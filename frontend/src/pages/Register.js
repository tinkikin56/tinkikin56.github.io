// frontend/src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '', rol: 'cliente' });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/usuarios/register', formData);
      alert('✅ Cuenta creada');
    } catch (err) {
      alert('❌ Error al registrarse');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
      <input name="correo" type="email" placeholder="Correo" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
      <select name="rol" value={formData.rol} onChange={handleChange}>
        <option value="cliente">Cliente</option>
        <option value="admin">Administrador</option>
      </select>
      <button type="submit">Registrar</button>
    </form>
  );
}

export default Register;
