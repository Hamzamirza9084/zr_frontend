import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- Utility Functions ---

// Get local currency
export const getCurrencySymbol = (country) => {
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

const PROGRAM_LEVELS = [
  "1-Year Post-Secondary Certificate", "2-Year Undergraduate Diploma",
  "3-Year Undergraduate Advanced Diploma", "3-Year Bachelor's Degree",
  "Top-up Degree", "4-Year Bachelor's Degree", "Integrated Masters",
  "Postgraduate Certificate", "Postgraduate Diploma", "Master's Degree",
  "Doctoral / PhD", "Non-Credential", "Grade 1", "Grade 2", "Grade 3",
  "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9",
  "Grade 10", "Grade 11", "Grade 12", "English as Second Language (ESL)"
];

const FIELD_OF_STUDIES = [
  "Arts", "Business, Management and Economics", "Elementary and High School",
  "Engineering and Technology", "English for Academic Studies",
  "Health Sciences, Medicine, Nursing, Paramedic and Kinesiology",
  "Law, Politics, Social, Community Service and Teaching", "Sciences"
];

// --- COMPONENTS ---

const StyledInput = ({ label, type = "text", placeholder, className, value, onChange, name, ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-xs font-bold text-deep-green/80 ml-1 uppercase tracking-wide">{label}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green placeholder:text-deep-green/30 focus:outline-none focus:border-deep-green focus:ring-0 transition-colors text-sm font-medium"
      placeholder={placeholder}
      {...props}
    />
  </div>
);

const StyledSelect = ({ label, options, value, onChange, name, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-bold text-deep-green/80 ml-1 uppercase tracking-wide">{label}</label>}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green focus:outline-none focus:border-deep-green focus:ring-0 transition-colors text-sm font-medium appearance-none cursor-pointer"
        {...props}
      >
        {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-deep-green pointer-events-none text-[20px]">
        expand_more
      </span>
    </div>
  </div>
);

const FilterSection = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-2 border-light-green/50 rounded-2xl bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-light-green/20 transition-colors"
      >
        <div className="flex items-center gap-3 text-deep-green">
          <div className="size-8 rounded-lg bg-light-green/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <span className="text-sm font-bold">{title}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="material-symbols-outlined text-deep-green/60"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 pt-0 space-y-4 border-t border-light-green/30 mt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Extracted Filter Content to reuse in Mobile Drawer and Desktop Sidebar
const FilterContent = ({ formData, handleChange, setFormData, handleEvaluate, institutions = [], destinations = [], cities = [], programLevels = [], fieldOfStudies = [] }) => {
  return (
    <div className="space-y-4">
      {/* 6. Program Filters */}
      <FilterSection title="Program Filters" icon="school" defaultOpen={true}>
        <div className="space-y-4">

          {/* Dropdowns Group 1 */}
          <div className="grid grid-cols-2 gap-3">
            <StyledSelect label="Destination" name="destination" value={formData.destination} onChange={handleChange} options={["All Destinations", ...destinations]} />
            <StyledSelect label="Institution" name="institution" value={formData.institution || ""} onChange={handleChange} options={["", ...institutions]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StyledSelect label="City" name="city" value={formData.city || ""} onChange={handleChange} options={["", ...cities]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StyledSelect label="Program Level" name="programLevel" value={formData.programLevel || ""} onChange={handleChange} options={["", ...programLevels]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StyledSelect label="Field of Study" name="fieldOfStudy" value={formData.fieldOfStudy || ""} onChange={handleChange} options={["", ...fieldOfStudies]} />
          </div>

          <div>
            <label className="text-xs font-bold text-deep-green/80 uppercase tracking-wide block mb-3">Fees (1st year)</label>
            <div className="flex gap-3 items-center">
              <input type="number" value={formData.tuitionMin || 0} onChange={(e) => setFormData(p => ({ ...p, tuitionMin: +e.target.value }))} className="w-20 px-1 py-1 text-center border-2 border-light-green rounded-lg text-sm font-bold text-deep-green focus:outline-none focus:border-deep-green" />
              <div className="flex-1 relative h-2 bg-light-green/30 rounded-full">
                <input type="range" min="0" max="100000" value={formData.tuitionMin || 0} onChange={(e) => setFormData(p => ({ ...p, tuitionMin: +e.target.value }))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="absolute top-0 h-full bg-deep-green rounded-full" style={{ left: `${((formData.tuitionMin || 0) / 100000) * 100}%`, right: `${100 - ((formData.tuitionMax || 100000) / 100000) * 100}%` }}></div>
                <input type="range" min="0" max="100000" value={formData.tuitionMax || 100000} onChange={(e) => setFormData(p => ({ ...p, tuitionMax: +e.target.value }))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
              </div>
              <input type="number" value={formData.tuitionMax || 100000} onChange={(e) => setFormData(p => ({ ...p, tuitionMax: +e.target.value }))} className="w-20 px-1 py-1 text-center border-2 border-light-green rounded-lg text-sm font-bold text-deep-green focus:outline-none focus:border-deep-green" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-deep-green/80 uppercase tracking-wide block mb-3">Intakes</label>
            <div className="flex gap-2 mb-3">
              <select value={formData._intakeInput || ""} onChange={(e) => setFormData(p => ({ ...p, _intakeInput: e.target.value }))} className="flex-1 px-3 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green focus:outline-none focus:border-deep-green text-sm font-medium">
                <option value="">Select intake...</option>
                {generateIntakeOptions().map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
              <button onClick={(e) => {
                e.preventDefault();
                if (formData._intakeInput && !formData.intakes.includes(formData._intakeInput)) {
                  setFormData(p => ({ ...p, intakes: [...p.intakes, p._intakeInput], _intakeInput: "" }));
                }
              }} className="px-4 py-2.5 bg-deep-green text-white font-bold rounded-xl hover:bg-deep-green/80 transition-colors text-sm">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-off-white/50 rounded-xl border border-light-green/30 min-h-[50px]">
              {formData.intakes.length === 0 && <span className="text-deep-green/40 text-xs italic p-1">No intakes selected yet.</span>}
              {formData.intakes.map(intake => (
                <motion.span key={intake} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-light-green rounded-lg text-xs font-bold text-deep-green shadow-sm">
                  {intake}
                  <button type="button" onClick={() => setFormData(p => ({ ...p, intakes: p.intakes.filter(i => i !== intake) }))} className="hover:text-red-500 transition-colors ml-1">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <StyledSelect label="Intake Status" name="intakeStatus" value={formData.intakeStatus || ""} onChange={handleChange} options={["", "Open", "Closed"]} />
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1.5"><label className="text-xs font-bold text-deep-green/80 uppercase tracking-wide">Program Tag</label><span className="material-symbols-outlined text-[16px] text-deep-green/60" title="Tag">info</span></div>
            <select name="programTag" value={formData.programTag || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-light-green bg-white text-deep-green text-sm font-medium focus:outline-none focus:border-deep-green">
              <option value="">Select Tag</option>
              {["Fast Acceptance", "High Job Demand", "Incentivized", "Instant Offer", "Instant Submission", "Loan Available", "New Program", "No UK Interview", "Popular", "Prime", "Scholarships Available", "Top"].map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-6 pt-4 border-t border-light-green/30">
            {/* Duration */}
            <div>
              <label className="text-xs font-bold text-deep-green/80 uppercase tracking-wide block mb-3">Program Duration (months)</label>
              <div className="flex gap-3 items-center">
                <input type="number" value={formData.programDurationMin || 1} onChange={(e) => setFormData(p => ({ ...p, programDurationMin: +e.target.value }))} className="w-14 px-1 py-1 text-center border-2 border-light-green rounded-lg text-sm font-bold text-deep-green focus:outline-none focus:border-deep-green" />
                <div className="flex-1 relative h-2 bg-light-green/30 rounded-full">
                  <input type="range" min="1" max="96" value={formData.programDurationMin || 1} onChange={(e) => setFormData(p => ({ ...p, programDurationMin: +e.target.value }))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="absolute top-0 h-full bg-deep-green rounded-full" style={{ left: `${((formData.programDurationMin || 1) / 96) * 100}%`, right: `${100 - ((formData.programDurationMax || 96) / 96) * 100}%` }}></div>
                  <input type="range" min="1" max="96" value={formData.programDurationMax || 96} onChange={(e) => setFormData(p => ({ ...p, programDurationMax: +e.target.value }))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                </div>
                <input type="number" value={formData.programDurationMax || 96} onChange={(e) => setFormData(p => ({ ...p, programDurationMax: +e.target.value }))} className="w-14 px-1 py-1 text-center border-2 border-light-green rounded-lg text-sm font-bold text-deep-green focus:outline-none focus:border-deep-green" />
              </div>
            </div>

            {/* Study Gap */}
            <div>
              <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-deep-green/80 uppercase tracking-wide">Study Gap (years)</label><span className="text-xs font-bold text-deep-green bg-light-green/30 px-2 py-0.5 rounded">{formData.studyGap || 0}</span></div>
              <input type="range" min="0" max="10" step="0.5" value={formData.studyGap || 0} onChange={(e) => setFormData(p => ({ ...p, studyGap: +e.target.value }))} className="w-full h-2 bg-light-green/30 rounded-lg appearance-none cursor-pointer accent-deep-green" />
            </div>

            {/* Backlog */}
            <div>
              <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-deep-green/80 uppercase tracking-wide">Backlogs</label><span className="text-xs font-bold text-deep-green bg-light-green/30 px-2 py-0.5 rounded">{formData.backlog || 0}</span></div>
              <input type="range" min="0" max="20" step="1" value={formData.backlog || 0} onChange={(e) => setFormData(p => ({ ...p, backlog: +e.target.value }))} className="w-full h-2 bg-light-green/30 rounded-lg appearance-none cursor-pointer accent-deep-green" />
            </div>
          </div>

        </div>
      </FilterSection>

      {/* 7. English Requirements */}
      <FilterSection title="English Requirements" icon="language" defaultOpen={true}>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group mb-2">
            <span className="text-xs font-bold text-deep-green/80 uppercase tracking-wide group-hover:text-deep-green transition-colors">Has MOI Certificate?</span>
            <div className="relative inline-block w-10 overflow-hidden h-5 rounded-full bg-light-green/30 target">
              <input type="checkbox" name="hasMOI" checked={formData.hasMOI || false} onChange={(e) => setFormData(p => ({ ...p, hasMOI: e.target.checked }))} className="peer absolute w-full h-full opacity-0 z-10 cursor-pointer" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 peer-checked:bg-deep-green shadow-sm"></div>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group mb-2 border-t border-light-green/30 pt-4">
            <span className="text-xs font-bold text-deep-green/80 uppercase tracking-wide group-hover:text-deep-green transition-colors">Require English Test?</span>
            <div className="relative inline-block w-10 overflow-hidden h-5 rounded-full bg-light-green/30 target">
              <input type="checkbox" name="requireEnglish" checked={formData.requireEnglish || false} onChange={(e) => setFormData(p => ({ ...p, requireEnglish: e.target.checked }))} className="peer absolute w-full h-full opacity-0 z-10 cursor-pointer" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 peer-checked:bg-deep-green shadow-sm"></div>
            </div>
          </label>

          <AnimatePresence>
            {formData.requireEnglish && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-2 overflow-hidden">
                <StyledSelect label="Select Test" name="englishTest" value={formData.englishTest || "IELTS"} onChange={handleChange} options={["IELTS", "TOEFL", "PTE", "DET"]} />

                <div className="grid grid-cols-2 gap-3">
                  <StyledInput
                    label={`${formData.englishTest || "IELTS"} Overall`}
                    name="scoreOA"
                    type="number"
                    step={formData.englishTest === "IELTS" ? "0.5" : "1"}
                    value={formData.scoreOA || ""}
                    onChange={handleChange}
                    placeholder={`e.g. ${formData.englishTest === 'IELTS' ? '6.5' : formData.englishTest === 'TOEFL' ? '90' : formData.englishTest === 'PTE' ? '60' : formData.englishTest === 'DET' ? '110' : '85'}`}
                  />
                  <StyledInput
                    label={`${formData.englishTest || "IELTS"} Section`}
                    name="scoreS"
                    type="number"
                    step={formData.englishTest === "IELTS" ? "0.5" : "1"}
                    value={formData.scoreS || ""}
                    onChange={handleChange}
                    placeholder={`e.g. ${formData.englishTest === 'IELTS' ? '6.0' : formData.englishTest === 'TOEFL' ? '20' : formData.englishTest === 'PTE' ? '55' : formData.englishTest === 'DET' ? '100' : '80'}`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FilterSection>

    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

const CollegeSearch = () => {
  const navigate = useNavigate();
  const [showMobileFilters, setShowMobileFilters] = useState(false); // State for mobile drawer

  // Filter State
  const [formData, setFormData] = useState({
    nationality: "India",
    educationCountry: "India",
    qualification: "Bachelor's Degree",
    degreeName: "",
    collegeName: "",
    gradYear: "",
    cgpa: "",
    backlogs: "No",
    backlogCount: "",
    englishTest: "IELTS",
    scoreL: "",
    scoreR: "",
    scoreW: "",
    scoreS: "",
    scoreOA: "",
    testDate: "",
    workExp: "No",
    workExpYears: "",
    workExpMonths: "",
    workField: "",
    intendedCourse: "",
    fieldStream: "",
    intake: "Any Intake",
    budget: 25000,
    destination: "All Destinations",
    institution: "",
    city: "",
    programLevel: "",
    fieldOfStudy: "",
    tuitionMin: 0,
    tuitionMax: 100000,
    intakes: [],
    _intakeInput: "",
    intakeStatus: "",
    programTag: "",
    pgwp: false,
    visaCap: false,
    freeApplications: false,
    excludePathway: false,
    programDurationMin: 1,
    programDurationMax: 96,
    studyGap: 0,
    backlog: 0,
    prerequisiteMissing: "",
    educationBackgroundMissing: "",
    hasMOI: false
  });

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [savedColleges, setSavedColleges] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResultsCount, setTotalResultsCount] = useState(0);

  // Filter metadata state
  const [meta, setMeta] = useState({
    destinations: [],
    institutions: [],
    cities: [],
    courseLevels: [],
    fieldsOfStudy: []
  });

  const loaderRef = React.useRef(null);

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const { data } = await axios.get('/api/universities/meta');
        setMeta(data);
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    };
    fetchMeta();
  }, []);

  const fetchColleges = async (pageNumber = 1, append = false, currentFormData = formData, savedIds = null) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      params.append('page', pageNumber);
      params.append('limit', 30);

      // If we are loading saved colleges, pass the IDs to the API
      if (savedIds) {
        params.append('ids', savedIds.join(','));
      } else {
        // Pass standard filters
        if (currentFormData.destination && currentFormData.destination !== 'All Destinations') {
          params.append('destination', currentFormData.destination);
        }
        if (currentFormData.institution) {
          params.append('institution', currentFormData.institution);
        }
        if (currentFormData.city) {
          params.append('city', currentFormData.city);
        }
        if (currentFormData.programLevel) {
          params.append('courseLevel', currentFormData.programLevel);
        }
        if (currentFormData.fieldOfStudy) {
          params.append('fieldOfStudy', currentFormData.fieldOfStudy);
        }
        if (currentFormData.tuitionMin !== undefined) {
          params.append('tuitionMin', currentFormData.tuitionMin);
        }
        if (currentFormData.tuitionMax !== undefined) {
          params.append('tuitionMax', currentFormData.tuitionMax);
        }
        if (currentFormData.intakes && currentFormData.intakes.length > 0) {
          params.append('intakes', currentFormData.intakes.join(','));
        }
        if (currentFormData.programTag) {
          params.append('tag', currentFormData.programTag);
        }
        if (currentFormData.studyGap > 0) {
          params.append('studyGap', currentFormData.studyGap);
        }
        if (currentFormData.backlog > 0) {
          params.append('backlog', currentFormData.backlog);
        }
        if (currentFormData.programDurationMin !== undefined) {
          params.append('durationMin', currentFormData.programDurationMin);
        }
        if (currentFormData.programDurationMax !== undefined) {
          params.append('durationMax', currentFormData.programDurationMax);
        }
        if (currentFormData.requireEnglish) {
          params.append('requireEnglish', 'true');
          params.append('englishTest', currentFormData.englishTest);
          if (currentFormData.scoreOA) params.append('scoreOA', currentFormData.scoreOA);
          if (currentFormData.scoreS) params.append('scoreS', currentFormData.scoreS);
        }
        if (currentFormData.hasMOI) {
          params.append('hasMOI', 'true');
        }
      }

      const { data } = await axios.get(`/api/universities?${params.toString()}`);
      
      if (append) {
        setColleges(prev => [...prev, ...data.data]);
        setFilteredColleges(prev => [...prev, ...data.data]);
      } else {
        setColleges(data.data);
        setFilteredColleges(data.data);
      }

      setPage(data.page);
      setHasMore(data.hasMore);
      setTotalResultsCount(data.totalCount);
      setLoading(false);
      setLoadingMore(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load universities.");
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) return;
        const user = JSON.parse(userString);
        if (!user.token) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/auth/saved-colleges', config);
        setSavedColleges(data);
      } catch (err) {
        console.error("Failed to fetch saved colleges:", err);
      }
    };
    fetchSaved();
  }, []);

  // Sync colleges list when showSavedOnly or savedColleges changes
  useEffect(() => {
    if (showSavedOnly) {
      if (savedColleges.length > 0) {
        fetchColleges(1, false, formData, savedColleges);
      } else {
        setColleges([]);
        setFilteredColleges([]);
        setTotalResultsCount(0);
        setHasMore(false);
        setLoading(false);
      }
    } else {
      fetchColleges(1, false, formData);
    }
  }, [showSavedOnly, savedColleges]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore || showSavedOnly) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchColleges(page + 1, true, formData);
      }
    }, { threshold: 0.5 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, loadingMore, hasMore, page, formData, showSavedOnly]);

  const toggleSave = async (collegeId) => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        alert("Please login to save colleges.");
        return;
      }
      const user = JSON.parse(userString);
      if (!user.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Optimistic UI update
      setSavedColleges(prev => 
        prev.includes(collegeId) 
          ? prev.filter(id => id !== collegeId)
          : [...prev, collegeId]
      );
      
      const { data } = await axios.post(`/api/auth/saved-colleges/${collegeId}`, {}, config);
      setSavedColleges(data); // Sync with actual server state
    } catch (err) {
      console.error("Failed to toggle save:", err);
      alert("Error saving college.");
    }
  };

  // Auth Check
  useEffect(() => {
    const checkStudentStatus = () => {
      const userString = localStorage.getItem('user');
      if (!userString) {
        alert("Please login to access this page.");
        navigate('/login');
        return;
      }
      const user = JSON.parse(userString);
      // Allow both 'student' and 'user' roles to access
      if (!user.token || (user.role !== 'student' && user.role !== 'user')) {
        alert("Access Denied: You must be logged in as a Student to view this page.");
        navigate('/');
      }
    };
    checkStudentStatus();
  }, [navigate]);

  // Pre-fill from Profile
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        console.log("Loaded Profile for Search:", user); // Debug log

        setFormData(prev => {
          const newData = { ...prev };

          // Safer mapping with optional chaining
          if (user.personalInfo?.citizenship) newData.nationality = user.personalInfo.citizenship;
          if (user.education && user.education.length > 0) {
            const edu = user.education[0]; // Assuming most recent is first
            if (edu.country) newData.educationCountry = edu.country;
            if (edu.level) newData.qualification = edu.level;
            // Check for grade/cgpa
            if (edu.grade) newData.cgpa = edu.grade;
          }

          // Map intended destination if available in profile (e.g. from a preferences field if it existed)
          // For now, we only map explicit matches.

          return newData;
        });
      }
    } catch (e) { console.error("Error loading profile", e); }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-clear dependent filters to avoid conflicts
      if (name === 'destination') {
        newData.institution = "";
        newData.city = "";
      }
      if (name === 'institution') {
        newData.city = "";
      }

      return newData;
    });
  };

  const handleReset = () => {
    const defaultFormData = {
      nationality: "India",
      educationCountry: "India",
      qualification: "Bachelor's Degree",
      degreeName: "",
      collegeName: "",
      gradYear: "",
      cgpa: "",
      backlogs: "No",
      backlogCount: "",
      englishTest: "IELTS",
      scoreL: "",
      scoreR: "",
      scoreW: "",
      scoreS: "",
      scoreOA: "",
      testDate: "",
      workExp: "No",
      workExpYears: "",
      workExpMonths: "",
      workField: "",
      intendedCourse: "",
      fieldStream: "",
      intake: "Any Intake",
      budget: 25000,
      destination: "All Destinations",
      institution: "",
      city: "",
      programLevel: "",
      fieldOfStudy: "",
      tuitionMin: 0,
      tuitionMax: 100000,
      intakes: [],
      _intakeInput: "",
      intakeStatus: "",
      programTag: "",
      pgwp: false,
      visaCap: false,
      freeApplications: false,
      excludePathway: false,
      programDurationMin: 1,
      programDurationMax: 96,
      studyGap: 0,
      backlog: 0,
      prerequisiteMissing: "",
      educationBackgroundMissing: "",
      hasMOI: false
    };
    setFormData(defaultFormData);
    setShowSavedOnly(false);
    fetchColleges(1, false, defaultFormData);
  };

  const handleApply = async (universityId) => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        alert("Please login to apply.");
        navigate('/login');
        return;
      }
      const user = JSON.parse(userString);

      const isProfileComplete = (() => {
        if (!user.personalInfo || !user.address || !user.education || !user.testScores) return false;
        
        const p = user.personalInfo;
        // Require essentially all personal fields (middleName is often optional so we skip it)
        if (!p.firstName || !p.lastName || !p.dob || !p.firstLanguage || !p.citizenship || !p.maritalStatus || !p.gender) return false;
        if (!p.passport || !p.passport.number || !p.passport.expiryDate || !p.passport.placeOfBirth) return false;

        const a = user.address;
        // Require all address fields
        if (!a.street || !a.city || !a.state || !a.country || !a.zipCode || !a.phone) return false;

        // Require at least one fully formed education record
        if (user.education.length === 0) return false;
        const edu = user.education[0];
        if (!edu.schoolName || !edu.country || !edu.level || !edu.gradingScheme || !edu.score || !edu.language || !edu.attendedFrom || !edu.attendedTo || !edu.degreeName) return false;

        // Require English proficiency status
        if (!user.testScores.englishProficiency) return false;

        return true;
      })();

      if (!isProfileComplete) {
         navigate('/profile/update');
         return;
      }

      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      await axios.post('/api/applications', { universityId }, config);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to submit application.");
    }
  };

  const handleEvaluate = () => {
    setShowSavedOnly(false);
    fetchColleges(1, false, formData);
    setShowMobileFilters(false);
  };

  const getIcon = (uni) => {
    if (uni.name?.toLowerCase().includes('college') || uni.courseLevel?.includes('Diploma')) return 'school';
    if (uni.courseName?.toLowerCase().includes('tech')) return 'computer';
    return 'account_balance';
  };

  // Helper for consistent name normalization
  const norm = (str) => (str || '').trim();
  const normLower = (str) => norm(str).toLowerCase();

  // Derived: unique destination names
  const availableDestinations = meta.destinations.map(d => d.name).sort();

  // Derived: unique institutions filtered by selected destination
  const selectedDestObj = meta.destinations.find(d => normLower(d.name) === normLower(formData.destination));
  const selectedDestId = selectedDestObj?._id;

  const availableInstitutions = meta.institutions
    .filter(inst => !selectedDestId || inst.destinationId === selectedDestId)
    .map(inst => inst.name)
    .sort();

  // Derived: unique cities filtered by selected destination + institution
  const availableCities = meta.institutions
    .filter(inst => {
      const matchesDest = !selectedDestId || inst.destinationId === selectedDestId;
      const matchesInst = !formData.institution || normLower(inst.name).includes(normLower(formData.institution));
      return matchesDest && matchesInst;
    })
    .map(inst => inst.city)
    .filter(Boolean)
    .filter((v, i, self) => self.indexOf(v) === i) // unique
    .sort();

  const availableCourseLevels = meta.courseLevels.length > 0 ? meta.courseLevels : PROGRAM_LEVELS;
  const availableFieldsOfStudy = meta.fieldsOfStudy.length > 0 ? meta.fieldsOfStudy : FIELD_OF_STUDIES;

  return (
    <div className="flex flex-1 h-[calc(100vh-80px)] overflow-hidden bg-off-white font-display relative">

      {/* --- MOBILE DRAWER OVERLAY --- */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-deep-green/60 z-40 lg:hidden backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[350px] bg-off-white z-50 overflow-y-auto flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-5 flex justify-between items-center border-b border-deep-green/10 bg-white">
                <h2 className="text-xl font-extrabold text-deep-green">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-deep-green transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto">
                <FilterContent
                  formData={formData}
                  handleChange={handleChange}
                  setFormData={setFormData}
                  handleEvaluate={handleEvaluate}
                  destinations={availableDestinations}
                  programLevels={availableCourseLevels}
                  fieldOfStudies={availableFieldsOfStudy}
                  institutions={availableInstitutions}
                  cities={availableCities}
                />
              </div>

              <div className="p-5 border-t border-deep-green/10 bg-white sticky bottom-0">
                <button
                  onClick={handleEvaluate}
                  className="w-full h-12 bg-primary text-deep-green text-sm font-extrabold rounded-xl border border-deep-green shadow-[4px_4px_0px_0px_rgba(52,121,40,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">search_check</span>
                  Apply Filters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* ---------------------------------- */}


      {/* Sidebar - Desktop (Hidden on mobile via 'hidden lg:flex') */}
      <aside className="w-[420px] border-r border-white/10 bg-[#0f4c3a] overflow-y-auto custom-scrollbar hidden lg:flex flex-col z-10">
        <div className="p-6 pb-24 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile Match</h1>
              <p className="text-white/60 text-xs font-medium mt-1">Refine criteria to find your fit</p>
            </div>
            <button
              onClick={handleReset}
              className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined">restart_alt</span>
            </button>
          </div>

          {/* Reusing the extracted content */}
          <FilterContent
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            handleEvaluate={handleEvaluate}
            destinations={availableDestinations}
            programLevels={availableCourseLevels}
            fieldOfStudies={availableFieldsOfStudy}
            institutions={availableInstitutions}
            cities={availableCities}
          />
        </div>

        <div className="sticky bottom-0 bg-[#0f4c3a] p-6 border-t border-white/10 backdrop-blur-xl">
          <button
            onClick={handleEvaluate}
            className="w-full h-14 bg-primary text-deep-green text-base font-extrabold rounded-xl border border-deep-green shadow-[4px_4px_0px_0px_rgba(52,121,40,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(52,121,40,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">search_check</span>
            Evaluate Profile
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-[#0f4c3a] custom-scrollbar">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm w-fit mb-3">
                <span className="size-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wide text-white/90">Live Results</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">University Matches</h2>
              <p className="text-white/70 mt-2 font-medium">Found <span className="text-white font-black underline decoration-white decoration-4 underline-offset-2">{totalResultsCount}</span> programs based on your profile.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Show Saved Toggle */}
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all shadow-sm font-bold ${showSavedOnly ? 'border-pink-400 bg-pink-500/20 text-pink-200' : 'border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${showSavedOnly ? 'text-pink-400' : 'text-white/80'}`}>favorite</span>
                {showSavedOnly ? 'Showing Saved' : 'Show Saved'}
              </button>

              {/* NEW MOBILE FILTER BUTTON */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/30 bg-white/5 text-white font-bold hover:bg-white/10 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Filters
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 font-bold border border-red-400/30 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-white/70 animate-spin">refresh</span>
            </div>
          ) : (
            <>
              {/* Grid */}
              <motion.div
                key={filteredColleges.map(c => c._id).join(',') + `-saved-${showSavedOnly}`}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                {filteredColleges.map((college, idx) => (
                  <motion.div
                    key={college._id || idx}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    {/* Header Section */}
                    <div className="p-6 pb-4 flex justify-between items-start gap-4 bg-[#00674F] rounded-t-2xl">
                      <div className="flex gap-4 flex-1">
                        {/* University Icon / Logo */}
                        <div className="size-12 rounded-lg bg-white border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                          {college.institutionId?.logo || college.logo ? (
                            <img src={college.institutionId?.logo || college.logo} alt={`${college.institutionId?.name || college.name} Logo`} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="material-symbols-outlined text-[#0f4c3a] text-2xl">apartment</span>
                          )}
                        </div>
                        {/* University Info */}
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white">{college.institutionId?.name || college.name || "Unknown University"}</h4>
                          <p className="text-xs text-white/70">{(college.institutionId?.city || college.city || "")}{((college.institutionId?.city || college.city) && (college.institutionId?.destinationId?.name || college.country)) ? ", " : ""}{(college.institutionId?.destinationId?.name || college.country || "")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="px-6 pt-4 pb-3">
                      <p className="text-[10px] font-bold text-[#0f4c3a]/50 uppercase tracking-wider mb-1">{college.courseLevel || "Program Level"}</p>
                      <h3 className="text-lg font-extrabold text-gray-900 uppercase leading-tight">{college.courseName || "Unknown Course"}</h3>
                      {college.courseLink && (
                        <a href={college.courseLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c3a] hover:text-[#0f4c3a]/70 mt-1.5 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">link</span>
                          View Course Details
                        </a>
                      )}
                    </div>

                    {/* Tags */}
                    {college.tags && college.tags.length > 0 && (
                      <div className="px-6 pb-4 flex flex-wrap gap-2">
                        {college.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f4c3a] bg-[#0f4c3a]/5 px-2.5 py-1 rounded-full border border-[#0f4c3a]/10">
                            <span className="material-symbols-outlined text-[13px] text-[#0f4c3a]/60">
                              {tag.includes('Scholarship') ? 'school' : tag.includes('Demand') ? 'trending_up' : 'verified'}
                            </span>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="px-6 border-t border-gray-100">
                      {/* Info Rows */}
                      <div className="py-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase">Duration</span>
                          <span className="text-sm font-bold text-gray-900">
                            {college.duration 
                              ? (/^\d+$/.test(college.duration.toString().trim()) ? `${college.duration} Months` : college.duration)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                          <span className="text-xs font-bold text-gray-400 uppercase">App Fee</span>
                          <span className="text-sm font-bold text-gray-900">{college.appFee || 'Free Waiver'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                          <span className="text-xs font-bold text-gray-400 uppercase">Success Chance</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${(!college.successChance || college.successChance.includes('High')) ? 'bg-emerald-500' : college.successChance === 'Medium' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                            <span className="text-sm font-bold text-gray-900">{college.successChance || 'High'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Requirement & Tuition Box */}
                    <div className="mx-6 my-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">English Req</p>
                          <div className="flex flex-wrap gap-1">
                            {college.englishRequirements && college.englishRequirements.length > 0 ? (
                              college.englishRequirements.slice(0, 2).map((req, i) => (
                                <span key={i} className="text-xs font-extrabold text-[#0f4c3a] bg-white px-2 py-1 rounded-lg border border-[#0f4c3a]/15 shadow-sm">
                                  {req.testName}: {req.minOverall}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm font-extrabold text-gray-400">N/A</span>
                            )}
                            {college.englishRequirements?.length > 2 && <span className="text-[10px] text-gray-400 font-bold self-center">+{college.englishRequirements.length - 2}</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tuition (1st yr)</p>
                          <p className="text-base font-extrabold text-gray-900">{college.tuitionFee ? `${getCurrencySymbol(college.institutionId?.destinationId?.name || college.country)}${Number(college.tuitionFee).toLocaleString('en-IN')}` : "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Available Intakes */}
                    <div className="px-6 py-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Available Intakes</p>
                      <div className="flex gap-3">
                        {college.intakes ? (
                          typeof college.intakes === 'string' ? (
                            college.intakes.split(',').slice(0, 3).map((intake, i) => (
                              <span key={i} className="px-4 py-2 bg-[#0f4c3a]/5 border border-[#0f4c3a]/10 rounded-lg text-xs font-bold text-[#0f4c3a]">
                                {intake.trim()}
                              </span>
                            ))
                          ) : (
                            Array.isArray(college.intakes) && college.intakes.slice(0, 3).map((intake, i) => (
                              <span key={i} className="px-4 py-2 bg-[#0f4c3a]/5 border border-[#0f4c3a]/10 rounded-lg text-xs font-bold text-[#0f4c3a]">
                                {intake}
                              </span>
                            ))
                          )
                        ) : (
                          <span className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-400">
                            Check availability
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-5 flex gap-3 items-center mt-auto border-t border-gray-100">
                      <button
                        onClick={() => handleApply(college._id)}
                        className="flex-1 py-3 bg-primary text-deep-green font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:brightness-90 active:scale-[0.98]"
                      >
                        Apply Now
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                      <button
                        onClick={() => toggleSave(college._id)}
                        className={`transition-all duration-200 p-2.5 rounded-xl border ${savedColleges.includes(college._id) ? 'border-pink-200 bg-pink-50 text-pink-500' : 'border-gray-200 bg-gray-50 text-gray-400 hover:text-pink-400 hover:border-pink-200 hover:bg-pink-50'}`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {savedColleges.includes(college._id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Infinite Scroll Loader Sentinel */}
              {hasMore && !showSavedOnly && (
                <div ref={loaderRef} className="flex justify-center items-center py-10 mt-6">
                  <span className="material-symbols-outlined text-4xl text-white/70 animate-spin">refresh</span>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CollegeSearch;