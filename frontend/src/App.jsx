import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import ReportIncident from './pages/ReportIncident.jsx';
import CitizenFacilities from './pages/CitizenFacilities.jsx';
import EOCDashboard from './pages/EOCDashboard.jsx';
import EOCIncidentDetail from './pages/EOCIncidentDetail.jsx';
import EOCDirectory from './pages/EOCDirectory.jsx';
import EOCVerification from './pages/EOCVerification.jsx';
import EOCBroadcasts from './pages/EOCBroadcasts.jsx';
import RescueDashboard from './pages/RescueDashboard.jsx';
import RescueIncidentDetail from './pages/RescueIncidentDetail.jsx';
import HospitalDashboard from './pages/HospitalDashboard.jsx';
import ShelterDashboard from './pages/ShelterDashboard.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PreparednessPage from './pages/PreparednessPage.jsx';
import AccessibilityPage from './pages/AccessibilityPage.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/help/preparedness" element={<PreparednessPage />} />
      <Route path="/help/accessibility" element={<AccessibilityPage />} />

      {/* Citizen / Volunteer / NGO Workspaces */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'ngo']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/report"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'ngo']}>
            <ReportIncident />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/facilities"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'ngo']}>
            <CitizenFacilities />
          </ProtectedRoute>
        }
      />

      {/* EOC / Admin Command Workspaces */}
      <Route
        path="/eoc"
        element={
          <ProtectedRoute allowedRoles={['eoc', 'admin']}>
            <EOCDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eoc/incidents/:id"
        element={
          <ProtectedRoute allowedRoles={['eoc', 'admin']}>
            <EOCIncidentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eoc/directory"
        element={
          <ProtectedRoute allowedRoles={['eoc', 'admin']}>
            <EOCDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eoc/verification"
        element={
          <ProtectedRoute allowedRoles={['eoc', 'admin']}>
            <EOCVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eoc/broadcasts"
        element={
          <ProtectedRoute allowedRoles={['eoc', 'admin']}>
            <EOCBroadcasts />
          </ProtectedRoute>
        }
      />

      {/* Rescue Team Workspaces */}
      <Route
        path="/rescue"
        element={
          <ProtectedRoute allowedRoles={['rescue_team']}>
            <RescueDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rescue/incidents/:id"
        element={
          <ProtectedRoute allowedRoles={['rescue_team']}>
            <RescueIncidentDetail />
          </ProtectedRoute>
        }
      />

      {/* Facility Operations Workspaces */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRoles={['hospital']}>
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shelter"
        element={
          <ProtectedRoute allowedRoles={['shelter']}>
            <ShelterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Profile (all roles) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
