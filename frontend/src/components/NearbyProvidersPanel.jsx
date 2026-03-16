import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { providersAPI } from '../services/api'
import { useAuthStore } from '../context/authStore'
import { 
  MapPinIcon, 
  XMarkIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
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
  const [manualQuery, setManualQuery] = useState('')
  const [activeTab, setActiveTab] = useState('nearby') // 'nearby' or 'manual'
  const [manualResults, setManualResults] = useState([])
  const [isManualLoading, setIsManualLoading] = useState(false)
  const [detectedPlaceName, setDetectedPlaceName] = useState('')
  const { isAuthenticated } = useAuthStore()

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`)
      const data = await response.json()
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county || ''
        const state = data.address.state || ''
        const displayName = city ? `${city}${state ? ', ' + state : ''}` : state
        setDetectedPlaceName(displayName)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }

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
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        reverseGeocode(latitude, longitude)
        setIsDetecting(false)
      },
      (error) => {
        setLocationError('Location access denied')
        setIsDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Nearby providers query
  const { data: nearbyData, isLoading, refetch } = useQuery(
    ['nearbyProviders', userLocation?.lat, userLocation?.lng],
    () => providersAPI.getNearbyByLocation(userLocation.lat, userLocation.lng, 15),
    { enabled: !!userLocation && activeTab === 'nearby' }
  )

  const handleManualSearch = async (e) => {
    e.preventDefault()
    if (!manualQuery.trim()) return
    
    setIsManualLoading(true)
    try {
      const response = await providersAPI.searchByLocation(manualQuery)
      setManualResults(response.data.data || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsManualLoading(false)
    }
  }

  const nearbyProviders = activeTab === 'nearby' 
    ? (nearbyData?.data?.data || [])
    : manualResults

  const currentLoading = activeTab === 'nearby' ? isLoading : isManualLoading

  // Auto-detect location when panel opens for the first time
  useEffect(() => {
    if (isOpen && !userLocation && !locationError && activeTab === 'nearby') {
      detectLocation()
    }
  }, [isOpen, activeTab])

  if (!isAuthenticated) return null

  return (
    <>
      {/* Floating Button */}
      <button
        id="location-trigger"
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
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPinIcon className="h-6 w-6" />
              Find Providers
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-emerald-100 text-sm">
            Discover service providers in your location
          </p>

          {/* Tabs */}
          <div className="flex bg-white/10 p-1 rounded-lg mt-4">
            <button 
              onClick={() => setActiveTab('nearby')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'nearby' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <MapPinIcon className="h-4 w-4" />
              Near Me
            </button>
            <button 
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'manual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search City
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSearch} className="mb-6 flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Enter city, district or state..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isManualLoading || !manualQuery.trim()}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Search
              </button>
            </form>
          )}

          {activeTab === 'nearby' && !userLocation && !isDetecting && !locationError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <MapPinIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enable Location</h3>
              <p className="text-gray-500 text-sm mb-6">
                Allow location access to find providers near you
              </p>
              <button onClick={detectLocation} className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full">
                Detect My Location
              </button>
            </div>
          )}

          {activeTab === 'nearby' && isDetecting && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Detecting your location...</p>
            </div>
          )}

          {activeTab === 'nearby' && locationError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location Error</h3>
              <p className="text-gray-500 text-sm mb-6">{locationError}</p>
              <button onClick={detectLocation} className="btn-secondary w-full">
                Try Again
              </button>
            </div>
          )}

          {currentLoading && (
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

          {!currentLoading && nearbyProviders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Found {nearbyProviders.length} providers {activeTab === 'nearby' ? 'within 15km' : `for "${manualQuery}"`}
                </p>
                {activeTab === 'nearby' && detectedPlaceName && (
                  <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {detectedPlaceName}
                  </div>
                )}
              </div>
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
                      {(provider.city || provider.basePincode) && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          <span>{provider.city || provider.basePincode}</span>
                        </div>
                      )}
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

          {!currentLoading && nearbyProviders.length === 0 && (activeTab === 'manual' ? manualQuery : userLocation) && (
            <div className="text-center py-12">
              <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {activeTab === 'nearby' 
                  ? (detectedPlaceName 
                      ? `We couldn't find providers in ${detectedPlaceName} yet.` 
                      : "We couldn't find providers in your area yet.")
                  : `No providers found matching "${manualQuery}"`}
              </p>
              <Link 
                to="/categories" 
                onClick={() => setIsOpen(false)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full"
              >
                Browse All Services
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'nearby' && userLocation && (
          <div className="p-4 bg-gray-50 border-t shrink-0">
            <button 
              onClick={() => { setUserLocation(null); detectLocation(); }}
              className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
            >
              Refresh Location
            </button>
          </div>
        )}
      </div>
    </>
  )
}
