import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
          navigate('/login');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        const { data } = await axios.get('/api/applications', config);
        setApplications(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const updateStatus = async (id, newStatus) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.put(`/api/applications/${id}`, { status: newStatus }, config);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="text-center mt-10 font-bold text-deep-green">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-deep-green font-display p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 w-fit mb-4">
              <span className="material-symbols-outlined text-[18px] text-white">admin_panel_settings</span>
              <span className="text-xs font-bold uppercase tracking-wide text-white">Admin Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Manage Applications</h1>
          </div>
          <div className="flex gap-3">
             <Link to="/admin/applications" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                Refresh
             </Link>
             <Link to="/admin" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                Add University
             </Link>
             <Link to="/admin/students" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                View Students
             </Link>
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-deep-green/5 rounded-2xl overflow-hidden border border-deep-green/10">
          <table className="min-w-full divide-y divide-deep-green/10">
            <thead className="bg-deep-green/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Program</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Date Applied</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-deep-green/10">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-deep-green/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-deep-green">{app.student?.name || "Unknown"}</div>
                    <div className="text-xs text-deep-green/60">{app.student?.email}</div>
                    <Link to={`/admin/students/${app.student?._id}`} className="text-xs text-primary underline mt-1 block">View Profile</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-deep-green">{app.university?.courseName}</div>
                    <div className="text-xs text-deep-green/60">{app.university?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-deep-green/70">{new Date(app.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                         app.status.includes('Accepted by University') ? 'bg-green-100 text-green-800 border-green-200' :
                         app.status.includes('Accepted by Anvora') ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                         app.status.includes('Rejected by University') ? 'bg-red-100 text-red-800 border-red-200' :
                         app.status.includes('Rejected by Anvora') ? 'bg-orange-100 text-orange-800 border-orange-200' :
                         app.status === 'Under Review' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                         'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1 flex-wrap">
                       <button 
                         onClick={() => updateStatus(app._id, 'Accepted by University')}
                         className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 text-xs font-semibold"
                         title="Accepted by University"
                       >
                         Uni ✓
                       </button>
                       <button 
                         onClick={() => updateStatus(app._id, 'Accepted by Anvora')}
                         className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold"
                         title="Accepted by Anvora"
                       >
                         Anvora ✓
                       </button>
                       <button 
                         onClick={() => updateStatus(app._id, 'Rejected by University')}
                         className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold"
                         title="Rejected by University"
                       >
                         Uni ✗
                       </button>
                       <button 
                         onClick={() => updateStatus(app._id, 'Rejected by Anvora')}
                         className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 text-xs font-semibold"
                         title="Rejected by Anvora"
                       >
                         Anvora ✗
                       </button>
                       <button 
                         onClick={() => updateStatus(app._id, 'Under Review')}
                         className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-semibold"
                         title="Mark Under Review"
                       >
                         Review
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
