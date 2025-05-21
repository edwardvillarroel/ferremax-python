
import base64
import os,pymysql,json
from typing import Dict, Any,List,Optional,Tuple,Union
import os
from dotenv import load_dotenv


load_dotenv()


MYSQL_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'bd-ferramas-producto.crwi4crvnqsy.us-east-1.rds.amazonaws.com'),
    'user': os.environ.get('MYSQL_USER', 'Ferremas_adm'),
    'password': os.environ.get('MYSQL_PASSWORD', 'C.AdmFerremas'),
    'database': os.environ.get('MYSQL_DATABASE', 'ferremasBD_Prod'),
    'port': int(os.environ.get('MYSQL_PORT', 3306)),
    'cursorclass': pymysql.cursors.DictCursor
}

class DatabaseError(Exception):
   pass

def get_db_connection():
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        return connection
    except pymysql.MySQLError as e:
        error_msg = f"Problema al conectar con AWS: {e}"
        raise DatabaseError(error_msg)

def execute_query(query: str, params: tuple = None, fetch: bool = True) -> Union[List[Dict], Dict, int]:
    connection = get_db_connection()
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
        error_msg = f"Respuesta:{e}"
        raise DatabaseError(error_msg)
    finally:
        connection.close()
        
"""De aqui pa abajo son operaciones CRUD se que se ven feas asi de largas las weas pero pa la 3ra entrega acortare todo esto y fucionarie todos los get,post,put y delete en una sola wea"""
        
def get_productos() -> List[Dict[str, Any]]:
    query = "SELECT * FROM Producto"
    return execute_query(query)


def get_producto(id_producto: str) -> Optional[Dict[str, Any]]:
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El id_producto debe ser de  hasta 12 caracteres")
    query = "SELECT * FROM Producto WHERE id_producto = %s"
    result = execute_query(query, (id_producto,))
    return result[0] if result else None


def crear_producto(
    id_producto: str,
    nom_prod: str,
    descr_prod: str,
    precio: int,
    marca: str,
    stock: int,
    id_categoria: int,
    img_prod: Optional[bytes] = None) -> Dict[str, Any]:
    # Validaciones
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El id_producto debe ser de  hasta 12 caracteres")
    if not isinstance(nom_prod, str) or len(nom_prod) > 30:
        raise ValueError("El nom_prod debe de hasta 30 caracteres")
    if not isinstance(descr_prod, str) or len(descr_prod) > 50:
        raise ValueError("La descr_prod debe serde hasta 50 caracteres")
    if not isinstance(precio, int) or precio < 0:
        raise ValueError("El precio debe ser un entero no negativo")
    if not isinstance(marca, str) or len(marca) > 30:
        raise ValueError("La marca debe ser de hasta caracteres")
    if not isinstance(stock, int) or stock < 0:
        raise ValueError("El stock debe ser un entero no negativo")
    if not isinstance(id_categoria, int) or id_categoria <= 0:
        raise ValueError("El id_categoria debe ser un entero positivo")
    if img_prod is not None:
            if not isinstance(img_prod, str):
                raise ValueError("La imagen debe ser un string en formato Base64 o None")
            try:
                base64.b64decode(img_prod, validate=True)
            except Exception as e:
                raise ValueError(f"Formato Base64 inválido: {str(e)}")

    query = """INSERT INTO Producto (id_producto, nom_prod, descr_prod, precio, marca, stock, id_categoria, img_prod)VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
    params = (id_producto, nom_prod, descr_prod, precio, marca, stock, id_categoria, img_prod)
    execute_query(query, params, fetch=False)

    return get_producto(id_producto)


def modificar_producto(id_producto: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if not data:
        raise ValueError("Ingresa datos para modificar")
    
    formatosValidos = {
            'nom_prod': {'type': str, 'max_length': 30, 'error': "El nom_prod debe ser de hasta 30 caracteres"},
            'descr_prod': {'type': str, 'max_length': 50, 'error': "La descr_prod debe ser de hasta 50 caracteres"},
            'precio': {'type': int, 'min_value': 0, 'error': "El precio debe ser un entero no negativo"},
            'marca': {'type': str, 'max_length': 30, 'error': "La marca debe ser de hasta 30 caracteres"},
            'stock': {'type': int, 'min_value': 0, 'error': "El stock debe ser un entero no positivo"},
            'id_categoria': {'type': int, 'min_value': 1, 'error': "El id_categoria debe ser un entero positivo"},
            'img_prod': {'type': str, 'optional': True, 'error': "La imagen debe ser un string en formato Base64 o None"}
        }
    #ESTA WEA VALIDA EL ID , Y LO DE ABAJO VALIDA EL FORMATO DE LOS CAMPOS Y DATOS PA MODIFICAR, NO BORREN ESTE COMENTARIO CTM QUE DESPUES SE ME OLVIDA PA QUE SON Y BORRO TODO
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El ID del producto debe ser un string de hasta 12 caracteres")

    for key in data:
        if key not in formatosValidos:
            raise ValueError(f"Campo inválido: {key}")
        field_info = formatosValidos[key]
        value = data[key]

        if value is not None:
            if not isinstance(value, field_info['type']):
                raise ValueError(field_info['error'])
            if field_info.get('max_length') and len(value) > field_info['max_length']:
                raise ValueError(field_info['error'])
            if field_info.get('min_value') is not None and value < field_info['min_value']:
                raise ValueError(field_info['error'])
            if key == 'img_prod':
                try:
                    base64.b64decode(value, validate=True)
                except Exception as e:
                    raise ValueError(f"Formato Base64 inválido para img_prod: {str(e)}")


    processed_data = data.copy()
    if 'img_prod' in processed_data and processed_data['img_prod'] is not None:
        processed_data['img_prod'] = base64.b64decode(processed_data['img_prod'])

    set_clause = ', '.join([f"{key} = %s" for key in processed_data.keys()])
    values = tuple(list(processed_data.values()) + [id_producto])
    query = f"UPDATE Producto SET {set_clause} WHERE id_producto = %s"
    execute_query(query, values, fetch=False)
    return get_producto(id_producto)


def eliminar_producto(id_producto: str) -> Dict[str, Any]:
    if not isinstance(id_producto, str) or len(id_producto) > 12:
        raise ValueError("El id_producto debe ser de hasta 12 caracteres")

    producto = get_producto(id_producto)
    if not producto:
        raise ValueError("El ID no existe")
    
    query = "DELETE FROM Producto WHERE id_producto = %s"
    params = (id_producto,)
    
    rows_affected = execute_query(query, params, fetch=False)
    
    if rows_affected == 0:
        raise DatabaseError("No se pudo eliminar el producto")
    
    return {"message": f"Producto eliminado correctamente"}


def login(email_cliente: str, password_cliente: str) -> Optional[Dict[str, Any]]:    
    if not isinstance(email_cliente, str) or len(email_cliente) > 40:
        raise ValueError("El email_cliente debe ser de hasta 40 caracteres")
    if not isinstance(password_cliente, str) or len(password_cliente) > 20:
        raise ValueError("La password_cliente debe ser de hasta 20 caracteres")
        
    query = "SELECT * FROM clientes WHERE email_cliente = %s"
    result = execute_query(query, (email_cliente,))
        
    if not result:
        return None
    
    cliente = result[0]
    if cliente['password_cliente'] == password_cliente:
        return cliente
    return None

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
                
        campos_obligatorios = ['id_producto', 'nom_prod', 'descr_prod', 'precio', 'marca', 'stock', 'id_categoria']
        for campo in campos_obligatorios:
            if campo not in data:
                return {"error": f"El campo '{campo}' es obligatorio"}, 400
                
        nuevo_producto = crear_producto(
            id_producto=data['id_producto'],
            nom_prod=data['nom_prod'],
            descr_prod=data['descr_prod'],
            precio=data['precio'],
            marca=data['marca'],
            stock=data['stock'],
            id_categoria=data['id_categoria'],
            img_prod=data.get('img_prod')
        )        
        return {
            "message": "Producto agregado",
            "data": nuevo_producto
        }, 201
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500


def flask_modificar_producto(id_producto: str, data: Dict[str, Any]) -> Tuple[Dict, int]:
    try:        
        producto = get_producto(id_producto)
        if not producto:
            return {"error": f"EL ID {id_producto} no existe"}, 404
                
        if not data:
            return {"error": "No se proporcionaron datos para actualizar"}, 400
                
        producto_actualizado = modificar_producto(id_producto, data)
        
        return {
            "message": "Producto actualizado",
            "data": producto_actualizado
        }, 200
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500


def flask_eliminar_producto(id_producto: str) -> Tuple[Dict, int]:
    try:
        producto = get_producto(id_producto)
        if not producto:
            return {"error": f"El ID {id_producto} no existe"}, 404
                
        resultado = eliminar_producto(id_producto)        
        return {
            "message": resultado.get("message", "Producto eliminado")
        }, 200
    except ValueError as e:
        return {"error": str(e)}, 400
    except DatabaseError as e:
        return {"error": str(e)}, 500
    except Exception as e:
        return {"error": f"Error: {str(e)}"}, 500
    

"cualquier wea nueva se agrega aqui"