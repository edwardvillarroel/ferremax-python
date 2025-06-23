import pytest
import json
import base64
from app import app
from unittest.mock import patch, MagicMock

# Fixture para cliente de prueba
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# 1. Prueba de integración para el flujo completo de productos
@patch('app.execute_query')
def test_producto_crud_flow(mock_execute_query, client):
    # Mock para verificar si el producto existe (GET)
    mock_execute_query.return_value = []
    
    # 1. Crear un producto (POST)
    producto = {
        'id_producto': 'TEST001',
        'nom_prod': 'Producto de Prueba',
        'descr_prod': 'Descripción de prueba',
        'precio': 1000,
        'marca': 'Marca Test',
        'stock': 5,
        'id_categoria': 1,
        'lanzamiento': 0,
        'promocion': 0
    }
    
    response = client.post('/api/productos',
                          data=json.dumps(producto),
                          content_type='application/json')
    assert response.status_code == 200
    
    # 2. Configurar mock para obtener el producto creado
    mock_execute_query.return_value = [{
        'id_producto': 'TEST001',
        'nom_prod': 'Producto de Prueba',
        'descr_prod': 'Descripción de prueba',
        'precio': 1000,
        'marca': 'Marca Test',
        'stock': 5,
        'id_categoria': 1,
        'lanzamiento': 0,
        'promocion': 0,
        'img_prod': None
    }]
    
    # Obtener el producto (GET)
    response = client.get('/api/productos/TEST001')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['data']['nom_prod'] == 'Producto de Prueba'
    
    # 3. Actualizar el producto (PUT)
    producto_actualizado = {
        'nom_prod': 'Producto Actualizado',
        'descr_prod': 'Descripción actualizada',
        'precio': 1500,
        'marca': 'Marca Test',
        'stock': 10,
        'id_categoria': 1,
        'lanzamiento': 0,
        'promocion': 0
    }
    
    response = client.put('/api/productos/TEST001',
                         data=json.dumps(producto_actualizado),
                         content_type='application/json')
    assert response.status_code == 200
    
    # 4. Eliminar el producto (DELETE)
    response = client.delete('/api/productos/TEST001')
    assert response.status_code == 200

# 2. Prueba de integración para autenticación de empleados
@patch('app.get_db_connection')
def test_login_empleado_flow(mock_get_connection, client):
    # Configurar mock para la conexión y cursor
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = {
        'pnom_emp': 'Juan',
        'snom_emp': 'Carlos',
        'appat_emp': 'Pérez',
        'apmat_emp': 'Gómez',
        'correo_emp': 'juan@example.com',
        'id_cargo': 1,
        'password_emp': 'password123'
    }
    mock_connection.cursor.return_value = mock_cursor
    mock_get_connection.return_value = mock_connection
    
    # Intentar login con credenciales correctas
    response = client.get('/api/login-empleado?email=juan@example.com&password=password123')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert data['user']['name'] == 'Juan'
    
    # Configurar mock para contraseña incorrecta
    mock_cursor.fetchone.return_value = {
        'pnom_emp': 'Juan',
        'snom_emp': 'Carlos',
        'appat_emp': 'Pérez',
        'apmat_emp': 'Gómez',
        'correo_emp': 'juan@example.com',
        'id_cargo': 1,
        'password_emp': 'password_correcta'
    }
    
    # Intentar login con contraseña incorrecta
    response = client.get('/api/login-empleado?email=juan@example.com&password=password_incorrecta')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['success'] == False

# 3. Prueba de integración para autenticación de clientes
@patch('app.get_db_connection')
def test_login_cliente_flow(mock_get_connection, client):
    # Configurar mock para la conexión y cursor
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = {
        'nombre_cliente': 'María',
        'apellidos_cliente': 'González',
        'email_cliente': 'maria@example.com',
        'password_cliente': 'clave123'
    }
    mock_connection.cursor.return_value = mock_cursor
    mock_get_connection.return_value = mock_connection
    
    # Intentar login con credenciales correctas
    response = client.get('/api/login?email=maria@example.com&password=clave123')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert data['user']['name'] == 'María'
    
    # Configurar mock para usuario no encontrado
    mock_cursor.fetchone.return_value = None
    
    # Intentar login con usuario inexistente
    response = client.get('/api/login?email=noexiste@example.com&password=clave123')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['success'] == False

# 4. Prueba de integración para el flujo de transacciones WebPay
@patch('app.Transaction.commit')
@patch('app.Transaction')
@patch('app.WebpayOptions')
def test_webpay(mock_webpay_options, mock_transaction, mock_commit, client):
    # Mock para WebpayOptions
    mock_options = MagicMock()
    mock_webpay_options.return_value = mock_options
    
    # Mock para la instancia de Transaction (para crear transacción)
    mock_tx_instance = MagicMock()
    mock_tx_instance.create.return_value = {
        'token': 'token123',
        'url': 'https://webpay.example.com/form'
    }
    mock_transaction.return_value = mock_tx_instance
    
    # 1. Crear transacción
    response = client.post('/api/webpay/crear_transaccion',
                          data=json.dumps({'amount': 10000}),
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    
    
# 5. Prueba de integración para gestión de empleados
@patch('app.flask_get_empleados')
@patch('app.flask_get_empleado')
@patch('app.flask_crear_empleado')
@patch('app.flask_modificar_empleado')
@patch('app.flask_eliminar_empleado')
def test_empleados_crud_flow(mock_eliminar, mock_modificar, mock_crear, 
                           mock_get_empleado, mock_get_empleados, client):
    # Configurar mocks
    mock_get_empleados.return_value = ({
        'data': [
            {'id_empleado': 'EMP001', 'pnom_emp': 'Juan', 'correo_emp': 'juan@example.com'}
        ]
    }, 200)
    
    mock_get_empleado.return_value = ({
        'data': {'id_empleado': 'EMP001', 'pnom_emp': 'Juan', 'correo_emp': 'juan@example.com'}
    }, 200)
    
    mock_crear.return_value = ({
        'data': {'id_empleado': 'EMP002', 'pnom_emp': 'Pedro', 'correo_emp': 'pedro@example.com'}
    }, 201)
    
    mock_modificar.return_value = ({
        'data': {'id_empleado': 'EMP001', 'pnom_emp': 'Juan Modificado', 'correo_emp': 'juan@example.com'}
    }, 200)
    
    mock_eliminar.return_value = ({
        'message': 'Empleado eliminado correctamente'
    }, 200)
    
    # 1. Obtener todos los empleados
    response = client.get('/api/empleados')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'data' in data
    assert len(data['data']) == 1
    
    # 2. Obtener un empleado específico
    response = client.get('/api/empleados/EMP001')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['data']['pnom_emp'] == 'Juan'
    
    # 3. Crear un nuevo empleado
    nuevo_empleado = {
        'pnom_emp': 'Pedro',
        'snom_emp': '',
        'appat_emp': 'López',
        'apmat_emp': 'García',
        'correo_emp': 'pedro@example.com',
        'id_cargo': 2,
        'password_emp': 'clave123'
    }
    
    response = client.post('/api/empleados',
                          data=json.dumps(nuevo_empleado),
                          content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['data']['pnom_emp'] == 'Pedro'
    
    # 4. Modificar un empleado
    empleado_modificado = {
        'pnom_emp': 'Juan Modificado',
        'snom_emp': '',
        'appat_emp': 'Pérez',
        'apmat_emp': 'Gómez',
        'correo_emp': 'juan@example.com',
        'id_cargo': 1
    }
    
    response = client.put('/api/empleados/EMP001',
                         data=json.dumps(empleado_modificado),
                         content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['data']['pnom_emp'] == 'Juan Modificado'
    
    # 5. Eliminar un empleado
    response = client.delete('/api/empleados/EMP001')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'message' in data

# 6. Prueba de integración para productos por categoría
@patch('app.execute_query')
def test_productos_por_categoria(mock_execute_query, client):
    # Configurar mock
    mock_execute_query.return_value = [
        {'id_producto': 'P001', 'nom_prod': 'Martillo', 'id_categoria': 1},
        {'id_producto': 'P002', 'nom_prod': 'Destornillador', 'id_categoria': 1}
    ]
    
    # Obtener productos por categoría
    response = client.get('/api/productos/categoria/1/1')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert len(data['data']) == 2

# 7. Prueba de integración para la ruta principal (home)
@patch('app.execute_query')
@patch('app.render_template')
def test_home_route(mock_render_template, mock_execute_query, client):
    # Configurar mocks
    lanzamientos_data = [{'id_producto': 'P001', 'nom_prod': 'Producto Nuevo', 'lanzamiento': 1}]
    promociones_data = [{'id_producto': 'P002', 'nom_prod': 'Producto Oferta', 'promocion': 1}]
    mock_execute_query.side_effect = [
        lanzamientos_data,
        promociones_data
    ]
    mock_render_template.return_value = "HTML Content"
    
    # Hacer petición a la ruta principal
    response = client.get('/')
    assert response.status_code == 200
    
    # Verificar que se llamó a render_template con los parámetros correctos
    mock_render_template.assert_called_once_with(
        'home.html', 
        lanzamientos=lanzamientos_data, 
        promociones=promociones_data
    )

# 8. Prueba de integración para tasa de cambio
@patch('app.flask_get_tasa_cambio')
def test_exchange_rate(mock_get_tasa_cambio, client):
    # Configurar mock
    mock_get_tasa_cambio.return_value = ({
        'success': True,
        'currency': 'USD',
        'rate': 850.50,
        'date': '2023-06-01'
    }, 200)
    
    # Obtener tasa de cambio
    response = client.get('/api/exchange-rate/USD')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert data['currency'] == 'USD'
    assert data['rate'] == 850.50

# 9. Prueba de integración para manejo de errores
def test_error_handling(client):
    # Ruta que no existe
    response = client.get('/api/ruta_inexistente')
    assert response.status_code == 404
    
    # Método no permitido
    response = client.post('/api/productos/P001')
    assert response.status_code == 405
    
    # Datos inválidos
    response = client.post('/api/productos',
                          data=json.dumps({'campo_invalido': 'valor'}),
                          content_type='application/json')
    assert response.status_code == 400

# 10. Prueba de integración para obtener categorías
@patch('app.flask_get_categorias')
def test_get_categorias(mock_get_categorias, client):
    # Configurar mock
    mock_get_categorias.return_value = ({
        'data': [
            {'id_categoria': 1, 'nom_categoria': 'Herramientas'},
            {'id_categoria': 2, 'nom_categoria': 'Tornillos'},
            {'id_categoria': 3, 'nom_categoria': 'Fijaciones'}
        ]
    }, 200)
    
    # Obtener categorías
    response = client.get('/api/categorias')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'data' in data
    assert len(data['data']) == 3
    assert data['data'][0]['nom_categoria'] == 'Herramientas'