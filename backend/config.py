
import base64
import os,pymysql,json
from typing import Dict, Any,List,Optional,Tuple,Union
import os
from dotenv import load_dotenv


load_dotenv()

DATABASE_CONFIGS = {
    'producto': {
        'host': os.environ.get('MYSQL_HOST', 'ferremax.crwi4crvnqsy.us-east-1.rds.amazonaws.com'),
        'user': os.environ.get('MYSQL_USER', 'Ferremas_adm'),
        'password': os.environ.get('MYSQL_PASSWORD', 'C.AdmFerremas'),
        'database': os.environ.get('MYSQL_DATABASE_PRODUCTO', 'Producto'),
        'port': int(os.environ.get('MYSQL_PORT', 3306)),
        'cursorclass': pymysql.cursors.DictCursor
    },
    'cliente': {
        'host': os.environ.get('MYSQL_HOST', 'ferremax.crwi4crvnqsy.us-east-1.rds.amazonaws.com'),
        'user': os.environ.get('MYSQL_USER', 'Ferremas_adm'),
        'password': os.environ.get('MYSQL_PASSWORD', 'C.AdmFerremas'),
        'database': os.environ.get('MYSQL_DATABASE_CLIENTE', 'Cliente'),
        'port': int(os.environ.get('MYSQL_PORT', 3306)),
        'cursorclass': pymysql.cursors.DictCursor
    },
    'empleado': {
        'host': os.environ.get('MYSQL_HOST', 'ferremax.crwi4crvnqsy.us-east-1.rds.amazonaws.com'),
        'user': os.environ.get('MYSQL_USER', 'Ferremas_adm'),
        'password': os.environ.get('MYSQL_PASSWORD', 'C.AdmFerremas'),
        'database': os.environ.get('MYSQL_DATABASE_EMPLEADO', 'Empleado'),
        'port': int(os.environ.get('MYSQL_PORT', 3306)),
        'cursorclass': pymysql.cursors.DictCursor
    }
}
class DatabaseError(Exception):
   pass
MYSQL_CONFIG = DATABASE_CONFIGS['producto']

def get_db_connection(database_type: str = 'producto'):
    if database_type not in DATABASE_CONFIGS:
        raise ValueError(f"Tipo de base de datos no válido: {database_type}. Opciones: {list(DATABASE_CONFIGS.keys())}")
    try:
        connection = pymysql.connect(**DATABASE_CONFIGS[database_type])
        return connection
    except pymysql.MySQLError as e:
        error_msg = f"Problema al conectar con AWS ({database_type}): {e}"
        raise DatabaseError(error_msg)

def execute_query(query: str, params: tuple = None, fetch: bool = True, database_type: str = 'producto') -> Union[List[Dict], Dict, int]:
    connection = get_db_connection(database_type)
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)            
            if fetch:
                result = cursor.fetchall()
                return result
            else:
                connection.commit()
                return cursor.lastrowid if cursor.lastrowid else cursor.rowcount
    except pymysql.MySQLError as e:
        if not fetch:
            connection.rollback()
        error_msg = f"Respuesta ({database_type}): {e}"
        raise DatabaseError(error_msg)
    finally:
        connection.close()
        
"""De aqui pa abajo son operaciones CRUD se que se ven feas asi de largas las weas pero pa la 3ra entrega acortare todo esto y fucionarie todos los get,post,put y delete en una sola wea"""
        
def get_productos() -> List[Dict[str, Any]]:
    query = "SELECT * FROM Producto"
    productos = execute_query(query, database_type='producto')
    
    for producto in productos:
        if producto.get('img_prod') and isinstance(producto['img_prod'], bytes):
            producto['img_prod'] = base64.b64encode(producto['img_prod']).decode('utf-8')
    
    return productos


def get_producto(id_producto: str) -> Optional[Dict[str, Any]]:
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El id_producto debe ser de  hasta 12 caracteres")
    query = "SELECT * FROM Producto WHERE id_producto = %s"
    result = execute_query(query, (id_producto,), database_type='producto')
    return result[0] if result else None

def crear_producto(
    id_producto: str,
    nom_prod: str,
    descr_prod: str,
    precio: int,
    marca: str,
    stock: int,
    id_categoria: int,
    lanzamiento: int,
    promocion: int,
    img_prod: Optional[str] = None) -> Dict[str, Any]:
    
    # Validaciones
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El id_producto debe ser de hasta 12 caracteres")
    if not isinstance(nom_prod, str) or len(nom_prod) > 30:
        raise ValueError("El nom_prod debe de hasta 30 caracteres")
    if not isinstance(descr_prod, str) or len(descr_prod) > 50:
        raise ValueError("La descr_prod debe ser de hasta 50 caracteres")
    if not isinstance(precio, int) or precio < 0:
        raise ValueError("El precio debe ser un entero no negativo")
    if not isinstance(marca, str) or len(marca) > 30:
        raise ValueError("La marca debe ser de hasta 30 caracteres")
    if not isinstance(stock, int) or stock < 0:
        raise ValueError("El stock debe ser un entero no negativo")
    if not isinstance(id_categoria, int) or id_categoria < 1 or id_categoria > 7:
        raise ValueError("El id_categoria debe ser un entero entre 1 y 7")
    if not isinstance(lanzamiento, int) or lanzamiento not in [0, 1]:
        raise ValueError("El lanzamiento debe ser 0 o 1")
    if not isinstance(promocion, int) or promocion not in [0, 1]:
        raise ValueError("La promocion debe ser 0 o 1")
    
    # Validación de imagen corregida
    if img_prod is not None:
        if not isinstance(img_prod, str):
            raise ValueError("La imagen debe ser un string en formato Base64 o None")
        if img_prod.strip():  # Solo validar si no está vacío
            try:
                base64.b64decode(img_prod, validate=True)
            except Exception as e:
                raise ValueError(f"Formato Base64 inválido: {str(e)}")

    query = """INSERT INTO Producto (id_producto, nom_prod, descr_prod, precio, marca, stock, id_categoria, lanzamiento, promocion, img_prod) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    params = (id_producto, nom_prod, descr_prod, precio, marca, stock, id_categoria, lanzamiento, promocion, img_prod)
    
    try:
        execute_query(query, params, fetch=False, database_type='producto')
        return get_producto(id_producto)
    except Exception as e:
        raise DatabaseError(f"Error al crear producto: {str(e)}")


def modificar_producto(id_producto: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if not data:
        raise ValueError("Ingresa datos para modificar")
    
    formatosValidos = {
        'nom_prod': {'type': str, 'max_length': 30, 'error': "El nom_prod debe ser de hasta 30 caracteres"},
        'descr_prod': {'type': str, 'max_length': 50, 'error': "La descr_prod debe ser de hasta 50 caracteres"},
        'precio': {'type': int, 'min_value': 0, 'error': "El precio debe ser un entero no negativo"},
        'marca': {'type': str, 'max_length': 30, 'error': "La marca debe ser de hasta 30 caracteres"},
        'stock': {'type': int, 'min_value': 0, 'error': "El stock debe ser un entero no negativo"},  # Corregido
        'id_categoria': {'type': int, 'min_value': 1, 'max_value': 7, 'error': "El id_categoria debe ser un entero entre 1 y 7"},
        'lanzamiento': {'type': int, 'valid_values': [0, 1], 'error': "El lanzamiento debe ser 0 o 1"},
        'promocion': {'type': int, 'valid_values': [0, 1], 'error': "La promocion debe ser 0 o 1"},
        'img_prod': {'type': str, 'optional': True, 'error': "La imagen debe ser un string en formato Base64 o None"}
    }
    
    # Validación del ID
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El ID del producto debe ser un string de hasta 12 caracteres")

    # Verificar que el producto existe
    if not get_producto(id_producto):
        raise ValueError("El producto con ese ID no existe")

    # Validación de campos
    for key in data:
        if key not in formatosValidos:
            raise ValueError(f"Campo inválido: {key}")
        
        field_info = formatosValidos[key]
        value = data[key]

        if value is not None:
            # Validación de tipo
            if not isinstance(value, field_info['type']):
                raise ValueError(field_info['error'])
            
            # Validación de longitud máxima
            if field_info.get('max_length') and len(str(value)) > field_info['max_length']:
                raise ValueError(field_info['error'])
            
            # Validación de valor mínimo
            if field_info.get('min_value') is not None and value < field_info['min_value']:
                raise ValueError(field_info['error'])
            
            # Validación de valor máximo
            if field_info.get('max_value') is not None and value > field_info['max_value']:
                raise ValueError(field_info['error'])
            
            # Validación de valores válidos (para lanzamiento y promocion)
            if field_info.get('valid_values') and value not in field_info['valid_values']:
                raise ValueError(field_info['error'])
            
            # Validación especial para imagen
            if key == 'img_prod' and value.strip():
                try:
                    base64.b64decode(value, validate=True)
                except Exception as e:
                    raise ValueError(f"Formato Base64 inválido para img_prod: {str(e)}")

    # Construir query sin modificar los datos (mantener como string Base64)
    set_clause = ', '.join([f"{key} = %s" for key in data.keys()])
    values = tuple(list(data.values()) + [id_producto])
    query = f"UPDATE Producto SET {set_clause} WHERE id_producto = %s"
    
    try:
        execute_query(query, values, fetch=False, database_type='producto')
        return get_producto(id_producto)
    except Exception as e:
        raise DatabaseError(f"Error al modificar producto: {str(e)}")


def eliminar_producto(id_producto: str) -> Dict[str, Any]:
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El id_producto debe ser de hasta 12 caracteres")

    # Verificar que el producto existe antes de eliminar
    producto = get_producto(id_producto)
    if not producto:
        raise ValueError("El producto con ese ID no existe")
    
    query = "DELETE FROM Producto WHERE id_producto = %s"
    params = (id_producto,)
    
    try:
        rows_affected = execute_query(query, params, fetch=False, database_type='producto')
        
        if rows_affected == 0:
            raise DatabaseError("No se pudo eliminar el producto")
        
        return {"message": f"Producto {id_producto} eliminado correctamente"}
    except Exception as e:
        raise DatabaseError(f"Error al eliminar producto: {str(e)}")



def login(email_cliente: str, password_cliente: str) -> Optional[Dict[str, Any]]:    
    if not isinstance(email_cliente, str) or len(email_cliente) > 40:
        raise ValueError("El email_cliente debe ser de hasta 40 caracteres")
    if not isinstance(password_cliente, str) or len(password_cliente) > 20:
        raise ValueError("La password_cliente debe ser de hasta 20 caracteres")
        
    query = "SELECT * FROM Cliente WHERE email_cliente = %s"
    result = execute_query(query, (email_cliente,), database_type='cliente')
        
    if not result:
        return None
    
    cliente = result[0]
    if cliente['password_cliente'] == password_cliente:
        return cliente
    return None


def get_cliente(email_cliente: str) -> Optional[Dict[str, Any]]:
    if not isinstance(email_cliente, str) or len(email_cliente) > 40:
        raise ValueError("Formato no válido")
    query = "SELECT * FROM Cliente WHERE email_cliente = %s"
    result = execute_query(query, (email_cliente,), database_type='cliente')
    return result[0] if result else None

def login_empleado(correo_emp: str, password_emp: str) -> Optional[Dict[str, Any]]:
    if not isinstance(correo_emp, str) or len(correo_emp) > 40:
        raise ValueError("El correo_emp debe ser de hasta 40 caracteres")
    if not isinstance(password_emp, str) or len(password_emp) > 20:
        raise ValueError("La password_emp debe ser de hasta 20 caracteres")
        
    query = "SELECT * FROM Empleado WHERE correo_emp = %s"
    result = execute_query(query, (correo_emp,), database_type='empleado')
        
    if not result:
        return None
    
    empleado = result[0]
    if empleado['password_emp'] == password_emp:
        return empleado
    return None

def get_empleado(correo_emp: str) -> Optional[Dict[str, Any]]:
    if not isinstance(correo_emp, str) or len(correo_emp) > 40:
        raise ValueError("Formato no válido")
    query = "SELECT * FROM Empleado WHERE correo_emp = %s"
    result = execute_query(query, (correo_emp,), database_type='empleado')


def registro_cliente(
    run_cliente: str,
    dvrun_cliente: str,
    nombre_cliente: str,
    apellidos_cliente: str,
    email_cliente: str,
    password_cliente: str) -> Dict[str, Any]:
        
    validaciones = [
        (isinstance(run_cliente, str) and len(run_cliente) <= 8, "run_cliente"),
        (isinstance(dvrun_cliente, str) and len(dvrun_cliente) == 1, "dvrun_cliente"),
        (isinstance(nombre_cliente, str) and len(nombre_cliente) <= 20, "nombre_cliente"),
        (isinstance(apellidos_cliente, str) and len(apellidos_cliente) <= 20, "apellidos_cliente"),
        (isinstance(email_cliente, str) and len(email_cliente) <= 40, "email_cliente"),
        (isinstance(password_cliente, str) and len(password_cliente) <= 20, "password_cliente")
    ]
    
    for valor, campo in validaciones:
        if not valor:
            raise ValueError(f"Formato no válido: {campo}")
    
    cliente_existente = get_cliente(email_cliente)
    if cliente_existente:
        raise ValueError("Email ya registrado")

    query = """INSERT INTO Cliente (run_cliente, dvrun_cliente, nombre_cliente, apellidos_cliente, 
               email_cliente, password_cliente) VALUES (%s, %s, %s, %s, %s, %s)"""
    params = (run_cliente, dvrun_cliente, nombre_cliente, apellidos_cliente, email_cliente, password_cliente)
    execute_query(query, params, fetch=False, database_type='cliente')

    return get_cliente(email_cliente)

"""weas para usar las funciones en flask"""


def flask_login(email_cliente: str, password_cliente: str) -> Tuple[Dict, int]:
    try:
        cliente = login(email_cliente, password_cliente)
        if cliente:
            return {"data": cliente}, 200
        else:
            return {"error": "correo o contraseña incorrectos"}, 401
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500
    

def flask_login_empleado(correo_emp: str, password_emp: str) -> Tuple[Dict, int]:
    try:
        empleado = login_empleado(correo_emp, password_emp)
        if empleado:
            return {"data": empleado}, 200
        else:
            return {"error": "correo o contraseña incorrectos"}, 401
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500


def flask_get_productos() -> Tuple[Dict, int]:
    try:
        productos = get_productos()
        return {"data": productos, "count": len(productos)}, 200
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500
    
    
def flask_get_producto(id_producto: str) -> Tuple[Dict, int]:
    try:
        producto = get_producto(id_producto)
        if producto:
            return {"data": producto}, 200
        else:
            return {"error": f"Producto con ID {id_producto} no encontrado"}, 404
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500
    
    

def flask_crear_producto(data: Dict[str, Any]) -> Tuple[Dict, int]:
    try:        
        id_producto = data.get('id_producto')
        if not id_producto:
            return {"error": "El campo 'id_producto' es obligatorio"}, 400
            
        producto_existente = get_producto(id_producto)
        if producto_existente:
            return {"error": f"Ya existe un producto con ID {id_producto}"}, 409
        
        # Campos obligatorios actualizados con lanzamiento y promocion        
        campos_obligatorios = ['id_producto', 'nom_prod', 'descr_prod', 'precio', 'marca', 'stock', 'id_categoria', 'lanzamiento', 'promocion']
        for campo in campos_obligatorios:
            if campo not in data:
                return {"error": f"El campo '{campo}' es obligatorio"}, 400
        
        # Validaciones adicionales de tipo y rango
        try:
            # Convertir a enteros si vienen como string
            data['precio'] = int(data['precio'])
            data['stock'] = int(data['stock'])
            data['id_categoria'] = int(data['id_categoria'])
            data['lanzamiento'] = int(data['lanzamiento'])
            data['promocion'] = int(data['promocion'])
        except (ValueError, TypeError):
            return {"error": "Los campos numéricos deben ser números enteros válidos"}, 400
        
        # Validaciones específicas
        if data['id_categoria'] < 1 or data['id_categoria'] > 7:
            return {"error": "El id_categoria debe estar entre 1 y 7"}, 400
        
        if data['lanzamiento'] not in [0, 1]:
            return {"error": "El campo lanzamiento debe ser 0 o 1"}, 400
            
        if data['promocion'] not in [0, 1]:
            return {"error": "El campo promocion debe ser 0 o 1"}, 400
                
        nuevo_producto = crear_producto(
            id_producto=data['id_producto'],
            nom_prod=data['nom_prod'],
            descr_prod=data['descr_prod'],
            precio=data['precio'],
            marca=data['marca'],
            stock=data['stock'],
            id_categoria=data['id_categoria'],
            lanzamiento=data['lanzamiento'],
            promocion=data['promocion'],
            img_prod=data.get('img_prod')
        )        
        return {
            "message": "Producto agregado exitosamente",
            "data": nuevo_producto
        }, 201
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error interno: {str(e)}"}, 500


def flask_modificar_producto(id_producto: str, data: Dict[str, Any]) -> Tuple[Dict, int]:
    try:        
        producto = get_producto(id_producto)
        if not producto:
            return {"error": f"El producto con ID {id_producto} no existe"}, 404
                
        if not data:
            return {"error": "No se proporcionaron datos para actualizar"}, 400
        
        # Validaciones adicionales para campos que pueden ser modificados
        if 'precio' in data:
            try:
                data['precio'] = int(data['precio'])
            except (ValueError, TypeError):
                return {"error": "El precio debe ser un número entero válido"}, 400
        
        if 'stock' in data:
            try:
                data['stock'] = int(data['stock'])
            except (ValueError, TypeError):
                return {"error": "El stock debe ser un número entero válido"}, 400
        
        if 'id_categoria' in data:
            try:
                data['id_categoria'] = int(data['id_categoria'])
                if data['id_categoria'] < 1 or data['id_categoria'] > 7:
                    return {"error": "El id_categoria debe estar entre 1 y 7"}, 400
            except (ValueError, TypeError):
                return {"error": "El id_categoria debe ser un número entero válido"}, 400
        
        if 'lanzamiento' in data:
            try:
                data['lanzamiento'] = int(data['lanzamiento'])
                if data['lanzamiento'] not in [0, 1]:
                    return {"error": "El campo lanzamiento debe ser 0 o 1"}, 400
            except (ValueError, TypeError):
                return {"error": "El lanzamiento debe ser un número entero válido (0 o 1)"}, 400
        
        if 'promocion' in data:
            try:
                data['promocion'] = int(data['promocion'])
                if data['promocion'] not in [0, 1]:
                    return {"error": "El campo promocion debe ser 0 o 1"}, 400
            except (ValueError, TypeError):
                return {"error": "La promocion debe ser un número entero válido (0 o 1)"}, 400
        
        producto_actualizado = modificar_producto(id_producto, data)
        
        return {
            "message": "Producto actualizado exitosamente",
            "data": producto_actualizado
        }, 200
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error interno: {str(e)}"}, 500


def flask_eliminar_producto(id_producto: str) -> Tuple[Dict, int]:
    try:
        # Validar que el ID no esté vacío
        if not id_producto or not id_producto.strip():
            return {"error": "El ID del producto es requerido"}, 400
        
        producto = get_producto(id_producto)
        if not producto:
            return {"error": f"El producto con ID {id_producto} no existe"}, 404
                
        resultado = eliminar_producto(id_producto)        
        return {
            "message": resultado.get("message", "Producto eliminado exitosamente")
        }, 200
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error interno: {str(e)}"}, 500


# Función auxiliar para validar datos de entrada comunes
def validar_datos_producto(data: Dict[str, Any], es_creacion: bool = False) -> Tuple[Dict, int, bool]:
    """
    Valida los datos de entrada para crear/modificar productos
    Retorna: (mensaje_error, codigo_estado, es_valido)
    """
    if es_creacion:
        campos_obligatorios = ['id_producto', 'nom_prod', 'descr_prod', 'precio', 'marca', 'stock', 'id_categoria', 'lanzamiento', 'promocion']
        for campo in campos_obligatorios:
            if campo not in data or data[campo] is None:
                return {"error": f"El campo '{campo}' es obligatorio"}, 400, False
    
    # Validaciones de longitud para strings
    validaciones_string = {
        'id_producto': 12,
        'nom_prod': 30,
        'descr_prod': 50,
        'marca': 30
    }
    
    for campo, max_length in validaciones_string.items():
        if campo in data and data[campo] is not None:
            if not isinstance(data[campo], str):
                return {"error": f"El campo '{campo}' debe ser texto"}, 400, False
            if len(data[campo]) > max_length:
                return {"error": f"El campo '{campo}' no puede tener más de {max_length} caracteres"}, 400, False
            if len(data[campo].strip()) == 0:
                return {"error": f"El campo '{campo}' no puede estar vacío"}, 400, False
    
    return {}, 200, True

def get_categorias() -> list:
    query = "SELECT id_categoria, nom_cat FROM Categoria"
    return execute_query(query, database_type='producto')

def flask_get_categorias():
    try:
        categorias = get_categorias()
        return {"data": categorias, "count": len(categorias)}, 200
    except Exception as e:
        return {"error": str(e)}, 500
    
def flask_crear_cliente(data: Dict[str, Any]) -> Tuple[Dict, int]:
    try:        
        campos_obligatorios = ['run_cliente', 'dvrun_cliente', 'nombre_cliente', 
                              'apellidos_cliente', 'email_cliente', 'password_cliente']
        
        for campo in campos_obligatorios:
            if campo not in data:
                return {"error": f"El campo '{campo}' es obligatorio"}, 400
                
        email = data['email_cliente']
        cliente_existente = get_cliente(email)
        if cliente_existente:
            return {"error": "Email ya registrado"}, 409
                
        
        nuevo_cliente = registro_cliente(
            run_cliente=data['run_cliente'],
            dvrun_cliente=data['dvrun_cliente'],
            nombre_cliente=data['nombre_cliente'],
            apellidos_cliente=data['apellidos_cliente'],
            email_cliente=data['email_cliente'],
            password_cliente=data['password_cliente']
        )
        
        return {
            "message": "Cliente registrado",
            "data": nuevo_cliente
        }, 201
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500
    
"cualquier wea nueva se agrega aqui"

#CRUD EMPLEADO

def get_empleados() -> list:
    query = """
        SELECT e.id_empleado, e.pnom_emp, e.snom_emp, e.appat_emp, e.apmat_emp, e.correo_emp, e.id_cargo, c.nom_cargo
        FROM Empleado e
        LEFT JOIN Cargo c ON e.id_cargo = c.id_cargo
    """
    return execute_query(query, database_type='empleado')

def get_empleado_by_id(id_empleado: str) -> dict:
    query = """
        SELECT e.id_empleado, e.pnom_emp, e.snom_emp, e.appat_emp, e.apmat_emp, e.correo_emp, e.id_cargo, c.nom_cargo
        FROM Empleado e
        LEFT JOIN Cargo c ON e.id_cargo = c.id_cargo
        WHERE e.id_empleado = %s
    """
    result = execute_query(query, (id_empleado,), database_type='empleado')
    return result[0] if result else None

def crear_empleado(data: dict) -> dict:
    campos = ['pnom_emp', 'snom_emp', 'appat_emp', 'apmat_emp', 'correo_emp', 'id_cargo', 'password_emp']
    for campo in campos:
        if campo not in data:
            raise ValueError(f"El campo '{campo}' es obligatorio")

    # Obtener el último id_empleado
    query_last_id = "SELECT id_empleado FROM Empleado WHERE id_empleado <> '' ORDER BY id_empleado DESC LIMIT 1"
    result = execute_query(query_last_id, database_type='empleado')
    if result and result[0]['id_empleado']:
        last_id = result[0]['id_empleado']
        last_num = int(last_id.replace('EMP', ''))
        new_num = last_num + 1
    else:
        new_num = 1
    new_id = f"EMP{new_num:03d}"

    query = """
        INSERT INTO Empleado (id_empleado, pnom_emp, snom_emp, appat_emp, apmat_emp, correo_emp, id_cargo, password_emp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        new_id,
        data['pnom_emp'],
        data['snom_emp'],
        data['appat_emp'],
        data['apmat_emp'],
        data['correo_emp'],
        data['id_cargo'],
        data['password_emp']
    )
    execute_query(query, params, fetch=False, database_type='empleado')
    return get_empleado_by_id(new_id)

def modificar_empleado(id_empleado: str, data: dict) -> dict:
    campos_validos = ['pnom_emp', 'snom_emp', 'appat_emp', 'apmat_emp', 'correo_emp', 'id_cargo', 'password_emp']
    set_clause = ', '.join([f"{campo} = %s" for campo in data if campo in campos_validos])
    if not set_clause:
        raise ValueError("No hay campos válidos para actualizar")
    params = tuple(data[campo] for campo in data if campo in campos_validos) + (id_empleado,)
    query = f"UPDATE Empleado SET {set_clause} WHERE id_empleado = %s"
    execute_query(query, params, fetch=False, database_type='empleado')
    return get_empleado_by_id(id_empleado)

def eliminar_empleado(id_empleado: str) -> dict:
    empleado = get_empleado_by_id(id_empleado)
    if not empleado:
        raise ValueError("El empleado no existe")
    query = "DELETE FROM Empleado WHERE id_empleado = %s"
    try:
        execute_query(query, (id_empleado,), fetch=False, database_type='empleado')
    except DatabaseError as e:
        raise ValueError(f"No se puede eliminar el empleado: {e}")
    return {"message": "Empleado eliminado correctamente"}

# Funciones para usar en Flask

def flask_get_empleados():
    try:
        empleados = get_empleados()
        return {"data": empleados, "count": len(empleados)}, 200
    except Exception as e:
        return {"error": str(e)}, 500

def flask_get_empleado(id_empleado: str):
    try:
        empleado = get_empleado_by_id(id_empleado)
        if empleado:
            return {"data": empleado}, 200
        else:
            return {"error": "Empleado no encontrado"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

def flask_crear_empleado(data: dict):
    try:
        nuevo = crear_empleado(data)
        return {"message": "Empleado creado", "data": nuevo}, 201
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        return {"error": str(e)}, 500

def flask_modificar_empleado(id_empleado: str, data: dict):
    try:
        actualizado = modificar_empleado(id_empleado, data)
        return {"message": "Empleado actualizado", "data": actualizado}, 200
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        return {"error": str(e)}, 500

def flask_eliminar_empleado(id_empleado: str):
    try:
        resultado = eliminar_empleado(id_empleado)
        return resultado, 200
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        return {"error": str(e)}, 500