import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
// import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import UserHomePage from './pages/UserHomePage';
import MultPage from './pages/MultPage';
import MultGamePage from './pages/MultGamePage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container mx-auto mt-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserHomePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/multiplayer" element={
              <ProtectedRoute>
                <MultPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/multiplayer/game/:gameId/:inviteCode" element={
              <ProtectedRoute>
                <MultGamePage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;