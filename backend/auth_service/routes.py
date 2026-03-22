from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token, 
            "user": user.to_dict()
        }), 200
    
    return jsonify({"msg": "Неверный логин или пароль"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"msg": "Пользователь не найден"}), 404
    return jsonify(user.to_dict()), 200

@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    
    if not admin or admin.role != 'Admin':
        return jsonify({"msg": "Доступ запрещен: требуется роль Администратора"}), 403
    
    users = User.query.order_by(User.last_name.asc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@auth_bp.route('/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    
    if not admin or admin.role != 'Admin':
        return jsonify({"msg": "Доступ запрещен"}), 403

    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"msg": "Сотрудник с таким Email уже существует"}), 400

    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    
    new_user = User(
        email=data.get('email'),
        password_hash=hashed_pw,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        middle_name=data.get('middle_name'),
        position=data.get('position'),
        role='User',
        status='offline'
    )
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Сотрудник успешно создан"}), 201