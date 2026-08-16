import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import OnboardingPage from "@/features/onboarding/OnboardingPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import ExerciseLibraryPage from "@/features/exercises/ExerciseLibraryPage";
import TrainingSessionPage from "@/features/training/TrainingSessionPage";
import ProgressPage from "@/features/progress/ProgressPage";
import ProfilePage from "@/features/profile/ProfilePage";

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <ExerciseLibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/:sessionId"
        element={
          <ProtectedRoute>
            <TrainingSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

