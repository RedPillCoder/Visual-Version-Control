from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///versions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Version(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False, unique=True)
    date = db.Column(db.Date, nullable=False)
    changes = db.Column(db.String(200), nullable=False)

# Create the database
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/versions', methods=['GET', 'POST'])
def manage_versions():
    try:
        if request.method == 'POST':
            new_version = request.json
            version_entry = Version(version=new_version['version'], date=new_version['date'], changes=new_version['changes'])
            db.session.add(version_entry)
            db.session.commit()
            return jsonify(new_version), 201
        
        page = request.args.get('page', 1, type=int)
        per_page = 5  # Number of versions per page
        versions = Version.query.paginate(page, per_page, error_out=False)
        return jsonify({
            "versions": [{"id": v.id, "version": v.version, "date": v.date.strftime('%Y-%m-%d'), "changes": v.changes} for v in versions.items],
            "has_next": versions.has_next,
            "has_prev": versions.has_prev,
            "next_num": versions.next_num,
            "prev_num": versions.prev_num
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/versions/<int:id>', methods=['DELETE'])
def delete_version(id):
    try:
        version_entry = Version.query.get_or_404(id)
        db.session.delete(version_entry)
        db.session.commit()
        return jsonify({"message": "Version deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
