import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center animate-fadeIn">
        <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/30">
          <span className="text-6xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <HomeIcon className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
