import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicPortfolio } from './components/PublicPortfolio';
import { AdminVault } from './components/AdminVault';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Primary Default Page: Visitor Portfolio Display */}
        <Route path="/" element={<PublicPortfolio />} />
        <Route path="/portfolio" element={<PublicPortfolio />} />
        <Route path="/view" element={<PublicPortfolio />} />

        {/* Hidden Admin Command Vault Routes (Accessible via secret paths, keyboard shortcuts, or stealth triggers) */}
        <Route path="/admin" element={<AdminVault />} />
        <Route path="/vault" element={<AdminVault />} />
        <Route path="/vault-9x2k1" element={<AdminVault />} />

        {/* Catch-all fallback directly to main portfolio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


