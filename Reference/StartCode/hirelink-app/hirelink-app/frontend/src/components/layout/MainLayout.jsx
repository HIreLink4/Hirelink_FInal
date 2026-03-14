import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../context/authStore'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  HomeIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <span className="text-xl font-bold text-primary-700">HireLink</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">
                Home
              </Link>
              <Link to="/categories" className="text-gray-600 hover:text-primary-600 font-medium">
                Services
              </Link>
              {isAuthenticated && (
                <Link to="/bookings" className="text-gray-600 hover:text-primary-600 font-medium">
                  My Bookings
                </Link>
              )}
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="font-medium">{user?.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <Link 
                to="/" 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5 text-gray-500" />
                <span>Home</span>
              </Link>
              <Link 
                to="/categories" 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Squares2X2Icon className="h-5 w-5 text-gray-500" />
                <span>Services</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/bookings" 
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                    <span>My Bookings</span>
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-5 w-5 text-gray-500" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 w-full text-red-600"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-4 border-t">
                  <Link 
                    to="/login" 
                    className="block w-full btn-secondary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-xl">H</span>
                </div>
                <span className="text-xl font-bold">HireLink</span>
              </div>
              <p className="text-primary-200">
                Connecting you with trusted local service providers for all your home needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-200">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/categories" className="hover:text-white">Services</Link></li>
                <li><Link to="/bookings" className="hover:text-white">My Bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Popular Services</h4>
              <ul className="space-y-2 text-primary-200">
                <li><a href="#" className="hover:text-white">Electrical</a></li>
                <li><a href="#" className="hover:text-white">Plumbing</a></li>
                <li><a href="#" className="hover:text-white">Cleaning</a></li>
                <li><a href="#" className="hover:text-white">AC Repair</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-primary-200">
                <li>support@hirelink.com</li>
                <li>1800-XXX-XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-600 mt-8 pt-8 text-center text-primary-200">
            <p>&copy; 2026 HireLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
