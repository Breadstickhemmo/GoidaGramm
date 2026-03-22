import os
from flask import Flask
from flask_cors import CORS
from extensions import db, bcrypt, jwt
from routes import auth_bp
from models import User

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    with app.app_context():
            db.create_all()
            if not User.query.filter_by(role='Admin').first():
                hpw = bcrypt.generate_password_hash(os.getenv('ADMIN_PASSWORD', 'admin12345')).decode('utf-8')
                admin = User(
                    email=os.getenv('ADMIN_EMAIL', 'admin@goida.ru'), 
                    password_hash=hpw, 
                    first_name="Системный",
                    last_name="Администратор",
                    position="IT-Департамент",
                    role="Admin",
                    status="online"
                )
                db.session.add(admin)
                db.session.commit()
                print("Первый администратор успешно создан в новой модели!")
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)