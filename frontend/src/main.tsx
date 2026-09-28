import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import OfflineBanner from './components/OfflineBanner';
import './index.css';

/**
 * The worker registers on `load`, so on a first visit the page has already
 * fired its API requests by the time the worker claims it - those responses
 * never reach the runtime cache, and the app would open offline with nothing
 * to show. Reload once, per session, when the worker first takes control; from
 * then on every read goes through the cache.
 */
if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
  const reloadWhenClaimed = () => {
    if (sessionStorage.getItem('sw-claimed')) return;
    sessionStorage.setItem('sw-claimed', '1');
    navigator.serviceWorker.removeEventListener('controllerchange', reloadWhenClaimed);
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', reloadWhenClaimed);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <OfflineBanner />
    <App />
  </React.StrictMode>
);
