import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminStudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
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

        const { data } = await axios.get(`/api/users/students/${id}`, config);
        setStudent(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!student) return <div className="text-center mt-10">Student not found</div>;

  return (
    <div className="min-h-screen bg-off-white font-display p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl shadow-deep-green/5 rounded-2xl p-8 border border-deep-green/10">
        <Link to="/admin/students" className="text-deep-green/60 hover:text-deep-green font-bold mb-6 inline-flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to List
        </Link>
        
        <h1 className="text-4xl font-extrabold text-deep-green mb-8 border-b-2 border-light-green/20 pb-4">{student.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="bg-off-white/50 p-6 rounded-2xl border border-deep-green/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-deep-green mb-4">
              <span className="material-symbols-outlined">badge</span>
              Basic Information
            </h2>
            <div className="space-y-3">
              <p className="flex justify-between border-b border-deep-green/5 pb-2">
                <span className="font-bold text-deep-green/60">Email:</span> 
                <span className="font-medium text-deep-green">{student.email}</span>
              </p>
              <p className="flex justify-between border-b border-deep-green/5 pb-2">
                <span className="font-bold text-deep-green/60">Role:</span> 
                <span className="px-3 py-0.5 rounded-full bg-light-green/30 text-deep-green text-sm font-bold border border-deep-green/10">{student.role}</span>
              </p>
              <p className="flex justify-between pt-1">
                <span className="font-bold text-deep-green/60">ID:</span> 
                <span className="font-mono text-xs text-deep-green/80 bg-white px-2 py-1 rounded border border-deep-green/10">{student._id}</span>
              </p>
            </div>
          </div>

          {/* Personal Info */}
          {student.personalInfo && (
            <div className="bg-off-white/50 p-6 rounded-2xl border border-deep-green/5">
              <h2 className="flex items-center gap-2 text-xl font-bold text-deep-green mb-4">
                <span className="material-symbols-outlined">person</span>
                Personal Information
              </h2>
              <div className="space-y-3">
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">First Name:</span> <span className="font-medium text-deep-green">{student.personalInfo.firstName}</span></p>
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">Last Name:</span> <span className="font-medium text-deep-green">{student.personalInfo.lastName}</span></p>
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">DOB:</span> <span className="font-medium text-deep-green">{student.personalInfo.dob ? new Date(student.personalInfo.dob).toLocaleDateString() : 'N/A'}</span></p>
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">Citizenship:</span> <span className="font-medium text-deep-green">{student.personalInfo.citizenship}</span></p>
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">Gender:</span> <span className="font-medium text-deep-green">{student.personalInfo.gender}</span></p>
                
                {/* Guardian Details */}
                <h3 className="text-sm font-bold text-deep-green/80 uppercase tracking-wide mt-4 pt-2 border-t border-deep-green/10">Guardian Details</h3>
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">Name:</span> <span className="font-medium text-deep-green">{student.personalInfo.guardianName || 'N/A'}</span></p>
                <p className="flex justify-between border-b border-deep-green/5 pb-2"><span className="font-bold text-deep-green/60">Phone:</span> <span className="font-medium text-deep-green">{student.personalInfo.guardianPhone || 'N/A'}</span></p>
                <p className="flex justify-between pt-1"><span className="font-bold text-deep-green/60">Email:</span> <span className="font-medium text-deep-green">{student.personalInfo.guardianEmail || 'N/A'}</span></p>
              </div>
            </div>
          )}

          {/* Address */}
          {student.address && (
            <div className="bg-off-white/50 p-6 rounded-2xl border border-deep-green/5">
              <h2 className="flex items-center gap-2 text-xl font-bold text-deep-green mb-4">
                <span className="material-symbols-outlined">home</span>
                Address
              </h2>
              <div className="space-y-2 text-deep-green font-medium">
                <p>{student.address.street}</p>
                <p>{student.address.city}, {student.address.state} {student.address.zipCode}</p>
                <p>{student.address.country}</p>
                <p className="mt-3 pt-3 border-t border-deep-green/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-deep-green/60">call</span>
                  {student.address.phone}
                </p>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-off-white/50 p-6 rounded-2xl border border-deep-green/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-deep-green mb-4">
              <span className="material-symbols-outlined">description</span>
              Documents
            </h2>
            {student.documents && student.documents.length > 0 ? (
              <ul className="space-y-3">
                {student.documents.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-deep-green/10 hover:shadow-sm transition-shadow">
                    <a 
                      href={`${doc.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-deep-green hover:text-primary font-bold flex items-center gap-2 truncate max-w-[200px]"
                      title={doc.fileName}
                    >
                      <span className="material-symbols-outlined text-[20px] text-red-500">picture_as_pdf</span>
                      <span className="truncate">{doc.fileName}</span>
                    </a>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                      doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                      doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-deep-green/60 italic text-sm">No documents uploaded.</p>
            )}
          </div>
        </div>

        {/* Education */}
        {student.education && student.education.length > 0 && (
          <div className="mt-8 bg-off-white/50 p-6 rounded-2xl border border-deep-green/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-deep-green mb-4">
              <span className="material-symbols-outlined">school</span>
              Education History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.education.map((edu, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-deep-green/10 shadow-sm">
                  <p className="font-extrabold text-deep-green text-lg mb-1">{edu.schoolName}</p>
                  <p className="text-sm font-bold text-deep-green/60 mb-3">{edu.level} • {edu.country}</p>
                  <div className="flex justify-between items-center text-sm font-medium text-deep-green bg-off-white p-2 rounded-lg">
                    <span>Year: {edu.graduationDate ? new Date(edu.graduationDate).getFullYear() : 'N/A'}</span>
                    <span>Score: {edu.score || 'N/A'} {edu.scoreScale ? `/ ${edu.scoreScale}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* English Proficiency / Test Scores */}
        {student.testScores && (
          <div className="mt-8 bg-off-white/50 p-6 rounded-2xl border border-deep-green/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-deep-green mb-4">
              <span className="material-symbols-outlined">spellcheck</span>
              English Proficiency
            </h2>
            <div className="bg-white p-5 rounded-xl border border-deep-green/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-extrabold text-deep-green text-lg">
                  Status: {student.testScores.englishProficiency === 'proof' ? 'Proof of English Proficiency' : 'Exempt'}
                </p>
                {student.testScores.englishProficiency === 'proof' && student.testScores.examType && (
                  <span className="text-sm font-bold text-deep-green bg-light-green/20 border border-light-green/30 px-3 py-1 rounded-full">
                    {student.testScores.examType}
                  </span>
                )}
              </div>

              {student.testScores.englishProficiency === 'proof' && (
                <div className="mt-4 pt-4 border-t border-deep-green/5">
                  <div className="flex flex-row justify-between items-center bg-off-white p-4 rounded-xl border border-deep-green/5">
                    <div>
                      <p className="text-xs font-bold text-deep-green/50 uppercase tracking-wider mb-1">Exam Date</p>
                      <p className="font-bold text-deep-green text-lg">
                        {student.testScores.examDate ? new Date(student.testScores.examDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-deep-green/50 uppercase tracking-wider mb-1">Overall Score</p>
                      <p className="font-black text-primary text-2xl drop-shadow-sm">
                        {student.testScores.overallScore || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentDetails;
