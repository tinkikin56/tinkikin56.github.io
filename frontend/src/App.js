import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import PanelCliente from './pages/PanelCliente';
import PanelAdmin from './pages/PanelAdmin';
import { obtenerUsuarioActual, cerrarSesion } from './utils/auth';
import CheckIn from './pages/CheckIn';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [pantalla, setPantalla] = useState('login'); // login, register, inicio

  useEffect(() => {
    const usr = obtenerUsuarioActual();
    if (usr) {
      setUsuario(usr);
      setPantalla('inicio');
    }
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    setUsuario(null);
    setPantalla('login');
  };

  return (
    <div className="App">
      <h1>Clínica Médica</h1>

      {!usuario ? (
        <>
          <button onClick={() => setPantalla('login')}>Iniciar Sesión</button>
          <button onClick={() => setPantalla('register')}>Registrarse</button>

          {pantalla === 'login' ? (
            <Login onLogin={u => { setUsuario(u); setPantalla('inicio'); }} />
          ) : (
            <Register />
          )}
        </>
      ) : (
        <>
  <p>👤 Bienvenido, {usuario.nombre} ({usuario.rol})</p>
  <button onClick={handleLogout}>Cerrar sesión</button>
  <button onClick={() => setPantalla('inicio')}>Inicio</button>
  <button onClick={() => setPantalla('checkin')}>Check-in</button>

  {pantalla === 'inicio' && (
    usuario.rol === 'admin' ? <PanelAdmin /> : <PanelCliente />
  )}

  {pantalla === 'checkin' && <CheckIn />}
</>

      )}
    </div>
  );
}

export default App;
