from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from datetime import datetime
import traceback
import logging

logging.basicConfig(level=logging.ERROR)

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a random secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///versions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)

class Version(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False, unique=True)
    date = db.Column(db.Date, nullable=False)
    changes = db.Column(db.String(200), nullable=False)

with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if the username already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists. Please choose a different one.')
            return redirect(url_for('register'))
        
        new_user = User(username=username, password=password)  # In a real app, hash the password
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful! You can now log in.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username, password=password).first()
        if user:
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/api/versions', methods=['GET', 'POST'])
@login_required
def manage_versions():
    try:
        if request.method == 'POST':
            new_version = request.json
            date = datetime.strptime(new_version['date'], '%Y-%m-%d').date()
            version_entry = Version(version=new_version['version'], date=date, changes=new_version['changes'])
            db.session.add(version_entry)
            db.session.commit()
            return jsonify(new_version), 201
        
        page = request.args.get('page', 1, type=int)
        per_page = 5  # Number of versions per page
        search_term = request.args.get('search', '', type=str)
        
        query = Version.query
        if search_term:
            query = query.filter(Version.version.ilike(f'%{search_term}%') | Version.changes.ilike(f'%{search_term}%'))
        
        versions = query.order_by(Version.date.desc()).paginate(page, per_page, error_out=False)

        return jsonify({
            "versions": [{"id": v.id, "version": v.version, "date": v.date.strftime('%Y-%m-%d'), "changes": v.changes} for v in versions.items],
            "has_next": versions.has_next,
            "has_prev": versions.has_prev,
            "next_num": versions.next_num,
            "prev_num": versions.prev_num
        })
    
    except Exception as e:
        logging.error(traceback.format_exc())
        return jsonify({"error": "An internal error has occurred!"}), 500

@app.route('/api/versions/<int:id>', methods=['DELETE'])
@login_required
def delete_version(id):
    try:
        version_entry = Version.query.get_or_404(id)
        db.session.delete(version_entry)
        db.session.commit()
        return jsonify({"message": "Version deleted"}), 204
    except Exception as e:
        logging.error(traceback.format_exc())
        return jsonify({"error": "An internal error has occurred!"}), 500

if __name__ == '__main__':
    app.run(debug=True)
