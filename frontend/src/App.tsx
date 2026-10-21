import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import { AppProvider } from "./context/AppContext";
import { theme } from "./theme";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import ExercisesPage from "./pages/ExercisesPage";
import FeedPage from "./pages/FeedPage";
import HistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RoutineDetailPage from "./pages/RoutineDetailPage";
import RoutineEditorPage from "./pages/RoutineEditorPage";
import RoutinesPage from "./pages/RoutinesPage";
import SettingsPage from "./pages/SettingsPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";
import "./styles/app.css";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AppProvider>
        <BrowserRouter>
          <div className="app-shell">
            <NavBar />
            <main>
              <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/exercises" element={<ExercisesPage />} />
                <Route path="/routines" element={<RoutinesPage />} />
                <Route path="/routines/new" element={<RoutineEditorPage />} />
                <Route path="/routines/:id" element={<RoutineDetailPage />} />
                <Route path="/routines/:id/edit" element={<RoutineEditorPage />} />
                <Route path="/workout" element={<ActiveWorkoutPage />} />
                <Route path="/workout/:id" element={<WorkoutDetailPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AppProvider>
    </ChakraProvider>
  );
}

export default App;
