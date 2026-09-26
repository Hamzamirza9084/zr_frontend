import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectUser, selectUserToken } from '../store/authSlice';
import { AdminUniversitiesListSkeleton } from './Skeletons';

const AdminUniversitiesList = () => {
    const [universities, setUniversities] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const token = useSelector(selectUserToken);

    // Cascading filter state
    const [selectedDestination, setSelectedDestination] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(50);
    const [hasMore, setHasMore] = useState(true);
    const [totalResultsCount, setTotalResultsCount] = useState(0);

    const [meta, setMeta] = useState({
        destinations: [],
        institutions: [],
        cities: []
    });

    // Debounce search input by 350ms to prevent barrage of requests while typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Auth check on mount
    useEffect(() => {
        if (!user || !token || user.role !== 'admin') {
            navigate(user ? '/' : '/login');
        }
    }, [user, token, navigate]);

    // Fetch filter metadata on mount
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const { data } = await axios.get('/api/universities/meta');
                setMeta(data);
            } catch (err) {
                console.error("Failed to load metadata:", err);
            }
        };
        fetchMeta();
    }, []);

    const fetchUniversities = async (pageNumber = 1, currentLimit = limit, filters = {}) => {
        try {
            setTableLoading(true);

            const params = new URLSearchParams();
            params.append('page', pageNumber);
            params.append('limit', currentLimit);

            const dest = filters.destination !== undefined ? filters.destination : selectedDestination;
            const inst = filters.institution !== undefined ? filters.institution : selectedInstitution;
            const city = filters.city !== undefined ? filters.city : selectedCity;
            const search = filters.search !== undefined ? filters.search : debouncedSearch;

            if (dest) params.append('destination', dest);
            if (inst) params.append('institution', inst);
            if (city) params.append('city', city);
            if (search) params.append('search', search);

            const { data } = await axios.get(`/api/universities?${params.toString()}`);

            setUniversities(data.data || []);
            setPage(data.page || pageNumber);
            setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / currentLimit) || 1);
            setTotalResultsCount(data.totalCount || 0);
            setHasMore(Boolean(data.hasMore));
        } catch (err) {
            console.error(err);
            setError("Failed to load universities.");
        } finally {
            setInitialLoading(false);
            setTableLoading(false);
        }
    };

    // Trigger fetch whenever filters change
    useEffect(() => {
        fetchUniversities(1, limit, {
            destination: selectedDestination,
            institution: selectedInstitution,
            city: selectedCity,
            search: debouncedSearch
        });
    }, [selectedDestination, selectedInstitution, selectedCity, debouncedSearch]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page || tableLoading) return;
        fetchUniversities(newPage, limit, {
            destination: selectedDestination,
            institution: selectedInstitution,
            city: selectedCity,
            search: debouncedSearch
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        fetchUniversities(1, newLimit, {
            destination: selectedDestination,
            institution: selectedInstitution,
            city: selectedCity,
            search: debouncedSearch
        });
    };

    const paginationItems = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (page <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }
        if (page >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', page - 1, page, page + 1, '...', totalPages];
    }, [page, totalPages]);

    // Helper for consistent name normalization
    const norm = (str) => (str || '').trim();
    const normLower = (str) => norm(str).toLowerCase();

    // Derived lists from meta
    const availableDestinations = (meta?.destinations || []).map(d => d.name).sort();

    const selectedDestObj = (meta?.destinations || []).find(d => normLower(d.name) === normLower(selectedDestination));
    const selectedDestId = selectedDestObj?._id;

    const availableInstitutions = (meta?.institutions || [])
        .filter(inst => !selectedDestId || inst.destinationId === selectedDestId)
        .map(inst => inst.name)
        .sort();

    const availableCities = (meta?.institutions || [])
        .filter(inst => {
            const matchesDest = !selectedDestId || inst.destinationId === selectedDestId;
            const matchesInst = !selectedInstitution || normLower(inst.name).includes(normLower(selectedInstitution));
            return matchesDest && matchesInst;
        })
        .map(inst => inst.city)
        .filter(Boolean)
        .filter((v, i, self) => self.indexOf(v) === i) // unique
        .sort();

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this university/program? This cannot be undone.")) {
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(`/api/universities/${id}`, config);

            // Update state to remove deleted university
            setUniversities(universities.filter(uni => uni._id !== id));
            setTotalResultsCount(prev => Math.max(0, prev - 1));
            alert("University deleted successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to delete university.");
        }
    }, [token, universities]);

    const handleClearFilters = () => {
        setSelectedDestination('');
        setSelectedInstitution('');
        setSelectedCity('');
        setSearchTerm('');
    };

    const hasActiveFilters = selectedDestination || selectedInstitution || selectedCity || searchTerm;

    if (initialLoading) return <AdminUniversitiesListSkeleton />;

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
                                Manage Universities 
                                <span className="text-lg bg-light-green text-deep-green px-2.5 py-1 rounded-xl ml-2 inline-flex items-center gap-1.5 -translate-y-0.5">
                                    {tableLoading && <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>}
                                    {totalResultsCount} Total
                                </span>
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
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search courses, institutions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green placeholder:text-deep-green/30 focus:outline-none focus:border-deep-green transition-colors text-sm font-medium"
                                />
                                {searchTerm && (
                                    <button 
                                        type="button" 
                                        onClick={() => setSearchTerm('')} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-green/40 hover:text-deep-green transition-colors cursor-pointer"
                                        title="Clear search"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                )}
                            </div>
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
                                {totalResultsCount} program{totalResultsCount !== 1 ? 's' : ''} found
                            </span>
                        </div>
                    )}
                </div>

                {/* Programs Table */}
                <div className="bg-white rounded-3xl border-2 border-light-green/50 shadow-xl overflow-hidden relative min-h-[350px]">
                    {/* In-table smooth loading overlay */}
                    {tableLoading && (
                        <div className="absolute inset-0 z-20 bg-white/75 backdrop-blur-[2px] flex items-center justify-center transition-all">
                            <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-xl border border-light-green/40">
                                <span className="material-symbols-outlined text-4xl text-deep-green animate-spin">progress_activity</span>
                                <span className="text-xs font-bold text-deep-green uppercase tracking-wider">Updating programs...</span>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-light-green/10 border-b-2 border-light-green/50">
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Course Name</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Institution</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Level & Location</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider">Tuition Fee</th>
                                    <th className="p-5 font-extrabold text-deep-green text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-green/30">
                                {universities.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-deep-green/50 font-bold italic">
                                            {hasActiveFilters
                                                ? "No programs found matching your filters. Try adjusting your selection."
                                                : "No programs found. Add one to get started!"
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    universities.map((uni) => (
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
                                                <span className="text-xs font-bold text-deep-green bg-light-green/20 border border-light-green/40 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[13px]">payments</span>
                                                    {uni.tuitionFee ? `${uni.currency || '$'}${Number(uni.tuitionFee).toLocaleString('en-IN')}` : 'N/A'}
                                                </span>
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

                {/* Pagination Controls */}
                {totalResultsCount > 0 && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-light-green/50 shadow-md">
                        {/* Page count & Per page selector */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-deep-green">
                            <span>
                                Showing Page <span className="font-extrabold text-deep-green text-sm">{page}</span> of <span className="font-extrabold text-deep-green text-sm">{totalPages}</span>
                                <span className="text-deep-green/60 ml-1.5 font-medium">({totalResultsCount} total programs)</span>
                            </span>
                            <div className="flex items-center gap-1.5 pl-3 border-l border-light-green/50">
                                <span className="text-deep-green/60">Per page:</span>
                                <select 
                                    value={limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                                    className="px-2 py-1 rounded-lg border border-light-green bg-white text-deep-green font-bold text-xs focus:outline-none focus:border-deep-green"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-1.5">
                            {/* Prev button */}
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1 || tableLoading}
                                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-deep-green bg-light-green/20 hover:bg-light-green/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-light-green/50 active:scale-95 cursor-pointer"
                                title="Previous Page"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                <span className="hidden sm:inline">Prev</span>
                            </button>

                            {/* Page numbers */}
                            {paginationItems.map((item, index) => {
                                if (item === '...') {
                                    return (
                                        <span key={`ellipsis-${index}`} className="px-2 text-deep-green/40 font-bold select-none text-sm">
                                            …
                                        </span>
                                    );
                                }
                                const isCurrent = item === page;
                                return (
                                    <button
                                        key={`page-${item}`}
                                        onClick={() => handlePageChange(item)}
                                        disabled={tableLoading}
                                        className={`min-w-[36px] h-[36px] flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                                            isCurrent
                                                ? 'bg-blue-600 text-white shadow-md font-black ring-2 ring-blue-400/40'
                                                : 'text-deep-green bg-white hover:bg-light-green/20 border border-light-green/50'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}

                            {/* Next button */}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages || tableLoading}
                                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-deep-green bg-light-green/20 hover:bg-light-green/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-light-green/50 active:scale-95 cursor-pointer"
                                title="Next Page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminUniversitiesList;

