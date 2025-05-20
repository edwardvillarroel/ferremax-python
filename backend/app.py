from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"mensaje": "Conexión exitosa con el backend!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)