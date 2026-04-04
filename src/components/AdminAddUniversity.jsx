import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';

// --- Utility Functions ---

// Get local currency
const getCurrencySymbol = (country) => {
  if (!country) return '$';
  const c = country.toLowerCase();
  // Europe & UK
  if (c.includes('united kingdom') || c.includes('uk')) return '£';
  if (c.includes('europe') || c.includes('ireland') || c.includes('germany') || c.includes('france') || c.includes('italy') || c.includes('netherlands')) return '€';
  // Asia
  if (c.includes('india')) return '₹';
  if (c.includes('japan')) return '¥';
  if (c.includes('singapore')) return 'S$';
  // Oceania & Americas
  if (c.includes('australia')) return 'A$';
  if (c.includes('canada')) return 'C$';
  if (c.includes('new zealand')) return 'NZ$';
  
  // Default (USA, etc.)
  return '$';
};

// Generate intake options for 2 years from current date
const generateIntakeOptions = () => {
  const intakes = [];
  const currentDate = new Date();
  const startMonth = currentDate.getMonth(); // 0-11
  const startYear = currentDate.getFullYear();

  // Generate intakes for 24 months (2 years) from now
  for (let i = 0; i < 24; i++) {
    const month = (startMonth + i) % 12;
    const year = startYear + Math.floor((startMonth + i) / 12);

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
    intakes.push(`${monthName} ${year}`);
  }

  return intakes;
};

// --- Reusable Styled Components ---

const StyledInput = ({ label, type = "text", placeholder, className, ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-xs font-bold text-deep-green/80 ml-1 uppercase tracking-wide">{label}</label>}
    <input
      type={type}
      className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green placeholder:text-deep-green/30 focus:outline-none focus:border-deep-green focus:ring-0 transition-colors text-sm font-medium"
      placeholder={placeholder}
      {...props}
    />
  </div>
);

const StyledSelect = ({ label, options, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-xs font-bold text-deep-green/80 ml-1 uppercase tracking-wide">{label}</label>}
    <div className="relative">
      <select
        className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-black focus:outline-none focus:border-deep-green focus:ring-0 transition-colors text-sm font-medium appearance-none cursor-pointer pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f4c3a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1.2em'
        }}
        {...props}
      >
        {options.map((opt, i) => {
          if (typeof opt === 'object' && opt !== null) {
            return <option key={i} value={opt.value} className="text-black">{opt.label}</option>;
          }
          return <option key={i} value={opt} className="text-black">{opt}</option>;
        })}
      </select>
    </div>
  </div>
);

// --- Main Admin Component ---

const AdminAddUniversity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // Institution Reference (Normalized)
    institutionId: "",
    // Fallbacks (Legacy flat fields, useful for inline creation)
    name: "",
    country: "",
    city: "",
    ranking: "",
    website: "",
    logo: "",
    mapLocation: "",

    // Admission Rules
    minCgpa: "",
    maxBacklogs: "",
    gapAccepted: "No",
    gapLimit: "",

    // English Requirements (Array of objects)
    englishRequirements: [],
    acceptsMOI: "No",

    // Course Details
    courseName: "",
    courseLink: "",
    courseLevel: "Master's Degree",
    fieldOfStudy: "",
    duration: "",
    tuitionFee: "",
    intakes: [],

    // Additional
    casPriority: "Medium",
    internalProcessing: "No",
    appFee: "Free Waiver",
    successChance: "High",

    tags: [] // Kept for flexible extra tags
  });

  const [tagInput, setTagInput] = useState("");
  const [intakeInput, setIntakeInput] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showNewCountryInput, setShowNewCountryInput] = useState(false);

  // Global Entities
  const [destinations, setDestinations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [showNewInstitutionInput, setShowNewInstitutionInput] = useState(false);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [destRes, instRes] = await Promise.all([
            axios.get('/api/destinations'),
            axios.get('/api/institutions')
        ]);
        if (destRes.data) setDestinations(destRes.data);
        if (instRes.data) setInstitutions(instRes.data);
      } catch (err) {
        console.error("Failed to fetch global lists:", err);
      }
    };
    fetchGlobalData();
  }, []);

  // CSV Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- SECURITY CHECK: Redirect if not Admin ---
  useEffect(() => {
    const checkAdminStatus = () => {
      const userString = localStorage.getItem('user');

      if (!userString) {
        // No user logged in
        alert("Please login as an Admin to access this page.");
        navigate('/login'); // Or '/' depending on your route
        return;
      }

      const user = JSON.parse(userString);

      // Check for token and 'admin' role
      if (!user.token || user.role !== 'admin') {
        alert("Access Denied: You do not have permission to view this page.");
        navigate('/'); // Redirect to landing page
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // --- Fetch Existing Data for Edit Mode ---
  useEffect(() => {
    if (isEditMode) {
      const fetchUniversity = async () => {
        try {
          const { data } = await axios.get(`/api/universities/${id}`);
          setFormData({
            ...data,
            // Normalize populated fields so `<select>` works with raw string IDs
            institutionId: data.institutionId?._id || data.institutionId || "",
            country: data.institutionId?.destinationId?.name || data.country || "",
            // Ensure fields are not undefined to prevent controlled/uncontrolled warnings
            tags: data.tags || [],
            intakes: data.intakes || [],
            englishRequirements: data.englishRequirements || [],
            appFee: data.appFee || 'Free Waiver',
            successChance: data.successChance || 'High'
          });
          
          // Use a default list to check against if destinations state hasn't populated yet,
          // though typically data.country will just be shown as custom if it's not in the dropdown.
          // Wait to check until destinations are actually mapped in the effect below? 
          // We can just rely on the component checking it. For simplicity we check fetched list.
        } catch (err) {
          console.error("Failed to fetch university details:", err);
          alert("Could not load university data for editing.");
          navigate('/admin/universities');
        }
      };
      fetchUniversity();
    }
  }, [id, isEditMode, navigate]);
  // Edit Mode Pre-population handler
  useEffect(() => {
    if (isEditMode && formData.country && destinations.length > 0) {
      if (!destinations.some(d => d.name === formData.country)) {
        setShowNewCountryInput(true);
      }
    }
  }, [formData.country, destinations, isEditMode]);
  // ------------------------------------------------

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const logoData = new FormData();
    logoData.append('logo', file);

    try {
      setUploadingLogo(true);
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.post('/api/universities/upload-logo', logoData, config);
      setFormData(prev => ({ ...prev, logo: data.url }));
    } catch (err) {
      console.error(err);
      alert("Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleEnglishRequirementToggle = (testName) => {
    setFormData(prev => {
      const exists = prev.englishRequirements.some(req => req.testName === testName);
      if (exists) {
        return {
          ...prev,
          englishRequirements: prev.englishRequirements.filter(req => req.testName !== testName)
        };
      } else {
        return {
          ...prev,
          englishRequirements: [...prev.englishRequirements, { testName, minOverall: "", minSection: "" }]
        };
      }
    });
  };

  const handleEnglishScoreChange = (testName, field, value) => {
    setFormData(prev => ({
      ...prev,
      englishRequirements: prev.englishRequirements.map(req =>
        req.testName === testName ? { ...req, [field]: value } : req
      )
    }));
  };

  const addIntake = (e) => {
    e.preventDefault();
    if (intakeInput && !formData.intakes.includes(intakeInput)) {
      setFormData(prev => ({ ...prev, intakes: [...prev.intakes, intakeInput] }));
      setIntakeInput("");
    }
  };

  const removeIntake = (intakeToRemove) => {
    setFormData(prev => ({ ...prev, intakes: prev.intakes.filter(intake => intake !== intakeToRemove) }));
  };

  const resetForm = () => {
    setFormData({
      name: "", country: "", city: "", ranking: "", website: "", logo: "",
      minCgpa: "", maxBacklogs: "",
      gapAccepted: "No", gapLimit: "", englishRequirements: [], acceptsMOI: "No",
      courseName: "", courseLink: "", courseLevel: "Master's Degree", fieldOfStudy: "", duration: "", tuitionFee: "", intakes: [],
      casPriority: "Medium", internalProcessing: "No", appFee: "Free Waiver", successChance: "High", tags: []
    });
    setTagInput("");
    setIntakeInput("");
  };

  const processCSVData = async (csvText) => {
    try {
      // Basic CSV Parser handling commas inside quotes
      const parseCSV = (text) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];

          if (char === '"' && insideQuotes && nextChar === '"') {
            currentCell += '"'; // unescape quote
            i++; 
          } else if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
            if (char === '\r') i++; // Skip \n
          } else {
            currentCell += char;
          }
        }
        if (currentRow.length > 0 || currentCell) {
          currentRow.push(currentCell.trim());
          rows.push(currentRow);
        }
        return rows;
      };

      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        alert('CSV file is empty or missing data rows.');
        return;
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const dataRows = rows.slice(1).filter(r => r.some(cell => cell.trim() !== ''));

      let successCount = 0;
      let failCount = 0;

      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      for (const row of dataRows) {
        try {
          const getValue = (headerName) => {
            const idx = headers.findIndex((h) => h === headerName.toLowerCase());
            return idx !== -1 && row[idx] ? row[idx] : '';
          };

          const englishRequirements = [];
          const addEnglishReq = (testName, overallHeader, sectionHeader) => {
             const overall = getValue(overallHeader);
             const section = getValue(sectionHeader);
             if (overall || section) {
               englishRequirements.push({
                 testName,
                 minOverall: overall ? parseFloat(overall) : '',
                 minSection: section ? parseFloat(section) : ''
               });
             }
          };
          addEnglishReq('IELTS', 'ielts_overall', 'ielts_section');
          addEnglishReq('TOEFL', 'toefl_overall', 'toefl_section');
          addEnglishReq('PTE', 'pte_overall', 'pte_section');
          addEnglishReq('DET', 'det_overall', 'det_section');

          const parseArrayField = (fieldValue) => {
             if (!fieldValue) return [];
             return fieldValue.split(',').map(v => v.trim()).filter(Boolean);
          };

          const payload = {
            name: getValue('name'),
            country: getValue('country'),
            city: getValue('city'),
            ranking: getValue('ranking'),
            website: getValue('website'),
            logo: getValue('logo'),
            courseName: getValue('courseName'),
            courseLink: getValue('courseLink'),
            courseLevel: getValue('courseLevel'),
            fieldOfStudy: getValue('fieldOfStudy'),
            duration: getValue('duration'),
            tuitionFee: getValue('tuitionFee'),
            intakes: parseArrayField(getValue('intakes')),
            minCgpa: getValue('minCgpa'),
            maxBacklogs: getValue('maxBacklogs') ? parseInt(getValue('maxBacklogs')) : '',
            gapAccepted: getValue('gapAccepted') || 'No',
            gapLimit: getValue('gapLimit') ? parseInt(getValue('gapLimit')) : '',
            englishRequirements,
            acceptsMOI: getValue('acceptsMOI') || 'No',
            casPriority: getValue('casPriority') || 'Medium',
            internalProcessing: getValue('internalProcessing') || 'No',
            appFee: getValue('appFee') || 'Free Waiver',
            successChance: getValue('successChance') || 'High',
            tags: parseArrayField(getValue('tags'))
          };

          await axios.post('/api/universities', payload, config);
          successCount++;
        } catch (err) {
          console.error('Failed to add university from row:', row, err.response?.data?.message || err.message);
          failCount++;
        }
      }

      alert(`CSV Upload Complete!\nSuccessfully added: ${successCount}\nFailed: ${failCount}`);
    } catch (err) {
      console.error('Error processing CSV:', err);
      alert('Error extracting data from CSV file. Please check the format.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null; // Reset file input
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      processCSVData(event.target.result);
    };
    reader.onerror = () => {
      alert('Failed to read the file.');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the logged-in user from storage
    const user = JSON.parse(localStorage.getItem('user'));

    // Redundant check (safe practice)
    if (!user || !user.token || user.role !== 'admin') {
      alert("You must be logged in as Admin to do this.");
      return;
    }

    // --- English Requirements Validation ---
    for (const req of formData.englishRequirements) {
      const overall = parseFloat(req.minOverall);
      const section = parseFloat(req.minSection);

      const validateScore = (score, max, test) => {
        if (isNaN(score) || score < 0 || score > max) {
          throw new Error(`Invalid score for ${test}. Must be between 0 and ${max}.`);
        }
      };

      try {
        if (req.testName === 'IELTS') { validateScore(overall, 9.0, 'IELTS Overall'); validateScore(section, 9.0, 'IELTS Section'); }
        if (req.testName === 'TOEFL') { validateScore(overall, 120, 'TOEFL Overall'); validateScore(section, 120, 'TOEFL Section'); }
        if (req.testName === 'PTE') { validateScore(overall, 90, 'PTE Overall'); validateScore(section, 90, 'PTE Section'); }
        if (req.testName === 'DET') { validateScore(overall, 160, 'DET Overall'); validateScore(section, 160, 'DET Section'); }
      } catch (err) {
        alert(err.message);
        return; // Stop submission
      }
    }
    // ----------------------------------------

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Send token in header
        },
      };

      let destinationIdToUse = null;

      // Add Destination if Custom
      if (showNewCountryInput && formData.country.trim()) {
        try {
          const destRes = await axios.post('/api/destinations', { name: formData.country.trim() }, config);
          destinationIdToUse = destRes.data._id;
          setDestinations(prev => [...new Set([...prev, destRes.data])]);
        } catch (err) {
          console.error("Could not append destination to database (may already exist):", err);
          // Fallback to finding it if it already existed
          destinationIdToUse = destinations.find(d => d.name === formData.country.trim())?._id;
        }
      } else {
        destinationIdToUse = destinations.find(d => d.name === formData.country)?._id;
      }

      let institutionIdToUse = formData.institutionId;

      // Add Institution if Custom
      if (showNewInstitutionInput && formData.name.trim() && destinationIdToUse) {
        try {
          const instRes = await axios.post('/api/institutions', {
             name: formData.name.trim(),
             destinationId: destinationIdToUse,
             city: formData.city,
             ranking: formData.ranking,
             website: formData.website,
             logo: formData.logo,
             mapLocation: formData.mapLocation
          }, config);
          institutionIdToUse = instRes.data._id;
          setInstitutions(prev => [...prev, instRes.data]);
        } catch (err) {
          console.error("Could not append institution:", err);
          throw new Error("Institution creation failed.");
        }
      }

      const finalPayload = {
         ...formData,
         institutionId: institutionIdToUse
      };

      if (isEditMode) {
        // Edit mode: PUT to specific ID
        const response = await axios.put(`/api/universities/${id}`, finalPayload, config);
        console.log("Updated Response:", response.data);
        alert("University Updated Successfully!");
        navigate('/admin/universities'); // Redirect to list after edit
      } else {
        // Add mode: POST to root
        const response = await axios.post('/api/universities', finalPayload, config);
        console.log("Response:", response.data);
        alert("University Added Successfully!");
        resetForm();
        setIntakeInput("");
      }
    } catch (error) {
      console.error("Error details:", error);
      console.error("Error response:", error.response);
      alert(error.response?.data?.message || error.message || "Failed to add university");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-deep-green overflow-hidden font-display">

      {/* LEFT: Entry Form Area */}
      <div className="w-full lg:w-3/5 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">

          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 w-fit mb-4">
                <span className="material-symbols-outlined text-[18px] text-white">admin_panel_settings</span>
                <span className="text-xs font-bold uppercase tracking-wide text-white">Admin Portal</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {isEditMode ? 'Edit Program' : 'Post New Program'}
              </h1>
              <p className="text-white/60 text-sm font-bold mt-1">
                {isEditMode ? 'Update the details for this program.' : 'Fill in the details below to add a new program to the system.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex gap-3">
            <Link to="/admin/universities" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
              View Universities
            </Link>
            <Link to="/admin/applications" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
              View Applications
            </Link>
            <Link to="/admin/students" className="px-5 py-2.5 rounded-xl border-2 border-deep-green/10 bg-white text-deep-green font-bold hover:bg-light-green/20 transition-all">
              View Students
            </Link>

            {/* Added CSV Upload Button */}
            {!isEditMode && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                  className={`px-5 py-2.5 rounded-xl border-2 border-primary bg-primary/20 text-deep-green font-bold transition-all flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/50'}`}
                >
                  <span className="material-symbols-outlined">{isUploading ? 'hourglass_empty' : 'upload_file'}</span>
                  {isUploading ? 'Uploading...' : 'Bulk Upload'}
                </button>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </>
            )}
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* 1. Institution Information (Normalized Flow) */}
          <section className="bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-deep-green mb-6 border-b border-light-green/30 pb-2">
              <span className="material-symbols-outlined">account_balance</span>
              Institution & Destination
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Destination Selection */}
              {showNewCountryInput ? (
                <div className="flex items-end gap-2 md:col-span-2">
                  <StyledInput
                    label="Custom Destination"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country name..."
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCountryInput(false);
                      setFormData(prev => ({ ...prev, country: "" }));
                    }}
                    className="px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green text-sm font-bold hover:bg-light-green/20 transition-colors h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <StyledSelect
                  label="Destination"
                  name="country"
                  value={formData.country || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Add New Destination...") {
                      setShowNewCountryInput(true);
                      setShowNewInstitutionInput(true); // Must add new institution if dest is new
                      setFormData(prev => ({ ...prev, country: "", institutionId: "", name: "" }));
                    } else {
                      setFormData(prev => ({ ...prev, country: val, institutionId: "" }));
                      setShowNewInstitutionInput(false);
                    }
                  }}
                  options={["", ...destinations.map(d => d.name), "Add New Destination..."]}
                  className="md:col-span-2"
                />
              )}
            </div>

            {/* Institution Selection */}
            {formData.country && !showNewInstitutionInput && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 border-t border-light-green/20 pt-4">
                <StyledSelect
                  label="Institution"
                  name="institutionId"
                  value={formData.institutionId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Add New Institution...") {
                      setShowNewInstitutionInput(true);
                      setFormData(prev => ({ ...prev, institutionId: "", name: "", city: "", ranking: "", website: "", logo: "", mapLocation: "" }));
                    } else {
                      setFormData(prev => ({ ...prev, institutionId: val, name: "" }));
                    }
                  }}
                  className="md:col-span-2"
                  options={[
                    { value: "", label: "Select an Institution..." },
                    ...institutions
                      .filter(i => {
                        const destIdOfInst = i.destinationId?._id || i.destinationId;
                        const destIdOfInput = destinations.find(d => d.name === formData.country)?._id;
                        return destIdOfInst === destIdOfInput || i.destinationId?.name === formData.country;
                      })
                      .map(i => ({ value: i._id, label: i.name })),
                    { value: "Add New Institution...", label: "+ Add New Institution..." }
                  ]}
                />
              </div>
            )}

            {/* Inline Add Institution Form */}
            {showNewInstitutionInput && formData.country && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-light-green/20 pt-4">
                <div className="md:col-span-2 flex items-center justify-between">
                   <h4 className="text-sm font-bold text-primary">Adding New Institution to {formData.country}</h4>
                   {!showNewCountryInput && (
                     <button type="button" onClick={() => setShowNewInstitutionInput(false)} className="text-xs font-bold text-red-500 hover:text-red-700">Cancel</button>
                   )}
                </div>
                <StyledInput label="Institution Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. University of Westminster" className="md:col-span-2" />
                <StyledInput label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. London" />
                <StyledInput label="Global Ranking (Optional)" name="ranking" value={formData.ranking} onChange={handleChange} type="number" placeholder="e.g. 102" />
                <StyledInput label="Website URL" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                <StyledInput label="Map Location (Google Embed URL)" name="mapLocation" value={formData.mapLocation || ""} onChange={handleChange} placeholder="https://www.google.com/maps/embed?..." />
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-deep-green/80 uppercase tracking-wide mb-2">Institution Logo</label>
                  <div className="flex items-center gap-3">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 appearance-none outline-none border-2 border-deep-green/10 rounded-xl px-2 py-1 w-full bg-white transition-colors" disabled={uploadingLogo} />
                    {uploadingLogo && <span className="text-xs text-primary font-bold animate-pulse whitespace-nowrap bg-primary/10 px-3 py-2 rounded-xl">Uploading...</span>}
                    {formData.logo && !uploadingLogo && <img src={formData.logo} alt="Logo" className="h-12 w-12 object-contain rounded-xl border-2 border-deep-green/10 bg-white shadow-sm" />}
                  </div>
                </div>
              </div>
            )}
            
            {/* Legacy Warning / Info */}
            {isEditMode && !formData.institutionId && formData.name && !showNewInstitutionInput && (
              <div className="md:col-span-2 mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-xs font-bold text-deep-green">Legacy Program detected: {formData.name}</p>
                <p className="text-[10px] text-deep-green/60">Select an Institution above to migrate this program to the new structure.</p>
              </div>
            )}
          </section>

          {/* 2. Course Details */}
          <section className="bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-deep-green mb-6 border-b border-light-green/30 pb-2">
              <span className="material-symbols-outlined">school</span>
              Course Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <StyledInput label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} placeholder="e.g. MSc Data Science" className="md:col-span-2" />
              </div>
              <div className="md:col-span-2">
                <StyledInput label="Course Link" name="courseLink" value={formData.courseLink} onChange={handleChange} placeholder="e.g. https://university.edu/course-page" className="md:col-span-2" />
              </div>

              <StyledSelect
                label="Program Level"
                name="courseLevel"
                value={formData.courseLevel}
                onChange={handleChange}
                options={["1-Year Post-Secondary Certificate", "2-Year Undergraduate Diploma", "3-Year Undergraduate Advanced Diploma", "3-Year Bachelor's Degree", "Top-up Degree", "4-Year Bachelor's Degree", "Integrated Masters", "Postgraduate Certificate", "Postgraduate Diploma", "Master's Degree", "Doctoral / PhD", "Non-Credential", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "English as Second Language (ESL)"]}
              />

              <StyledSelect
                label="Field of Study"
                name="fieldOfStudy"
                value={formData.fieldOfStudy || ""}
                onChange={handleChange}
                options={["", "Arts", "Business, Management and Economics", "Elementary and High School", "Engineering and Technology", "English for Academic Studies", "Health Sciences, Medicine, Nursing, Paramedic and Kinesiology", "Law, Politics, Social, Community Service and Teaching", "Sciences"]}
              />

              <StyledInput label="Duration" name="duration" value={formData.duration} onChange={handleChange} type="number" placeholder="e.g. 12" />
              <StyledInput label="Tuition Fee" name="tuitionFee" value={formData.tuitionFee} onChange={handleChange} type="number" placeholder="e.g. 16000" />

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-deep-green mb-2">Intake Month/Year (Multiple)</label>
                <div className="flex gap-3 mb-4">
                  <StyledSelect
                    value={intakeInput}
                    onChange={(e) => setIntakeInput(e.target.value)}
                    options={["", ...generateIntakeOptions()]}
                    className="flex-1"
                  />
                  <button
                    onClick={addIntake}
                    type="button"
                    className="px-6 rounded-xl bg-deep-green text-white font-bold hover:bg-deep-green/90 transition-colors shadow-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-off-white/50 rounded-xl border border-light-green/30 min-h-[60px]">
                  <AnimatePresence>
                    {formData.intakes.length === 0 && <span className="text-deep-green/40 text-sm italic p-1">No intakes added yet.</span>}
                    {formData.intakes.map(intake => (
                      <motion.span
                        key={intake}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-light-green rounded-lg text-xs font-bold text-deep-green shadow-sm"
                      >
                        {intake}
                        <button type="button" onClick={() => removeIntake(intake)} className="hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Admission Rules */}
          <section className="bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-deep-green mb-6 border-b border-light-green/30 pb-2">
              <span className="material-symbols-outlined">gavel</span>
              Admission Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StyledInput label="Min Percentage / CGPA" name="minCgpa" value={formData.minCgpa} onChange={handleChange} placeholder="e.g. 60% or 6.5 CGPA" />
              <StyledInput label="Max Backlogs Allowed" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} type="number" placeholder="e.g. 10" />

              <StyledSelect label="Gap Accepted?" name="gapAccepted" value={formData.gapAccepted} onChange={handleChange} options={["No", "Yes"]} />

              <AnimatePresence>
                {formData.gapAccepted === "Yes" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <StyledInput label="Gap Limit (Years)" name="gapLimit" value={formData.gapLimit} onChange={handleChange} placeholder="e.g. 5 Years" type="number" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 4. English Requirements (Multi-Test) */}
          <section className="bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-deep-green mb-6 border-b border-light-green/30 pb-2">
              <span className="material-symbols-outlined">language</span>
              English Requirements
            </h3>

            <div className="space-y-4">
              <label className="text-xs font-bold text-deep-green/80 ml-1 uppercase tracking-wide block mb-2">Accepted Tests</label>
              <div className="flex flex-wrap gap-3 mb-6">
                {["IELTS", "PTE", "TOEFL", "DET"].map(test => {
                  const isSelected = formData.englishRequirements.some(req => req.testName === test);
                  return (
                    <label key={test} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-deep-green bg-light-green/20' : 'border-light-green/50 bg-white hover:border-light-green'}`}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-deep-green cursor-pointer hidden"
                        checked={isSelected}
                        onChange={() => handleEnglishRequirementToggle(test)}
                      />
                      <span className={`text-sm font-bold ${isSelected ? 'text-deep-green' : 'text-deep-green/60'}`}>{test}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mb-6 w-full md:w-1/2">
                <StyledSelect label="Accepts MOI Certificate?" name="acceptsMOI" value={formData.acceptsMOI} onChange={handleChange} options={["No", "Yes"]} />
              </div>

              {/* Dynamic Inputs for Selected Tests */}
              <AnimatePresence>
                {formData.englishRequirements.length > 0 && (
                  <div className="space-y-4">
                    {formData.englishRequirements.map((req) => (
                      <motion.div
                        key={req.testName}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-off-white/50 rounded-xl border border-light-green/30"
                      >
                        <div className="flex items-center">
                          <span className="text-base font-extrabold text-deep-green">{req.testName} Scores</span>
                        </div>

                        <StyledInput
                          label={`Min Overall Score (Max ${req.testName === 'IELTS' ? '9.0' : req.testName === 'TOEFL' ? '120' : req.testName === 'PTE' ? '90' : req.testName === 'DET' ? '160' : '100%'})`}
                          type="number"
                          step={req.testName === 'IELTS' ? '0.5' : '1'}
                          value={req.minOverall}
                          placeholder={`e.g. ${req.testName === 'IELTS' ? '6.5' : req.testName === 'TOEFL' ? '90' : req.testName === 'PTE' ? '60' : '110'}`}
                          onChange={(e) => handleEnglishScoreChange(req.testName, 'minOverall', e.target.value)}
                        />
                        <StyledInput
                          label={`Min Section Score`}
                          type="number"
                          step={req.testName === 'IELTS' ? '0.5' : '1'}
                          value={req.minSection}
                          placeholder={`e.g. ${req.testName === 'IELTS' ? '6.0' : req.testName === 'TOEFL' ? '20' : req.testName === 'PTE' ? '55' : '100'}`}
                          onChange={(e) => handleEnglishScoreChange(req.testName, 'minSection', e.target.value)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 5. Additional Info & Tags */}
          <section className="bg-white p-6 rounded-2xl border-2 border-light-green/50 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-deep-green mb-6 border-b border-light-green/30 pb-2">
              <span className="material-symbols-outlined">settings_suggest</span>
              Additional Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <StyledSelect label="CAS Priority" name="casPriority" value={formData.casPriority} onChange={handleChange} options={["High", "Medium", "Low"]} />
              <StyledSelect label="Internal Processing?" name="internalProcessing" value={formData.internalProcessing} onChange={handleChange} options={["Yes", "No"]} />
              <StyledInput label="Application Fee" name="appFee" value={formData.appFee || ''} onChange={handleChange} placeholder="e.g. Free Waiver, £50, etc." />
              <StyledSelect label="Success Chance" name="successChance" value={formData.successChance || 'High'} onChange={handleChange} options={["Very High", "High", "Medium", "Low", "Waitlisted"]} />
              <StyledSelect
                label="Program Tag"
                name="tags"
                value={formData.tags?.[0] || ""}
                onChange={(e) => {
                  if (e.target.value && !formData.tags.includes(e.target.value)) {
                    setFormData(prev => ({ ...prev, tags: [...prev.tags, e.target.value] }));
                  }
                }}
                options={["", "Fast Acceptance", "High Job Demand", "Incentivized", "Instant Offer", "Instant Submission", "Loan Available", "New Program", "No UK Interview", "Popular", "Prime", "Scholarships Available", "Top"]}
              />
            </div>

            {/* Tag System */}
            <div className="flex gap-3 mb-4">
              <StyledInput
                placeholder="Add custom tag (e.g. PGWP Eligible)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
              />
              <button
                onClick={addTag}
                type="button" // Prevent form submission
                className="px-6 rounded-xl bg-deep-green text-white font-bold hover:bg-deep-green/90 transition-colors shadow-lg"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-4 bg-off-white/50 rounded-xl border border-light-green/30 min-h-[60px]">
              <AnimatePresence>
                {formData.tags.length === 0 && <span className="text-deep-green/40 text-sm italic p-1">No custom tags added.</span>}
                {formData.tags.map(tag => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-light-green rounded-lg text-xs font-bold text-deep-green shadow-sm"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Sticky Actions Footer */}
          <div className="sticky bottom-0 bg-off-white/95 backdrop-blur-sm py-4 border-t border-deep-green/10 flex items-center gap-4 z-20">
            <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-deep-green text-lg font-extrabold border-2 border-deep-green shadow-[4px_4px_0px_0px_rgba(52,121,40,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(52,121,40,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">save</span>
              {isEditMode ? 'Save Changes' : 'Save Program'}
            </button>
            {!isEditMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 rounded-xl border-2 border-deep-green text-deep-green font-bold hover:bg-light-green/20 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

        </form>
      </div>

      {/* RIGHT: Live Preview Panel */}
      <div className="hidden lg:flex w-2/5 bg-deep-green/5 border-l border-deep-green/10 flex-col items-center justify-center p-10 relative">
        <div className="absolute top-8 left-8">
          <span className="text-xs font-bold uppercase tracking-wide text-deep-green/40">Live Preview Card</span>
        </div>

        {/* Live Card Preview */}
        <motion.div
          layout
          className="w-full max-w-sm bg-white rounded-2xl border-2 border-light-green p-6 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-light-green/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="size-16 rounded-2xl bg-off-white border border-deep-green/10 flex items-center justify-center shadow-inner text-deep-green">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <span className="bg-light-green/30 text-deep-green text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-light-green/50">
              {formData.courseLevel.split(' ')[0]}
            </span>
          </div>

          <div className="mb-6 relative z-10">
            <h3 className="text-xl font-extrabold text-deep-green leading-tight mb-1">
              {formData.courseName || "Course Name"}
            </h3>
            <p className="text-sm font-bold text-deep-green/80 mb-2">
              {formData.name || "University Name"}
            </p>
            <div className="flex items-center gap-1.5 text-deep-green/60 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {formData.city ? `${formData.city}, ${formData.country}` : "City, Country"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-off-white/50 border border-deep-green/5 relative z-10">
            <div className="col-span-2">
              <p className="text-[10px] text-deep-green/40 font-black uppercase tracking-wider mb-1">English Requirements</p>
              <div className="flex flex-wrap gap-2 text-sm items-center">
                {formData.englishRequirements.length > 0 ? (
                  formData.englishRequirements.map(req => (
                    <span key={req.testName} className="font-bold text-deep-green bg-white px-2 py-0.5 rounded border border-deep-green/10 shadow-sm">
                      {req.testName}: {req.minOverall}
                    </span>
                  ))
                ) : (
                  <span className="text-deep-green/50 italic text-xs">No test reqs</span>
                )}
                {formData.acceptsMOI === "Yes" && (
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    MOI Accepted
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-deep-green/40 font-black uppercase tracking-wider mb-1 mt-2">Tuition</p>
              <p className="text-deep-green font-bold text-sm">{formData.tuitionFee ? `${getCurrencySymbol(formData.country)}${Number(formData.tuitionFee).toLocaleString('en-IN')}` : "$0"}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-deep-green/10 mt-1">
              <p className="text-[10px] text-deep-green/40 font-black uppercase tracking-wider mb-1">Intakes</p>
              <p className="text-deep-green font-bold text-xs">{formData.intakes.length > 0 ? formData.intakes.join(', ') : "N/A"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 relative z-10 min-h-[24px]">
            {/* Auto-generated tags based on inputs */}
            {formData.ranking && <span className="text-[10px] font-bold px-2.5 py-1 bg-white border border-deep-green/10 rounded-md text-deep-green/70">{formData.ranking}</span>}
            {formData.gapAccepted === "Yes" && <span className="text-[10px] font-bold px-2.5 py-1 bg-white border border-deep-green/10 rounded-md text-deep-green/70">Gap Accepted</span>}
            {/* Custom Tags */}
            {formData.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2.5 py-1 bg-white border border-deep-green/10 rounded-md text-deep-green/70">{tag}</span>
            ))}
          </div>

          <button className="mt-auto w-full py-3.5 rounded-xl border-2 border-deep-green/10 text-deep-green font-bold bg-gray-50 flex items-center justify-center gap-2 relative z-10 cursor-not-allowed opacity-70">
            View Details
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </motion.div>
      </div>
    </div >
  );
};

export default AdminAddUniversity;