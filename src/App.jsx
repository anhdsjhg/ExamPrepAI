import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Public pages
import LoginPage from "./pages/LoginPage";

// User pages
import DashboardPage from "./pages/DashboardPage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailsPage from "./pages/SubjectDetailsPage";
import TestPage from "./pages/TestPage";
import TestReviewPage from "./pages/TestReviewPage";
import ResultsPage from "./pages/ResultsPage";
import ProfilePage from "./pages/ProfilePage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubjects from "./pages/admin/AdminSubjects";
import AdminSubjectDetails from "./pages/admin/AdminSubjectDetails";
import AdminTests from "./pages/admin/AdminTests";
import AdminTestDetails from "./pages/admin/AdminTestDetails";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <SubjectDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <TestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/review"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <TestReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <Navbar />
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navbar />
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navbar />
                <AdminSubjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navbar />
                <AdminSubjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navbar />
                <AdminTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navbar />
                <AdminTestDetails />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
