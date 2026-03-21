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
        return jsonify({"access_token": access_token, "user": {"full_name": user.full_name, "role": user.role}}), 200
    return jsonify({"msg": "Неверный логин или пароль"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    return jsonify({"full_name": user.full_name, "role": user.role, "email": user.email}), 200

@auth_bp.route('/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    if admin.role != 'Admin':
        return jsonify({"msg": "Доступ запрещен"}), 403

    data = request.get_json()
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(email=data.get('email'), password_hash=hashed_pw, full_name=data.get('full_name'), role='User')
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Пользователь создан"}), 201