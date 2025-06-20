// frontend/src/pages/CheckIn.js

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

function CheckIn() {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const iniciarEscaneo = () => {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCodeRef.current = new Html5Qrcode('qr-reader');

    html5QrCodeRef.current
      .start(
        { facingMode: 'environment' }, // Usa cámara trasera si está disponible
        config,
        async (decodedText) => {
          if (decodedText) {
            try {
              const cita = JSON.parse(decodedText);
              await axios.put(`http://localhost:5000/api/citas/${cita._id}/confirmar`);
              setMensaje(`✅ Bienvenido ${cita.nombre}`);
              setScanSuccess(true);
              detenerEscaneo();
            } catch (err) {
              console.error('Error al procesar el código:', err);
              setMensaje('⚠️ Código inválido o cita no encontrada');
              detenerEscaneo();
            }
          }
        },
        (errorMessage) => {
          console.warn('Escaneo fallido:', errorMessage);
        }
      )
      .catch((err) => {
        console.error('No se pudo iniciar el escáner:', err);
        setMensaje('⚠️ No se pudo acceder a la cámara');
      });
  };

  const detenerEscaneo = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      });
    }
  };

  useEffect(() => {
    iniciarEscaneo();

    return () => {
      detenerEscaneo(); // Detiene la cámara al desmontar el componente
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {!scanSuccess ? (
        <>
          <h2>📷 Escanear Código QR</h2>
          <div
            id="qr-reader"
            style={{
              width: '300px',
              height: '300px',
              margin: '0 auto',
              border: '4px solid #4c9aff',
              borderRadius: '12px',
            }}
            ref={scannerRef}
          ></div>
          <button
            onClick={detenerEscaneo}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Parar cámara
          </button>
          {mensaje && <p style={{ marginTop: '20px', color: 'crimson' }}>{mensaje}</p>}
        </>
      ) : (
        <div style={{ marginTop: '50px', animation: 'fadeIn 0.5s ease' }}>
          <svg
            style={{ width: '80px', height: '80px', color: 'green' }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h2 style={{ color: 'green', fontSize: '24px' }}>{mensaje}</h2>
          <p style={{ color: '#555', marginTop: '10px' }}>Gracias por registrarte</p>
        </div>
      )}
    </div>
  );
}

export default CheckIn;
