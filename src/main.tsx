
/**
 * @file This is the entry point for the React application.
 * It renders the main App component into the root HTML element.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * The root HTML element where the React app will be mounted.
 * @type {HTMLElement}
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
