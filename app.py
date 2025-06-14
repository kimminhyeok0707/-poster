from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os


app = Flask(__name__)
CORS(app)  


basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'board.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        """ 객체를 딕셔너리로 변환하는 함수 """
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }




@app.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    if not data or not 'title' in data or not 'content' in data:
        return jsonify({'error': '제목과 내용은 필수입니다.'}), 400
    
    new_post = Post(title=data['title'], content=data['content'])
    db.session.add(new_post)
    db.session.commit()
    
    return jsonify(new_post.to_dict()), 201


@app.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts])


@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = db.session.get(Post, post_id)
    if post is None:
        return jsonify({'error': '게시글을 찾을 수 없습니다.'}), 404
    return jsonify(post.to_dict())


@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    post = db.session.get(Post, post_id)
    if post is None:
        return jsonify({'error': '게시글을 찾을 수 없습니다.'}), 404
    
    data = request.get_json()
    if not data or not 'title' in data or not 'content' in data:
        return jsonify({'error': '제목과 내용은 필수입니다.'}), 400

    post.title = data['title']
    post.content = data['content']
    db.session.commit()
    
    return jsonify(post.to_dict())


@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = db.session.get(Post, post_id)
    if post is None:
        return jsonify({'error': '게시글을 찾을 수 없습니다.'}), 404
        
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({'message': '게시글이 성공적으로 삭제되었습니다.'})


if __name__ == '__main__':
    
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001) 
