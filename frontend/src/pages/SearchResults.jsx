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
  ClockIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const TABS = [
  { id: 'services', label: 'Services', icon: Squares2X2Icon },
  { id: 'providers', label: 'Providers', icon: UserGroupIcon },
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [activeTab, setActiveTab] = useState('services')
  const [searchQuery, setSearchQuery] = useState(query)

  // Fetch services
  const { data: servicesData, isLoading: servicesLoading } = useQuery(
    ['searchServices', query],
    () => servicesAPI.search(query, { page: 0, size: 20 }),
    { enabled: !!query }
  )

  // Fetch top-rated providers (we'll filter by query on client side for now)
  const { data: providersData, isLoading: providersLoading } = useQuery(
    ['searchProviders', query],
    () => providersAPI.getTopRated({ page: 0, size: 20 }),
    { enabled: !!query }
  )

  const services = servicesData?.data?.data?.services || []
  // Handle both array and object with providers property
  const allProviders = Array.isArray(providersData?.data?.data) 
    ? providersData.data.data 
    : (providersData?.data?.data?.providers || [])
  
  // Filter providers by query (client-side)
  const providers = query && Array.isArray(allProviders)
    ? allProviders.filter(p => 
        p.businessName?.toLowerCase().includes(query.toLowerCase()) ||
        p.providerName?.toLowerCase().includes(query.toLowerCase()) ||
        p.serviceCategories?.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
      )
    : (Array.isArray(allProviders) ? allProviders : [])

  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery })
    setSearchQuery(newQuery)
  }

  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  const isLoading = servicesLoading || providersLoading
  const totalResults = services.length + providers.length

  return (
    <div className="animate-fadeIn">
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">Search Results</h1>
          <SearchBar 
            placeholder="Search services, providers..."
            variant="hero"
            onSearch={handleSearch}
            autoFocus={!query}
          />
          {query && !isLoading && (
            <p className="mt-4 text-primary-100">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>
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
