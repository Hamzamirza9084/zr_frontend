import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import Loader from './Loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Initialize State for form data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Function to handle typing — useCallback since it's stable
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // 3. Toggle password visibility
  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // 4. Submit logic — useCallback with deps
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data && response.data.token) {
        // Dispatch to Redux store (also persists to localStorage via slice)
        dispatch(setUser(response.data));

        // Directly redirect without toast/alert
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/colleges');
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      const errMsg = error.response?.data?.message || "Invalid Email or Password";

      // Error Toast
      toast.error(errMsg, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, [formData.email, formData.password, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-off-white font-display text-deep-green overflow-hidden flex">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* RENDER THE FULL SCREEN LOADER HERE */}
      {isLoading && <Loader />}

      {/* Left Section: Visual & Branding (Hidden on mobile) */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-light-green/20">
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
          <img 
            src="/Images/svglogo.svg" 
            alt="Anvora Hero Logo" 
            className="w-full max-w-md object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" 
          />

          <div className="mt-12 text-center max-w-sm">
            <h2 className="text-3xl font-extrabold leading-tight mb-4">
              "We have successfully guided over 1,000<sup>+</sup> students to their top universities."
            </h2>
            <p className="text-deep-green/70 font-medium">Join over 1,000 students achieving their goals.</p>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
      </section>

      {/* Right Section: Login Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 ">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="px-0">
            <CardTitle className="text-4xl font-extrabold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-deep-green/60 font-medium text-base">
              Log in to continue your preparation journey.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a className="text-xs font-bold hover:text-primary transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
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
              </div>

              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Login to Dashboard'}
              </Button>
            </form>

            <p className="mt-10 text-center text-sm font-medium text-deep-green/60">
              Don't have an account?
              <Link to="/register" className="ml-1 font-bold text-deep-green hover:text-primary transition-colors underline decoration-primary decoration-2 underline-offset-4">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LoginPage;