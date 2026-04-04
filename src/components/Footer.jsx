import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background-dark text-off-white py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between gap-12">
        
        {/* Branding Section */}
        <div className="flex flex-col gap-6 max-w-md">
          <div className="flex items-center gap-2 text-primary">
            
            <h2 className="text-xl font-bold">Anvora.</h2>
          </div>
          <p className="text-off-white/60 text-sm leading-relaxed">
            Empowering students worldwide to find their dream universities and achieve global academic success with expert data and guidance.
          </p>
          <div className="flex gap-4 mt-2">
            <a className="text-off-white/60 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="text-off-white/60 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>

        {/* Simplified Contact Section */}
        <div className="flex flex-col md:items-end">
          <h3 className="text-lg font-bold mb-6 text-primary">Contact Information</h3>
          <div className="flex flex-col gap-4 text-off-white/70 md:items-end">
            <a 
              href="mailto:info@anvora.in" 
              className="flex items-center gap-3 hover:text-white transition-colors group"
            >
              info@anvora.in
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">mail</span>
            </a>
            <a 
              href="tel:+919978714141" 
              className="flex items-center gap-3 hover:text-white transition-colors group"
            >
              +91 99787 14141
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">call</span>
            </a>
            <div className="flex gap-3 mt-4">
              <a className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-deep-green transition-all" href="#">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1440px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-off-white/40">
        <p>© 2026 Anvora Platform. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="hover:text-white" href="#">Privacy Policy</a>
          <a className="hover:text-white" href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;