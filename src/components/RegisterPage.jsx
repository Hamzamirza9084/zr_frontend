import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const RegisterPage = () => {
  const navigate = useNavigate();
  
  // 1. Initialize State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // New: State for validation errors
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Function to handle typing in inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // New: Validation Logic
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Full Name Validation
    if (!formData.fullName.trim()) {
        newErrors.fullName = "Full Name is required";
        isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        isValid = false;
    } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
        isValid = false;
    }

    // Phone Number Validation
    if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone Number is required";
        isValid = false;
    } else if (formData.phoneNumber.length < 10) {
        newErrors.phoneNumber = "Phone number must be at least 10 digits";
        isValid = false;
    }

    // Password Validation
    if (!formData.password) {
        newErrors.password = "Password is required";
        isValid = false;
    } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
    }

    // Confirm Password Validation
    if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
    }

    setErrors(newErrors);
    
    // Optional: Toast error if validation fails globally
    if (!isValid) {
        toast.warn("Please fix the errors in the form.", {
            position: "top-right",
            autoClose: 3000,
        });
    }

    return isValid;
  };

  // 3. Function to submit data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run Validation before submitting
    if (!validateForm()) {
        return;
    }

    try {
      // Backend expects: name, email, phone, password
      const response = await axios.post('/api/auth/register', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password
      });

      if (response.data) {
        // Success Toast
        toast.success("Registration Successful! Redirecting to Login...", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            // Navigate after the toast closes
            onClose: () => navigate('/login') 
        });
      }
    } catch (error) {
      console.error(error);
      // Error Toast
      const errMsg = error.response?.data?.message || "Registration failed";
      toast.error(errMsg, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  // Helper component for Error Message
  const ErrorMsg = ({ msg }) => (
    msg ? <span className="text-red-500 text-xs font-bold mt-1 ml-1">{msg}</span> : null
  );

  return (
    <div className="bg-off-white font-display text-deep-green min-h-screen">
      {/* Toast Container Configuration */}
      <ToastContainer />

      <main className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left Section: Branding & Features */}
        <section className="hidden lg:flex w-1/2 bg-deep-green p-12 lg:p-20 flex-col justify-between relative overflow-hidden sticky top-0 h-screen">
          <div className="absolute top-0 right-0 w-64 h-64 bg-light-green/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-primary mb-16">
              <div className="size-10 flex items-center justify-center rounded-xl bg-primary text-deep-green">
                <img src="/Images/svglogo.svg" alt="Anvora logo" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-off-white">Anvora</h1>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl font-extrabold text-off-white leading-tight">
                Find your university faster and get <span className="text-primary">accepted</span> there.
              </h2>
              {/* <div className="space-y-8">
                {[
                  { icon: 'assignment_turned_in', title: 'Free Diagnostic Test', desc: 'Identify your strengths and weaknesses with our comprehensive assessment.' },
                  { icon: 'groups', title: 'Expert Community', desc: 'Join 50,000+ students and certified trainers in active learning groups.' },
                  { icon: 'verified_user', title: 'Proven Strategies', desc: 'Access materials that helped 92% of students reach Band 7.5+.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 items-start">
                    <div className="size-12 shrink-0 rounded-full bg-light-green/20 flex items-center justify-center border border-light-green/30">
                      <span className="material-symbols-outlined text-light-green">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-light-green mb-1">{item.title}</h3>
                      <p className="text-off-white/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          </div>
          <div className="relative z-10 pt-12">
            <p className="text-off-white/50 text-sm">© 2026 Anvora.</p>
          </div>
        </section>

        {/* Right Section: Form */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-off-white">
          <div className="w-full max-w-xl flex flex-col gap-8">
            <div className="lg:hidden flex items-center gap-3 text-deep-green mb-4">
              <div className="size-8 flex items-center justify-center rounded-lg bg-deep-green text-primary">
                <img src="/Images/svglogo.svg" alt="Anvora logo" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Anvora</h2>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-extrabold text-deep-green">Create Account</h2>
              <p className="text-deep-green/60 font-medium">Join the thousands of students already preparing with us.</p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-deep-green/40 mb-2 border-b border-light-green pb-2">Basic Information</h3>
              </div>
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-deep-green/80 ml-1">Full Name</label>
                <input 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.fullName ? 'border-red-500' : 'border-light-green'} bg-white focus:ring-0 focus:border-deep-green transition-colors`} 
                  placeholder="John Doe" 
                  type="text" 
                />
                <ErrorMsg msg={errors.fullName} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-deep-green/80 ml-1">Email Address</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email ? 'border-red-500' : 'border-light-green'} bg-white focus:ring-0 focus:border-deep-green transition-colors`} 
                  placeholder="john@example.com" 
                  type="email" 
                />
                <ErrorMsg msg={errors.email} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-deep-green/80 ml-1">Phone Number</label>
                <input 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.phoneNumber ? 'border-red-500' : 'border-light-green'} bg-white focus:ring-0 focus:border-deep-green transition-colors`} 
                  placeholder="+1 (555) 000-0000" 
                  type="tel" 
                />
                <ErrorMsg msg={errors.phoneNumber} />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-deep-green/80 ml-1">Password</label>
                <div className="relative">
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${errors.password ? 'border-red-500' : 'border-light-green'} bg-white focus:ring-0 focus:border-deep-green transition-colors`} 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
                <ErrorMsg msg={errors.password} />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-deep-green/80 ml-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-light-green'} bg-white focus:ring-0 focus:border-deep-green transition-colors`} 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? "text" : "password"} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
                <ErrorMsg msg={errors.confirmPassword} />
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="w-full h-14 bg-primary text-deep-green font-bold text-lg rounded-xl shadow-[0px_4px_0px_0px_#347928] hover:translate-y-[2px] hover:shadow-[0px_2px_0px_0px_#347928] active:translate-y-[4px] active:shadow-none transition-all mt-4">
                  Create Account
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-6 items-center">
              <p className="text-deep-green/60 text-sm">
                Already have an account? 
                <Link to="/login" className="font-bold text-deep-green hover:text-primary transition-colors ml-1 underline decoration-primary decoration-2 underline-offset-4">Log in instead</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;