// frontend/src/pages/PanelAdmin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { toJpeg } from 'html-to-image';
import './ModalQR.css';

function PanelAdmin() {
  const [citas, setCitas] = useState([]);
  const [vista, setVista] = useState('todas');
  const [formData, setFormData] = useState({ nombre: '', fecha: '', hora: '', motivo: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombre: '', fecha: '', hora: '', motivo: '' });
  const [qrVisibleId, setQrVisibleId] = useState(null);

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const obtenerCitas = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/citas');
      setCitas(res.data);
    } catch (err) {
      console.error('Error al obtener citas:', err);
    }
  };

  useEffect(() => {
    obtenerCitas();
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const nuevaCita = {
      ...formData,
      usuario: usuario._id,
      correo: usuario.correo
    };
    try {
      await axios.post('http://localhost:5000/api/citas', nuevaCita);
      setFormData({ nombre: '', fecha: '', hora: '', motivo: '' });
      obtenerCitas();
    } catch (err) {
      alert('Error al crear cita: ' + err.message);
    }
  };

  const eliminarCita = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/citas/${id}`);
      obtenerCitas();
    } catch (err) {
      console.error('Error al eliminar cita:', err);
    }
  };

  const iniciarEdicion = cita => {
    setEditandoId(cita._id);
    setFormEdit({
      nombre: cita.nombre,
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo
    });
  };

  const guardarEdicion = async id => {
    try {
      await axios.put(`http://localhost:5000/api/citas/${id}`, formEdit);
      setEditandoId(null);
      obtenerCitas();
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  const descargarQRDesdeCita = citaId => {
    const element = document.getElementById(`qr-${citaId}`);
    if (element) {
      toJpeg(element).then(dataUrl => {
        const link = document.createElement('a');
        link.download = `qr-${citaId}.jpg`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setVista('nueva')}>📅 Nueva Cita</button>
        <button onClick={() => setVista('todas')}>📋 Todas las Citas</button>
      </div>

      {vista === 'nueva' && (
        <div>
          <h2>Crear Nueva Cita (Admin)</h2>
          <form onSubmit={handleSubmit}>
            <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
            <input name="motivo" placeholder="Motivo" value={formData.motivo} onChange={handleChange} required />
            <button type="submit">Crear Cita</button>
          </form>
        </div>
      )}

      {vista === 'todas' && (
        <div>
          <h2>📋 Todas las Citas</h2>
          {citas.length === 0 ? (
            <p>No hay citas disponibles.</p>
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
                      📅 <strong>{cita.fecha}</strong> {cita.hora} – {cita.nombre} – {cita.motivo}
                      {' - '}
                      <span style={{ color: cita.confirmado ? 'green' : 'red' }}>
                        {cita.confirmado ? '✅ Check-in hecho' : '❌ Pendiente'}
                      </span>
                      <br />
                      <button onClick={() => iniciarEdicion(cita)}>✏️ Editar</button>
                      <button onClick={() => eliminarCita(cita._id)}>🗑 Eliminar</button>
                      <button onClick={() => setQrVisibleId(cita._id)}>📷 Ver QR</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {qrVisibleId && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-content">
            <span className="cerrar" onClick={() => setQrVisibleId(null)}>✖</span>
            <div id={`qr-${qrVisibleId}`} style={{ padding: '10px', background: '#fff' }}>
              <QRCodeSVG value={JSON.stringify(citas.find(c => c._id === qrVisibleId))} size={200} />
            </div>
            <br />
            <button onClick={() => descargarQRDesdeCita(qrVisibleId)}>📥 Descargar QR en JPG</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelAdmin;
