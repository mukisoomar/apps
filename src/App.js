import React, { useState, useEffect, useCallback } from 'react';
import CustomerTable from './components/CustomerTable';
import CustomerForm from './components/CustomerForm';

const API = '/api/customers';

const styles = {
  app: { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700, color: '#e0e0e0' },
  addBtn: {
    background: '#1565c0', color: '#e0e0e0', border: 'none', borderRadius: 6,
    padding: '10px 20px', fontSize: 15, cursor: 'pointer', fontWeight: 600,
  },
  error: { background: '#3b1f1f', color: '#ef9a9a', padding: '10px 16px', borderRadius: 6, marginBottom: 16 },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modalBox: { background: '#1e1e1e', borderRadius: 10, padding: 32, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid #333' },
};

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to load customers');
      setCustomers(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  async function handleSave(data) {
    setError('');
    try {
      const isEdit = modal?.mode === 'edit';
      const url = isEdit ? `${API}/${modal.customer.id}` : API;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Save failed');
      }
      setModal(null);
      await loadCustomers();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(customer) {
    setError('');
    try {
      const res = await fetch(`${API}/${customer.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteConfirm(null);
      await loadCustomers();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>Customer Manager</h1>
        <button style={styles.addBtn} onClick={() => setModal({ mode: 'add' })}>
          + Add Customer
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <CustomerTable
        customers={customers}
        loading={loading}
        onEdit={c => setModal({ mode: 'edit', customer: c })}
        onDelete={c => setDeleteConfirm(c)}
      />

      {modal && (
        <div style={styles.modal} onClick={() => setModal(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <CustomerForm
              mode={modal.mode}
              initial={modal.customer}
              onSave={handleSave}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={styles.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...styles.modalBox, width: 380, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 12, fontSize: 20, color: '#e0e0e0' }}>Delete Customer?</h2>
            <p style={{ color: '#aaa', marginBottom: 24 }}>
              Are you sure you want to delete <strong style={{ color: '#e0e0e0' }}>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                style={{ ...styles.addBtn, background: '#c62828' }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
              <button
                style={{ ...styles.addBtn, background: '#424242' }}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
