'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleImport = async () => {
    setLoading(true);
    setStatus('Starting import...');

    try {
      const res = await fetch('/api/admin/import');
      const result = await res.json();

      if (result.success) {
        setStatus('✅ Import successful. Redirecting to homepage...');
        setTimeout(() => router.push('/'), 1500); // Redirect after a brief delay
      } else {
        setStatus('❌ Import failed. Check server logs.');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error while importing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🛠️ ChoreBazaar Admin Panel</h1>
      <button
        onClick={handleImport}
        disabled={loading}
        style={{
          padding: '0.8rem 1.5rem',
          fontSize: '1rem',
          marginTop: '1rem',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Importing Products...' : 'Import Products from Amazon'}
      </button>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </main>
  );
}