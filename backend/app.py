import os
from flask import Flask, request, jsonify, redirect, render_template
from flask_cors import CORS
from flasgger import Swagger, swag_from
import logging
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
from transbank.webpay.webpay_plus.transaction import WebpayOptions

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

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

COMMERCE_CODE = "597055555532"
API_KEY = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
INTEGRATION_TYPE = IntegrationType.TEST

RETURN_URL = "http://localhost:5000/api/webpay/retorno"
FINAL_URL = "http://localhost:3001/resultado"

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

@app.route('/api/webpay/crear', methods=['POST'])
def crear_transaccion():
    try:
        data = request.json
        monto = data.get('monto')
        orden_compra = data.get('orden_compra')
        
        logger.info(f"Iniciando transacción: monto={monto}, orden={orden_compra}")
        
        if not monto or not orden_compra:
            return jsonify({"error": "Debe proporcionar monto y orden_compra"}), 400
        
        monto = int(monto)
        
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        
        tx = Transaction(options)
        response = tx.create(
            buy_order=orden_compra,
            session_id=f"sesion_{orden_compra}",
            amount=monto,
            return_url=RETURN_URL
        )
        
        # Mostrar la respuesta para debugging
        logger.debug(f"Respuesta de WebPay: {response}")
        
        # Verificamos si la respuesta es un diccionario y extraemos los datos correctamente
        if isinstance(response, dict):
            token = response.get("token")
            url = response.get("url")
            logger.info(f"Transacción creada como diccionario: token={token}, url={url}")
        else:
            token = response.token if hasattr(response, 'token') else None
            url = response.url if hasattr(response, 'url') else None
            logger.info(f"Transacción creada como objeto: token={token}, url={url}")
        
        if not url or not token:
            logger.error("URL o token no encontrados en la respuesta")
            return jsonify({"error": "No se pudo obtener URL de pago"}), 500
            
        return jsonify({
            "url": url,
            "token": token
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/webpay/retorno', methods=['GET', 'POST'])
def webpay_return():
    """
    Endpoint que recibe la respuesta de WebPay después del pago
    """
    token = request.args.get("token_ws")
    
    if not token:
        return jsonify({"error": "Token no recibido"}), 400
    
    try:
        # Configurar opciones de WebPay
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        
        # Confirmar transacción
        tx = Transaction(options)
        response = tx.commit(token)
        
        # Extracción segura de datos
        if isinstance(response, dict):
            buy_order = response.get("buy_order")
            amount = response.get("amount")
        else:
            buy_order = response.buy_order if hasattr(response, "buy_order") else "unknown"
            amount = response.amount if hasattr(response, "amount") else 0
        
        
        redirect_url = f"{FINAL_URL}?token={token}&status=success&order={buy_order}&amount={amount}"
        return redirect(redirect_url)
    
    except Exception as e:
        # Error en la transacción, redirigir con error
        redirect_url = f"{FINAL_URL}?status=error&message={str(e)}"
        return redirect(redirect_url)

@app.route('/api/estado-transaccion', methods=['GET'])
def estado_transaccion():
    """
    Endpoint para consultar el estado de una transacción
    """
    token = request.args.get('token')
    
    if not token:
        return jsonify({"error": "Token no proporcionado"}), 400
    
    try:
        # Configurar opciones de WebPay
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        
        # Consultar estado
        tx = Transaction(options)
        response = tx.status(token)
        
        # Extracción segura de datos
        if isinstance(response, dict):
            estado = response.get("status")
            orden_compra = response.get("buy_order")
            monto = response.get("amount")
            tarjeta = response.get("card_detail", {}).get("card_number") if isinstance(response.get("card_detail"), dict) else None
            fecha_transaccion = response.get("transaction_date")
        else:
            estado = response.status if hasattr(response, "status") else "unknown"
            orden_compra = response.buy_order if hasattr(response, "buy_order") else "unknown"
            monto = response.amount if hasattr(response, "amount") else 0
            tarjeta = response.card_detail.card_number if hasattr(response, "card_detail") and hasattr(response.card_detail, "card_number") else None
            fecha_transaccion = response.transaction_date if hasattr(response, "transaction_date") else None
        
        return jsonify({
            "estado": estado,
            "orden_compra": orden_compra,
            "monto": monto,
            "tarjeta": tarjeta,
            "fecha_transaccion": fecha_transaccion
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/anular-transaccion', methods=['POST'])
def anular_transaccion():
    """
    Endpoint para anular una transacción (opcional)
    """
    try:
        data = request.json
        token = data.get('token')
        monto = data.get('monto')
        
        if not token or not monto:
            return jsonify({"error": "Debe proporcionar token y monto"}), 400
        
        # Configurar opciones de WebPay
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        
        # Anular transacción
        tx = Transaction(options)
        response = tx.refund(token, monto)
        
        # Extracción segura de datos
        if isinstance(response, dict):
            tipo_respuesta = response.get("type")
            codigo_autorizacion = response.get("authorization_code")
            monto_anulado = response.get("refunded_amount")
            codigo_respuesta = response.get("response_code")
            estado = response.get("status")
        else:
            tipo_respuesta = response.type if hasattr(response, "type") else "unknown"
            codigo_autorizacion = response.authorization_code if hasattr(response, "authorization_code") else "unknown"
            monto_anulado = response.refunded_amount if hasattr(response, "refunded_amount") else 0
            codigo_respuesta = response.response_code if hasattr(response, "response_code") else "unknown"
            estado = response.status if hasattr(response, "status") else "unknown"
        
        return jsonify({
            "tipo_respuesta": tipo_respuesta,
            "codigo_autorizacion": codigo_autorizacion,
            "monto_anulado": monto_anulado,
            "codigo_respuesta": codigo_respuesta,
            "estado": estado
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

