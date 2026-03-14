import { Outlet, Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-700 font-bold text-2xl">H</span>
            </div>
            <span className="text-2xl font-bold text-white">HireLink</span>
          </Link>
          <p className="text-primary-200 mt-2">Your trusted service partner</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200 mt-6 text-sm">
          &copy; 2026 HireLink. All rights reserved.
        </p>
      </div>
    </div>
  )
}
