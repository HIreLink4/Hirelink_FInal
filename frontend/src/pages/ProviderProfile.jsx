import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { providersAPI } from '../services/api'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { 
  ClockIcon, 
  CurrencyRupeeIcon, 
  MapPinIcon,
  CheckBadgeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function ProviderProfile() {
  const { id } = useParams()

  const { data, isLoading } = useQuery(
    ['provider', id],
    () => providersAPI.getById(id)
  )

  const provider = data?.data?.data

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h2>
        <Link to="/categories" className="btn-primary">Browse Services</Link>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center text-primary-600 text-3xl font-bold shadow-xl">
              {provider.providerName?.charAt(0) || 'P'}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {provider.businessName || provider.providerName}
                </h1>
                {provider.kycStatus === 'VERIFIED' && (
                  <CheckBadgeIcon className="h-6 w-6 text-green-400" />
                )}
              </div>
              {provider.tagline && (
                <p className="text-primary-100 mb-3">{provider.tagline}</p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-100">
                <div className="flex items-center gap-1">
                  <StarIconSolid className="h-5 w-5 text-amber-400" />
                  <span className="font-medium text-white">{provider.averageRating?.toFixed(1) || '5.0'}</span>
                  <span>({provider.totalReviews || 0} reviews)</span>
                </div>
                <span>•</span>
                <span>{provider.completedBookings || 0} jobs completed</span>
                {provider.experienceYears > 0 && (
                  <>
                    <span>•</span>
                    <span>{provider.experienceYears} years exp</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {provider.businessDescription && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{provider.businessDescription}</p>
              </div>
            )}

            {/* Specializations */}
            {provider.specializations?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.specializations.map((spec, i) => (
                    <span key={i} className="badge-primary px-3 py-1">{spec}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Services Offered</h2>
              {provider.services?.length > 0 ? (
                <div className="space-y-4">
                  {provider.services.map((service) => (
                    <Link
                      key={service.serviceId}
                      to={`/services/${service.serviceId}`}
                      className="block p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{service.serviceName}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {service.serviceDescription}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {service.estimatedDurationMinutes && (
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{service.estimatedDurationMinutes} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-primary-600">
                            <CurrencyRupeeIcon className="h-4 w-4" />
                            <span className="font-bold">{service.basePrice}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services listed yet.</p>
              )}
            </div>

            {/* Reviews */}
            {provider.recentReviews?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {provider.recentReviews.map((review) => (
                    <div key={review.reviewId} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {review.reviewerName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewerName}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIconSolid 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.round(review.overallRating) ? 'text-amber-400' : 'text-gray-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-400 ml-auto">{review.createdAt}</span>
                      </div>
                      {review.reviewText && (
                        <p className="text-gray-600 text-sm">{review.reviewText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Provider Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Rating</span>
                  <div className="flex items-center gap-1">
                    <StarIconSolid className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold">{provider.averageRating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Reviews</span>
                  <span className="font-semibold">{provider.totalReviews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Jobs Completed</span>
                  <span className="font-semibold">{provider.completedBookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-semibold">{provider.completionRate?.toFixed(0) || 100}%</span>
                </div>
                {provider.basePincode && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Service Area</span>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="font-semibold">{provider.basePincode}</span>
                    </div>
                  </div>
                )}
                {provider.serviceRadiusKm && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Service Radius</span>
                    <span className="font-semibold">{provider.serviceRadiusKm} km</span>
                  </div>
                )}
              </div>

              {/* Location Info */}
              {provider.baseAddress && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Base Location</h4>
                  <p className="text-sm text-gray-600">{provider.baseAddress}</p>
                  {provider.baseLatitude && provider.baseLongitude && (
                    <a
                      href={`https://www.google.com/maps?q=${provider.baseLatitude},${provider.baseLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-2"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      View on Map
                    </a>
                  )}
                </div>
              )}

              {provider.kycStatus === 'VERIFIED' && (
                <div className="mt-6 p-3 bg-green-50 rounded-xl flex items-center gap-2 text-green-700">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">KYC Verified Provider</span>
                </div>
              )}

              <div className={`mt-6 p-3 rounded-xl flex items-center gap-2 ${
                provider.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {provider.isAvailable ? 'Available for bookings' : 'Currently unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
