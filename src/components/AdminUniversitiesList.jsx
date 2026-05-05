import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminUniversitiesList = () => {
    const [universities, setUniversities] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Cascading filter state
    const [selectedDestination, setSelectedDestination] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const userString = localStorage.getItem('user');
            if (!userString) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userString);
            if (!user.token || user.role !== 'admin') {
                navigate('/');
                return;
            }

            await fetchData();
        };

        checkAdminAndFetch();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [uniRes, destRes, instRes] = await Promise.all([
                axios.get('/api/universities'),
                axios.get('/api/destinations'),
                axios.get('/api/institutions')
            ]);
            setUniversities(uniRes.data);
            setDestinations(destRes.data);
            setInstitutions(instRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
            setLoading(false);
        }
    };

    // Helper for consistent name normalization
    const norm = (str) => (str || '').trim();
    const normLower = (str) => norm(str).toLowerCase();

    // Derived: unique destination names (case-insensitive dedup)
    const availableDestinations = [...new Map(
        universities
            .map(u => norm(u.institutionId?.destinationId?.name || u.country))
            .filter(Boolean)
            .map(n => [normLower(n), n])
    ).values()].sort();

    // Derived: unique institution names filtered by selected destination
    const availableInstitutions = [...new Map(
        universities
            .filter(u => {
                if (!selectedDestination) return true;
                const country = norm(u.institutionId?.destinationId?.name || u.country);
                return normLower(country) === normLower(selectedDestination);
            })
            .map(u => norm(u.institutionId?.name || u.name))
            .filter(n => n !== '')
            .map(n => [normLower(n), n])
    ).values()].sort();

    // Derived: unique cities filtered by selected destination + institution
    const availableCities = [...new Map(
        universities
            .filter(u => {
                if (!selectedDestination) return true;
                const country = norm(u.institutionId?.destinationId?.name || u.country);
                return normLower(country) === normLower(selectedDestination);
            })
            .filter(u => {
                if (!selectedInstitution) return true;
                const instName = norm(u.institutionId?.name || u.name);
                return normLower(instName) === normLower(selectedInstitution);
            })
            .map(u => norm(u.institutionId?.city || u.city))
            .filter(c => c !== '')
            .map(c => [normLower(c), c])
    ).values()].sort();

    // Final filtered list
    const filteredUniversities = universities.filter(uni => {
        const country = norm(uni.institutionId?.destinationId?.name || uni.country);
        const instName = norm(uni.institutionId?.name || uni.name);
        const city = norm(uni.institutionId?.city || uni.city);

        const matchesDest = !selectedDestination || normLower(country) === normLower(selectedDestination);
        const matchesInst = !selectedInstitution || normLower(instName) === normLower(selectedInstitution);
        const matchesCity = !selectedCity || normLower(city) === normLower(selectedCity);

        const matchesSearch = !searchTerm ||
            instName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (uni.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesDest && matchesInst && matchesCity && matchesSearch;
    });

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this university/program? This cannot be undone.")) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            await axios.delete(`/api/universities/${id}`, config);

            // Update state to remove deleted university
            setUniversities(universities.filter(uni => uni._id !== id));
            alert("University deleted successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to delete university.");
        }
    };

    const handleClearFilters = () => {
        setSelectedDestination('');
        setSelectedInstitution('');
        setSelectedCity('');
        setSearchTerm('');
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-transparent">
            <span className="material-symbols-outlined text-4xl text-white animate-spin">refresh</span>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-transparent">
            <p className="text-red-500 font-bold">{error}</p>
        </div>
    );

    const hasActiveFilters = selectedDestination || selectedInstitution || selectedCity || searchTerm;

    return (
        <div className="min-h-screen bg-transparent py-12 px-6 font-display">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-light-green/10 rounded-full select-none pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-light-green/30 text-deep-green flex flex-col items-center justify-center shadow-inner border border-white">
                            <span className="material-symbols-outlined text-[24px]">account_balance</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-deep-green tracking-tight">
                                Manage Universities <span className="text-lg bg-light-green text-deep-green px-2 py-1 rounded-xl ml-2 inline-block -translate-y-0.5">{universities.length} Total</span>
                            </h1>
                            <p className="text-deep-green/60 text-sm font-bold mt-1">View, edit, or remove programs from the system.</p>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-3 flex-wrap justify-end">
                        <Link to="/admin/global" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                            Global Config
                        </Link>
                        <Link to="/admin" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                            Add New Form
                        </Link>
                        <Link to="/admin/students" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                            View Students
                        </Link>
                        <Link to="/admin/applications" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
                            View Applications
                        </Link>
                    </div>
                </div>

                {/* Cascading Filters */}
                <div className="bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-extrabold text-deep-green uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filter Programs
                        </h2>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Step 1: Destination */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-deep-green/70 uppercase tracking-wide ml-1">
                                <span className="inline-flex items-center gap-1">
                                    <span className="size-5 rounded-md bg-deep-green text-white text-[10px] font-black flex items-center justify-center">1</span>
                                    Destination
                                </span>
                            </label>
                            <select
                                value={selectedDestination}
                                onChange={(e) => {
                                    setSelectedDestination(e.target.value);
                                    setSelectedInstitution('');
                                    setSelectedCity('');
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green focus:outline-none focus:border-deep-green transition-colors text-sm font-medium appearance-none cursor-pointer"
                            >
                                <option value="">All Destinations</option>
                                {availableDestinations.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Step 2: Institution */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-deep-green/70 uppercase tracking-wide ml-1">
                                <span className="inline-flex items-center gap-1">
                                    <span className={`size-5 rounded-md text-[10px] font-black flex items-center justify-center ${selectedDestination ? 'bg-deep-green text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
                                    Institution
                                </span>
                            </label>
                            <select
                                value={selectedInstitution}
                                onChange={(e) => {
                                    setSelectedInstitution(e.target.value);
                                    setSelectedCity('');
                                }}
                                disabled={!selectedDestination}
                                className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white text-deep-green focus:outline-none focus:border-deep-green transition-colors text-sm font-medium appearance-none cursor-pointer ${selectedDestination ? 'border-light-green' : 'border-gray-200 opacity-50 cursor-not-allowed'}`}
                            >
                                <option value="">All Institutions</option>
                                {availableInstitutions.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>

                        {/* Step 3: City */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-deep-green/70 uppercase tracking-wide ml-1">
                                <span className="inline-flex items-center gap-1">
                                    <span className={`size-5 rounded-md text-[10px] font-black flex items-center justify-center ${selectedInstitution ? 'bg-deep-green text-white' : 'bg-gray-200 text-gray-400'}`}>3</span>
                                    City
                                </span>
                            </label>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={!selectedInstitution}
                                className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white text-deep-green focus:outline-none focus:border-deep-green transition-colors text-sm font-medium appearance-none cursor-pointer ${selectedInstitution ? 'border-light-green' : 'border-gray-200 opacity-50 cursor-not-allowed'}`}
                            >
                                <option value="">All Cities</option>
                                {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>

                        {/* Step 4: Search */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-deep-green/70 uppercase tracking-wide ml-1">
                                <span className="inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">search</span>
                                    Search
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green placeholder:text-deep-green/30 focus:outline-none focus:border-deep-green transition-colors text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-light-green/30">
                            {selectedDestination && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep-green/5 border border-deep-green/15 rounded-lg text-xs font-bold text-deep-green">
                                    <span className="material-symbols-outlined text-[14px]">public</span>
                                    {selectedDestination}
                                    <button onClick={() => { setSelectedDestination(''); setSelectedInstitution(''); setSelectedCity(''); }} className="ml-1 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                </span>
                            )}
                            {selectedInstitution && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep-green/5 border border-deep-green/15 rounded-lg text-xs font-bold text-deep-green">
                                    <span className="material-symbols-outlined text-[14px]">account_balance</span>
                                    {selectedInstitution}
                                    <button onClick={() => { setSelectedInstitution(''); setSelectedCity(''); }} className="ml-1 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                </span>
                            )}
                            {selectedCity && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep-green/5 border border-deep-green/15 rounded-lg text-xs font-bold text-deep-green">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {selectedCity}
                                    <button onClick={() => setSelectedCity('')} className="ml-1 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                </span>
                            )}
                            <span className="text-xs font-bold text-deep-green/50 self-center ml-2">
                                {filteredUniversities.length} program{filteredUniversities.length !== 1 ? 's' : ''} found
                            </span>
                        </div>
                    )}
                </div>

                {/* Programs Table */}
                <div className="bg-white rounded-3xl border-2 border-light-green/50 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-light-green/10 border-b-2 border-light-green/50">
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Course Name</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Institution</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Level & Location</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-green/30">
                                {filteredUniversities.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-deep-green/50 font-bold italic">
                                            {hasActiveFilters
                                                ? "No programs found matching your filters. Try adjusting your selection."
                                                : "No programs found. Add one to get started!"
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUniversities.map((uni) => (
                                        <motion.tr
                                            key={uni._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="hover:bg-light-green/5 transition-colors"
                                        >
                                            <td className="p-5">
                                                <span className="font-extrabold text-deep-green text-sm">{uni.courseName || "N/A"}</span>
                                            </td>
                                            <td className="p-5 text-sm font-bold text-deep-green/80">
                                                {uni.institutionId?.name || uni.name}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold bg-light-green/30 text-deep-green px-2 py-0.5 rounded-full inline-flex w-fit">{uni.courseLevel?.split(' ')[0] || "Program"}</span>
                                                    <span className="text-xs font-medium text-deep-green/60 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                        {uni.institutionId?.city || uni.city}, {uni.institutionId?.destinationId?.name || uni.country}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/edit-university/${uni._id}`}
                                                        className="size-8 rounded-lg bg-light-green/20 text-deep-green hover:bg-light-green transition-colors flex items-center justify-center font-bold text-xs shadow-sm border border-light-green/50"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(uni._id)}
                                                        className="size-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center shadow-sm border border-red-100"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUniversitiesList;

