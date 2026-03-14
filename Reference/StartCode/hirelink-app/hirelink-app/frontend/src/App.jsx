import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Categories from './pages/Categories'
import CategoryServices from './pages/CategoryServices'
import ServiceDetail from './pages/ServiceDetail'
import ProviderProfile from './pages/ProviderProfile'
import Bookings from './pages/Bookings'
import BookingDetail from './pages/BookingDetail'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryServices />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
        
        {/* Protected Routes */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
