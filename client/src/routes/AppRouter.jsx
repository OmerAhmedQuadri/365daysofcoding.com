import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import Profile from '../pages/account/Profile.jsx';
import Settings from '../pages/account/Settings.jsx';
import Dashboard from '../pages/student/Dashboard.jsx';
import CoursePage from '../pages/student/CoursePage.jsx';
import TopicPage from '../pages/student/TopicPage.jsx';
import LabPage from '../pages/student/LabPage.jsx';
import BootcampHome from '../pages/bootcamper/BootcampHome.jsx';
import BootcampLeaderboard from '../pages/bootcamper/Leaderboard.jsx';
import InstructorDashboard from '../pages/instructor/InstructorDashboard.jsx';
import StudentProgress from '../pages/instructor/StudentProgress.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageCourses from '../pages/admin/ManageCourses.jsx';
import ManageTopics from '../pages/admin/ManageTopics.jsx';
import ManageLabs from '../pages/admin/ManageLabs.jsx';
import ManageTestCases from '../pages/admin/ManageTestCases.jsx';
import ManageBootcamps from '../pages/admin/ManageBootcamps.jsx';
import ManageInstructors from '../pages/admin/ManageInstructors.jsx';
import ManageAdmins from '../pages/admin/ManageAdmins.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/topics/:id" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />
          <Route path="/labs/:id" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
          <Route path="/bootcamp" element={<ProtectedRoute><BootcampHome /></ProtectedRoute>} />
          <Route path="/bootcamp/leaderboard" element={<ProtectedRoute><BootcampLeaderboard /></ProtectedRoute>} />
          <Route path="/instructor" element={<RoleRoute roles={['instructor', 'admin']}><InstructorDashboard /></RoleRoute>} />
          <Route path="/instructor/students/:userId" element={<RoleRoute roles={['instructor', 'admin']}><StudentProgress /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/courses" element={<RoleRoute roles={['admin']}><ManageCourses /></RoleRoute>} />
          <Route path="/admin/courses/:courseId/topics" element={<RoleRoute roles={['admin']}><ManageTopics /></RoleRoute>} />
          <Route path="/admin/topics/:topicId/labs" element={<RoleRoute roles={['admin']}><ManageLabs /></RoleRoute>} />
          <Route path="/admin/labs/:labId/test-cases" element={<RoleRoute roles={['admin']}><ManageTestCases /></RoleRoute>} />
          <Route path="/admin/bootcamps" element={<RoleRoute roles={['admin']}><ManageBootcamps /></RoleRoute>} />
          <Route path="/admin/instructors" element={<RoleRoute roles={['admin']}><ManageInstructors /></RoleRoute>} />
          <Route path="/admin/admins" element={<RoleRoute roles={['admin']}><ManageAdmins /></RoleRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
