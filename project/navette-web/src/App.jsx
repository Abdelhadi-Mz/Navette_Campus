import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Shuttles from './pages/Shuttles';
import Stops from './pages/Stops';
import Trips from './pages/Trips';
import Map from './pages/Map';
import Navbar from './components/Navbar';

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="app-main">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/shuttles" element={
            <ProtectedRoute>
              <AppLayout><Shuttles /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/stops" element={
            <ProtectedRoute>
              <AppLayout><Stops /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/trips" element={
            <ProtectedRoute>
              <AppLayout><Trips /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <AppLayout><Map /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
