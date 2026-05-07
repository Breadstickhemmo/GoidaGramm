from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re

auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    if len(password) < 8:
        return "Пароль должен быть не менее 8 символов"
    if not re.search(r"[a-zа-я]", password):
        return "Пароль должен содержать строчные буквы"
    if not re.search(r"[A-ZА-Я]", password):
        return "Пароль должен содержать заглавные буквы"
    if not re.search(r"[0-9]", password):
        return "Пароль должен содержать цифры"
    if not re.search(r"[!@#$%^&*()_+={}\[\]:;<>,.?/~`|-]", password):
        return "Пароль должен содержать специальные символы"
    return None

def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None

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

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"msg": "Пользователь не найден"}), 404
        
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'middle_name' in data:
        user.middle_name = data['middle_name']
    if 'position' in data:
        user.position = data['position']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
        
    db.session.commit()
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
    email = data.get('email')
    password = data.get('password')

    if not validate_email(email):
        return jsonify({"msg": "Некорректный формат Email"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Сотрудник с таким Email уже существует"}), 400

    pass_err = validate_password(password)
    if pass_err:
        return jsonify({"msg": pass_err}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(
        email=email,
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

@auth_bp.route('/admin/users/<int:target_id>', methods=['PUT'])
@jwt_required()
def admin_edit_user(target_id):
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    if not admin or admin.role != 'Admin':
        return jsonify({"msg": "Доступ запрещен"}), 403

    user = User.query.get_or_404(target_id)
    data = request.get_json()
    email = data.get('email')

    if email and email != user.email:
        if not validate_email(email):
            return jsonify({"msg": "Некорректный формат Email"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "Этот Email уже занят другим сотрудником"}), 400
        user.email = email

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.middle_name = data.get('middle_name', user.middle_name)
    user.position = data.get('position', user.position)

    db.session.commit()
    return jsonify(user.to_dict()), 200

@auth_bp.route('/admin/users/<int:target_id>/reset-password', methods=['POST'])
@jwt_required()
def admin_reset_password(target_id):
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    if not admin or admin.role != 'Admin':
        return jsonify({"msg": "Доступ запрещен"}), 403

    user = User.query.get_or_404(target_id)
    new_password = request.get_json().get('password')

    pass_err = validate_password(new_password)
    if pass_err:
        return jsonify({"msg": pass_err}), 400

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({"msg": "Пароль успешно сброшен"}), 200

@auth_bp.route('/admin/users/<int:target_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(target_id):
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    if not admin or admin.role != 'Admin':
        return jsonify({"msg": "Доступ запрещен"}), 403

    user = User.query.get_or_404(target_id)
    if user.role == 'Admin':
        return jsonify({"msg": "Невозможно удалить системного администратора"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Сотрудник удален"}), 200

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users_for_chat():
    current_user_id = int(get_jwt_identity())
    users = User.query.filter(User.id != current_user_id).all()
    return jsonify([u.to_dict() for u in users]), 200