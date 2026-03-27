import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get('/api/applications/my', config);
        setApplications(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applications");
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10 font-bold text-deep-green">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-off-white font-display p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-deep-green mb-8">My Applications</h1>

        {applications.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-deep-green/10 text-center">
            <p className="text-deep-green/70 mb-4">You haven't applied to any programs yet.</p>
            <button 
              onClick={() => navigate('/colleges')}
              className="px-6 py-3 bg-primary text-deep-green font-bold rounded-xl"
            >
              Browse Programs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => (
              <div key={app._id} className="bg-white p-6 rounded-2xl border border-deep-green/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-deep-green">{app.university?.courseName || "Unknown Course"}</h3>
                  <p className="text-deep-green/70 font-bold">{app.university?.name || "Unknown University"}</p>
                  <p className="text-sm text-deep-green/60 mt-1">Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className={`px-4 py-2 rounded-full font-bold text-sm border ${
                     app.status === 'Accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                     app.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                     'bg-yellow-100 text-yellow-800 border-yellow-200'
                   }`}>
                     {app.status}
                   </div>
                   <button className="text-deep-green font-bold text-sm underline hover:text-primary">
                     View Details
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
