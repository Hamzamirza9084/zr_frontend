import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { PageSkeleton } from './components/Skeletons';

// Eagerly loaded (used on landing page)
import LandingPage from './components/LandingPage';

// Lazy-loaded routes (only loaded when navigated to)
const LoginPage = lazy(() => import('./components/LoginPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const CollegeSearch = lazy(() => import('./components/CollegeSearch'));
const AdminAddUniversity = lazy(() => import('./components/AdminAddUniversity'));
const AdminStudentList = lazy(() => import('./components/AdminStudentList'));
const AdminStudentDetails = lazy(() => import('./components/AdminStudentDetails'));
const AdminApplications = lazy(() => import('./components/AdminApplications'));
const AdminUniversitiesList = lazy(() => import('./components/AdminUniversitiesList'));
const AdminManageGlobal = lazy(() => import('./components/AdminManageGlobal'));
const MyApplications = lazy(() => import('./components/MyApplications'));
const ProfileUpdate = lazy(() => import('./components/ProfileUpdate'));

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-deep-green dark:text-off-white overflow-x-hidden">
    <Header />
    {children}
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/colleges" element={
            <MainLayout>
              <CollegeSearch />
            </MainLayout>
          } />

          {/* Profile Update Route - Wrapped in MainLayout so Header/Footer show */}
          <Route path="/profile/update" element={
            <MainLayout>
              <ProfileUpdate />
            </MainLayout>
          } />

          {/* My Applications Route */}
          <Route path="/applications" element={
            <MainLayout>
              <MyApplications />
            </MainLayout>
          } />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminAddUniversity />} />
          <Route path="/admin/universities" element={<AdminUniversitiesList />} />
          <Route path="/admin/edit-university/:id" element={<AdminAddUniversity />} />
          <Route path="/admin/students" element={<AdminStudentList />} />
          <Route path="/admin/students/:id" element={<AdminStudentDetails />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/global" element={<AdminManageGlobal />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;