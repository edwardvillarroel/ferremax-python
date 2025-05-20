import {Container, Form, Button, Alert} from 'react-bootstrap';
import './Registro.css';

import { useState } from 'react';
import Swal from 'sweetalert2';


function RegistroUser(){

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPasword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error , setError] = useState('');
    const [email , setEmail] = useState('');
    const [nombre , setNombre] = useState('');
    const [apellido , setApellido] = useState('');
    const [rut , setRut] = useState('');

    const paswordShow = () => {
          setShowPassword(!showPassword)
    };

    const validarRut = (rut) => {
        const cleanRut = rut.replace(/\./g, '').replace('-', '');
        if (!/^[0-9]+[0-9kK]{1}$/.test(cleanRut)) return false;

        const cuerpo = cleanRut.slice(0, -1);
        let dv = cleanRut.slice(-1).toUpperCase();

        let suma = 0;
        let multiplo = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

        const dvEsperado = 11 - (suma % 11);
        let dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

        return dv === dvCalculado;
  };

    const handleSubmit = (e) => {
        e.preventDefault();

    console.log("Nombre:", nombre);
    console.log("Apellido:", apellido);
    console.log("RUT:", rut);
    console.log("Email:", email);
    console.log("Contraseña:", password);
    console.log("Confirmar Contraseña:", confirmPassword);

        if(!nombre || !apellido || !rut){
            setError('Completa todos los campos');
             Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Por favor, completa todos los campos.'
            });
            return; 
        }

        if (!validarRut(rut)) {
            setError('El RUT ingresado no es válido');
            return;
        }

        if (password !== confirmPassword){
            setError('Las contraseñas no coinciden');
            return;
    }
        setError('');
        console.log('Formulario válido');

        Swal.fire({
           icon: 'success',
           title: 'Formulario enviado',
           text: 'Tu cuenta se ha registrado correctamente.',
           confirmButtonColor: '#00bcd4',
           });

        setNombre('');
        setApellido('');
        setRut('');
        setEmail('');
        setPasword('');
        setConfirmPassword('');

    };

    return(
        <Container className='div-contenedor'>
            <h1>Crear nueva cuenta de cliente</h1>
            <div className="formulario-custom">
                <Form/>
                    <Form.Group className="mb-3" controlId="formName">
                    <h3>Información Personal</h3>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control 
                    type="text"
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formApellido">
                    <Form.Label>Apellidos</Form.Label>
                    <Form.Control 
                    type="text"
                    value={apellido} 
                    onChange={(e) => setApellido(e.target.value)}>
                    </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formRut">
                    <Form.Label>Rut</Form.Label>
                    <Form.Control 
                    type="text"
                    value={rut} 
                    onChange={(e) => setRut(e.target.value)} placeholder="Ej: 12345678-5" >
                    </Form.Control>
                    </Form.Group> 

                    <Form onSubmit={handleSubmit}> 
                    <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPasswordRegistro">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPasword(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPasswordRegistroRepet">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control 
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check 
                    type="checkbox" 
                    label="Mostrar contraseña"
                    onChange={paswordShow}
                    /> 
                    </Form.Group>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Button className='buttonRegistro' variant="primary" type="submit"
                    >Registrarse</Button>
                </Form>
            </div>
        </Container>);
}

export default RegistroUser; 