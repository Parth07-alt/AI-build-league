import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import ClubDashboard from './pages/ClubDashboard';
import ProjectWall from './pages/ProjectWall';
import PassportPage from './pages/PassportPage';
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminFunnel from './pages/admin/AdminFunnel';
import AdminExperiments from './pages/admin/AdminExperiments';
import AdminBudget from './pages/admin/AdminBudget';
import AdminCampuses from './pages/admin/AdminCampuses';
import AdminClubs from './pages/admin/AdminClubs';
import AdminStudents from './pages/admin/AdminStudents';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/:id" element={<StudentDashboard />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/club" element={<ClubDashboard />} />
        <Route path="/projects" element={<ProjectWall />} />
        <Route path="/passport/:studentId" element={<PassportPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="funnel" element={<AdminFunnel />} />
          <Route path="campuses" element={<AdminCampuses />} />
          <Route path="clubs" element={<AdminClubs />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="experiments" element={<AdminExperiments />} />
          <Route path="budget" element={<AdminBudget />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
