import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TextType from './TextType'; // Assuming this is your typewriter component

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pt-20 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Column: Text & CTA */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                We Help Students <br />
                <span className="text-[#347928]">Study Abroad.</span>
              </h1>
              
              <div className="text-lg text-gray-600 mb-8 max-w-lg">
                <TextType 
                  text="Connect with over 1,500+ educational institutions worldwide. Your journey to global education starts here." 
                  speed={30} 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/colleges')}
                  className="px-8 py-4 bg-[#347928] hover:bg-[#2a6220] text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  Explore Schools
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white border-2 border-[#347928] text-[#347928] text-lg font-bold rounded-full hover:bg-green-50 transition-all"
                >
                  Student Registration
                </button>
              </div>
            </motion.div>

            {/* Right Column: Hero Image */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 mt-12 lg:mt-0 relative"
            >
              {/* Plain hero image — optimized with WebP + width/height for CLS */}
              <div className="relative">
                <picture>
                  <source srcSet="/Images/royal.webp" type="image/webp" />
                  <img
                    src="/Images/royal-optimized.jpg"
                    alt="Students studying abroad with Anvora platform"
                    width="800"
                    height="600"
                    fetchpriority="high"
                    className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-700"
                  />
                </picture>
              </div>
              
              {/* Floating Badge Example */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-[#FCCD2A] p-2 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Acceptance Rate</p>
                  <p className="text-xl font-bold text-gray-900">98.5%</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="bg-[#e6ffe8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Students Helped', value: '100k+' },
              { label: 'Partner Schools', value: '1,500+' },
              { label: 'Countries', value: '100+' },
              { label: 'Scholarships', value: '$50M+' },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-[#347928]">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Three Cards) --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How Anvora Works</h2>
            <p className="mt-4 text-gray-500">We make the application process simple and seamless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Choose a Program', desc: 'Use our AI-powered search to find the perfect match.' },
              { title: 'Submit Application', desc: 'Apply to multiple schools with a single profile.' },
              { title: 'Get Accepted', desc: 'Receive guidance on visa and travel arrangements.' }
            ].map((step, i) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={i} 
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-[#FCCD2A]/20 text-[#347928] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;