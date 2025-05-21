from flask import Flask, request
from config import (
    flask_get_productos,
    flask_get_producto,
    flask_crear_producto,
    flask_modificar_producto,
    flask_eliminar_producto,
    flask_login,
)

app = Flask(__name__)

@app.route('/api/productos', methods=['GET'])
def get_productos():
    return flask_get_productos()

@app.route('/api/productos/<id_producto>', methods=['GET'])
def get_producto(id_producto):
    return flask_get_producto(id_producto)

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    data = request.get_json()
    return flask_crear_producto(data)

@app.route('/api/productos/<id_producto>', methods=['PUT'])
def modificar_producto(id_producto):
    data = request.get_json()
    return flask_modificar_producto(id_producto, data)

@app.route('/api/productos/<id_producto>', methods=['DELETE'])
def eliminar_producto(id_producto):
    return flask_eliminar_producto(id_producto)

@app.route('/api/login', methods=['GET'])
def login():
    email = request.args.get('email')
    password = request.args.get('password')
    return flask_login(email, password)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)