// frontend/src/pages/PanelCliente.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { toJpeg } from 'html-to-image';
import './ModalQR.css';

function PanelCliente() {
  const [vista, setVista] = useState('nueva');
  const [formData, setFormData] = useState({ nombre: '', fecha: '', hora: '', motivo: '' });
  const [citas, setCitas] = useState([]);
  const [citaQR, setCitaQR] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombre: '', fecha: '', hora: '', motivo: '' });
  const [mostrarQRId, setMostrarQRId] = useState(null);
  const qrRef = useRef(null);
  const [analisis, setAnalisis] = useState([]);
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const obtenerCitas = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/citas/mias/${usuario._id}`);
      setCitas(res.data);
    } catch (err) {
      console.error('Error al obtener citas:', err);
    }
  };

  const obtenerAnalisis = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/ia/mias/${usuario._id}`);
      setAnalisis(res.data.resultado || []);
    } catch (err) {
      console.error('Error al obtener análisis:', err);
    }
  };

  useEffect(() => {
    obtenerCitas();
  }, []);

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const nuevaCita = {
      ...formData,
      usuario: usuario._id,
      correo: usuario.correo
    };
    try {
      const res = await axios.post('http://localhost:5000/api/citas', nuevaCita);
      setCitaQR(res.data);
      setFormData({ nombre: '', fecha: '', hora: '', motivo: '' });
      obtenerCitas();
    } catch (err) {
      alert('Error al crear cita: ' + err.message);
    }
  };

  const eliminarCita = async id => {
    await axios.delete(`http://localhost:5000/api/citas/${id}`);
    obtenerCitas();
  };

  const iniciarEdicion = cita => {
    setEditandoId(cita._id);
    setFormEdit({ nombre: cita.nombre, fecha: cita.fecha, hora: cita.hora, motivo: cita.motivo });
  };

  const guardarEdicion = async id => {
    await axios.put(`http://localhost:5000/api/citas/${id}`, formEdit);
    setEditandoId(null);
    obtenerCitas();
  };

  const descargarQR = () => {
    if (qrRef.current) {
      toJpeg(qrRef.current).then(dataUrl => {
        const link = document.createElement('a');
        link.download = `qr-cita-${citaQR._id}.jpg`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  const descargarQRporID = id => {
    const div = document.getElementById(`qr-${id}`);
    if (div) {
      toJpeg(div).then(dataUrl => {
        const link = document.createElement('a');
        link.download = `qr-cita-${id}.jpg`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setVista('nueva')}>📅 Nueva Cita</button>
        <button onClick={() => setVista('mis-citas')}>📋 Mis Citas</button>
        <button onClick={() => { setVista('analisis'); obtenerAnalisis(); }}>📊 Análisis con IA</button>
      </div>

      {vista === 'nueva' && (
        <div>
          <h2>Reservar Nueva Cita</h2>
          <form onSubmit={handleSubmit}>
            <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
            <input name="motivo" placeholder="Motivo" value={formData.motivo} onChange={handleChange} required />
            <button type="submit">Crear Cita</button>
          </form>

          {citaQR && (
            <div style={{ marginTop: '20px' }}>
              <h3>✅ Cita creada. Código QR:</h3>
              <div ref={qrRef} style={{ display: 'inline-block', padding: '10px', background: '#fff' }}>
                <QRCodeSVG value={JSON.stringify(citaQR)} size={200} />
              </div>
              <br />
              <button onClick={descargarQR}>📥 Descargar QR en JPG</button>
            </div>
          )}
        </div>
      )}

      {vista === 'mis-citas' && (
        <div>
          <h2>Mis Citas</h2>
          {citas.length === 0 ? (
            <p>No tienes citas registradas.</p>
          ) : (
            <ul>
              {citas.map(cita => (
                <li key={cita._id} style={{ marginBottom: '25px' }}>
                  {editandoId === cita._id ? (
                    <>
                      <input name="nombre" value={formEdit.nombre} onChange={e => setFormEdit({ ...formEdit, nombre: e.target.value })} />
                      <input type="date" name="fecha" value={formEdit.fecha} onChange={e => setFormEdit({ ...formEdit, fecha: e.target.value })} />
                      <input type="time" name="hora" value={formEdit.hora} onChange={e => setFormEdit({ ...formEdit, hora: e.target.value })} />
                      <input name="motivo" value={formEdit.motivo} onChange={e => setFormEdit({ ...formEdit, motivo: e.target.value })} />
                      <button onClick={() => guardarEdicion(cita._id)}>💾 Guardar</button>
                      <button onClick={() => setEditandoId(null)}>❌ Cancelar</button>
                    </>
                  ) : (
                    <>
                      <strong>{cita.fecha} {cita.hora}</strong> – {cita.nombre} – {cita.motivo}
                      <span style={{ marginLeft: '10px', color: cita.confirmado ? 'green' : 'gray' }}>
                        {cita.confirmado ? '✅ Asistió' : '⏳ No confirmado'}
                      </span>
                      <br />
                      <button onClick={() => iniciarEdicion(cita)}>✏️ Editar</button>
                      <button onClick={() => eliminarCita(cita._id)}>🗑 Eliminar</button>
                      <button onClick={() => setMostrarQRId(cita._id)}>🔍 Ver QR</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {vista === 'analisis' && (
        <div>
          <h2>📊 Análisis de tus Citas (IA)</h2>
          {analisis.length === 0 ? (
            <p>No hay suficientes datos para generar recomendaciones aún.</p>
          ) : (
            <ul>
              {analisis.map((linea, i) => (
                <li key={i}>{linea}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mostrarQRId && (
        <div className="qr-overlay">
          <div className="qr-contenedor">
            <button className="cerrar" onClick={() => setMostrarQRId(null)}>❌</button>
            <div id={`qr-${mostrarQRId}`} style={{ background: '#fff', padding: '10px' }}>
              <QRCodeSVG
                value={JSON.stringify(citas.find(c => c._id === mostrarQRId))}
                size={200}
              />
            </div>
            <br />
            <button onClick={() => descargarQRporID(mostrarQRId)}>📥 Descargar QR</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelCliente;
