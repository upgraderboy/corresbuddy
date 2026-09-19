import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';

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

  const [phase, setPhase] = useState(() => (localStorage.getItem('token') ? 'app' : 'login'));
  const [screen, setScreen] = useState('dashboard');
  const [screenData, setScreenData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saved, setSaved] = useState(['res-1']);

  const nav = (key, data = null) => {
    setScreen(key);
    setScreenData(data);
    window.scrollTo(0, 0);
  };

  const toggleSave = (id) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSearch = (query) => {
    nav('resources', { initialSearch: query });
  };

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

  if (!token) {
    if (phase === 'onboarding') {
      return (
        <OnboardingScreen
          onDone={() => {
            setPhase('app');
            setScreen('dashboard');
          }}
          goLogin={() => setPhase('login')}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={() => {
          setPhase('app');
          setScreen('dashboard');
        }}
        goRegister={() => setPhase('onboarding')}
      />
    );
  }

  if (phase === 'onboarding') {
    return (
      <OnboardingScreen
        onDone={() => {
          setPhase('app');
          setScreen('dashboard');
        }}
        goLogin={() => setPhase('login')}
      />
    );
  }

  // Determine active view body
  let body;

  if (role === 'student') {
    if (screen === 'dashboard') body = <StudentDashboard nav={nav} user={user} />;
    else if (screen === 'corres') body = <MyCorresScreen nav={nav} user={user} />;
    else if (screen === 'resources')
      body = <ResourceDirectory nav={nav} saved={saved} toggleSave={toggleSave} />;
    else if (screen === 'resourceDetail')
      body = <ResourceDetailScreen resource={screenData} nav={nav} saved={saved} toggleSave={toggleSave} />;
    else if (screen === 'upload') body = <UploadResourceScreen nav={nav} role={role} screenData={screenData} />;
    else if (screen === 'qa') body = <QAScreen nav={nav} user={user} />;
    else if (screen === 'question')
      body = <QuestionDetailScreen question={screenData} nav={nav} user={user} />;
    else if (screen === 'chat') body = <ChatScreen user={user} screenData={screenData} />;
    else if (screen === 'lineage') body = <LineageScreen user={user} nav={nav} />;
    else if (screen === 'saved')
      body = <SavedResourcesScreen saved={saved} nav={nav} toggleSave={toggleSave} />;
    else if (screen === 'notifications') body = <NotificationsScreen />;
    else if (screen === 'profile') body = <ProfileScreen role={role} user={user} />;
  } else if (role === 'senior' || role === 'alumni') {
    if (screen === 'dashboard') body = <SeniorDashboard nav={nav} user={user} />;
    else if (screen === 'juniors') body = <MyJuniorsScreen nav={nav} />;
    else if (screen === 'resources')
      body = <ResourceDirectory nav={nav} saved={saved} toggleSave={toggleSave} />;
    else if (screen === 'resourceDetail')
      body = <ResourceDetailScreen resource={screenData} nav={nav} saved={saved} toggleSave={toggleSave} />;
    else if (screen === 'upload') body = <UploadResourceScreen nav={nav} role={role} screenData={screenData} />;
    else if (screen === 'qa') body = <QAScreen nav={nav} user={user} />;
    else if (screen === 'question')
      body = <QuestionDetailScreen question={screenData} nav={nav} user={user} />;
    else if (screen === 'chat') body = <ChatScreen user={user} screenData={screenData} />;
    else if (screen === 'contributions') body = <ContributionsScreen />;
    else if (screen === 'notifications') body = <NotificationsScreen />;
    else if (screen === 'profile') body = <ProfileScreen role={role} user={user} />;
  } else {
    // Admin
    if (screen === 'dashboard') body = <AdminDashboard />;
    else if (screen === 'users') body = <AdminUsersScreen />;
    else if (screen === 'batches') body = <AdminBatchesScreen />;
    else if (screen === 'assignments') body = <AdminAssignmentsScreen />;
    else if (screen === 'resources')
      body = <ResourceDirectory nav={nav} saved={saved} toggleSave={toggleSave} />;
    else if (screen === 'resourceDetail')
      body = <ResourceDetailScreen resource={screenData} nav={nav} saved={saved} toggleSave={toggleSave} />;
    else if (screen === 'moderation') body = <AdminModerationScreen />;
  }

  if (!body) {
    body =
      role === 'student' ? (
        <StudentDashboard nav={nav} user={user} />
      ) : role === 'senior' || role === 'alumni' ? (
        <SeniorDashboard nav={nav} user={user} />
      ) : (
        <AdminDashboard />
      );
  }

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
          onLogout={() => {
            logout();
            setPhase('login');
          }}
          setMobileOpen={setMobileOpen}
          onSearch={handleSearch}
        />

        <div className="content">{body}</div>
      </div>

      <MobileNav role={role} screen={screen} nav={nav} />
    </div>
  );
}

export default App;

