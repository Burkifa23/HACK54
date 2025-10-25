import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { initializeApp } from './utils/initialize';

// Pages
import { HomePage } from './pages/HomePage';
import { SymptomTracker } from './pages/SymptomTracker';
import { PharmacyFinder } from './pages/PharmacyFinder';
import { Blog } from './pages/Blog';
import { Login } from './pages/Login';
import { PharmacyDashboard } from './pages/PharmacyDashboard';
import { PharmacyInventory } from './pages/PharmacyInventory';
import { AdminDashboard } from './pages/AdminDashboard';

// Placeholder components for remaining admin pages
import { AdminDataManagement } from './pages/AdminDataManagement';
import { AdminImport } from './pages/AdminImport';
import { AdminBlog } from './pages/AdminBlog';
import { AdminPharmacies } from './pages/AdminPharmacies';

function App() {
  const { user, login, logout, register } = useAuth();

  useEffect(() => {
    // Initialize app with sample data on first load
    initializeApp();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navigation user={user} onLogout={logout} />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/symptoms" element={<SymptomTracker />} />
          <Route path="/pharmacy-finder" element={<PharmacyFinder />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          
          {/* Login Route */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === 'admin'
                      ? '/admin/dashboard'
                      : user.role === 'pharmacy'
                      ? '/pharmacy/dashboard'
                      : '/'
                  }
                  replace
                />
              ) : (
                <Login
                  onLogin={(username, password) => {
                    const loggedInUser = login(username, password);
                    if (loggedInUser) {
                      // Redirect handled by Navigate above
                      return true;
                    }
                    return false;
                  }}
                  onRegister={(username, email, password) => {
                    const newUser = register(username, email, password);
                    return !!newUser;
                  }}
                />
              )
            }
          />

          {/* Pharmacy Routes */}
          <Route
            path="/pharmacy/dashboard"
            element={
              <ProtectedRoute user={user} requiredRole="pharmacy">
                {user && <PharmacyDashboard user={user} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/inventory"
            element={
              <ProtectedRoute user={user} requiredRole="pharmacy">
                {user && <PharmacyInventory user={user} />}
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/data"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminDataManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pharmacies"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminPharmacies />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <a href="/" className="underline">Return to Homepage</a>
      </div>
    </div>
  );
}

export default App;
