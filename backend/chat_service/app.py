import os
from flask import Flask, request, jsonify, Blueprint
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, decode_token
from sqlalchemy import text
from models import db, Chat, Message, chat_members

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'supersecret')

db.init_app(app)
jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins="*", path='/api/chat/socket.io')
online_users = set()

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

@chat_bp.route('/my-chats', methods=['GET'])
@jwt_required()
def get_my_chats():
    user_id = int(get_jwt_identity())
    chats = Chat.query.join(chat_members).filter(chat_members.c.user_id == user_id).all()
    
    result = []
    for c in chats:
        c_dict = c.to_dict()
        if c.type == 'private':
            other_member = db.session.query(chat_members.c.user_id).filter(
                chat_members.c.chat_id == c.id,
                chat_members.c.user_id != user_id
            ).first()
            
            if other_member:
                target_id = other_member[0]
                user_req = db.session.execute(
                    text("SELECT first_name, last_name FROM users WHERE id = :uid"), 
                    {'uid': target_id}
                ).first()
                
                if user_req:
                    c_dict['title'] = f"{user_req[1]} {user_req[0]}"
        result.append(c_dict)
        
    return jsonify(result), 200

@chat_bp.route('/<int:chat_id>/messages', methods=['GET'])
@jwt_required()
def get_chat_history(chat_id):
    user_id = int(get_jwt_identity())
    is_member = db.session.query(chat_members).filter_by(chat_id=chat_id, user_id=user_id).first()
    if not is_member:
        return jsonify({"msg": "Отказано в доступе"}), 403
    
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.created_at.asc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

@chat_bp.route('/private', methods=['POST'])
@jwt_required()
def get_or_create_private_chat():
    user_id = int(get_jwt_identity())
    target_id = request.json.get('target_id')
    
    if not target_id:
        return jsonify({"msg": "ID получателя не указан"}), 400

    query = db.session.query(Chat.id).join(chat_members).filter(Chat.type == 'private')
    user_chats = query.filter(chat_members.c.user_id == user_id).subquery()
    common_chat = db.session.query(user_chats).join(chat_members, chat_members.c.chat_id == user_chats.c.id)\
        .filter(chat_members.c.user_id == target_id).first()

    user_req = db.session.execute(
        text("SELECT first_name, last_name FROM users WHERE id = :uid"), 
        {'uid': target_id}
    ).first()
    target_name = f"{user_req[1]} {user_req[0]}" if user_req else "Личный чат"

    if common_chat:
        chat = Chat.query.get(common_chat[0])
        c_dict = chat.to_dict()
        c_dict['title'] = target_name
        return jsonify(c_dict), 200

    new_chat = Chat(type='private', title=None)
    db.session.add(new_chat)
    db.session.flush()
    
    db.session.execute(chat_members.insert().values(user_id=user_id, chat_id=new_chat.id))
    db.session.execute(chat_members.insert().values(user_id=target_id, chat_id=new_chat.id))
    db.session.commit()
    
    c_dict = new_chat.to_dict()
    c_dict['title'] = target_name
    return jsonify(c_dict), 201

app.register_blueprint(chat_bp)

@app.route('/health')
def health():
    return jsonify({"status": "chat_service ok"}), 200

def get_user_from_socket():
    token = request.args.get('token')
    if not token: return None
    try:
        data = decode_token(token)
        return int(data['sub'])
    except:
        return None

@socketio.on('connect')
def connect():
    user_id = get_user_from_socket()
    if not user_id: 
        return False
    online_users.add(user_id)
    emit('user_status', {'user_id': user_id, 'status': 'online'}, broadcast=True)
    chats = Chat.query.join(chat_members).filter(chat_members.c.user_id == user_id).all()
    for chat in chats:
        join_room(f"chat_{chat.id}")

@socketio.on('send_message')
def handle_message(data):
    user_id = get_user_from_socket()
    chat_id = data.get('chat_id')
    content = data.get('content')
    if not chat_id or not content:
        return

    is_member = db.session.query(chat_members).filter_by(chat_id=chat_id, user_id=user_id).first()
    if not is_member:
        return
    
    new_msg = Message(chat_id=chat_id, sender_id=user_id, content=content)
    db.session.add(new_msg)
    db.session.commit()
    
    emit('new_message', new_msg.to_dict(), room=f"chat_{chat_id}")

@socketio.on('disconnect')
def disconnect():
    user_id = get_user_from_socket()
    if user_id and user_id in online_users:
        online_users.remove(user_id)
        emit('user_status', {'user_id': user_id, 'status': 'offline'}, broadcast=True)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=5000)