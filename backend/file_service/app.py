import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, File

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'supersecret')
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'query_string']
app.config['UPLOAD_FOLDER'] = '/app/storage'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

BANNED_EXTENSIONS = {'exe', 'com', 'bat', 'sh', 'msi', 'jar'}

db.init_app(app)
jwt = JWTManager(app)

def get_extension(filename):
    if '.' not in filename:
        return ""
    return filename.rsplit('.', 1)[1].lower()

@app.route('/api/files/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"msg": "Файл не найден"}), 400
    
    file = request.files['file']
    raw_filename = file.filename
    
    if raw_filename == '':
        return jsonify({"msg": "Имя файла пустое"}), 400

    extension = get_extension(raw_filename)

    if not extension:
        return jsonify({"msg": "Файлы без расширения запрещены"}), 400
    
    if extension in BANNED_EXTENSIONS:
        return jsonify({"msg": f"Тип .{extension} запрещен политикой безопасности"}), 400

    storage_name = f"{uuid.uuid4()}.{extension}"
    display_name = os.path.basename(raw_filename)

    try:
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], storage_name))
        
        new_file = File(
            original_name=display_name,
            storage_path=storage_name,
            user_id=int(get_jwt_identity())
        )
        db.session.add(new_file)
        db.session.commit()
        
        return jsonify({
            "file_id": new_file.id,
            "filename": display_name
        }), 201
    except Exception as e:
        return jsonify({"msg": f"Ошибка сервера: {str(e)}"}), 500

@app.route('/api/files/download/<int:file_id>', methods=['GET'])
@jwt_required()
def download_file(file_id):
    file_record = File.query.get_or_404(file_id)
    
    return send_from_directory(
        app.config['UPLOAD_FOLDER'], 
        file_record.storage_path, 
        as_attachment=True, 
        download_name=file_record.original_name 
    )

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)