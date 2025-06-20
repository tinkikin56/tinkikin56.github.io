// frontend/src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/usuarios/login', { correo, password });
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      alert('✅ Sesión iniciada');
      onLogin(res.data.usuario);
    } catch (err) {
      alert('❌ Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default Login;
