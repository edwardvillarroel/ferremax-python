from flask import Flask, request
from flask_cors import CORS
from flasgger import Swagger, swag_from
from config import (
    flask_get_productos,
    flask_get_producto,
    flask_crear_producto,
    flask_modificar_producto,
    flask_eliminar_producto,
    flask_login,
    flask_crear_cliente
)

app = Flask(__name__)
CORS(app)

# Configuración de Swagger
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs/"
}

swagger = Swagger(app, config=swagger_config)

@app.route('/api/productos', methods=['GET'])
@swag_from({
    'tags': ['Productos'],
    'summary': 'Obtiene todos los productos',
    'responses': {
        200: {
            'description': 'Lista de productos obtenida exitosamente',
            'schema': {
                'type': 'object',
                'properties': {
                    'data': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id_producto': {'type': 'string'},
                                'nom_prod': {'type': 'string'},
                                'descr_prod': {'type': 'string'},
                                'precio': {'type': 'integer'},
                                'marca': {'type': 'string'},
                                'stock': {'type': 'integer'},
                                'id_categoria': {'type': 'integer'},
                                'img_prod': {'type': 'string', 'nullable': True}
                            }
                        }
                    }
                }
            }
        }
    }
})
def get_productos():
    return flask_get_productos()

@app.route('/api/productos/<id_producto>', methods=['GET'])
@swag_from({
    'tags': ['Productos'],
    'summary': 'Obtiene un producto específico',
    'parameters': [
        {
            'name': 'id_producto',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'ID del producto a buscar'
        }
    ],
    'responses': {
        200: {
            'description': 'Producto encontrado exitosamente'
        }
    }
})
def get_producto(id_producto):
    return flask_get_producto(id_producto)

@app.route('/api/productos', methods=['POST'])
@swag_from({
    'tags': ['Productos'],
    'summary': 'Crea un nuevo producto',
    'parameters': [
        {
            'name': 'producto',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'id_producto': {'type': 'string'},
                    'nom_prod': {'type': 'string'},
                    'descr_prod': {'type': 'string'},
                    'precio': {'type': 'integer'},
                    'marca': {'type': 'string'},
                    'stock': {'type': 'integer'},
                    'id_categoria': {'type': 'integer'},
                    'img_prod': {'type': 'string', 'nullable': True}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Producto creado exitosamente'
        }
    }
})
def crear_producto():
    data = request.get_json()
    return flask_crear_producto(data)

@app.route('/api/productos/<id_producto>', methods=['PUT'])
@swag_from({
    'tags': ['Productos'],
    'summary': 'Modifica un producto existente',
    'parameters': [
        {
            'name': 'id_producto',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'ID del producto a modificar'
        },
        {
            'name': 'producto',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'nom_prod': {'type': 'string'},
                    'descr_prod': {'type': 'string'},
                    'precio': {'type': 'integer'},
                    'marca': {'type': 'string'},
                    'stock': {'type': 'integer'},
                    'id_categoria': {'type': 'integer'},
                    'img_prod': {'type': 'string', 'nullable': True}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Producto actualizado exitosamente'
        }
    }
})
def modificar_producto(id_producto):
    data = request.get_json()
    return flask_modificar_producto(id_producto, data)

@app.route('/api/productos/<id_producto>', methods=['DELETE'])
@swag_from({
    'tags': ['Productos'],
    'summary': 'Elimina un producto',
    'parameters': [
        {
            'name': 'id_producto',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'ID del producto a eliminar'
        }
    ],
    'responses': {
        200: {
            'description': 'Producto eliminado exitosamente'
        }
    }
})
def eliminar_producto(id_producto):
    return flask_eliminar_producto(id_producto)

@app.route('/api/login', methods=['GET'])
@swag_from({
    'tags': ['Autenticación'],
    'summary': 'Inicia sesión de usuario',
    'parameters': [
        {
            'name': 'email',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Correo electrónico del usuario'
        },
        {
            'name': 'password',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Contraseña del usuario'
        }
    ],
    'responses': {
        200: {
            'description': 'Inicio de sesión exitoso'
        }
    }
})
def login():
    email = request.args.get('email')
    password = request.args.get('password')
    return flask_login(email, password)

@app.route('/api/clientes', methods=['POST'])
@swag_from({
    'tags': ['Clientes'],
    'summary': 'Crea un nuevo cliente',
    'parameters': [
        {
            'name': 'cliente',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'nombre': {'type': 'string'},
                    'email': {'type': 'string'},
                    'password': {'type': 'string'}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Cliente creado exitosamente'
        }
    }
})
def crear_cliente():
    data = request.get_json()
    return flask_crear_cliente(data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)