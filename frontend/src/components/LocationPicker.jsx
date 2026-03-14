import { useState, useEffect, useRef } from 'react'
import { 
  MapPinIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

/**
 * LocationPicker Component
 * 
 * Provides location selection via:
 * - Browser geolocation (GPS)
 * - Address search with autocomplete
 * - Manual address entry
 * 
 * Uses OpenStreetMap's Nominatim API for geocoding (free, no API key required)
 */
export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation = null,
  showManualEntry = true,
  className = ''
}) {
  const [location, setLocation] = useState(initialLocation)
  const [address, setAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef(null)
  const resultsRef = useRef(null)

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced address search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length < 3) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(searchQuery)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  /**
   * Get current location using browser's geolocation API
   */
  const getCurrentLocation = () => {
    setIsDetecting(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsDetecting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'HireLink-App'
              }
            }
          )
          
          if (!response.ok) throw new Error('Failed to get address')
          
          const data = await response.json()
          const locationData = {
            latitude,
            longitude,
            address: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village || data.address?.county,
            state: data.address?.state,
            pincode: data.address?.postcode,
            country: data.address?.country
          }
          
          setLocation(locationData)
          setAddress(data.display_name)
          setSearchQuery('')
          onLocationSelect?.(locationData)
        } catch (err) {
          console.error('Reverse geocoding error:', err)
          // Still set coordinates even if reverse geocoding fails
          const locationData = {
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }
          setLocation(locationData)
          onLocationSelect?.(locationData)
        }
        
        setIsDetecting(false)
      },
      (error) => {
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }
        setError(errorMessage)
        setIsDetecting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  /**
   * Search for addresses using Nominatim API
   */
  const searchAddress = async (query) => {
    if (query.length < 3) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'HireLink-App'
          }
        }
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const results = await response.json()
      setSearchResults(results)
      setShowResults(results.length > 0)
    } catch (err) {
      console.error('Address search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Handle selection of a search result
   */
  const handleSelectResult = (result) => {
    const locationData = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || result.address?.county,
      state: result.address?.state,
      pincode: result.address?.postcode,
      country: result.address?.country
    }
    
    setLocation(locationData)
    setAddress(result.display_name)
    setSearchQuery('')
    setShowResults(false)
    setError('')
    onLocationSelect?.(locationData)
  }

  /**
   * Clear selected location
   */
  const clearLocation = () => {
    setLocation(null)
    setAddress('')
    setSearchQuery('')
    setError('')
    onLocationSelect?.(null)
  }

  return (
    <div className={`bg-gray-50 rounded-xl border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-primary-600" />
          <span className="font-medium text-gray-900">Service Location</span>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isDetecting}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDetecting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <MapPinIcon className="h-4 w-4" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Selected Location Display */}
      {location && (
        <div className="bg-white border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Location Selected</p>
                <p className="text-sm text-gray-600 mt-1">{location.address || address}</p>
                {location.city && (
                  <p className="text-xs text-gray-500 mt-1">
                    {location.city}{location.state ? `, ${location.state}` : ''}
                    {location.pincode ? ` - ${location.pincode}` : ''}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Coordinates: {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearLocation}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Address Search */}
      {showManualEntry && (
        <div className="relative" ref={resultsRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for address
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search address..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={result.place_id || index}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <p className="text-sm text-gray-900 line-clamp-2">{result.display_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.address?.city || result.address?.town || result.address?.village || 'Unknown location'}
                    {result.address?.state ? `, ${result.address.state}` : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-3">
        Click "Use Current Location" to auto-detect, or search for an address above.
      </p>
    </div>
  )
}
