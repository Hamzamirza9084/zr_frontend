import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AdminStudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get('/api/users/students', config);
        setStudents(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10 font-bold text-deep-green">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-off-white font-display p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-green/10 border border-deep-green/20 w-fit mb-4">
              <span className="material-symbols-outlined text-[18px] text-deep-green">admin_panel_settings</span>
              <span className="text-xs font-bold uppercase tracking-wide text-deep-green">Admin Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-deep-green">Student List</h1>
          </div>
          <Link to="/admin" className="px-5 py-2.5 rounded-xl bg-deep-green text-white font-bold hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-lg shadow-deep-green/20">
            <span className="material-symbols-outlined">add_circle</span>
            Add University
          </Link>
        </div>

        <div className="bg-white shadow-xl shadow-deep-green/5 rounded-2xl overflow-hidden border border-deep-green/10">
          <table className="min-w-full divide-y divide-deep-green/10">
            <thead className="bg-deep-green/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-deep-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-deep-green/10">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-deep-green/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-deep-green">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-deep-green/70">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-light-green/30 text-deep-green border border-deep-green/10">
                      {student.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/admin/students/${student._id}`} className="text-deep-green hover:text-primary font-bold flex items-center gap-1">
                      View Details
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
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

export default AdminStudentList;
