import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser, selectUserToken } from '../store/authSlice';
import { AdminManageSkeleton } from './Skeletons';

const AdminManageGlobal = () => {
    const [destinations, setDestinations] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('institutions'); // 'institutions' | 'destinations'
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const token = useSelector(selectUserToken);

    // Modals
    const [editingInstitution, setEditingInstitution] = useState(null);
    const [showAddInstModal, setShowAddInstModal] = useState(false);
    const [showAddDestModal, setShowAddDestModal] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Form states for adding
    const [newInst, setNewInst] = useState({
        name: '',
        destinationId: '',
        city: '',
        ranking: '',
        website: '',
        logo: '',
        mapLocation: ''
    });
    const [newDestName, setNewDestName] = useState('');

    useEffect(() => {
        if (!user || !token || user.role !== 'admin') {
            navigate(user ? '/' : '/login');
            return;
        }
        fetchData();
    }, [navigate, user, token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [destRes, instRes] = await Promise.all([
                axios.get('/api/destinations?withCounts=true'),
                axios.get('/api/institutions?withCounts=true')
            ]);
            setDestinations(destRes.data);
            setInstitutions(instRes.data);
        } catch (err) {
            console.error("Failed fetching global data", err);
        }
        setLoading(false);
    };

    const toggleDestination = useCallback(async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`/api/destinations/${id}/toggle`, {}, config);
            setDestinations(prev => prev.map(d => d._id === data._id ? { ...d, enabled: data.enabled } : d));
        } catch (err) {
            alert('Failed to toggle destination');
        }
    }, [token]);

    const toggleInstitution = useCallback(async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`/api/institutions/${id}/toggle`, {}, config);
            setInstitutions(prev => prev.map(i => i._id === data._id ? { ...i, enabled: data.enabled } : i));
        } catch (err) {
            alert('Failed to toggle institution');
        }
    }, [token]);

    const deleteInstitution = useCallback(async (inst) => {
        const pCount = inst.programCount || 0;
        const confirmMsg = pCount > 0
            ? `⚠️ Warning: "${inst.name}" has ${pCount} program(s) attached to it.\n\nDeleting this institution may orphan these programs. Are you sure you want to force delete it?`
            : `Are you sure you want to delete "${inst.name}"${inst.city ? ` (${inst.city})` : ''}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = pCount > 0 ? `/api/institutions/${inst._id}?force=true` : `/api/institutions/${inst._id}`;
            await axios.delete(url, config);
            setInstitutions(prev => prev.filter(i => i._id !== inst._id));
            alert("Institution deleted successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete institution');
        }
    }, [token]);

    const deleteDestination = useCallback(async (dest) => {
        const iCount = dest.institutionCount || 0;
        const confirmMsg = iCount > 0
            ? `⚠️ Warning: "${dest.name}" has ${iCount} institution(s) registered under it.\n\nAre you sure you want to delete this country?`
            : `Are you sure you want to delete "${dest.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = iCount > 0 ? `/api/destinations/${dest._id}?force=true` : `/api/destinations/${dest._id}`;
            await axios.delete(url, config);
            setDestinations(prev => prev.filter(d => d._id !== dest._id));
            alert("Country deleted successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete country');
        }
    }, [token]);

    const handleLogoUpload = useCallback(async (e, isEditing = true) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            setUploadingLogo(true);
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await axios.post('/api/universities/upload-logo', formData, config);
            if (isEditing) {
                setEditingInstitution(prev => ({ ...prev, logo: data.url }));
            } else {
                setNewInst(prev => ({ ...prev, logo: data.url }));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    }, [token]);

    const handleSaveInstitution = useCallback(async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { ...editingInstitution };
            if (payload.destinationId && payload.destinationId._id) {
                payload.destinationId = payload.destinationId._id;
            }
            const { data } = await axios.put(`/api/institutions/${editingInstitution._id}`, payload, config);
            setInstitutions(prev => prev.map(i => i._id === data._id ? { ...data, programCount: i.programCount } : i));
            setEditingInstitution(null);
            alert("Institution updated successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update institution');
        }
    }, [token, editingInstitution]);

    const handleCreateInstitution = async (e) => {
        e.preventDefault();
        const trimmedName = newInst.name.trim();
        if (!trimmedName || !newInst.destinationId) {
            alert("Please enter the institution name and select a country.");
            return;
        }

        // Frontend check for duplicate
        const destObj = destinations.find(d => d._id === newInst.destinationId);
        const duplicate = institutions.find(i => 
            (i.name || '').trim().toLowerCase() === trimmedName.toLowerCase() &&
            (i.destinationId?._id === newInst.destinationId || i.destinationId === newInst.destinationId)
        );

        if (duplicate) {
            alert(`"${trimmedName}" is already there for ${destObj?.name || 'this country'}!`);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/institutions', newInst, config);
            setInstitutions(prev => [...prev, { ...data, programCount: 0 }]);
            setShowAddInstModal(false);
            setNewInst({ name: '', destinationId: '', city: '', ranking: '', website: '', logo: '', mapLocation: '' });
            alert(`Institution "${trimmedName}" created successfully!`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create institution');
        }
    };

    const handleCreateDestination = async (e) => {
        e.preventDefault();
        const trimmed = newDestName.trim();
        if (!trimmed) {
            alert("Please enter a country name.");
            return;
        }

        const duplicate = destinations.find(d => (d.name || '').trim().toLowerCase() === trimmed.toLowerCase());
        if (duplicate) {
            alert(`"${trimmed}" is already there!`);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/destinations', { name: trimmed }, config);
            setDestinations(prev => [...prev, { ...data, institutionCount: 0 }]);
            setShowAddDestModal(false);
            setNewDestName('');
            alert(`Country "${trimmed}" created successfully!`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create country');
        }
    };

    // Filtered lists based on search
    const filteredInstitutions = useMemo(() => {
        if (!searchQuery.trim()) return institutions;
        const q = searchQuery.toLowerCase().trim();
        return institutions.filter(i => 
            (i.name || '').toLowerCase().includes(q) ||
            (i.city || '').toLowerCase().includes(q) ||
            (i.destinationId?.name || '').toLowerCase().includes(q)
        );
    }, [institutions, searchQuery]);

    const filteredDestinations = useMemo(() => {
        if (!searchQuery.trim()) return destinations;
        const q = searchQuery.toLowerCase().trim();
        return destinations.filter(d => (d.name || '').toLowerCase().includes(q));
    }, [destinations, searchQuery]);

    if (loading) return <AdminManageSkeleton />;

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
                            <p className="text-deep-green/60 text-sm font-bold mt-1">Manage, add, delete, and enable/disable Countries and Institutions.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowAddInstModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-deep-green text-white font-bold hover:bg-deep-green/90 transition-all flex items-center gap-1.5 shadow-sm text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Add Institution
                        </button>
                        <button
                            onClick={() => setShowAddDestModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-light-green/40 text-deep-green font-bold hover:bg-light-green/70 transition-all flex items-center gap-1.5 border border-light-green/50 text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                            Add Country
                        </button>
                        <Link to="/admin/universities" className="px-4 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all text-sm">
                            Manage Programs
                        </Link>
                    </div>
                </div>

                {/* Tabs & Search Filter */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setActiveTab('institutions'); setSearchQuery(''); }}
                            className={`px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2 cursor-pointer ${
                                activeTab === 'institutions' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-500' 
                                    : 'bg-white hover:bg-white/90 text-deep-green shadow-sm border-2 border-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">account_balance</span>
                            Institutions ({institutions.length})
                        </button>
                        <button 
                            onClick={() => { setActiveTab('destinations'); setSearchQuery(''); }}
                            className={`px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2 cursor-pointer ${
                                activeTab === 'destinations' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-500' 
                                    : 'bg-white hover:bg-white/90 text-deep-green shadow-sm border-2 border-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                            Countries ({destinations.length})
                        </button>
                    </div>

                    <div className="relative min-w-[280px]">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-deep-green/40 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder={activeTab === 'institutions' ? "Search institutions, cities..." : "Search countries..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-light-green/60 bg-white text-deep-green placeholder:text-deep-green/40 focus:outline-none focus:border-deep-green text-sm font-medium"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-green/40 hover:text-deep-green">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-3xl border-2 border-light-green/50 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-light-green/10 border-b-2 border-light-green/50">
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">
                                        {activeTab === 'institutions' ? 'Institution Name' : 'Country Name'}
                                    </th>
                                    {activeTab === 'institutions' && (
                                        <>
                                            <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Country</th>
                                            <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">City / Campus</th>
                                            <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Programs</th>
                                        </>
                                    )}
                                    {activeTab === 'destinations' && (
                                        <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Institutions</th>
                                    )}
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Status</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-green/30">
                                {activeTab === 'destinations' && filteredDestinations.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-deep-green/50 font-bold italic">
                                            No countries found.
                                        </td>
                                    </tr>
                                )}
                                {activeTab === 'destinations' && filteredDestinations.map(dest => (
                                    <tr key={dest._id} className="hover:bg-light-green/5 transition-colors">
                                        <td className="p-5 font-extrabold text-deep-green text-sm">{dest.name}</td>
                                        <td className="p-5">
                                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-light-green/20 text-deep-green border border-light-green/40">
                                                {dest.institutionCount || 0} institution{dest.institutionCount !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${dest.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {dest.enabled !== false ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => toggleDestination(dest._id)}
                                                    className="px-3 py-1.5 bg-light-green/30 text-deep-green rounded-lg font-bold text-xs hover:bg-light-green/60 transition-colors"
                                                >
                                                    {dest.enabled !== false ? 'Disable' : 'Enable'}
                                                </button>
                                                <button 
                                                    onClick={() => deleteDestination(dest)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-100"
                                                    title="Delete Country"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'institutions' && filteredInstitutions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-deep-green/50 font-bold italic">
                                            No institutions found matching your search.
                                        </td>
                                    </tr>
                                )}
                                {activeTab === 'institutions' && filteredInstitutions.map(inst => (
                                    <tr key={inst._id} className="hover:bg-light-green/5 transition-colors">
                                        <td className="p-5 font-extrabold text-deep-green">
                                            <div className="flex items-center gap-3">
                                                {inst.logo ? (
                                                    <img src={inst.logo} alt="logo" className="w-8 h-8 object-contain rounded-md border border-light-green/50 bg-white p-0.5"/>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-md bg-light-green/20 text-deep-green flex items-center justify-center font-black text-xs">
                                                        {inst.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-sm font-extrabold text-deep-green">{inst.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 font-bold text-sm text-deep-green/80">
                                            {inst.destinationId?.name || "—"}
                                        </td>
                                        <td className="p-5 font-medium text-sm text-deep-green/70">
                                            <span className="inline-flex items-center gap-1">
                                                {inst.city && <span className="material-symbols-outlined text-[15px] text-deep-green/50">location_on</span>}
                                                {inst.city || "—"}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                                (inst.programCount || 0) > 0 
                                                    ? 'bg-deep-green/10 text-deep-green border-deep-green/20' 
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {inst.programCount || 0} program{(inst.programCount || 0) !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${inst.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {inst.enabled !== false ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingInstitution({...inst})}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-100"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => toggleInstitution(inst._id)}
                                                    className="px-3 py-1.5 bg-light-green/30 text-deep-green rounded-lg font-bold text-xs hover:bg-light-green/60 transition-colors"
                                                >
                                                    {inst.enabled !== false ? 'Disable' : 'Enable'}
                                                </button>
                                                <button 
                                                    onClick={() => deleteInstitution(inst)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-100"
                                                    title="Delete Institution"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    Delete
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

            {/* Modal: Add New Institution */}
            {showAddInstModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-green/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-extrabold text-deep-green flex items-center gap-2">
                                <span className="material-symbols-outlined text-deep-green">add_circle</span>
                                Add New Institution
                            </h2>
                            <button onClick={() => setShowAddInstModal(false)} className="text-deep-green/40 hover:text-deep-green">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateInstitution} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Country / Destination *</label>
                                <select 
                                    required 
                                    value={newInst.destinationId} 
                                    onChange={e => setNewInst({...newInst, destinationId: e.target.value})} 
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm bg-white"
                                >
                                    <option value="">Select Country</option>
                                    {destinations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Institution Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. University of Manchester" 
                                    value={newInst.name} 
                                    onChange={e => setNewInst({...newInst, name: e.target.value})} 
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">City / Campus</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Manchester" 
                                    value={newInst.city} 
                                    onChange={e => setNewInst({...newInst, city: e.target.value})} 
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Ranking (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. #27 QS World" 
                                    value={newInst.ranking} 
                                    onChange={e => setNewInst({...newInst, ranking: e.target.value})} 
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Website URL</label>
                                <input 
                                    type="text" 
                                    placeholder="https://..." 
                                    value={newInst.website} 
                                    onChange={e => setNewInst({...newInst, website: e.target.value})} 
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Logo URL or Upload</label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="https://..." 
                                        value={newInst.logo} 
                                        onChange={e => setNewInst({...newInst, logo: e.target.value})} 
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" 
                                    />
                                    <label className="px-4 py-2 bg-light-green/20 text-deep-green rounded-xl font-bold border border-light-green cursor-pointer hover:bg-light-green/40 transition-colors whitespace-nowrap text-xs">
                                        {uploadingLogo ? 'Uploading...' : 'Upload'}
                                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, false)} className="hidden" disabled={uploadingLogo} />
                                    </label>
                                </div>
                                {newInst.logo && (
                                    <div className="mt-2 p-2 border border-light-green/30 rounded-xl inline-block bg-light-green/5">
                                        <img src={newInst.logo} alt="Preview" className="h-10 object-contain" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-light-green/30">
                                <button type="button" onClick={() => setShowAddInstModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-deep-green hover:bg-light-green/20 text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-deep-green text-white hover:bg-deep-green/90 text-sm shadow-md">Add Institution</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add New Country */}
            {showAddDestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-green/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-extrabold text-deep-green flex items-center gap-2">
                                <span className="material-symbols-outlined text-deep-green">add_location_alt</span>
                                Add Country / Destination
                            </h2>
                            <button onClick={() => setShowAddDestModal(false)} className="text-deep-green/40 hover:text-deep-green">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateDestination} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Country Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Germany" 
                                    value={newDestName} 
                                    onChange={e => setNewDestName(e.target.value)} 
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" 
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-light-green/30">
                                <button type="button" onClick={() => setShowAddDestModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-deep-green hover:bg-light-green/20 text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-deep-green text-white hover:bg-deep-green/90 text-sm shadow-md">Add Country</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Institution Modal */}
            {editingInstitution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-green/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-extrabold text-deep-green mb-4">Edit Institution</h2>
                        <form onSubmit={handleSaveInstitution} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Institution Name</label>
                                <input type="text" required value={editingInstitution.name} onChange={e => setEditingInstitution({...editingInstitution, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">City / Campus</label>
                                <input type="text" value={editingInstitution.city || ''} onChange={e => setEditingInstitution({...editingInstitution, city: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Destination</label>
                                <select value={editingInstitution.destinationId?._id || editingInstitution.destinationId || ''} onChange={e => setEditingInstitution({...editingInstitution, destinationId: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm bg-white">
                                    <option value="">Select Destination</option>
                                    {destinations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Ranking</label>
                                <input type="text" value={editingInstitution.ranking || ''} onChange={e => setEditingInstitution({...editingInstitution, ranking: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Website URL</label>
                                <input type="text" value={editingInstitution.website || ''} onChange={e => setEditingInstitution({...editingInstitution, website: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" placeholder="www.example.ac.uk" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-deep-green/80 uppercase mb-1">Logo URL (or Upload)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="text" value={editingInstitution.logo || ''} onChange={e => setEditingInstitution({...editingInstitution, logo: e.target.value})} className="w-full px-4 py-2 rounded-xl border-2 border-light-green focus:border-deep-green focus:outline-none text-deep-green font-medium text-sm" placeholder="https://..." />
                                    <label className="px-4 py-2 bg-light-green/20 text-deep-green rounded-xl font-bold border border-light-green cursor-pointer hover:bg-light-green/40 transition-colors whitespace-nowrap text-xs">
                                        {uploadingLogo ? 'Uploading...' : 'Upload'}
                                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, true)} className="hidden" disabled={uploadingLogo} />
                                    </label>
                                </div>
                                {editingInstitution.logo && (
                                    <div className="mt-2 p-2 border border-light-green/30 rounded-xl inline-block bg-light-green/5">
                                        <img src={editingInstitution.logo} alt="Preview" className="h-10 object-contain" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-light-green/30">
                                <button type="button" onClick={() => setEditingInstitution(null)} className="px-5 py-2 rounded-xl font-bold text-deep-green hover:bg-light-green/20 text-sm">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-primary text-deep-green hover:bg-primary/80 text-sm">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageGlobal;
