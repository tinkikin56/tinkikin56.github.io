import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

function CheckIn() {
  const qrRegionId = 'reader';
  const [mensaje, setMensaje] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (confirmado) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    };

    scannerRef.current = new Html5QrcodeScanner(qrRegionId, config, false);

    scannerRef.current.render(
      async (decodedText, decodedResult) => {
        try {
          const cita = JSON.parse(decodedText);
          const res = await axios.put(`http://localhost:5000/api/citas/${cita._id}/confirmar`);
          if (res.data.success) {
            setMensaje(`✅ Bienvenido ${cita.nombre}, pase a su cita.`);
            setConfirmado(true);
            scannerRef.current.clear(); // Detiene el escáner
          } else {
            setMensaje('⚠️ No se pudo confirmar la cita.');
          }
        } catch (err) {
          console.error('QR inválido:', err);
          setMensaje('⚠️ Código QR inválido.');
        }
      },
      (errorMessage) => {
        // Opcional: console.warn('Escaneo fallido:', errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Error al detener cámara:', err));
      }
    };
  }, [confirmado]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Escanear Código QR para Check-in</h2>
      <div
        id={qrRegionId}
        style={{
          width: '300px',
          margin: '0 auto',
          border: '4px solid #00bfff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      ></div>
      <p style={{ marginTop: '20px', fontSize: '18px' }}>{mensaje}</p>
    </div>
  );
}

export default CheckIn;
