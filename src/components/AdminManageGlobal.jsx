import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminManageGlobal = () => {
    const [destinations, setDestinations] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'institutions'
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const userString = localStorage.getItem('user');
            if (!userString) return navigate('/login');
            const user = JSON.parse(userString);
            if (!user.token || user.role !== 'admin') return navigate('/');

            await fetchData();
        };
        checkAdminAndFetch();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [destRes, instRes] = await Promise.all([
                axios.get('/api/destinations'),
                axios.get('/api/institutions')
            ]);
            setDestinations(destRes.data);
            setInstitutions(instRes.data);
        } catch (err) {
            console.error("Failed fetching global data", err);
        }
        setLoading(false);
    };

    const toggleDestination = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/destinations/${id}/toggle`, {}, config);
            setDestinations(prev => prev.map(d => d._id === data._id ? data : d));
        } catch (err) {
            alert('Failed to toggle destination');
        }
    };

    const [editingInstitution, setEditingInstitution] = useState(null);

    const toggleInstitution = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/institutions/${id}/toggle`, {}, config);
            setInstitutions(prev => prev.map(i => i._id === data._id ? data : i));
        } catch (err) {
            alert('Failed to toggle institution');
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.post('/api/universities/upload-logo', formData, config);
            setEditingInstitution({ ...editingInstitution, logo: data.url });
        } catch (err) {
            console.error(err);
            alert('Failed to upload logo');
        }
    };

    const handleSaveInstitution = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = { ...editingInstitution };
            // Ensure destinationId is just the ID string if it's an object
            if (payload.destinationId && payload.destinationId._id) {
                payload.destinationId = payload.destinationId._id;
            }
            const { data } = await axios.put(`/api/institutions/${editingInstitution._id}`, payload, config);
            setInstitutions(prev => prev.map(i => i._id === data._id ? data : i));
            setEditingInstitution(null);
            alert("Institution updated successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update institution');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-transparent">
            <span className="material-symbols-outlined text-4xl text-white animate-spin">refresh</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent py-12 px-6 font-display">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-light-green/30 text-deep-green flex flex-col items-center justify-center shadow-inner border border-white">
                            <span className="material-symbols-outlined text-[24px]">public</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-deep-green tracking-tight">Global Management</h1>
                            <p className="text-deep-green/60 text-sm font-bold mt-1">Enable or disable Countries and Institutions globally.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/universities" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                            Manage Programs
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('destinations')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'destinations' ? 'bg-deep-green text-white' : 'bg-white text-deep-green border-2 border-light-green/50 hover:bg-light-green/20'}`}
                    >
                        Countries ({destinations.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('institutions')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'institutions' ? 'bg-deep-green text-white' : 'bg-white text-deep-green border-2 border-light-green/50 hover:bg-light-green/20'}`}
                    >
                        Institutions ({institutions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl border-2 border-light-green/50 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-light-green/10 border-b-2 border-light-green/50">
                                <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Name</th>
                                {activeTab === 'institutions' && <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Country</th>}
                                <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Status</th>
                                <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-green/30">
                            {activeTab === 'destinations' && destinations.map(dest => (
                                <tr key={dest._id} className="hover:bg-light-green/5">
                                    <td className="p-5 font-extrabold text-deep-green">{dest.name}</td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-lg ${dest.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {dest.enabled !== false ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => toggleDestination(dest._id)}
                                            className="px-4 py-2 bg-light-green/30 text-deep-green rounded-lg font-bold text-xs hover:bg-light-green/60 transition-colors"
                                        >
                                            {dest.enabled !== false ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'institutions' && institutions.map(inst => (
                                <tr key={inst._id} className="hover:bg-light-green/5">
                                    <td className="p-5 font-extrabold text-deep-green">
                                        <div className="flex items-center gap-3">
                                            {inst.logo && <img src={inst.logo} alt="logo" className="w-8 h-8 object-contain rounded-md border border-light-green/50"/>}
                                            {inst.name}
                                        </div>
                                    </td>
                                    <td className="p-5 font-bold text-deep-green/60">{inst.destinationId?.name}</td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-lg ${inst.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {inst.enabled !== false ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right flex justify-end gap-2">
                                        <button 
                                            onClick={() => setEditingInstitution({...inst})}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-200 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => toggleInstitution(inst._id)}
                                            className="px-4 py-2 bg-light-green/30 text-deep-green rounded-lg font-bold text-xs hover:bg-light-green/60 transition-colors"
                                        >
                                            {inst.enabled !== false ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Edit Institution Modal */}
            {editingInstitution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-green/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                        <h2 className="text-xl font-extrabold text-deep-green mb-4">Edit Institution</h2>
                        <form onSubmit={handleSaveInstitution} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Institution Name</label>
                                <input type="text" required value={editingInstitution.name} onChange={e => setEditingInstitution({...editingInstitution, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">City</label>
                                <input type="text" value={editingInstitution.city || ''} onChange={e => setEditingInstitution({...editingInstitution, city: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Destination</label>
                                <select value={editingInstitution.destinationId?._id || editingInstitution.destinationId || ''} onChange={e => setEditingInstitution({...editingInstitution, destinationId: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium">
                                    <option value="">Select Destination</option>
                                    {destinations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Ranking</label>
                                <input type="text" value={editingInstitution.ranking || ''} onChange={e => setEditingInstitution({...editingInstitution, ranking: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Website URL</label>
                                <input type="text" value={editingInstitution.website || ''} onChange={e => setEditingInstitution({...editingInstitution, website: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium" placeholder="www.example.ac.uk" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Logo URL (or Upload)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="text" value={editingInstitution.logo || ''} onChange={e => setEditingInstitution({...editingInstitution, logo: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium" placeholder="https://..." />
                                    <label className="px-4 py-2 bg-light-green/20 text-deep-green rounded-xl font-bold border border-light-green cursor-pointer hover:bg-light-green/40 transition-colors whitespace-nowrap">
                                        Upload File
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                </div>
                                {editingInstitution.logo && (
                                    <div className="mt-2 p-2 border border-light-green/30 rounded-xl inline-block bg-light-green/5">
                                        <img src={editingInstitution.logo} alt="Preview" className="h-10 object-contain" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-light-green/30">
                                <button type="button" onClick={() => setEditingInstitution(null)} className="px-5 py-2 rounded-xl font-bold text-deep-green hover:bg-light-green/20">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-primary text-deep-green hover:bg-primary/80">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageGlobal;
