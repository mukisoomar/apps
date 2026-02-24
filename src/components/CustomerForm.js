import React, { useState, useEffect } from 'react';

const styles = {
  title: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#e0e0e0' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontWeight: 600, fontSize: 14, color: '#aaa', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #444', borderRadius: 6,
    fontSize: 15, outline: 'none', background: '#2a2a2a', color: '#e0e0e0',
    transition: 'border-color 0.2s',
  },
  inputError: { borderColor: '#ef5350' },
  errorMsg: { color: '#ef5350', fontSize: 12, marginTop: 4 },
  actions: { display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' },
  saveBtn: {
    background: '#1565c0', color: '#e0e0e0', border: 'none', borderRadius: 6,
    padding: '10px 24px', fontSize: 15, cursor: 'pointer', fontWeight: 600,
  },
  cancelBtn: {
    background: '#2a2a2a', color: '#aaa', border: '1px solid #444', borderRadius: 6,
    padding: '10px 24px', fontSize: 15, cursor: 'pointer',
  },
};

const PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/;

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function CustomerForm({ mode, initial, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm({ name: initial.name || '', address: initial.address || '', phone: initial.phone || '' });
    }
  }, [mode, initial]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Format: (555) 555-5555';
    return e;
  }

  function handleChange(field, value) {
    const updated = field === 'phone' ? formatPhone(value) : value;
    setForm(f => ({ ...f, [field]: updated }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave({ name: form.name.trim(), address: form.address.trim(), phone: form.phone.trim() });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={styles.title}>{mode === 'edit' ? 'Edit Customer' : 'Add Customer'}</div>

      <div style={styles.field}>
        <label style={styles.label}>Name</label>
        <input
          style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="John Smith"
          autoFocus
        />
        {errors.name && <div style={styles.errorMsg}>{errors.name}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Address</label>
        <input
          style={{ ...styles.input, ...(errors.address ? styles.inputError : {}) }}
          value={form.address}
          onChange={e => handleChange('address', e.target.value)}
          placeholder="123 Main St, Springfield, IL 62701"
        />
        {errors.address && <div style={styles.errorMsg}>{errors.address}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Phone</label>
        <input
          style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
          value={form.phone}
          onChange={e => handleChange('phone', e.target.value)}
          placeholder="(555) 555-5555"
        />
        {errors.phone && <div style={styles.errorMsg}>{errors.phone}</div>}
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" style={styles.saveBtn}>{mode === 'edit' ? 'Save Changes' : 'Add Customer'}</button>
      </div>
    </form>
  );
}
