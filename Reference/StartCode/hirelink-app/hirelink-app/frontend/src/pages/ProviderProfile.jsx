import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { providersAPI } from '../services/api'
import { 
  StarIcon, 
  MapPinIcon, 
  PhoneIcon,
  ClockIcon,
  CheckBadgeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/solid'

export default function ProviderProfile() {
  const { id } = useParams()

  const { data: provider, isLoading } = useQuery(
    ['provider', id],
    () => providersAPI.getById(id).then(res => res.data.data),
    { enabled: !!id }
  )

  const { data: services } = useQuery(
    ['provider-services', id],
    () => providersAPI.getServices(id).then(res => res.data.data),
    { enabled: !!id }
  )

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Provider not found</h2>
        <Link to="/categories" className="btn-primary mt-4">Browse Services</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Provider Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {provider.profileImageUrl ? (
              <img 
                src={provider.profileImageUrl} 
                alt={provider.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-600">
                {provider.name?.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
              {provider.kycStatus === 'VERIFIED' && (
                <CheckBadgeIcon className="h-6 w-6 text-blue-500" />
              )}
            </div>
            
            {provider.businessName && (
              <p className="text-gray-600 mb-2">{provider.businessName}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">{provider.averageRating || '0.0'}</span>
                <span>({provider.totalRatings || 0} reviews)</span>
              </div>
              
              <div className="flex items-center gap-1">
                <BriefcaseIcon className="h-4 w-4" />
                <span>{provider.experienceYears || 0} years exp.</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{provider.basePincode}</span>
              </div>
            </div>
            
            {provider.tagline && (
              <p className="mt-3 text-gray-700 italic">"{provider.tagline}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{provider.completedBookings || 0}</p>
          <p className="text-sm text-gray-600">Jobs Done</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{provider.completionRate || 0}%</p>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{provider.serviceRadiusKm || 10}km</p>
          <p className="text-sm text-gray-600">Service Area</p>
        </div>
      </div>

      {/* About */}
      {provider.businessDescription && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700">{provider.businessDescription}</p>
        </div>
      )}

      {/* Services */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h2>
        
        {services && services.length > 0 ? (
          <div className="space-y-4">
            {services.map(service => (
              <Link 
                key={service.serviceId}
                to={`/services/${service.serviceId}`}
                className="block p-4 border rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{service.serviceName}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {service.serviceDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">₹{service.basePrice}</p>
                    <p className="text-xs text-gray-500">{service.priceType?.toLowerCase()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No services listed yet</p>
        )}
      </div>
    </div>
  )
}
