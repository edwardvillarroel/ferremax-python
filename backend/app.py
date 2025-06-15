# Importaciones necesarias para el funcionamiento de la aplicación
import datetime  # Para manejar fechas y horas
import os        # Para interactuar con el sistema operativo
import uuid      # Para generar identificadores únicos
from flask import Flask, request, jsonify, redirect, render_template  # Framework web Flask
from flask_cors import CORS  # Para habilitar CORS (Cross-Origin Resource Sharing)
from flasgger import Swagger, swag_from  # Para documentación automática de API
import logging   # Para logging y registro de eventos
import pymysql   # Conector para base de datos MySQL
import base64    # Para codificar y decodificar datos en base64
from pymysql import MySQLError
# Importaciones específicas de Transbank para pagos
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
from transbank.webpay.webpay_plus.transaction import WebpayOptions
import mysql.connector
from mysql.connector import Error # Otro conector para MySQL
# Importaciones desde archivo de configuración local
from config import flask_login, flask_login_empleado, flask_get_categorias, DATABASE_CONFIGS

from config import (
    DatabaseError,
    flask_get_productos,
    flask_get_producto,
    flask_crear_producto,
    flask_modificar_producto,
    flask_eliminar_producto,
    flask_login,
    flask_crear_cliente,
    get_db_connection,
    flask_get_empleados,
    flask_get_empleado,
    flask_crear_empleado,
    flask_modificar_empleado,
    flask_eliminar_empleado
)

# Inicialización de la aplicación Flask
app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde otros dominios
CORS(app)

# Configuración del sistema de logging
logging.basicConfig(
    level=logging.INFO,  # Nivel de logging
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'  # Formato de los mensajes
)

# Crear logger específico para esta aplicación
logger = logging.getLogger(__name__)

# Configuración de Transbank para pagos (ambiente de pruebas)
COMMERCE_CODE = "597055555532"  # Código de comercio proporcionado por Transbank
API_KEY = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"  # Llave API
INTEGRATION_TYPE = IntegrationType.TEST  # Tipo de integración (TEST para pruebas)

# Diccionario para almacenar transacciones en memoria (temporal)
transactions = {}

# URLs para el flujo de pagos
RETURN_URL = "http://localhost:5000/api/webpay/retorno"  # URL donde Transbank envía la respuesta
FINAL_URL = "http://localhost:3001/resultado"  # URL final donde se redirige al usuario

# Configuración de Swagger para documentación de la API
swagger_config = {
    "headers": [],  # Headers adicionales
    "specs": [
        {
            "endpoint": 'apispec',  # Endpoint para las especificaciones
            "route": '/apispec.json',  # Ruta del archivo JSON de especificaciones
            "rule_filter": lambda rule: True,  # Filtro para rutas (incluir todas)
            "model_filter": lambda tag: True,  # Filtro para modelos (incluir todos)
        }
    ],
    "static_url_path": "/flasgger_static",  # Path para archivos estáticos de Swagger
    "swagger_ui": True,  # Habilitar interfaz de usuario de Swagger
    "specs_route": "/docs/"  # Ruta donde se mostrará la documentación
}

# Inicializar Swagger con la configuración
swagger = Swagger(app, config=swagger_config)

def dict_factory(cursor, row):
    """Convierte filas de SQLite en diccionarios"""
    d = {}
    for idx, col in enumerate(cursor.description):
        value = row[idx]
        # Si es un campo de imagen (bytes), convertir a base64
        if isinstance(value, bytes):
            try:
                d[col[0]] = base64.b64encode(value).decode('utf-8')
            except:
                d[col[0]] = None
        else:
            d[col[0]] = value
    return d

def execute_query(query, params=None, fetch=False, db_type='producto'):
    connection = None
    cursor = None
    try:
        # Obtiene la configuración correcta
        db_config = DATABASE_CONFIGS.get(db_type, DATABASE_CONFIGS['producto'])
        
        # Conexión usando pymysql
        connection = pymysql.connect(**db_config)
        cursor = connection.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch or query.strip().upper().startswith('SELECT'):
            result = cursor.fetchall()
            return result if result else []  # Siempre retorna lista
        else:
            connection.commit()
            return cursor.rowcount
            
    except MySQLError as e:
        print(f"Error MySQL [{e.args[0]}]: {e.args[1]}")
        return [] if fetch else None
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return [] if fetch else None
    finally:
        if cursor: cursor.close()
        if connection and connection.open: connection.close()

# ENDPOINTS DE PRODUCTOS

@app.route('/api/productos', methods=['GET'])
def get_productos():
    try:
        productos = execute_query('SELECT * FROM Producto', fetch=True)
        
        # Convertir imágenes a base64 si existen
        for producto in productos:
            if producto.get('img_prod') and isinstance(producto['img_prod'], bytes):
                producto['img_prod'] = base64.b64encode(producto['img_prod']).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': productos
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/productos/<id_producto>', methods=['GET'])
def get_producto(id_producto):
    try:
        productos = execute_query(
            'SELECT * FROM Producto WHERE id_producto = %s', 
            (id_producto,),
            fetch=True
        )
        
        if not productos:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        producto = productos[0]
        
        # Convertir imagen a base64 si existe
        if producto.get('img_prod') and isinstance(producto['img_prod'], bytes):
            producto['img_prod'] = base64.b64encode(producto['img_prod']).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': producto
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/')
def home():
    try:
        # Obtener productos de lanzamiento
        lanzamientos = execute_query("SELECT * FROM Producto WHERE lanzamiento = 1", fetch=True)
        
        # Obtener productos en promoción
        promociones = execute_query("SELECT * FROM Producto WHERE promocion = 1", fetch=True)
        
        # Convertir imágenes si existen
        for producto in lanzamientos + promociones:
            if producto.get('img_prod') and isinstance(producto['img_prod'], bytes):
                producto['img_prod'] = base64.b64encode(producto['img_prod']).decode('utf-8')
        
        return render_template('home.html', lanzamientos=lanzamientos, promociones=promociones)
        
    except Exception as e:
        print(f"Error al obtener productos destacados: {e}")
        return render_template('home.html', lanzamientos=[], promociones=[])

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['id_producto', 'nom_prod', 'precio', 'stock', 'id_categoria']
        for field in required_fields:
            if field not in data or data[field] in (None, ''):
                return jsonify({
                    'success': False,
                    'error': f'El campo {field} es requerido'
                }), 400
        
        # Verificar si el producto ya existe
        existing = execute_query(
            'SELECT id_producto FROM Producto WHERE id_producto = %s', 
            (data['id_producto'],),
            fetch=True
        )
        
        if existing:
            return jsonify({
                'success': False,
                'error': 'Ya existe un producto con ese ID'
            }), 400
        
        # Convertir imagen base64 a bytes si existe
        img_data = None
        if 'img_prod' in data and data['img_prod']:
            try:
                img_data = base64.b64decode(data['img_prod'])
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': 'Imagen inválida: ' + str(e)
                }), 400
        
        # Insertar producto
        execute_query('''
            INSERT INTO Producto 
            (id_producto, nom_prod, descr_prod, precio, marca, stock, id_categoria, 
             lanzamiento, promocion, img_prod)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['id_producto'],
            data.get('nom_prod', ''),
            data.get('descr_prod', ''),
            float(data['precio']),
            data.get('marca', ''),
            int(data['stock']),
            int(data['id_categoria']),
            int(data.get('lanzamiento', 0)),
            int(data.get('promocion', 0)),
            img_data
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Producto creado exitosamente'
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'Datos inválidos: ' + str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/productos/<id_producto>', methods=['PUT'])
def actualizar_producto(id_producto):
    try:
        data = request.get_json()
        
        # 1. Obtener el producto actual primero
        producto_actual = execute_query(
            "SELECT img_prod FROM Producto WHERE id_producto = %s",
            (id_producto,),
            fetch=True
        )[0] if execute_query(
            "SELECT 1 FROM Producto WHERE id_producto = %s",
            (id_producto,),
            fetch=True
        ) else None

        if not producto_actual:
            return jsonify({'success': False, 'error': 'Producto no encontrado'}), 404

       
        img_prod = producto_actual['img_prod']
        if 'img_prod' in data and data['img_prod'] not in (None, '', '0'):
            if data['img_prod'].startswith('data:image'):
                # Extraer solo el base64 si viene con prefijo
                img_prod = data['img_prod'].split(',')[1]
            else:
                img_prod = data['img_prod']

        # 3. Actualizar manteniendo la imagen original si no hay nueva
        execute_query('''
            UPDATE Producto SET
            nom_prod=%s, descr_prod=%s, precio=%s, marca=%s,
            stock=%s, id_categoria=%s, lanzamiento=%s, promocion=%s,
            img_prod=%s
            WHERE id_producto=%s
        ''', (
            data['nom_prod'],
            data.get('descr_prod', ''),
            float(data['precio']),
            data.get('marca', ''),
            int(data['stock']),
            int(data.get('id_categoria', 0)),
            int(data.get('lanzamiento', 0)),
            int(data.get('promocion', 0)),
            img_prod,  
            id_producto
        ), fetch=False)

        return jsonify({
            'success': True,
            'message': 'Producto actualizado',
            'data': {**data, 'img_prod': img_prod}
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/productos/<string:id_producto>', methods=['DELETE'])
def eliminar_producto(id_producto):
    try:
        # Verificar si el producto existe
        existing = execute_query(
            'SELECT id_producto FROM Producto WHERE id_producto = %s', 
            (id_producto,),
            fetch=True
        )
        
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        # Eliminar producto
        execute_query(
            'DELETE FROM Producto WHERE id_producto = %s', 
            (id_producto,),
            fetch=False
        )
        
        return jsonify({
            'success': True,
            'message': 'Producto eliminado exitosamente'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ENDPOINTS DE AUTENTICACIÓN

@app.route('/api/login-empleado', methods=['GET'])  # Login para empleados
@swag_from({
    'tags': ['Autenticación'],
    'summary': 'Inicia sesión de usuario',
    'parameters': [
        {
            'name': 'email',  # Email como parámetro de consulta
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Correo electrónico del usuario'
        },
        {
            'name': 'password',  # Password como parámetro de consulta
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
def login_empleado():
    # Obtener parámetros de la URL
    email = request.args.get('email')
    password = request.args.get('password')
    
    # Validar que los parámetros estén presentes
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email y contraseña son requeridos'}), 400

    # Inicializar variables para manejo de conexión
    connection = None
    cursor = None
    try:
        # Obtener conexión a la base de datos de empleados
        connection = get_db_connection(database_type='empleado')
        # Crear cursor con formato de diccionario
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # Query SQL para buscar empleado por email
        query = """
            SELECT pnom_emp, snom_emp, appat_emp, apmat_emp, correo_emp, id_cargo, password_emp
            FROM Empleado
            WHERE correo_emp = %s
        """
        cursor.execute(query, (email,))  # Ejecutar query con parámetro
        user = cursor.fetchone()  # Obtener primer resultado

        if user:  # Si se encontró el usuario
            password_db = user.get('password_emp')  # Obtener contraseña de BD
            if password == password_db:  # Comparar contraseñas (sin hash - no recomendado)
                token = 'token-generado-aqui'  # Generar token (simplificado)
                # Retornar respuesta exitosa con datos del usuario
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'name': user['pnom_emp'],
                        'lastname': user['appat_emp'],
                        'email': user['correo_emp'],
                        'cargo': user['id_cargo']
                    }
                }), 200
            else:
                # Contraseña incorrecta
                return jsonify({'success': False, 'message': 'Contraseña incorrecta'}), 401
        else:
            # Usuario no encontrado
            return jsonify({'success': False, 'message': 'Empleado no encontrado'}), 404

    # Manejo de diferentes tipos de errores
    except pymysql.MySQLError as err:
        print(f"Error de base de datos: {err}")
        return jsonify({'success': False, 'message': 'Error en el servidor'}), 500
    except DatabaseError as err:
        print(f"Error personalizado: {err}")
        return jsonify({'success': False, 'message': 'Error en el servidor'}), 500
    except Exception as err:
        print(f"Error inesperado: {err}")
        return jsonify({'success': False, 'message': 'Error inesperado en el servidor'}), 500
    finally:
        # Cerrar cursor y conexión para liberar recursos
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.open:
            connection.close()

@app.route('/api/login', methods=['GET'])  # Login para clientes
def login():
    # Obtener credenciales de los parámetros de la URL
    email = request.args.get('email')
    password = request.args.get('password')
    
    # Validar presencia de credenciales
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email y contraseña son requeridos'}), 400

    # Inicializar variables de conexión
    connection = None
    cursor = None
    try:        
        # Conexión a base de datos de clientes
        connection = get_db_connection(database_type='cliente')        
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # Query para buscar cliente por email
        query = "SELECT nombre_cliente, apellidos_cliente, password_cliente, email_cliente FROM Cliente WHERE email_cliente = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if user:  # Si el usuario existe
            # Extraer datos del usuario
            nombre = user['nombre_cliente']
            apellidos = user['apellidos_cliente']
            password_db = user['password_cliente']

            if password == password_db:  # Verificar contraseña
                token = 'token-generado-aqui'  # Token simplificado
                # Respuesta exitosa
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'name': nombre,
                        'lastname': apellidos,
                        'email': user['email_cliente']
                    }
                }), 200
            else:
                return jsonify({'success': False, 'message': 'Contraseña incorrecta'}), 401
        else:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404

    # Manejo de errores similar al login de empleados
    except pymysql.MySQLError as err:
        print(f"Error de base de datos: {err}")
        return jsonify({'success': False, 'message': 'Error en el servidor'}), 500
    except DatabaseError as err:
        print(f"Error personalizado: {err}")
        return jsonify({'success': False, 'message': 'Error en el servidor'}), 500
    except Exception as err:
        print(f"Error inesperado: {err}")
        return jsonify({'success': False, 'message': 'Error inesperado en el servidor'}), 500
    finally:
        # Limpieza de recursos
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.open:
            connection.close()

# ENDPOINT PARA CREAR CLIENTES

@app.route('/api/Cliente', methods=['POST'])  # Crear nuevo cliente
@swag_from({
    'tags': ['Cliente'],
    'summary': 'Crea un nuevo cliente',
    'parameters': [
        {
            'name': 'cliente',
            'in': 'body',
            'required': True,
            'schema': {  # Esquema del objeto cliente
                'type': 'object',
                'properties': {
                    'run_cliente': {'type': 'string'},
                    'dvrun_cliente': {'type': 'string'},
                    'nombre_cliente': {'type': 'string'},
                    'apellidos_cliente': {'type': 'string'},
                    'email_cliente': {'type': 'string'},
                    'password_cliente': {'type': 'string'}
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
    data = request.get_json()  # Obtener datos JSON
    return flask_crear_cliente(data)  # Delegar a función importada

# ENDPOINTS DE WEBPAY (TRANSBANK)

@app.route('/api/webpay/crear_transaccion', methods=['POST'])  # Crear transacción de pago
def crear_transaccion():
    try:
        data = request.get_json()  # Obtener datos de la petición
        
        # Validar que se envió el monto
        if not data or 'amount' not in data:
            return jsonify({
                'error': 'Monto es requerido'
            }), 400
        
        # Convertir monto a float y validar
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({
                'error': 'El monto debe ser mayor a 0'
            }), 400
        
        # Generar identificadores únicos para la transacción
        buy_order = str(uuid.uuid4())[:8]  # Orden de compra (8 caracteres)
        session_id = str(uuid.uuid4())[:8]  # ID de sesión (8 caracteres)
        
        # URL de retorno personalizable o por defecto
        return_url = data.get('return_url', 'http://localhost:3001/resultadoPago')
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        tx = Transaction(options)
        # Crear transacción en Transbank
        response = tx.create(
            buy_order=buy_order,
            session_id=session_id,
            amount=amount,
            return_url=return_url
        )
        # Extraer token y URL de la respuesta (manejo de dict y objeto)
        if isinstance(response, dict):
            token = response.get('token')
            url = response.get('url')
        else:
            token = getattr(response, 'token', None)
            url = getattr(response, 'url', None)
            
        # Almacenar información de la transacción en memoria
        transactions[buy_order] = {
            'buy_order': buy_order,
            'session_id': session_id,
            'amount': amount,
            'status': 'CREATED',  # Estado inicial
            'created_at': datetime.datetime.now().isoformat(),  # Timestamp de creación
            'token': token # Token de Transbank
        }
        
        # Retornar información de la transacción creada
        return jsonify({
            'success': True,
            'token': token,      # Token para el formulario de pago
            'url': url,          # URL del formulario de Transbank
            'buy_order': buy_order,       # Orden de compra generada
            'amount': amount              # Monto de la transacción
        })
        
    except Exception as e:
        # En caso de error, retornar mensaje de error
        return jsonify({
            'error': f'Error al crear transacción: {str(e)}'
        }), 500

@app.route('/api/webpay/retorno', methods=['GET', 'POST'])  # Endpoint de retorno de WebPay
def webpay_return():
    """
    Endpoint que recibe la respuesta de WebPay después del pago
    """
    # Obtener token de la respuesta de WebPay
    token = request.args.get("token_ws")
    
    if not token:
        return jsonify({"error": "Token no recibido"}), 400
    
    try:        
        # Configurar opciones de WebPay
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        tx = Transaction(options)
        # Confirmar la transacción con Transbank
        response = tx.commit(token)

        # Extraer información de la respuesta (compatible con dict y objeto)
        if isinstance(response, dict):
            buy_order = response.get("buy_order")
            amount = response.get("amount")
        else:
            buy_order = response.buy_order if hasattr(response, "buy_order") else "unknown"
            amount = response.amount if hasattr(response, "amount") else 0
        
        # Redirigir al frontend con información del resultado
        redirect_url = f"{FINAL_URL}?token={token}&status=success&order={buy_order}&amount={amount}"
        return redirect(redirect_url)
    
    except Exception as e:        
        # En caso de error, redirigir con mensaje de error
        redirect_url = f"{FINAL_URL}?status=error&message={str(e)}"
        return redirect(redirect_url)

@app.route('/api/confirmar-transaccion', methods=['POST'])  # Confirmar transacción manualmente
def confirmar_transaccion():
    """Confirmar una transacción después del pago"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'error': 'Token es requerido'
            }), 400
        
        # Confirmar transacción con Transbank
        response = Transaction.commit(token)
        
        # Actualizar estado de la transacción en memoria
        buy_order = response.buy_order
        if buy_order in transactions:
            transactions[buy_order].update({
                'status': 'CONFIRMED' if response.status == 'AUTHORIZED' else 'FAILED',
                'response_code': response.response_code,
                'authorization_code': getattr(response, 'authorization_code', None),
                'confirmed_at': datetime.datetime.now().isoformat()
            })
        
        # Retornar información de la confirmación
        return jsonify({
            'success': True,
            'buy_order': response.buy_order,
            'status': response.status,
            'amount': response.amount,
            'response_code': response.response_code,
            'authorization_code': getattr(response, 'authorization_code', None),
            'transaction_date': getattr(response, 'transaction_date', None)
        })
    except Exception as e:
        return jsonify({
            'error': f'Error al confirmar transacción: {str(e)}'
        }), 500
    
@app.route('/api/transaction-status/<buy_order>', methods=['GET'])  # Obtener estado de transacción
def get_transaction_status(buy_order):
    """Obtener el estado de una transacción"""
    # Verificar si la transacción existe en memoria
    if buy_order not in transactions:
        return jsonify({
            'error': 'Transacción no encontrada'
        }), 404
    
    # Retornar información de la transacción
    return jsonify({
        'success': True,
        'transaction': transactions[buy_order]
    })

@app.route('/api/transactions', methods=['GET'])  # Obtener todas las transacciones
def get_all_transactions():
    """Obtener todas las transacciones"""
    return jsonify({
        'success': True,
        'transactions': list(transactions.values())  # Convertir valores del dict a lista
    })

@app.route('/api/anular-transaccion', methods=['POST'])  # Anular/reembolsar transacción
def anular_transaccion():
    """
    Endpoint para anular una transacción (opcional)
    """
    try:
        data = request.json  # Obtener datos JSON
        token = data.get('token')
        monto = data.get('monto')
        
        # Validar parámetros requeridos
        if not token or not monto:
            return jsonify({"error": "Debe proporcionar token y monto"}), 400
        
        # Configurar opciones de WebPay
        options = WebpayOptions(COMMERCE_CODE, API_KEY, INTEGRATION_TYPE)
        
        # Crear instancia de transacción
        tx = Transaction(options)
        # Solicitar reembolso
        response = tx.refund(token, monto)
                
        # Extraer información de la respuesta (compatible con dict y objeto)
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
        
        # Retornar información del reembolso
        return jsonify({
            "tipo_respuesta": tipo_respuesta,
            "codigo_autorizacion": codigo_autorizacion,
            "monto_anulado": monto_anulado,
            "codigo_respuesta": codigo_respuesta,
            "estado": estado
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#API EMPLEADOS
@app.route('/api/empleados', methods=['GET'])
def get_empleados():
    return flask_get_empleados()

@app.route('/api/empleados/<id_empleado>', methods=['GET'])
def get_empleado(id_empleado):
    return flask_get_empleado(id_empleado)

@app.route('/api/empleados', methods=['POST'])
def crear_empleado():
    data = request.get_json()
    return flask_crear_empleado(data)

@app.route('/api/empleados/<id_empleado>', methods=['PUT'])
def modificar_empleado(id_empleado):
    data = request.get_json()
    return flask_modificar_empleado(id_empleado, data)

@app.route('/api/empleados/<id_empleado>', methods=['DELETE'])
def eliminar_empleado(id_empleado):
    return flask_eliminar_empleado(id_empleado)

@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    return flask_get_categorias()

# Punto de entrada de la aplicación
if __name__ == '__main__':
    # Ejecutar aplicación Flask en modo debug
    # host='0.0.0.0' permite conexiones desde cualquier IP
    # port=5000 define el puerto de escucha
    app.run(debug=True, host='0.0.0.0', port=5000)
