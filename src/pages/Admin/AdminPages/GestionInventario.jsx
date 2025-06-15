import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, InputGroup } from "react-bootstrap";

function GestionInventario() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); 
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        id_producto: "",
        nom_prod: "",
        descr_prod: "",
        precio: "",
        marca: "",
        stock: "",
        id_categoria: "",
        lanzamiento: 0,
        promocion: 0,
        img_prod: ""
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [loading, setLoading] = useState(false);

    // Configuración de la API
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Función para hacer peticiones con mejor manejo de errores
    const fetchWithErrorHandling = async (url, options = {}) => {
        try {
            console.log(`Realizando petición a: ${url}`);
            console.log('Opciones de la petición:', options);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers,
                },
            });

            console.log(`Respuesta recibida: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText };
                }
                console.error('Error del servidor:', errorData);
                throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            // Verificar si la respuesta tiene el formato esperado
            if (data.success === false) {
                throw new Error(data.error || 'Error desconocido del servidor');
            }
            
            return data;
        } catch (error) {
            console.error('Error en fetchWithErrorHandling:', error);
            throw error;
        }
    };

    // Cargar productos desde la API
    const cargarProductos = async () => {
        try {
            const data = await fetchWithErrorHandling(`${API_BASE_URL}/api/productos`);
            setProductos(data.data || []);
        } catch (error) {
            console.error("Error cargando productos:", error);
            alert("Error al cargar productos: " + error.message);
        }
    };

    // Cargar categorías desde la API
    const cargarCategorias = async () => {
        try {
            const data = await fetchWithErrorHandling(`${API_BASE_URL}/api/categorias`);
            setCategorias(data.data || []);
        } catch (error) {
            console.error("Error cargando categorías:", error);
            alert("Error al cargar categorías: " + error.message);
        }
    };

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    // Filtrar productos por búsqueda
    const productosFiltrados = productos.filter((prod) => {
        const texto = `${prod.nom_prod} ${prod.descr_prod} ${prod.precio} ${prod.marca} ${prod.stock} ${prod.id_categoria}`.toLowerCase();
        return texto.includes(busqueda.toLowerCase());
    });

    // Validar datos del producto
    const validarProducto = (producto) => {
        const errores = [];
        
        if (!producto.nom_prod || producto.nom_prod.trim() === "") {
            errores.push("El nombre del producto es requerido");
        }
        
        if (!producto.precio || isNaN(producto.precio) || producto.precio <= 0) {
            errores.push("El precio debe ser un número mayor a 0");
        }
        
        if (!producto.stock || isNaN(producto.stock) || producto.stock < 0) {
            errores.push("El stock debe ser un número mayor o igual a 0");
        }
        
        if (!producto.id_categoria || isNaN(producto.id_categoria)) {
            errores.push("Debe seleccionar una categoría válida");
        }
        
        if (!editando && (!producto.id_producto || producto.id_producto.trim() === "")) {
            errores.push("El ID del producto es requerido");
        }
        
        return errores;
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setNuevoProducto((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    // Abrir modal para agregar o editar producto
    const handleShowModal = (producto = null) => {
        if (producto) {
            setNuevoProducto({
                ...producto,
                lanzamiento: producto.lanzamiento || 0,
                promocion: producto.promocion || 0,
                img_prod: producto.img_prod || ""
            });
            setEditando(true);
        } else {
            setNuevoProducto({
                id_producto: "",
                nom_prod: "",
                descr_prod: "",
                precio: "",
                marca: "",
                stock: "",
                id_categoria: "",
                lanzamiento: 0,
                promocion: 0,
                img_prod: ""
            });
            setEditando(false);
        }
        setShowModal(true);
    };

    // Preparar datos para enviar al servidor
    const prepararDatosProducto = (producto) => {
        const datos = {
            nom_prod: producto.nom_prod.trim(),
            descr_prod: producto.descr_prod.trim(),
            marca: producto.marca.trim(),
            precio: parseFloat(producto.precio), 
            stock: parseInt(producto.stock),
            id_categoria: parseInt(producto.id_categoria),
            lanzamiento: parseInt(producto.lanzamiento), 
            promocion: parseInt(producto.promocion)
        };

        // Solo agregar img_prod si existe
        if (producto.img_prod && producto.img_prod.trim() !== "") {
            datos.img_prod = producto.img_prod;
        }

        // Para productos nuevos, agregar el ID
        if (!editando && producto.id_producto) {
            datos.id_producto = producto.id_producto.trim();
        }

        return datos;
    };

    // Guardar nuevo producto o editar existente
    const handleGuardar = async () => {
        setLoading(true);
        
        try {
            // Validar datos
            const errores = validarProducto(nuevoProducto);
            if (errores.length > 0) {
                alert("Errores de validación:\n" + errores.join("\n"));
                setLoading(false);
                return;
            }

            const productoData = prepararDatosProducto(nuevoProducto);
            
            console.log("Datos a enviar:", productoData);

            let url, method;
            
            if (editando) {
                url = `${API_BASE_URL}/api/productos/${nuevoProducto.id_producto}`;
                method = "PUT";
            } else {
                url = `${API_BASE_URL}/api/productos`;
                method = "POST";
            }

            const responseData = await fetchWithErrorHandling(url, {
                method: method,
                body: JSON.stringify(productoData),
            });

            // Éxito
            await cargarProductos();
            setShowModal(false);
            alert(editando ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
            
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Error de conexión: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal de confirmación para eliminar
    const handleEliminarClick = (producto) => {
        setProductoAEliminar(producto);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    // Confirmar eliminación
    const handleConfirmarEliminar = async () => {
        if (!productoAEliminar?.id_producto) {
            setDeleteError("Producto sin ID válido. No se puede eliminar.");
            return;
        }

        try {
            const url = `${API_BASE_URL}/api/productos/${productoAEliminar.id_producto}`;
            await fetchWithErrorHandling(url, {
                method: "DELETE",
            });

            // Éxito
            setShowDeleteModal(false);
            setProductoAEliminar(null);
            await cargarProductos();
            alert("Producto eliminado exitosamente");
            
        } catch (error) {
            console.error("Error eliminando producto:", error);
            setDeleteError("Error de conexión: " + error.message);
        }
    };

    return (
        <div>
            <h2>Gestión de Inventario</h2>
            
            {/* Botón para probar conexión */}
            <div className="mb-3">
                <Button 
                    variant="info" 
                    size="sm" 
                    onClick={async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/productos`);
                            alert(`Conexión ${response.ok ? 'exitosa' : 'fallida'}: ${response.status}`);
                        } catch (error) {
                            alert(`Error de conexión: ${error.message}`);
                        }
                    }}
                >
                    Probar Conexión
                </Button>
                <small className="text-muted ms-2">API: {API_BASE_URL}</small>
            </div>
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Buscar por nombre, descripción, marca, categoría, etc."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <Button variant="primary" className="ms-2" onClick={() => handleShowModal()}>
                    Agregar Producto
                </Button>
            </InputGroup>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Marca</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>¿Nuevo?</th>
                        <th>¿Promoción?</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productosFiltrados.map((prod) => (
                        <tr key={prod.id_producto}>
                            <td>{prod.id_producto}</td>
                            <td>{prod.nom_prod}</td>
                            <td>{prod.descr_prod}</td>
                            <td>${prod.precio}</td>
                            <td>{prod.marca}</td>
                            <td>{prod.stock}</td>
                            <td>
                                {categorias.find(cat => cat.id_categoria === prod.id_categoria)?.nom_cat || prod.id_categoria}
                            </td>
                            <td>{prod.lanzamiento ? "Sí" : "No"}</td>
                            <td>{prod.promocion ? "Sí" : "No"}</td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="warning"
                                    className="me-2"
                                    onClick={() => handleShowModal(prod)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleEliminarClick(prod)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para agregar/editar producto */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editando ? "Editar Producto" : "Agregar Producto"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {!editando && (
                            <Form.Group className="mb-2">
                                <Form.Label>ID del Producto *</Form.Label>
                                <Form.Control
                                    name="id_producto"
                                    value={nuevoProducto.id_producto}
                                    onChange={handleChange}
                                    placeholder="Ingrese un ID único"
                                />
                            </Form.Group>
                        )}
                        <Form.Group className="mb-2">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                name="nom_prod"
                                value={nuevoProducto.nom_prod}
                                onChange={handleChange}
                                placeholder="Nombre del producto"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="descr_prod"
                                value={nuevoProducto.descr_prod}
                                onChange={handleChange}
                                placeholder="Descripción del producto"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Precio *</Form.Label>
                            <Form.Control
                                name="precio"
                                type="number"
                                step="0.01"
                                min="0"
                                value={nuevoProducto.precio}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Marca</Form.Label>
                            <Form.Control
                                name="marca"
                                value={nuevoProducto.marca}
                                onChange={handleChange}
                                placeholder="Marca del producto"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Stock *</Form.Label>
                            <Form.Control
                                name="stock"
                                type="number"
                                min="0"
                                value={nuevoProducto.stock}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Categoría *</Form.Label>
                            <Form.Select
                                name="id_categoria"
                                value={nuevoProducto.id_categoria}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>
                                        {cat.nom_cat}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Imagen</Form.Label>
                            {nuevoProducto.img_prod && (
                                <div style={{ marginBottom: 10 }}>
                                    <img
                                        src={`data:image/jpeg;base64,${nuevoProducto.img_prod}`}
                                        alt="Vista previa"
                                        style={{ maxWidth: "100%", maxHeight: 150 }}
                                    />
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const base64 = reader.result.split(',')[1];
                                            setNuevoProducto({ ...nuevoProducto, img_prod: base64 });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="¿Es nuevo?"
                                name="lanzamiento"
                                checked={!!nuevoProducto.lanzamiento}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="¿Está en promoción?"
                                name="promocion"
                                checked={!!nuevoProducto.promocion}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleGuardar} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación para eliminar */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteError && (
                        <div className="alert alert-danger">{deleteError}</div>
                    )}
                    ¿Estás seguro que deseas eliminar el producto{" "}
                    <strong>
                        {productoAEliminar &&
                            `${productoAEliminar.nom_prod} (ID: ${productoAEliminar.id_producto})`}
                    </strong>
                    ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirmarEliminar}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GestionInventario;