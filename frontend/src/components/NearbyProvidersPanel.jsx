import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { providersAPI } from '../services/api'
import { 
  MapPinIcon, 
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

/**
 * Floating button + slide-out panel for nearby providers
 * Accessible from anywhere in the app
 */
export default function NearbyProvidersPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)

  // Nearby providers query
  const { data: nearbyData, isLoading, refetch } = useQuery(
    ['nearbyProviders', userLocation?.lat, userLocation?.lng],
    () => providersAPI.getNearbyByLocation(userLocation.lat, userLocation.lng, 15),
    { enabled: !!userLocation }
  )

  const nearbyProviders = nearbyData?.data?.data || []

  const detectLocation = () => {
    setIsDetecting(true)
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      setIsDetecting(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsDetecting(false)
      },
      (error) => {
        setLocationError('Location access denied')
        setIsDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Auto-detect location when panel opens for the first time
  useEffect(() => {
    if (isOpen && !userLocation && !locationError) {
      detectLocation()
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
        title="Find Nearby Providers"
      >
        <MapPinIcon className="h-6 w-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Nearby Providers
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPinIcon className="h-6 w-6" />
              Nearby Providers
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-emerald-100 text-sm">
            Service providers in your area
          </p>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-120px)] overflow-y-auto">
          {!userLocation && !isDetecting && !locationError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <MapPinIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enable Location</h3>
              <p className="text-gray-500 text-sm mb-6">
                Allow location access to find providers near you
              </p>
              <button onClick={detectLocation} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                Detect My Location
              </button>
            </div>
          )}

          {isDetecting && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Detecting your location...</p>
            </div>
          )}

          {locationError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location Error</h3>
              <p className="text-gray-500 text-sm mb-6">{locationError}</p>
              <button onClick={detectLocation} className="btn-secondary">
                Try Again
              </button>
            </div>
          )}

          {userLocation && isLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {userLocation && !isLoading && nearbyProviders.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                Found {nearbyProviders.length} providers within 15km
              </p>
              {nearbyProviders.map((provider) => (
                <Link
                  key={provider.providerId}
                  to={`/providers/${provider.providerId}`}
                  onClick={() => setIsOpen(false)}
                  className="block bg-gray-50 hover:bg-emerald-50 rounded-xl p-4 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {provider.providerName?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {provider.businessName || provider.providerName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="h-4 w-4 text-amber-400" />
                          <span className="font-medium">{provider.averageRating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{provider.completedBookings || 0} jobs</span>
                      </div>
                      {provider.serviceCategories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.serviceCategories.slice(0, 2).map((cat, i) => (
                            <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {userLocation && !isLoading && nearbyProviders.length === 0 && (
            <div className="text-center py-12">
              <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No providers nearby</h3>
              <p className="text-gray-500 text-sm mb-6">
                We couldn't find providers in your area yet.
              </p>
              <Link 
                to="/categories" 
                onClick={() => setIsOpen(false)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700"
              >
                Browse All Services
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {userLocation && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
            <button 
              onClick={() => { setUserLocation(null); detectLocation(); }}
              className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Refresh Location
            </button>
          </div>
        )}
      </div>
    </>
  )
}
