import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, InputGroup } from "react-bootstrap";

function GestionInventario() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); // <-- NUEVO
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        nom_prod: "",
        descr_prod: "",
        precio: "",
        marca: "",
        stock: "",
        id_categoria: "",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    // Cargar productos desde la API
    const cargarProductos = () => {
        fetch("http://localhost:5000/api/productos")
            .then((res) => res.json())
            .then((data) => setProductos(data.data || []))
            .catch((err) => console.error(err));
    };

    // Cargar categorías desde la API
    const cargarCategorias = () => {
        fetch("http://localhost:5000/api/categorias")
            .then((res) => res.json())
            .then((data) => setCategorias(data.data || []))
            .catch((err) => console.error(err));
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

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
    };

    // Abrir modal para agregar o editar producto
    const handleShowModal = (producto = null) => {
        if (producto) {
            setNuevoProducto(producto);
            setEditando(true);
        } else {
            setNuevoProducto({
                nom_prod: "",
                descr_prod: "",
                precio: "",
                marca: "",
                stock: "",
                id_categoria: "",
            });
            setEditando(false);
        }
        setShowModal(true);
    };

    // Guardar nuevo producto o editar existente
    const handleGuardar = () => {
        const productoData = { ...nuevoProducto, id_categoria: parseInt(nuevoProducto.id_categoria) };
        if (editando) {
            fetch(`http://localhost:5000/api/productos/${nuevoProducto.id_producto}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productoData),
            })
                .then((res) => res.json())
                .then(() => {
                    cargarProductos();
                    setShowModal(false);
                })
                .catch((err) => {
                    alert("Error al editar producto");
                    console.error(err);
                });
        } else {
            fetch("http://localhost:5000/api/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productoData),
            })
                .then((res) => res.json())
                .then(() => {
                    cargarProductos();
                    setShowModal(false);
                })
                .catch((err) => {
                    alert("Error al crear producto");
                    console.error(err);
                });
        }
    };

    // Abrir modal de confirmación para eliminar
    const handleEliminarClick = (producto) => {
        setProductoAEliminar(producto);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    // Confirmar eliminación
    const handleConfirmarEliminar = () => {
        if (!productoAEliminar?.id_producto) {
            setDeleteError("Producto sin ID válido. No se puede eliminar.");
            return;
        }
        fetch(`http://localhost:5000/api/productos/${productoAEliminar.id_producto}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setDeleteError(data.error);
                } else {
                    setShowDeleteModal(false);
                    setProductoAEliminar(null);
                    cargarProductos();
                }
            })
            .catch((err) => {
                setDeleteError("Error al eliminar producto");
                console.error(err);
            });
    };

    return (
        <div>
            <h2>Gestión de Inventario</h2>
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
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Marca</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productosFiltrados.map((prod) => (
                        <tr key={prod.id_producto}>
                            <td>{prod.nom_prod}</td>
                            <td>{prod.descr_prod}</td>
                            <td>{prod.precio}</td>
                            <td>{prod.marca}</td>
                            <td>{prod.stock}</td>
                            <td>
                                {categorias.find(cat => cat.id_categoria === prod.id_categoria)?.nom_cat || prod.id_categoria}
                            </td>
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
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editando ? "Editar Producto" : "Agregar Producto"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                name="nom_prod"
                                value={nuevoProducto.nom_prod}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                name="descr_prod"
                                value={nuevoProducto.descr_prod}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control
                                name="precio"
                                type="number"
                                value={nuevoProducto.precio}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Marca</Form.Label>
                            <Form.Control
                                name="marca"
                                value={nuevoProducto.marca}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                name="stock"
                                type="number"
                                value={nuevoProducto.stock}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Categoría</Form.Label>
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
                            {/* Vista previa si hay imagen */}
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleGuardar}>
                        Guardar
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
                            `${productoAEliminar.nom_prod}`}
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