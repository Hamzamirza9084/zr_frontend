import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage'
import CollegeSearch from './components/CollegeSearch';
import AdminAddUniversity from './components/AdminAddUniversity';
import AdminStudentList from './components/AdminStudentList';
import AdminStudentDetails from './components/AdminStudentDetails';
import AdminApplications from './components/AdminApplications';
import AdminUniversitiesList from './components/AdminUniversitiesList';
import MyApplications from './components/MyApplications';
import ProfileUpdate from './components/ProfileUpdate';

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
      </Routes>
    </Router>
  );
}

export default App;