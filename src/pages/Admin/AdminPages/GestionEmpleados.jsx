import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, InputGroup } from "react-bootstrap";

function GestionEmpleados() {
    const [empleados, setEmpleados] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [nuevoEmpleado, setNuevoEmpleado] = useState({
        pnom_emp: "",
        snom_emp: "",
        appat_emp: "",
        apmat_emp: "",
        correo_emp: "",
        password_emp: "",
        id_cargo: "1",
    });

    // Para el modal de eliminar
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    // Cargar empleados desde la API
    const cargarEmpleados = () => {
        fetch("http://localhost:5000/api/empleados")
            .then((res) => res.json())
            .then((data) => setEmpleados(data.data || []))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    // Filtrar empleados por búsqueda
    const empleadosFiltrados = empleados.filter((emp) => {
        const texto = `${emp.pnom_emp} ${emp.snom_emp} ${emp.appat_emp} ${emp.apmat_emp} ${emp.correo_emp} ${cargoTexto(emp.id_cargo)}`.toLowerCase();
        return texto.includes(busqueda.toLowerCase());
    });

    function cargoTexto(id) {
        if (id === 1 || id === "1") return "Administrador";
        if (id === 2 || id === "2") return "Vendedor";
        return "Desconocido";
    }

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setNuevoEmpleado({ ...nuevoEmpleado, [e.target.name]: e.target.value });
    };

    // Abrir modal para agregar o editar empleado
    const handleShowModal = (empleado = null) => {
        if (empleado) {
            setNuevoEmpleado(empleado);
            setEditando(true);
        } else {
            setNuevoEmpleado({
                pnom_emp: "",
                snom_emp: "",
                appat_emp: "",
                apmat_emp: "",
                correo_emp: "",
                password_emp: "",
                id_cargo: "1",
            });
            setEditando(false);
        }
        setShowModal(true);
    };

    // Guardar nuevo empleado o editar existente
    const handleGuardar = () => {
        if (editando) {
            // PUT para editar
            fetch(`http://localhost:5000/api/empleados/${nuevoEmpleado.id_empleado}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoEmpleado),
            })
                .then((res) => res.json())
                .then((data) => {
                    cargarEmpleados();
                    setShowModal(false);
                })
                .catch((err) => {
                    alert("Error al editar empleado");
                    console.error(err);
                });
        } else {
            // POST para agregar
            fetch("http://localhost:5000/api/empleados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoEmpleado),
            })
                .then((res) => res.json())
                .then((data) => {
                    cargarEmpleados();
                    setShowModal(false);
                })
                .catch((err) => {
                    alert("Error al crear empleado");
                    console.error(err);
                });
        }
    };

    // Abrir modal de confirmación para eliminar
    const handleEliminarClick = (empleado) => {
        setEmpleadoAEliminar(empleado);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    // Confirmar eliminación
    const handleConfirmarEliminar = () => {
        if (!empleadoAEliminar?.id_empleado) {
            setDeleteError("Empleado sin ID válido. No se puede eliminar.");
            return;
        }
        fetch(`http://localhost:5000/api/empleados/${empleadoAEliminar.id_empleado}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setDeleteError(data.error);
                } else {
                    setShowDeleteModal(false);
                    setEmpleadoAEliminar(null);
                    cargarEmpleados();
                }
            })
            .catch((err) => {
                setDeleteError("Error al eliminar empleado");
                console.error(err);
            });
    };


    return (
        <div>
            <h2>Gestión de Empleados</h2>
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Buscar por nombre, apellidos, correo o cargo"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <Button variant="primary" className="ms-2" onClick={() => handleShowModal()}>
                    Agregar Empleado
                </Button>
            </InputGroup>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Primer Nombre</th>
                        <th>Segundo Nombre</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Correo</th>
                        <th>Cargo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleadosFiltrados
                        .filter(emp => emp.id_empleado && emp.id_empleado.trim() !== "")
                        .map((emp) => (
                            <tr key={emp.id_empleado}>
                                <td>{emp.pnom_emp}</td>
                                <td>{emp.snom_emp}</td>
                                <td>{emp.appat_emp}</td>
                                <td>{emp.apmat_emp}</td>
                                <td>{emp.correo_emp}</td>
                                <td>{cargoTexto(emp.id_cargo)}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="warning"
                                        className="me-2"
                                        onClick={() => handleShowModal(emp)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleEliminarClick(emp)}
                                    >
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            {/* Modal para agregar/editar empleado */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editando ? "Editar Empleado" : "Agregar Empleado"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Primer Nombre</Form.Label>
                            <Form.Control
                                name="pnom_emp"
                                value={nuevoEmpleado.pnom_emp}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Segundo Nombre</Form.Label>
                            <Form.Control
                                name="snom_emp"
                                value={nuevoEmpleado.snom_emp}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Apellido Paterno</Form.Label>
                            <Form.Control
                                name="appat_emp"
                                value={nuevoEmpleado.appat_emp}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Apellido Materno</Form.Label>
                            <Form.Control
                                name="apmat_emp"
                                value={nuevoEmpleado.apmat_emp}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Correo</Form.Label>
                            <Form.Control
                                name="correo_emp"
                                value={nuevoEmpleado.correo_emp}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                name="password_emp"
                                type="password"
                                value={nuevoEmpleado.password_emp}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Cargo</Form.Label>
                            <Form.Select
                                name="id_cargo"
                                value={nuevoEmpleado.id_cargo}
                                onChange={handleChange}
                            >
                                <option value="1">Administrador</option>
                                <option value="2">Vendedor</option>
                            </Form.Select>
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
                    ¿Estás seguro que deseas eliminar al empleado{" "}
                    <strong>
                        {empleadoAEliminar &&
                            `${empleadoAEliminar.pnom_emp} ${empleadoAEliminar.appat_emp}`}
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

export default GestionEmpleados;