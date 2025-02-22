from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

# Sample data to simulate version control changes
version_data = [
    {"version": "v1.0", "date": "2023-01-01", "changes": "Initial commit"},
    {"version": "v1.1", "date": "2023-02-01", "changes": "Added feature A"},
    {"version": "v1.2", "date": "2023-03-01", "changes": "Fixed bug in feature A"},
    {"version": "v2.0", "date": "2023-04-01", "changes": "Major update with new features"},
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/versions', methods=['GET', 'POST'])
def manage_versions():
    if request.method == 'POST':
        new_version = request.json
        version_data.append(new_version)
        return jsonify(new_version), 201
    return jsonify(version_data)

if __name__ == '__main__':
    app.run(debug=True)
