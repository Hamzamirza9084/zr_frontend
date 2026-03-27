import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Trash2, Eye, Info, Plus, Calendar, 
  MapPin, Globe, GraduationCap, CheckCircle 
} from 'lucide-react';
import axios from 'axios';

const ProfileUpdate = () => {
  // --- STATE MANAGEMENT ---
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    documents: [
      
    ],
    personalInfo: {
      firstName: "", middleName: "", lastName: "",
      dob: "", firstLanguage: "", citizenship: "",
      maritalStatus: "Single", gender: "Male",
      passport: {
        number: "",
        expiryDate: "",
        placeOfBirth: ""
      },
      guardianName: "",
      guardianPhone: "",
      guardianEmail: ""
    },
    address: {
      street: "", city: "", country: "", state: "", zipCode: "",
      phone: "", phoneCountryCode: "+91"
    },
    education: [
      {
        country: "India",
        schoolName: "",
        level: "Bachelors",
        gradingScheme: "Percentage",
        score: "",
        scoreScale: "100",
        language: "English",
        attendedFrom: "",
        attendedTo: "",
        degreeName: "",
        isGraduated: true,
        graduationDate: "",
        hasPhysicalCertificate: true,
        schoolAddress: { street: "", city: "", state: "", zipCode: "" }
      }
    ],
    testScores: {
      englishProficiency: "proof",
      examType: "",
      examDate: "",
      overallScore: ""
    }
  });

  // Load existing user profile into form on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        const toDateInput = (d) => {
          if (!d) return '';
          const dt = (typeof d === 'string' || typeof d === 'number') ? new Date(d) : d;
          if (!(dt instanceof Date) || isNaN(dt)) return '';
          return dt.toISOString().slice(0,10);
        };

        const normalizedPersonal = { ...(stored.personalInfo || {}) };
        if (normalizedPersonal.dob) normalizedPersonal.dob = toDateInput(normalizedPersonal.dob);
        if (normalizedPersonal.passport) {
          normalizedPersonal.passport = {
            ...(normalizedPersonal.passport || {}),
            expiryDate: toDateInput(normalizedPersonal.passport.expiryDate)
          };
        }

        const normalizedEducation = Array.isArray(stored.education)
          ? stored.education.map(edu => ({
              ...edu,
              attendedFrom: toDateInput(edu.attendedFrom),
              attendedTo: toDateInput(edu.attendedTo),
              graduationDate: toDateInput(edu.graduationDate),
              schoolAddress: edu.schoolAddress || {}
            }))
          : prev.education;

        const normalizedTestScores = { ...(stored.testScores || {}) };
        if (normalizedTestScores.examDate) normalizedTestScores.examDate = toDateInput(normalizedTestScores.examDate);

        setFormData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, ...normalizedPersonal },
          address: { ...prev.address, ...(stored.address || {}) },
          education: normalizedEducation,
          testScores: { ...prev.testScores, ...normalizedTestScores },
          documents: Array.isArray(stored.documents) ? stored.documents : prev.documents
        }));
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  // --- HANDLERS ---
  
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
    
    // Special handling for nested passport fields
    if (name === 'passportNumber' || name === 'passportExpiry' || name === 'placeOfBirth') {
      const passportFieldMap = {
        passportNumber: 'number',
        passportExpiry: 'expiryDate',
        placeOfBirth: 'placeOfBirth'
      };
      const schemaFieldName = passportFieldMap[name];
      
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          passport: { ...prev.personalInfo.passport, [schemaFieldName]: value }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [name]: value }
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  };

  // Education Repeater Logic
  const addSchool = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          country: "", schoolName: "", level: "", gradingScheme: "", score: "", scoreScale: "100",
          language: "", attendedFrom: "", attendedTo: "", degreeName: "",
          isGraduated: true, graduationDate: "", hasPhysicalCertificate: false,
          schoolAddress: { street: "", city: "", state: "", zipCode: "" }
        }
      ]
    }));
  };

  const removeSchool = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index, field, value, isNested = false, nestedField = null) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => {
        if (i === index) {
          if (isNested) {
            return { ...edu, [field]: { ...edu[field], [nestedField]: value } };
          }
          return { ...edu, [field]: value };
        }
        return edu;
      })
    }));
    if (isNested) {
      if (errors[`edu_${field}_${nestedField}_${index}`]) setErrors(prev => ({ ...prev, [`edu_${field}_${nestedField}_${index}`]: false }));
    } else {
      if (errors[`edu_${field}_${index}`]) setErrors(prev => ({ ...prev, [`edu_${field}_${index}`]: false }));
    }
  };

  const handleTestScoreChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
    setFormData(prev => ({
      ...prev,
      testScores: { ...prev.testScores, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    const p = formData.personalInfo;
    if (!p.firstName) newErrors['firstName'] = true;
    if (!p.lastName) newErrors['lastName'] = true;
    if (!p.dob) newErrors['dob'] = true;
    if (!p.firstLanguage) newErrors['firstLanguage'] = true;
    if (!p.citizenship) newErrors['citizenship'] = true;
    
    if (p.passport) {
      if (!p.passport.number) newErrors['passportNumber'] = true;
      if (!p.passport.expiryDate) newErrors['passportExpiry'] = true;
      if (!p.passport.placeOfBirth) newErrors['placeOfBirth'] = true;
    }
    
    if (!p.guardianName) newErrors['guardianName'] = true;
    if (!p.guardianPhone) newErrors['guardianPhone'] = true;
    if (!p.guardianEmail) newErrors['guardianEmail'] = true;

    const a = formData.address;
    if (!a.street) newErrors['street'] = true;
    if (!a.city) newErrors['city'] = true;
    if (!a.state) newErrors['state'] = true;
    if (!a.country) newErrors['country'] = true;
    if (!a.zipCode) newErrors['zipCode'] = true;
    if (!a.phone) newErrors['phone'] = true;

    if (formData.education.length > 0) {
      const e0 = formData.education[0];
      if (!e0.schoolName) newErrors['edu_schoolName_0'] = true;
      if (!e0.score) newErrors['edu_score_0'] = true;
      if (!e0.degreeName) newErrors['edu_degreeName_0'] = true;
      if (!e0.attendedFrom) newErrors['edu_attendedFrom_0'] = true;
      if (!e0.attendedTo) newErrors['edu_attendedTo_0'] = true;
      if (!e0.language) newErrors['edu_language_0'] = true;
      if (!e0.country) newErrors['edu_country_0'] = true;
      if (!e0.level) newErrors['edu_level_0'] = true;
      
      const sa = e0.schoolAddress || {};
      if (!sa.street) newErrors['edu_schoolAddress_street_0'] = true;
      if (!sa.city) newErrors['edu_schoolAddress_city_0'] = true;
      if (!sa.state) newErrors['edu_schoolAddress_state_0'] = true;
      if (!sa.zipCode) newErrors['edu_schoolAddress_zipCode_0'] = true;
    } else {
        newErrors['no_education'] = true;
    }

    // test scores
    if (formData.testScores.englishProficiency === 'proof') {
       if (!formData.testScores.examType) newErrors['examType'] = true;
       if (!formData.testScores.overallScore) newErrors['overallScore'] = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const errorElement = document.querySelector('.border-red-500');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    try {
      // Get token from user object stored in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;

      if (!token) {
        alert("Error: Authentication token not found. Please log in again.");
        return;
      }

      // Sanitize payload: convert empty-date strings to null so Mongoose won't cast/break
      const sanitize = (data) => {
        const copy = JSON.parse(JSON.stringify(data));

        const setNullIfEmpty = (obj, key) => {
          if (obj && obj[key] === '') obj[key] = null;
        };

        if (copy.personalInfo) {
          setNullIfEmpty(copy.personalInfo, 'dob');
          if (copy.personalInfo.passport) {
            setNullIfEmpty(copy.personalInfo.passport, 'expiryDate');
            setNullIfEmpty(copy.personalInfo.passport, 'placeOfBirth');
          }
        }

        if (copy.testScores) setNullIfEmpty(copy.testScores, 'examDate');

        if (Array.isArray(copy.education)) {
          copy.education = copy.education.map(edu => {
            ['attendedFrom', 'attendedTo', 'graduationDate'].forEach(k => {
              if (edu[k] === '') edu[k] = null;
            });
            return edu;
          });
        }

        return copy;
      };

      const payload = sanitize(formData);

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put('/api/users/profile', payload, config);
      const data = response.data;

      // Update form with returned user data so inputs reflect saved values
      const toDateInput = (d) => {
        if (!d) return '';
        const dt = (typeof d === 'string' || typeof d === 'number') ? new Date(d) : d;
        if (!(dt instanceof Date) || isNaN(dt)) return '';
        return dt.toISOString().slice(0,10);
      };

      const normalizedPersonal = { ...(data.personalInfo || {}) };
      if (normalizedPersonal.dob) normalizedPersonal.dob = toDateInput(normalizedPersonal.dob);
      if (normalizedPersonal.passport) {
        normalizedPersonal.passport = {
          ...(normalizedPersonal.passport || {}),
          expiryDate: toDateInput(normalizedPersonal.passport.expiryDate)
        };
      }

      const normalizedEducation = Array.isArray(data.education)
        ? data.education.map(edu => ({
            ...edu,
            attendedFrom: toDateInput(edu.attendedFrom),
            attendedTo: toDateInput(edu.attendedTo),
            graduationDate: toDateInput(edu.graduationDate),
            schoolAddress: edu.schoolAddress || {}
          }))
        : prev.education;

      const normalizedTestScores = { ...(data.testScores || {}) };
      if (normalizedTestScores.examDate) normalizedTestScores.examDate = toDateInput(normalizedTestScores.examDate);

      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...normalizedPersonal },
        address: { ...prev.address, ...(data.address || {}) },
        education: normalizedEducation,
        testScores: { ...prev.testScores, ...normalizedTestScores },
        documents: Array.isArray(data.documents) ? data.documents : prev.documents
      }));

      // Update stored user object (keeps token and latest profile)
      try {
        const current = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...current, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        // ignore storage errors
      }

      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error updating profile");
    }
  };

  // --- Document Upload ---
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Client-side validation: only PDFs
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert('Please select a PDF file');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      if (!token) return alert('Please login to upload files');

      const fd = new FormData();
      fd.append('file', file);

      const res = await axios.post('/api/users/documents', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const docs = res.data.documents;
      setFormData(prev => ({ ...prev, documents: docs }));

      // update localStorage user
      try {
        const current = JSON.parse(localStorage.getItem('user')) || {};
        const updated = { ...current, documents: docs };
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (err) {}
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleView = (doc) => {
    if (!doc || !doc.fileUrl) return alert('No file URL available');
    window.open(doc.fileUrl, '_blank');
  };

  const handleDelete = async (doc) => {
    if (!doc || !doc.fileUrl) return;
    if (!confirm('Delete this document?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      if (!token) return alert('Please login to delete files');

      const res = await axios.delete('/api/users/documents', {
        data: { fileUrl: doc.fileUrl },
        headers: { Authorization: `Bearer ${token}` }
      });

      const docs = res.data.documents;
      setFormData(prev => ({ ...prev, documents: docs }));

      try {
        const current = JSON.parse(localStorage.getItem('user')) || {};
        const updated = { ...current, documents: docs };
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (err) {}
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Application Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 2. Smart Document Vault */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-deep-green/10 flex justify-between items-center bg-off-white">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-deep-green">
                  <FileText className="w-5 h-5 text-deep-green" /> Smart Document Vault
                </h2>
              </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Upload Zone */}
              <div className="border-2 border-dashed border-deep-green/30 rounded-lg p-8 flex flex-col items-center justify-center bg-off-white hover:bg-off-white/95 transition cursor-pointer">
                <div className="bg-light-green p-3 rounded-full mb-3">
                  <Upload className="w-6 h-6 text-deep-green" />
                </div>
                <p className="text-sm font-medium text-deep-green">Drag & Drop files here</p>
                <p className="text-xs text-deep-green/60 mt-1">or click to browse (PDF)</p>
                <input type="file" accept=".pdf" onChange={handleFileSelect} className="mt-3" />
              </div>

              {/* Right: File List */}
              <div className="space-y-3">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-deep-green/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-deep-green/70" />
                      <span className="text-sm font-medium text-deep-green">{doc.fileName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-light-green text-deep-green text-xs rounded-full font-medium border border-light-green/60">
                        {doc.status}
                      </span>
                      <button type="button" onClick={() => handleView(doc)} className="text-deep-green/70 hover:text-deep-green"><Eye className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDelete(doc)} className="text-deep-green/70 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="First Name" name="firstName" value={formData.personalInfo.firstName} onChange={handlePersonalChange} error={errors.firstName} />
                <InputGroup label="Middle Name" name="middleName" value={formData.personalInfo.middleName} onChange={handlePersonalChange} />
                <InputGroup label="Last Name" name="lastName" value={formData.personalInfo.lastName} onChange={handlePersonalChange} error={errors.lastName} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup type="date" label="Date of Birth" name="dob" value={formData.personalInfo.dob} onChange={handlePersonalChange} error={errors.dob} />
                <InputGroup label="First Language" name="firstLanguage" value={formData.personalInfo.firstLanguage} onChange={handlePersonalChange} error={errors.firstLanguage} />
                <InputGroup label="Country of Citizenship" name="citizenship" value={formData.personalInfo.citizenship} onChange={handlePersonalChange} error={errors.citizenship} />
              </div>

              {/* Passport Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Passport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Passport Number" name="passportNumber" value={formData.personalInfo.passport.number} onChange={handlePersonalChange} error={errors.passportNumber} />
                  <InputGroup type="date" label="Expiry Date" name="passportExpiry" value={formData.personalInfo.passport.expiryDate} onChange={handlePersonalChange} error={errors.passportExpiry} />
                  <InputGroup label="Place of Birth" name="placeOfBirth" value={formData.personalInfo.passport.placeOfBirth} onChange={handlePersonalChange} error={errors.placeOfBirth} />
                </div>
              </div>

              {/* Guardian Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Guardian Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Guardian Name" name="guardianName" value={formData.personalInfo.guardianName} onChange={handlePersonalChange} error={errors.guardianName} />
                  <InputGroup label="Guardian Phone Number" name="guardianPhone" value={formData.personalInfo.guardianPhone} onChange={handlePersonalChange} error={errors.guardianPhone} />
                  <InputGroup label="Guardian Email" name="guardianEmail" value={formData.personalInfo.guardianEmail} type="email" onChange={handlePersonalChange} error={errors.guardianEmail} />
                </div>
              </div>

              {/* Radio Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                  <div className="flex gap-4">
                    {['Single', 'Married'].map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="maritalStatus" 
                          value={status}
                          checked={formData.personalInfo.maritalStatus === status}
                          onChange={handlePersonalChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other'].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          value={g}
                          checked={formData.personalInfo.gender === g}
                          onChange={handlePersonalChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Address Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800">Please provide your current residential address. This will be used for official correspondence.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <InputGroup label="Street Address" name="street" value={formData.address.street} onChange={handleAddressChange} error={errors.street} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputGroup label="City" name="city" value={formData.address.city} onChange={handleAddressChange} error={errors.city} />
                <InputGroup label="State/Province" name="state" value={formData.address.state} onChange={handleAddressChange} error={errors.state} />
                <InputGroup label="Country" name="country" value={formData.address.country} onChange={handleAddressChange} error={errors.country} />
                <InputGroup label="Zip Code" name="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} error={errors.zipCode} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                  <select 
                    name="phoneCountryCode"
                    value={formData.address.phoneCountryCode}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border"
                  >
                    <option value="+91">+91 (India)</option>
                    <option value="+1">+1 (USA)</option>
                    <option value="+44">+44 (UK)</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <InputGroup label="Phone Number" name="phone" value={formData.address.phone} onChange={handleAddressChange} error={errors.phone} />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Education Details (Repeater) */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-green">Education History</h2>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-off-white border-b border-deep-green/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-deep-green" />
                    <h3 className="font-semibold text-deep-green">{edu.schoolName || "New Institution"}</h3>
                  </div>
                  {formData.education.length > 1 && (
                    <button type="button" onClick={() => removeSchool(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country of Institution</label>
                      <select 
                        value={edu.country}
                        onChange={(e) => handleEducationChange(index, 'country', e.target.value)}
                        className={`w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 ${errors[`edu_country_${index}`] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <InputGroup 
                        label="School Name" 
                        value={edu.schoolName}
                        onChange={(e) => handleEducationChange(index, 'schoolName', e.target.value)}
                        placeholder="Search for school..."
                        error={errors[`edu_schoolName_${index}`]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level of Education</label>
                      <select 
                        value={edu.level}
                        onChange={(e) => handleEducationChange(index, 'level', e.target.value)}
                        className={`w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 ${errors[`edu_level_${index}`] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                      >
                        <option value="High School">High School</option>
                        <option value="Bachelors">Bachelor's Degree</option>
                        <option value="Masters">Master's Degree</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grading Scheme</label>
                      <select 
                        value={edu.gradingScheme}
                        onChange={(e) => handleEducationChange(index, 'gradingScheme', e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5"
                      >
                        <option value="Percentage">Percentage (0-100)</option>
                        <option value="GPA">GPA (4.0 Scale, 10.0 Scale etc)</option>
                        <option value="Letter">Letter Grade</option>
                      </select>
                    </div>

                    <InputGroup 
                      label={
                        edu.gradingScheme === 'Percentage' ? "Percentage Achieved (%)" : 
                        edu.gradingScheme === 'GPA' ? "GPA / CGPA Score" : 
                        "Grade / Score"
                      }
                      value={edu.score} 
                      onChange={(e) => handleEducationChange(index, 'score', e.target.value)} 
                      placeholder={
                        edu.gradingScheme === 'Percentage' ? "e.g. 85.5" : 
                        edu.gradingScheme === 'GPA' ? "e.g. 3.5 or 8.5" : 
                        "e.g. A+"
                      }
                      type={edu.gradingScheme === 'Letter' ? "text" : "number"}
                      error={errors[`edu_score_${index}`]}
                    />

                    {edu.gradingScheme !== 'Percentage' && (
                       <InputGroup 
                        label={
                          edu.gradingScheme === 'GPA' ? "Scale (Max GPA)" : 
                          "Score Scale (Optional)"
                        }
                        value={edu.scoreScale} 
                        onChange={(e) => handleEducationChange(index, 'scoreScale', e.target.value)} 
                        placeholder={
                          edu.gradingScheme === 'GPA' ? "e.g. 4.0 or 10.0" : 
                          "e.g. 100"
                        }
                      />
                    )}
                    
                    {edu.gradingScheme === 'Percentage' && (
                       <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Scale</label>
                          <div className="w-full rounded-lg bg-gray-100 border border-gray-200 py-2.5 px-3 text-gray-500 text-sm">
                            Out of 100
                          </div>
                       </div>
                    )}
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputGroup label="Primary Language" value={edu.language} onChange={(e) => handleEducationChange(index, 'language', e.target.value)} error={errors[`edu_language_${index}`]} />
                    <InputGroup type="date" label="Attended From" value={edu.attendedFrom} onChange={(e) => handleEducationChange(index, 'attendedFrom', e.target.value)} error={errors[`edu_attendedFrom_${index}`]} />
                    <InputGroup type="date" label="Attended To" value={edu.attendedTo} onChange={(e) => handleEducationChange(index, 'attendedTo', e.target.value)} error={errors[`edu_attendedTo_${index}`]} />
                  </div>

                  {/* Row 4 */}
                  <InputGroup label="Degree Name" value={edu.degreeName} onChange={(e) => handleEducationChange(index, 'degreeName', e.target.value)} error={errors[`edu_degreeName_${index}`]} />

                  {/* Checkboxes & Logic */}
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={edu.isGraduated} 
                        onChange={(e) => handleEducationChange(index, 'isGraduated', e.target.checked)}
                        className="w-5 h-5 text-deep-green rounded focus:ring-deep-green border-deep-green/30"
                      />
                      <span className="text-gray-700 font-medium">I have graduated from this institution</span>
                    </label>

                    {edu.isGraduated && (
                      <div className="pl-8 w-full md:w-1/3">
                        <InputGroup type="date" label="Graduation Date" value={edu.graduationDate} onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)} />
                      </div>
                    )}

                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={edu.hasPhysicalCertificate} 
                        onChange={(e) => handleEducationChange(index, 'hasPhysicalCertificate', e.target.checked)}
                        className="w-5 h-5 text-deep-green rounded focus:ring-deep-green border-deep-green/30"
                      />
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        I have the physical certificate for this degree
                        <Info className="w-4 h-4 text-gray-400" />
                      </span>
                    </label>
                  </div>

                  {/* School Address Sub-section */}
                  <div className="bg-off-white/50 p-6 rounded-lg border border-deep-green/10 mt-6">
                    <h4 className="font-bold text-deep-green mb-4">School Address</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup 
                          label="Address" 
                          value={edu.schoolAddress.street} 
                          onChange={(e) => handleEducationChange(index, 'schoolAddress', e.target.value, true, 'street')} 
                          error={errors[`edu_schoolAddress_street_${index}`]}
                        />
                        <InputGroup 
                          label="City/Town" 
                          value={edu.schoolAddress.city} 
                          onChange={(e) => handleEducationChange(index, 'schoolAddress', e.target.value, true, 'city')} 
                          error={errors[`edu_schoolAddress_city_${index}`]}
                        />
                        <InputGroup 
                          label="Province/State" 
                          value={edu.schoolAddress.state} 
                          onChange={(e) => handleEducationChange(index, 'schoolAddress', e.target.value, true, 'state')} 
                          error={errors[`edu_schoolAddress_state_${index}`]}
                        />
                      </div>
                      <div className="w-full md:w-1/3">
                        <InputGroup 
                          label="Postal/Zip Code" 
                          value={edu.schoolAddress.zipCode} 
                          onChange={(e) => handleEducationChange(index, 'schoolAddress', e.target.value, true, 'zipCode')} 
                          error={errors[`edu_schoolAddress_zipCode_${index}`]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-start">
              <button 
                type="button" 
                onClick={addSchool} 
                className="flex items-center gap-2 px-4 py-2 text-green-600 bg-transparent hover:bg-blue-50 font-medium rounded-lg transition"
              >
                <Plus className="w-5 h-5" /> Add School
              </button>
            </div>
          </div>

          {/* 6. Test Scores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold">English Proficiency</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="englishProficiency" 
                    value="proof"
                    checked={formData.testScores.englishProficiency === 'proof'}
                    onChange={handleTestScoreChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">I have or will have proofs of my English proficiency</span>
                </label>
                <label className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="englishProficiency" 
                    value="exempt"
                    checked={formData.testScores.englishProficiency === 'exempt'}
                    onChange={handleTestScoreChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">I am exempt from submitting English proficiency proof</span>
                </label>
              </div>

              {formData.testScores.englishProficiency === 'proof' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select 
                      name="examType"
                      value={formData.testScores.examType}
                      onChange={handleTestScoreChange}
                      className={`w-full rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 ${errors.examType ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Exam</option>
                      <option value="IELTS">IELTS</option>
                      <option value="PTE">PTE</option>
                      <option value="TOEFL">TOEFL</option>
                      <option value="DET">DET</option>
                    </select>
                  </div>
                  <InputGroup type="date" label="Date of Exam" name="examDate" value={formData.testScores.examDate} onChange={handleTestScoreChange} />
                  <InputGroup label="Overall Score" name="overallScore" value={formData.testScores.overallScore} onChange={handleTestScoreChange} error={errors.overallScore} />
                </div>
              )}
            </div>
          </div>

          {/* Final Submit */}
          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              className="px-8 py-3 bg-primary text-deep-green font-bold rounded-xl hover:bg-primary/90 focus:ring-4 focus:ring-primary/30 transition shadow-md flex items-center gap-2"
            >
              Save Profile Application
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputGroup = ({ label, type = "text", value, onChange, name, placeholder, required = false, error, ...props }) => (
  <div className="w-full">
    <label className={`block text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-gray-700'}`}>{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 transition ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
        {...props}
      />
      {type === 'date' && <Calendar className={`absolute right-3 top-2.5 w-5 h-5 pointer-events-none ${error ? 'text-red-400' : 'text-gray-400'}`} />}
    </div>
    {error && <p className="text-red-500 text-xs mt-1 font-medium">This field is required</p>}
  </div>
);

export default ProfileUpdate;