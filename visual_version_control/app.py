from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///versions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Version(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)
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
    if request.method == 'POST':
        new_version = request.json
        version_entry = Version(version=new_version['version'], date=new_version['date'], changes=new_version['changes'])
        db.session.add(version_entry)
        db.session.commit()
        return jsonify(new_version), 201
    versions = Version.query.all()
    return jsonify([{"id": v.id, "version": v.version, "date": v.date.strftime('%Y-%m-%d'), "changes": v.changes} for v in versions])

@app.route('/api/versions/<int:id>', methods=['DELETE'])
def delete_version(id):
    version_entry = Version.query.get_or_404(id)
    db.session.delete(version_entry)
    db.session.commit()
    return jsonify({"message": "Version deleted"}), 204

if __name__ == '__main__':
    app.run(debug=True)
