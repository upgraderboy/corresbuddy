import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Badge } from '../common/CommonUI';
import { batchesApi } from '../../services/api';

export function AdminBatchesScreen() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [year, setYear] = useState('2027');
  const [program, setProgram] = useState('MCA');
  const [branch, setBranch] = useState('Computer Applications');

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await batchesApi.listBatches();
      if (res.data.success) {
        setBatches(res.data.batches);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await batchesApi.createBatch({
        year: parseInt(year, 10),
        program,
        branch,
      });
      setShowAddModal(false);
      fetchBatches();
    } catch (err) {
      alert('Failed to create batch: ' + err.message);
    }
  };

  return (
    <div>
      <PageHead
        title="Batches"
        subhead="Program batches used for Corres assignment matching."
        action={
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Icon name="plus" />
            Add batch
          </button>
        }
      />

      {showAddModal && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--ink-900)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Add new academic batch</h3>
          <form onSubmit={handleCreateBatch}>
            <div className="grid grid-3">
              <div className="field">
                <label>Year</label>
                <input
                  className="input"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Program</label>
                <input
                  className="input"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Branch</label>
                <input
                  className="input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary">
                Save batch
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Program</th>
              <th>Branch</th>
              <th>College</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-600)' }}>
                  No batches configured.
                </td>
              </tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <b>{b.year}</b>
                  </td>
                  <td>{b.program}</td>
                  <td>{b.branch}</td>
                  <td>{b.college || 'VIT Vellore'}</td>
                  <td>
                    <Badge tone={b.status === 'ACTIVE' ? 'sage' : 'slate'}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBatchesScreen;

