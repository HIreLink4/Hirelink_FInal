import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid'
import { FunnelIcon } from '@heroicons/react/24/outline'

// Mock data - in real app, fetch from API
const servicesData = {
  electrical: {
    name: 'Electrical',
    services: [
      { id: 1, name: 'Fan Installation', price: 299, rating: 4.8, reviews: 234, duration: '30-45 mins', provider: 'Ramesh Electrical', providerId: 1 },
      { id: 2, name: 'Switch Board Repair', price: 199, rating: 4.7, reviews: 189, duration: '20-30 mins', provider: 'Suresh Electric Works', providerId: 2 },
      { id: 3, name: 'Wiring Repair', price: 499, rating: 4.9, reviews: 312, duration: '1-2 hours', provider: 'Ramesh Electrical', providerId: 1 },
      { id: 4, name: 'MCB/Fuse Replacement', price: 249, rating: 4.6, reviews: 156, duration: '15-30 mins', provider: 'City Electricians', providerId: 3 },
      { id: 5, name: 'Inverter Installation', price: 799, rating: 4.8, reviews: 98, duration: '1-2 hours', provider: 'Power Solutions', providerId: 4 },
      { id: 6, name: 'Chandelier Installation', price: 599, rating: 4.5, reviews: 67, duration: '45-60 mins', provider: 'Ramesh Electrical', providerId: 1 },
    ]
  },
  plumbing: {
    name: 'Plumbing',
    services: [
      { id: 7, name: 'Tap Repair/Replacement', price: 199, rating: 4.7, reviews: 445, duration: '20-30 mins', provider: 'Quick Plumbers', providerId: 5 },
      { id: 8, name: 'Pipe Leakage Fix', price: 349, rating: 4.8, reviews: 321, duration: '30-60 mins', provider: 'Metro Plumbing', providerId: 6 },
      { id: 9, name: 'Drainage Cleaning', price: 499, rating: 4.6, reviews: 234, duration: '1-2 hours', provider: 'Quick Plumbers', providerId: 5 },
      { id: 10, name: 'Toilet Repair', price: 299, rating: 4.5, reviews: 189, duration: '30-45 mins', provider: 'City Plumbers', providerId: 7 },
    ]
  },
  cleaning: {
    name: 'Cleaning',
    services: [
      { id: 11, name: 'Full Home Deep Cleaning', price: 2499, rating: 4.9, reviews: 567, duration: '4-6 hours', provider: 'CleanPro Services', providerId: 8 },
      { id: 12, name: 'Kitchen Deep Cleaning', price: 999, rating: 4.8, reviews: 432, duration: '2-3 hours', provider: 'Sparkle Clean', providerId: 9 },
      { id: 13, name: 'Bathroom Cleaning', price: 499, rating: 4.7, reviews: 345, duration: '1-2 hours', provider: 'CleanPro Services', providerId: 8 },
      { id: 14, name: 'Sofa/Carpet Cleaning', price: 799, rating: 4.6, reviews: 234, duration: '2-3 hours', provider: 'Fresh Clean', providerId: 10 },
    ]
  }
}

export default function CategoryServices() {
  const { slug } = useParams()
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  
  const category = servicesData[slug] || { name: 'Services', services: [] }

  const sortedServices = [...category.services].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'rating': return b.rating - a.rating
      default: return b.reviews - a.reviews
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2 text-gray-500">
          <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
          <li>/</li>
          <li><Link to="/categories" className="hover:text-primary-600">Services</Link></li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{category.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{category.name} Services</h1>
          <p className="text-gray-600 mt-1">{category.services.length} services available</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2 md:hidden"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedServices.map((service) => (
          <Link 
            key={service.id}
            to={`/services/${service.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                  <StarIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 ml-1">{service.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-4">by {service.provider}</p>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {service.duration}
                </span>
                <span>{service.reviews} reviews</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
                  <span className="text-gray-500 text-sm ml-1">onwards</span>
                </div>
                <button className="btn-primary text-sm">
                  Book Now
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {category.services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found in this category.</p>
          <Link to="/categories" className="text-primary-600 font-medium hover:underline mt-2 inline-block">
            Browse all categories
          </Link>
        </div>
      )}
    </div>
  )
}
