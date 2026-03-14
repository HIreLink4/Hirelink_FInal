import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { categoriesAPI, servicesAPI } from '../services/api'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { ClockIcon, CurrencyRupeeIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function CategoryServices() {
  const { slug } = useParams()
  
  const { data: categoryData, isLoading: categoryLoading } = useQuery(
    ['category', slug],
    () => categoriesAPI.getBySlug(slug)
  )
  
  const { data: servicesData, isLoading: servicesLoading } = useQuery(
    ['services', slug],
    () => servicesAPI.getByCategorySlug(slug, { page: 0, size: 20 })
  )

  const category = categoryData?.data?.data
  const services = servicesData?.data?.data?.services || []
  const isLoading = categoryLoading || servicesLoading

  if (isLoading) {
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
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {services.length > 0 ? (
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
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {service.provider?.providerName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{service.provider?.businessName || service.provider?.providerName}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <StarIconSolid className="h-4 w-4 text-amber-400" />
                        <span className="font-medium">{service.provider?.averageRating?.toFixed(1) || '5.0'}</span>
                        <span className="text-gray-400">({service.provider?.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>

                  {/* Service details */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{service.serviceName}</h3>
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
                    <span className="btn-primary text-sm px-4 py-2">
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyRupeeIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services available</h3>
            <p className="text-gray-500 mb-6">Check back later for new services in this category</p>
            <Link to="/categories" className="btn-secondary">
              Browse Other Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
