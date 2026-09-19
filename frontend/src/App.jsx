import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import ScrollToTopBottom from './components/common/ScrollToTopBottom';

// Auth
import LoginScreen from './components/auth/LoginScreen';
import OnboardingScreen from './components/auth/OnboardingScreen';

// Student
import StudentDashboard from './components/student/StudentDashboard';
import MyCorresScreen from './components/student/MyCorresScreen';

// Senior
import SeniorDashboard from './components/senior/SeniorDashboard';
import MyJuniorsScreen from './components/senior/MyJuniorsScreen';
import ContributionsScreen from './components/senior/ContributionsScreen';

// Resources
import ResourceDirectory from './components/resources/ResourceDirectory';
import ResourceDetailScreen from './components/resources/ResourceDetailScreen';
import UploadResourceScreen from './components/resources/UploadResourceScreen';
import SavedResourcesScreen from './components/resources/SavedResourcesScreen';

// Q&A
import QAScreen from './components/qa/QAScreen';
import QuestionDetailScreen from './components/qa/QuestionDetailScreen';

// Chat
import ChatScreen from './components/chat/ChatScreen';

// Lineage
import LineageScreen from './components/lineage/LineageScreen';

// Notifications & Profile
import NotificationsScreen from './components/notifications/NotificationsScreen';
import ProfileScreen from './components/profile/ProfileScreen';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsersScreen from './components/admin/AdminUsersScreen';
import AdminBatchesScreen from './components/admin/AdminBatchesScreen';
import AdminAssignmentsScreen from './components/admin/AdminAssignmentsScreen';
import AdminModerationScreen from './components/admin/AdminModerationScreen';

export function App() {
  const { user, token, role, logout, switchPreviewRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [saved, setSaved] = useState(['res-1']);

  const toggleSave = (id) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Maps navigation keys and legacy calls to exact URL paths
  const nav = (key, data = null) => {
    switch (key) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'corres':
        navigate('/corres');
        break;
      case 'juniors':
        navigate('/juniors');
        break;
      case 'contributions':
        navigate('/contributions');
        break;
      case 'resources':
        navigate('/resources', { state: data });
        break;
      case 'upload':
        navigate('/resources/upload', { state: data });
        break;
      case 'resourceDetail': {
        const resId = data?.id || (typeof data === 'string' ? data : '');
        navigate(`/resources/${resId}`, { state: data });
        break;
      }
      case 'saved':
        navigate('/saved');
        break;
      case 'qa':
        navigate('/qa', { state: data });
        break;
      case 'question': {
        const qId = data?.id || (typeof data === 'string' ? data : '');
        navigate(`/qa/${qId}`, { state: data });
        break;
      }
      case 'chat':
        navigate('/chat', { state: data });
        break;
      case 'lineage':
        navigate('/lineage');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'batches':
        navigate('/admin/batches');
        break;
      case 'assignments':
        navigate('/admin/assignments');
        break;
      case 'moderation':
        navigate('/admin/moderation');
        break;
      default:
        navigate(`/${key}`);
        break;
    }
  };

  const handleSearch = (query) => {
    nav('resources', { initialSearch: query });
  };

  // Derive active screen string from current URL pathname
  const getScreenFromPath = (pathname) => {
    if (pathname.startsWith('/resources/upload')) return 'upload';
    if (pathname.startsWith('/resources/')) return 'resourceDetail';
    if (pathname.startsWith('/resources')) return 'resources';
    if (pathname.startsWith('/qa/')) return 'question';
    if (pathname.startsWith('/qa')) return 'qa';
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/batches')) return 'batches';
    if (pathname.startsWith('/admin/assignments')) return 'assignments';
    if (pathname.startsWith('/admin/moderation')) return 'moderation';
    const clean = pathname.replace(/^\//, '').split('/')[0];
    return clean || 'dashboard';
  };

  const screen = getScreenFromPath(location.pathname);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'var(--font-d)',
          fontSize: 20,
          color: 'var(--ink-900)',
        }}
      >
        Loading CorresBuddy…
      </div>
    );
  }

  // Unauthenticated routing
  if (!token) {
    return (
      <Routes>
        <Route
          path="/register"
          element={
            <OnboardingScreen
              onDone={() => navigate('/dashboard')}
              goLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/onboarding"
          element={
            <OnboardingScreen
              onDone={() => navigate('/dashboard')}
              goLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginScreen
              onLogin={() => navigate('/dashboard')}
              goRegister={() => navigate('/register')}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated user visits login or register, redirect to dashboard
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  const isAdmin = user?.email === 'admin@celestia-trichy.me' && (role === 'admin' || user?.role === 'ADMIN');

  // Role-appropriate Dashboard component
  const DashboardComponent =
    isAdmin ? (
      <AdminDashboard />
    ) : role === 'senior' || role === 'alumni' ? (
      <SeniorDashboard nav={nav} user={user} />
    ) : (
      <StudentDashboard nav={nav} user={user} />
    );

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        screen={screen}
        setScreen={(k) => nav(k)}
        setRole={switchPreviewRole}
        user={user}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-col">
        <Topbar
          screen={screen}
          nav={nav}
          user={user}
          onLogout={() => {
            logout();
            navigate('/login');
          }}
          setMobileOpen={setMobileOpen}
          onSearch={handleSearch}
        />

        <main className="content" role="main">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={DashboardComponent} />

            {/* Student & Senior Shared / Specific */}
            <Route path="/corres" element={<MyCorresScreen nav={nav} user={user} />} />
            <Route path="/juniors" element={<MyJuniorsScreen nav={nav} />} />
            <Route path="/contributions" element={<ContributionsScreen />} />

            {/* Resources */}
            <Route
              path="/resources"
              element={<ResourceDirectory nav={nav} saved={saved} toggleSave={toggleSave} />}
            />
            <Route
              path="/resources/upload"
              element={<UploadResourceScreen nav={nav} role={role} screenData={location.state} />}
            />
            <Route
              path="/resources/:id"
              element={
                <ResourceDetailScreen
                  resource={location.state}
                  nav={nav}
                  saved={saved}
                  toggleSave={toggleSave}
                />
              }
            />
            <Route
              path="/saved"
              element={<SavedResourcesScreen saved={saved} nav={nav} toggleSave={toggleSave} />}
            />

            {/* Q&A */}
            <Route path="/qa" element={<QAScreen nav={nav} user={user} />} />
            <Route
              path="/qa/:id"
              element={<QuestionDetailScreen question={location.state} nav={nav} user={user} />}
            />

            {/* Chat & Lineage */}
            <Route path="/chat" element={<ChatScreen user={user} screenData={location.state} />} />
            <Route path="/lineage" element={<LineageScreen user={user} nav={nav} />} />

            {/* Notifications & Profile */}
            <Route path="/notifications" element={<NotificationsScreen />} />
            <Route path="/profile" element={<ProfileScreen role={role} user={user} />} />

            {/* Admin Protected Routes: strictly restricted to admin@celestia-trichy.me */}
            <Route
              path="/admin/users"
              element={isAdmin ? <AdminUsersScreen /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/admin/batches"
              element={isAdmin ? <AdminBatchesScreen /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/admin/assignments"
              element={isAdmin ? <AdminAssignmentsScreen /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/admin/moderation"
              element={isAdmin ? <AdminModerationScreen /> : <Navigate to="/dashboard" replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <Footer />
        <ScrollToTopBottom />
      </div>

      <MobileNav role={role} screen={screen} nav={nav} />
    </div>
  );
}

export default App;
