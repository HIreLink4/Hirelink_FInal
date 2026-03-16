import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { servicesAPI, providersAPI } from '../services/api'
import SearchBar from '../components/SearchBar'
import { 
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  FunnelIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const TABS = [
  { id: 'services', label: 'Services', icon: Squares2X2Icon },
  { id: 'providers', label: 'Providers', icon: UserGroupIcon },
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const location = searchParams.get('loc') || ''
  const [activeTab, setActiveTab] = useState('services')
  const [searchQuery, setSearchQuery] = useState(query)
  const [locationQuery, setLocationQuery] = useState(location)

  // Fetch services
  const { data: servicesData, isLoading: servicesLoading } = useQuery(
    ['searchServices', query, location],
    () => servicesAPI.search(query, { location, page: 0, size: 20 }),
    { enabled: !!query }
  )

  // Fetch providers from backend
  const { data: providersData, isLoading: providersLoading } = useQuery(
    ['searchProviders', query, location],
    () => providersAPI.search(query, { location, page: 0, size: 20 }),
    { enabled: !!query }
  )
  
  const services = servicesData?.data?.data?.services || []
  const providers = providersData?.data?.data?.providers || []

  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery, loc: locationQuery })
    setSearchQuery(newQuery)
  }

  const handleLocationChange = (e) => {
    setLocationQuery(e.target.value)
  }

  const handleLocationSubmit = (e) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery, loc: locationQuery })
  }

  const clearLocation = () => {
    setLocationQuery('')
    setSearchParams({ q: searchQuery, loc: '' })
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'HireLink-App' } }
          )
          const data = await response.json()
          const locName = data.address?.city || data.address?.town || data.address?.village || data.address?.state || ''
          if (locName) {
            setLocationQuery(locName)
            setSearchParams({ q: searchQuery, loc: locName })
          }
        } catch (err) {
          console.error('Error detecting location:', err)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
      }
    )
  }

  useEffect(() => {
    setSearchQuery(query)
    setLocationQuery(location)
  }, [query, location])

  const isLoading = servicesLoading || providersLoading
  const totalResults = services.length + providers.length

  return (
    <div className="animate-fadeIn">
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">Search Results</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                placeholder="Search services, providers..."
                variant="hero"
                onSearch={handleSearch}
                autoFocus={!query}
              />
            </div>
            <div className="md:w-72 lg:w-80">
              <form onSubmit={handleLocationSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-primary-300 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={handleLocationChange}
                  placeholder="City, District, State or Pincode..."
                  className="w-full h-[58px] bg-white/10 border border-white/20 text-white placeholder-primary-200 rounded-2xl py-3 pl-11 pr-24 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all text-sm"
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {locationQuery && (
                    <button 
                      type="button"
                      onClick={clearLocation}
                      className="p-1 text-primary-200 hover:text-white transition-colors"
                      title="Clear location"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={detectLocation}
                    className="p-1 text-primary-200 hover:text-white transition-colors"
                    title="Detect my location"
                  >
                    <MapPinIcon className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-colors shadow-sm"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          {query && !isLoading && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-primary-100">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
              </p>
              {location && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                  <MapPinIcon className="h-3 w-3" />
                  {location}
                  <button onClick={clearLocation} className="hover:text-red-300">×</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!query ? (
          // No query state
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Search for services
            </h3>
            <p className="text-gray-500">
              Enter a search term to find services and providers
            </p>
          </div>
        ) : isLoading ? (
          // Loading state
          <div className="animate-pulse space-y-6">
            <div className="flex gap-4 mb-6">
              {[1, 2].map(i => (
                <div key={i} className="h-10 w-28 bg-gray-200 rounded-full"></div>
              ))}
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
              {TABS.map(tab => {
                const count = tab.id === 'services' ? services.length : providers.length
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Results */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <Link
                      key={service.serviceId}
                      to={`/services/${service.serviceId}`}
                      className={`card p-5 block hover:shadow-lg transition-all animate-slideUp`}
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {service.serviceName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{service.serviceName}</h3>
                              <p className="text-sm text-gray-500">{service.categoryName}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center text-primary-600 font-bold">
                                <CurrencyRupeeIcon className="h-4 w-4" />
                                {service.basePrice}
                              </div>
                              {service.averageRating > 0 && (
                                <div className="flex items-center gap-1 text-sm mt-1">
                                  <StarIconSolid className="h-4 w-4 text-amber-400" />
                                  <span className="font-medium">{service.averageRating?.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {service.shortDescription && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{service.shortDescription}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            {service.providerName && (
                              <span>by {service.providerName}</span>
                            )}
                            {service.estimatedDuration && (
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{service.estimatedDuration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Squares2X2Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No services found for "{query}"</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="grid md:grid-cols-2 gap-4">
                {providers.length > 0 ? (
                  providers.map((provider, index) => (
                    <Link
                      key={provider.providerId}
                      to={`/providers/${provider.providerId}`}
                      className={`card p-5 block hover:shadow-lg transition-all animate-slideUp`}
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {provider.providerName?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{provider.businessName || provider.providerName}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <StarIconSolid className="h-4 w-4 text-amber-400" />
                              <span className="font-medium">{provider.averageRating?.toFixed(1) || '5.0'}</span>
                            </div>
                            <span className="text-gray-400">({provider.totalReviews || 0} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        {provider.completedBookings || 0} jobs completed
                      </div>
                      {provider.serviceCategories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {provider.serviceCategories.slice(0, 3).map((cat, i) => (
                            <span key={i} className="badge-primary">{cat}</span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 col-span-2">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No providers found for "{query}"</p>
                  </div>
                )}
              </div>
            )}

            {/* No results at all */}
            {totalResults === 0 && (
              <div className="text-center py-16">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find anything matching "{query}"
                </p>
                <Link to="/categories" className="btn-primary">
                  Browse All Services
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
