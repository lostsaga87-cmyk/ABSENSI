/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Violations from './pages/Violations';
import Grades from './pages/Grades';
import Geofencing from './pages/Geofencing';
import Profile from './pages/Profile';
import MenuUser from './pages/MenuUser';
import About from './pages/About';

export default function App() {
  return (
    <AppDataProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="violations" element={<Violations />} />
            <Route path="grades" element={<Grades />} />
            <Route path="geofencing" element={<Geofencing />} />
            <Route path="profile" element={<Profile />} />
            <Route path="menu" element={<MenuUser />} />
            <Route path="about" element={<About />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppDataProvider>
  );
}
