import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { categoriesAPI, servicesAPI } from '../services/api'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { ClockIcon, CurrencyRupeeIcon, ChevronRightIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function CategoryServices() {
  const { slug } = useParams()
  const [locationQuery, setLocationQuery] = useState('')
  const [activeLocation, setActiveLocation] = useState('')
  
  const { data: categoryData, isLoading: categoryLoading } = useQuery(
    ['category', slug],
    () => categoriesAPI.getBySlug(slug)
  )
  
  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices } = useQuery(
    ['services', slug, activeLocation],
    () => servicesAPI.getByCategorySlug(slug, { location: activeLocation, page: 0, size: 20 })
  )

  const category = categoryData?.data?.data
  const services = servicesData?.data?.data?.services || []
  const isLoading = categoryLoading || servicesLoading

  const handleLocationSearch = (e) => {
    e.preventDefault()
    setActiveLocation(locationQuery)
  }

  if (categoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-primary-200 text-sm mb-3">
                <Link to="/categories" className="hover:text-white transition-colors">Services</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-white">{category?.categoryName}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{category?.categoryName}</h1>
              {category?.categoryDescription && (
                <p className="text-primary-100 text-lg max-w-2xl">{category.categoryDescription}</p>
              )}
            </div>

            {/* Location Search Bar */}
            <div className="w-full md:w-96">
              <form onSubmit={handleLocationSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-primary-300 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Enter City, Pincode or State..."
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-primary-200 rounded-xl py-3.5 pl-11 pr-24 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all text-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-2 inset-y-2 px-4 bg-white text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Search
                </button>
              </form>
              {activeLocation && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-primary-200">Filtering by:</span>
                  <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    {activeLocation}
                    <button onClick={() => { setActiveLocation(''); setLocationQuery(''); }} className="hover:text-red-300">×</button>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {servicesLoading ? (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-64 rounded-2xl"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link 
                key={service.serviceId}
                to={`/services/${service.serviceId}`}
                className={`card-hover animate-slideUp stagger-${(index % 3) + 1}`}
                style={{ animationFillMode: 'both' }}
              >
                <div className="p-6">
                  {/* Provider info */}
                  <div className="flex items-center gap-3 mb-4">
                    {service.provider?.profileImageUrl ? (
                      <img 
                        src={service.provider.profileImageUrl.startsWith('http') 
                          ? service.provider.profileImageUrl 
                          : `${import.meta.env.VITE_API_URL || '/api'}${service.provider.profileImageUrl}`}
                        alt={service.provider?.businessName || service.provider?.providerName}
                        className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                        {service.provider?.providerName?.charAt(0) || 'P'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{service.provider?.businessName || service.provider?.providerName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="h-4 w-4 text-amber-400" />
                          <span className="font-medium">{service.provider?.averageRating?.toFixed(1) || '5.0'}</span>
                          <span className="text-gray-400">({service.provider?.totalReviews || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service details */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{service.serviceName}</h3>
                  
                  {/* Provider Location if available */}
                  {(service.provider?.city || service.provider?.district) && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <MapPinIcon className="h-3 w-3" />
                      <span>{[service.provider.city, service.provider.district].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{service.serviceDescription}</p>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {service.estimatedDurationMinutes && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{service.estimatedDurationMinutes} min</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Starting from</span>
                      <div className="flex items-center text-primary-600">
                        <CurrencyRupeeIcon className="h-5 w-5" />
                        <span className="text-xl font-bold">{service.basePrice}</span>
                      </div>
                    </div>
                    <span className="btn-primary text-sm px-4 py-2 shadow-sm">
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <MapPinIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeLocation ? `No results in "${activeLocation}"` : 'No services available'}
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              {activeLocation 
                ? "Try searching for a different city or removing the filter to see all results." 
                : "Check back later for new services in this category."}
            </p>
            {activeLocation ? (
              <button onClick={() => { setActiveLocation(''); setLocationQuery(''); }} className="btn-primary px-8">
                Clear Filters
              </button>
            ) : (
              <Link to="/categories" className="btn-secondary px-8">
                Browse Other Categories
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
