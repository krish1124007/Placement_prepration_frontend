import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Portfolio from "./pages/Portfolio";
import Socials from "./pages/Socials";
import PlansNew from "./pages/PlansNew";
import PlanRoadmap from "./pages/PlanRoadmap";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import Interview from "./pages/Interview";
import DSAInterview from "./pages/DSAInterview";
import InterviewScorecard from "./pages/InterviewScorecard";
import AIPanelInterview from "./pages/AIPanelInterview";
import GitHubCallback from "./pages/GitHubCallback";
import "./App.css";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio/:username/:userId"
                element={<Portfolio />}
              />
              <Route
                path="/socials"
                element={
                  <ProtectedRoute>
                    <Socials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans"
                element={
                  <ProtectedRoute>
                    <PlansNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <Schedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/:sessionId"
                element={
                  <ProtectedRoute>
                    <Interview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dsa-interview/:sessionId"
                element={
                  <ProtectedRoute>
                    <DSAInterview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview-scorecard/:sessionId"
                element={
                  <ProtectedRoute>
                    <InterviewScorecard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-panel-interview/:sessionId"
                element={
                  <ProtectedRoute>
                    <AIPanelInterview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/github-callback"
                element={
                  <ProtectedRoute>
                    <GitHubCallback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plan-roadmap/:id"
                element={
                  <ProtectedRoute>
                    <PlanRoadmap />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
