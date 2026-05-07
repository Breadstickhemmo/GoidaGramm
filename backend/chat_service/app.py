import os
from flask import Flask, request, jsonify, Blueprint
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, decode_token
from sqlalchemy import text
from datetime import datetime
from models import db, Chat, Message, chat_members

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'supersecret')

db.init_app(app)
jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins="*", path='/api/chat/socket.io')

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
                    text("SELECT first_name, last_name, status, avatar_url FROM users WHERE id = :uid"), 
                    {'uid': target_id}
                ).first()
                
                if user_req:
                    c_dict['title'] = f"{user_req[1]} {user_req[0]}"
                    c_dict['status'] = user_req[2]
                    c_dict['avatar_url'] = user_req[3]
                    c_dict['target_id'] = target_id
        result.append(c_dict)
        
    return jsonify(result), 200

@chat_bp.route('/<int:chat_id>/messages', methods=['GET'])
@jwt_required()
def get_chat_history(chat_id):
    user_id = int(get_jwt_identity())
    is_member = db.session.query(chat_members).filter_by(chat_id=chat_id, user_id=user_id).first()
    if not is_member:
        return jsonify({"msg": "Отказано в доступе"}), 403
    
    query = text("""
        SELECT m.id, m.chat_id, m.sender_id, m.content, m.file_id, m.created_at, u.first_name, u.last_name, m.is_edited, u.avatar_url
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = :cid
        ORDER BY m.created_at ASC
    """)
    result = db.session.execute(query, {'cid': chat_id}).fetchall()
    
    messages = []
    for r in result:
        messages.append({
            "id": str(r[0]),
            "chat_id": r[1],
            "sender_id": r[2],
            "content": r[3],
            "file_id": r[4],
            "created_at": r[5].isoformat(),
            "sender_name": f"{r[7]} {r[6]}" if r[6] else "Пользователь",
            "is_edited": r[8],
            "avatar_url": r[9]
        })
        
    return jsonify(messages), 200

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
        text("SELECT first_name, last_name, status, avatar_url FROM users WHERE id = :uid"), 
        {'uid': target_id}
    ).first()
    
    target_name = f"{user_req[1]} {user_req[0]}" if user_req else "Личный чат"
    target_status = user_req[2] if user_req else "offline"
    target_avatar = user_req[3] if user_req else None

    if common_chat:
        chat = Chat.query.get(common_chat[0])
        c_dict = chat.to_dict()
        c_dict['title'] = target_name
        c_dict['status'] = target_status
        c_dict['avatar_url'] = target_avatar
        c_dict['target_id'] = target_id
        return jsonify(c_dict), 200

    new_chat = Chat(type='private', title=None)
    db.session.add(new_chat)
    db.session.flush()
    
    db.session.execute(chat_members.insert().values(user_id=user_id, chat_id=new_chat.id))
    db.session.execute(chat_members.insert().values(user_id=target_id, chat_id=new_chat.id))
    db.session.commit()
    
    c_dict = new_chat.to_dict()
    c_dict['title'] = target_name
    c_dict['status'] = target_status
    c_dict['avatar_url'] = target_avatar
    c_dict['target_id'] = target_id
    return jsonify(c_dict), 201

@chat_bp.route('/group', methods=['POST'])
@jwt_required()
def create_group():
    user_id = int(get_jwt_identity())
    data = request.json
    title = data.get('title', 'Новая группа')
    member_ids = data.get('user_ids', [])

    new_chat = Chat(type='group', title=title, creator_id=user_id)
    db.session.add(new_chat)
    db.session.flush()

    members = set(member_ids)
    members.add(user_id)
    
    for m_id in members:
        db.session.execute(chat_members.insert().values(user_id=m_id, chat_id=new_chat.id))
    
    db.session.commit()
    return jsonify(new_chat.to_dict()), 201

@chat_bp.route('/<int:chat_id>/members', methods=['GET'])
@jwt_required()
def get_group_members(chat_id):
    members = db.session.execute(
        text("SELECT u.id, u.first_name, u.last_name, u.status, u.avatar_url FROM users u JOIN chat_members cm ON u.id = cm.user_id WHERE cm.chat_id = :cid"),
        {'cid': chat_id}
    ).fetchall()
    
    result = [{"id": m[0], "full_name": f"{m[2]} {m[1]}", "status": m[3], "avatar_url": m[4]} for m in members]
    return jsonify(result), 200

@chat_bp.route('/group/<int:chat_id>/title', methods=['PUT'])
@jwt_required()
def update_group_title(chat_id):
    user_id = int(get_jwt_identity())
    chat = Chat.query.get_or_404(chat_id)
    if chat.creator_id != user_id:
        return jsonify({"msg": "Только создатель может изменять название"}), 403
    
    chat.title = request.json.get('title', chat.title)
    db.session.commit()
    return jsonify(chat.to_dict()), 200

@chat_bp.route('/group/<int:chat_id>/members', methods=['POST'])
@jwt_required()
def add_group_member(chat_id):
    user_id = int(get_jwt_identity())
    chat = Chat.query.get_or_404(chat_id)
    if chat.creator_id != user_id:
        return jsonify({"msg": "Только создатель может добавлять участников"}), 403
        
    target_id = request.json.get('user_id')
    exist = db.session.query(chat_members).filter_by(chat_id=chat_id, user_id=target_id).first()
    if not exist:
        db.session.execute(chat_members.insert().values(user_id=target_id, chat_id=chat_id))
        db.session.commit()
    return jsonify({"msg": "Участник добавлен"}), 200

@chat_bp.route('/group/<int:chat_id>/members/<int:target_id>', methods=['DELETE'])
@jwt_required()
def remove_group_member(chat_id, target_id):
    user_id = int(get_jwt_identity())
    chat = Chat.query.get_or_404(chat_id)
    if chat.creator_id != user_id:
        return jsonify({"msg": "Только создатель может удалять участников"}), 403
        
    db.session.execute(text("DELETE FROM chat_members WHERE chat_id = :cid AND user_id = :uid"), {'cid': chat_id, 'uid': target_id})
    db.session.commit()
    return jsonify({"msg": "Участник удален"}), 200

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
def connect(auth=None):
    user_id = get_user_from_socket()
    if not user_id: 
        return False
    
    db.session.execute(
        text("UPDATE users SET status = 'online' WHERE id = :uid"),
        {'uid': user_id}
    )
    db.session.commit()
    
    emit('user_status', {'user_id': user_id, 'status': 'online'}, broadcast=True)
    
    chats = Chat.query.join(chat_members).filter(chat_members.c.user_id == user_id).all()
    for chat in chats:
        join_room(f"chat_{chat.id}")

@socketio.on('join_chat')
def on_join(data):
    user_id = get_user_from_socket()
    chat_id = data.get('chat_id')
    if user_id and chat_id:
        is_member = db.session.query(chat_members).filter_by(
            chat_id=chat_id, user_id=user_id
        ).first()
        if is_member:
            join_room(f"chat_{chat_id}")

@socketio.on('send_message')
def handle_message(data):
    user_id = get_user_from_socket()
    chat_id = data.get('chat_id')
    content = data.get('content')
    file_id = data.get('file_id')

    if not chat_id or not content:
        return

    is_member = db.session.query(chat_members).filter_by(chat_id=chat_id, user_id=user_id).first()
    if not is_member:
        return
    
    new_msg = Message(
        chat_id=chat_id, 
        sender_id=user_id, 
        content=content, 
        file_id=file_id 
    )
    db.session.add(new_msg)
    db.session.commit()

    user_req = db.session.execute(text("SELECT first_name, last_name, avatar_url FROM users WHERE id = :uid"), {'uid': user_id}).first()
    sender_name = f"{user_req[1]} {user_req[0]}" if user_req else "Пользователь"
    avatar_url = user_req[2] if user_req else None
    
    msg_dict = new_msg.to_dict()
    msg_dict['sender_name'] = sender_name
    msg_dict['avatar_url'] = avatar_url
    
    emit('new_message', msg_dict, room=f"chat_{chat_id}")

@socketio.on('edit_message')
def handle_edit(data):
    user_id = get_user_from_socket()
    msg_id = data.get('message_id')
    new_content = data.get('content')
    
    if not user_id or not msg_id or not new_content:
        return
        
    msg = Message.query.get(msg_id)
    if msg and msg.sender_id == user_id and not msg.file_id:
        msg.content = new_content
        msg.is_edited = True
        db.session.commit()
        emit('message_edited', {'message_id': str(msg_id), 'content': new_content, 'chat_id': msg.chat_id}, room=f"chat_{msg.chat_id}")

@socketio.on('delete_message')
def handle_delete(data):
    user_id = get_user_from_socket()
    msg_id = data.get('message_id')
    
    if not user_id or not msg_id:
        return
        
    msg = Message.query.get(msg_id)
    if msg and msg.sender_id == user_id:
        chat_id = msg.chat_id
        db.session.delete(msg)
        db.session.commit()
        emit('message_deleted', {'message_id': str(msg_id), 'chat_id': chat_id}, room=f"chat_{chat_id}")

@socketio.on('disconnect')
def disconnect(*args):
    user_id = get_user_from_socket()
    if user_id:
        db.session.execute(
            text("UPDATE users SET status = 'offline', last_seen = :now WHERE id = :uid"),
            {'uid': user_id, 'now': datetime.utcnow()}
        )
        db.session.commit()
        
        emit('user_status', {'user_id': user_id, 'status': 'offline'}, broadcast=True)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=5000)