import base64
import io
from typing import Optional, Union
from PIL import Image
import mysql.connector
import psycopg2

def imagen_a_base64(imagen: Union[str, bytes, Image.Image]) -> Optional[str]:

    try:
        if isinstance(imagen, str):

            with open(imagen, "rb") as archivo:
                return base64.b64encode(archivo.read()).decode('utf-8')
                
        elif isinstance(imagen, bytes):
            return base64.b64encode(imagen).decode('utf-8')
            
        elif isinstance(imagen, Image.Image):
            buffer = io.BytesIO()
            imagen.save(buffer, format='PNG')
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        else:
            raise ValueError("Tipo de entrada no soportado")
            
    except Exception as e:
        print(f"Error al convertir la imagen: {str(e)}")
        return None

def base64_a_imagen(datos_base64: str, formato: str = 'PNG') -> Optional[bytes]:


    try:
        imagen_bytes = base64.b64decode(datos_base64)
        
        imagen = Image.open(io.BytesIO(imagen_bytes))

        buffer = io.BytesIO()
        imagen.save(buffer, format=formato)
        
        return buffer.getvalue()
        
    except Exception as e:
        print(f"Error al procesar la imagen: {str(e)}")
        return None


def obtener_imagen_db(id_imagen):
    try:
        # Configura la conexión a tu base de datos en la nube
        conexion = mysql.connector.connect(
            host="",
            user="usuario",
            password="contraseña",
            database="nombre_db"
        )
        
        cursor = conexion.cursor()
        cursor.execute("SELECT datos_imagen FROM imagenes WHERE id = %s", (id_imagen,))
        imagen_bytes = cursor.fetchone()[0]
        
        return imagen_a_base64(imagen_bytes)
        
    except Exception as e:
        print(f"Error al obtener la imagen: {str(e)}")
        return None