import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TrackPage from './pages/TrackPage';

function App() {
  return (
    <div className="rail-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fffaf5',
            color: '#1c1b1a',
            border: '1px solid rgba(28, 27, 26, 0.08)',
            borderRadius: '16px',
            fontSize: '0.875rem',
            padding: '12px 16px',
            boxShadow: '0 18px 50px rgba(29, 30, 30, 0.10)',
          },
          success: {
            iconTheme: {
              primary: '#2d9a6f',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f05d3c',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/track/:trainId" element={<TrackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
