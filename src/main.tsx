import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'DEFINI' : 'NON DEFINI');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'DEFINI' : 'NON DEFINI');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
