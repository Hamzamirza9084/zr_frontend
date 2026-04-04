import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminUniversitiesList = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutionSearch, setInstitutionSearch] = useState('');
    const navigate = useNavigate();

    const filteredUniversities = universities.filter(uni => {
        const instName = uni.institutionId?.name || uni.name || '';
        const matchesGeneral = instName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               (uni.courseName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesInstitution = instName.toLowerCase().includes(institutionSearch.toLowerCase());
        return matchesGeneral && matchesInstitution;
    });

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

            await fetchUniversities();
        };

        checkAdminAndFetch();
    }, [navigate]);

    const fetchUniversities = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/universities');
            setUniversities(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load universities.");
            setLoading(false);
        }
    };

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

                {/* Search & Toolbox */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border-2 border-light-green/50 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-deep-green/50">search</span>
                            <input 
                                type="text" 
                                placeholder="Search all..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-light-green/50 rounded-xl focus:outline-none focus:border-deep-green transition-colors text-deep-green font-medium"
                            />
                        </div>
                        <div className="relative w-full sm:w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-deep-green/50">account_balance</span>
                            <input 
                                type="text" 
                                placeholder="Search by Institution..."
                                value={institutionSearch}
                                onChange={(e) => setInstitutionSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-light-green/50 rounded-xl focus:outline-none focus:border-deep-green transition-colors text-deep-green font-medium"
                            />
                        </div>
                    </div>
                    <div className="text-deep-green font-bold text-sm whitespace-nowrap">
                        Showing {filteredUniversities.length} of {universities.length}
                    </div>
                </div>

                {/* Content */}
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
                                            No universities or programs found matching your search. Add one to get started!
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
