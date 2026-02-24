import React, { useState } from 'react';

const styles = {
  wrapper: { background: '#1e1e1e', borderRadius: 8, border: '1px solid #333', overflow: 'hidden' },
  toolbar: { padding: '12px 16px', borderBottom: '1px solid #333', display: 'flex', gap: 8, alignItems: 'center' },
  searchInput: {
    flex: 1, padding: '8px 12px', border: '1px solid #444', borderRadius: 6,
    fontSize: 14, outline: 'none', background: '#2a2a2a', color: '#e0e0e0',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', background: '#252525',
    fontWeight: 600, fontSize: 13, color: '#aaa', borderBottom: '2px solid #333',
    cursor: 'pointer', userSelect: 'none',
  },
  td: { padding: '11px 16px', fontSize: 14, borderBottom: '1px solid #2a2a2a', color: '#e0e0e0' },
  trEven: { background: '#1e1e1e' },
  trOdd: { background: '#232323' },
  editBtn: {
    background: '#1565c0', color: '#e0e0e0', border: 'none', borderRadius: 5,
    padding: '5px 12px', fontSize: 13, cursor: 'pointer', marginRight: 6,
  },
  deleteBtn: {
    background: '#c62828', color: '#e0e0e0', border: 'none', borderRadius: 5,
    padding: '5px 12px', fontSize: 13, cursor: 'pointer',
  },
  empty: { padding: 40, textAlign: 'center', color: '#666' },
  pagination: { padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid #333' },
  pageBtn: { border: '1px solid #444', background: '#2a2a2a', color: '#e0e0e0', borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { border: '1px solid #1565c0', background: '#1565c0', color: '#fff', borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  recordCount: { fontSize: 13, color: '#666', whiteSpace: 'nowrap' },
};

const PAGE_SIZE = 15;

export default function CustomerTable({ customers, loading, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const filtered = customers.filter(c =>
    [c.name, c.address, c.phone].some(v =>
      (v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = sortKey === 'id' ? a.id : (a[sortKey] || '').toLowerCase();
    const bv = sortKey === 'id' ? b.id : (b[sortKey] || '').toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function sortIndicator(key) {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  if (loading) return <div style={styles.empty}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          placeholder="Search by name, address, or phone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span style={styles.recordCount}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => handleSort('id')}>ID{sortIndicator('id')}</th>
            <th style={styles.th} onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
            <th style={styles.th} onClick={() => handleSort('address')}>Address{sortIndicator('address')}</th>
            <th style={styles.th} onClick={() => handleSort('phone')}>Phone{sortIndicator('phone')}</th>
            <th style={{ ...styles.th, cursor: 'default' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan={5} style={styles.empty}>No customers found.</td></tr>
          ) : (
            paged.map((c, i) => (
              <tr key={c.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                <td style={styles.td}>{c.id}</td>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.address}</td>
                <td style={styles.td}>{c.phone}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => onEdit(c)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => onDelete(c)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '...'
              ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#555' }}>…</span>
              : <button key={p} style={p === page ? styles.pageBtnActive : styles.pageBtn} onClick={() => setPage(p)}>{p}</button>
          )
        }
        <button style={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
