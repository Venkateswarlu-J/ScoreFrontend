import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Log JV branding
console.log('%c🏏 LocalScore - Built by JV', 'color: #14b8a6; font-size: 16px; font-weight: bold;');
console.log('%cCopyright © 2026 Javvaji Venkateswarlu. All rights reserved.', 'color: #94a3b8; font-size: 12px;');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
