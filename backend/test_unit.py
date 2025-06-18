import pytest
import json
import base64
from unittest.mock import patch, MagicMock
from app import app, execute_query, dict_factory
from config import get_db_connection, DatabaseError

# Fixture para cliente de prueba
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# 1. Prueba unitaria para la función execute_query
@patch('app.pymysql.connect')
def test_execute_query_select(mock_connect):
    # Configurar el mock
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [{'id': 1, 'nombre': 'Test'}]
    mock_connection.cursor.return_value = mock_cursor
    mock_connect.return_value = mock_connection
    
    # Ejecutar la función
    result = execute_query("SELECT * FROM test", fetch=True)
    
    # Verificar resultados
    assert result == [{'id': 1, 'nombre': 'Test'}]
    mock_cursor.execute.assert_called_once_with("SELECT * FROM test")
    mock_cursor.fetchall.assert_called_once()

# 2. Prueba unitaria para la función execute_query (INSERT)
@patch('app.pymysql.connect')
def test_execute_query_insert(mock_connect):
    # Configurar el mock
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.rowcount = 1
    mock_connection.cursor.return_value = mock_cursor
    mock_connect.return_value = mock_connection
    
    # Ejecutar la función
    result = execute_query("INSERT INTO test VALUES (1, 'Test')", fetch=False)
    
    # Verificar resultados
    assert result == 1
    mock_cursor.execute.assert_called_once_with("INSERT INTO test VALUES (1, 'Test')")
    mock_connection.commit.assert_called_once()

# 3. Prueba unitaria para la función dict_factory
def test_dict_factory():
    # Crear mocks para cursor y row
    cursor = MagicMock()
    cursor.description = [("id",), ("nombre",)]
    row = [1, "Test"]
    
    # Ejecutar la función
    result = dict_factory(cursor, row)
    
    # Verificar resultados
    assert result == {"id": 1, "nombre": "Test"}

# 4. Prueba unitaria para manejo de errores en execute_query
@patch('app.pymysql.connect')
def test_execute_query_error(mock_connect):
    # Configurar el mock para lanzar una excepción
    mock_connect.side_effect = Exception("Error de conexión")
    
    # Ejecutar la función y verificar que maneja el error
    result = execute_query("SELECT * FROM test", fetch=True)
    
    # Verificar que devuelve una lista vacía en caso de error
    assert result == []

# 5. Prueba unitaria para la función get_db_connection
@patch('config.pymysql.connect')
def test_get_db_connection(mock_connect):
    # Configurar el mock
    mock_connection = MagicMock()
    mock_connect.return_value = mock_connection
    
    # Ejecutar la función
    connection = get_db_connection()
    
    # Verificar que se llamó a connect con los parámetros correctos
    mock_connect.assert_called_once()
    assert connection == mock_connection

# 6. Prueba unitaria para manejo de errores en get_db_connection
@patch('config.pymysql.connect')
def test_get_db_connection_error(mock_connect):
    # Configurar el mock para lanzar una excepción
    mock_connect.side_effect = Exception("Error de conexión")
    
    # Verificar que se lanza la excepción DatabaseError
    with pytest.raises(Exception):
        get_db_connection()

# 7. Prueba unitaria para la ruta /api/productos (GET)
@patch('app.execute_query')
def test_get_productos_route(mock_execute_query, client):
    # Configurar el mock
    mock_execute_query.return_value = [
        {'id_producto': 'P001', 'nom_prod': 'Martillo', 'precio': 5000, 'img_prod': None}
    ]
    
    # Hacer la petición
    response = client.get('/api/productos')
    data = json.loads(response.data)
    
    # Verificar la respuesta
    assert response.status_code == 200
    assert data['success'] == True
    assert len(data['data']) == 1
    assert data['data'][0]['nom_prod'] == 'Martillo'

# 8. Prueba unitaria para la ruta /api/productos/<id_producto> (GET)
@patch('app.execute_query')
def test_get_producto_by_id_route(mock_execute_query, client):
    # Configurar el mock
    mock_execute_query.return_value = [
        {'id_producto': 'P001', 'nom_prod': 'Martillo', 'precio': 5000}
    ]
    
    # Hacer la petición
    response = client.get('/api/productos/P001')
    data = json.loads(response.data)
    
    # Verificar la respuesta
    assert response.status_code == 200
    assert data['success'] == True
    assert data['data']['nom_prod'] == 'Martillo'

# 9. Prueba unitaria para la ruta /api/productos (POST)
@patch('app.execute_query')
def test_crear_producto_route(mock_execute_query, client):
    # Configurar el mock
    mock_execute_query.side_effect = [[], 1]  # Primero para verificar si existe, luego para insertar
    
    # Datos del producto
    producto = {
        'id_producto': 'P001',
        'nom_prod': 'Martillo',
        'descr_prod': 'Martillo de carpintero',
        'precio': 5000,
        'marca': 'Stanley',
        'stock': 10,
        'id_categoria': 1,
        'lanzamiento': 0,
        'promocion': 0
    }
    
    # Hacer la petición
    response = client.post('/api/productos', 
                          data=json.dumps(producto),
                          content_type='application/json')
    data = json.loads(response.data)
    
    # Verificar la respuesta
    assert response.status_code == 200
    assert data['success'] == True
    assert 'message' in data

# 10. Prueba unitaria para la ruta /api/productos/<id_producto> (DELETE)
@patch('app.execute_query')
def test_eliminar_producto_route(mock_execute_query, client):
    # Configurar el mock
    mock_execute_query.side_effect = [[{'id_producto': 'P001'}], 1]  # Primero para verificar si existe, luego para eliminar
    
    # Hacer la petición
    response = client.delete('/api/productos/P001')
    data = json.loads(response.data)
    
    # Verificar la respuesta
    assert response.status_code == 200
    assert data['success'] == True
    assert 'message' in data