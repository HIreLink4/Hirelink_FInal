import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { categoriesAPI } from '../services/api'
import { 
  BoltIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  HomeModernIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
  TruckIcon,
  WifiIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'

const categoryIcons = {
  electrical: BoltIcon,
  plumbing: WrenchScrewdriverIcon,
  cleaning: SparklesIcon,
  carpentry: HomeModernIcon,
  'ac-repair': ComputerDesktopIcon,
  painting: PaintBrushIcon,
  moving: TruckIcon,
  appliances: WifiIcon,
}

const categoryColors = {
  electrical: 'from-amber-400 to-orange-500',
  plumbing: 'from-blue-400 to-cyan-500',
  cleaning: 'from-emerald-400 to-green-500',
  carpentry: 'from-orange-400 to-amber-500',
  'ac-repair': 'from-sky-400 to-blue-500',
  painting: 'from-purple-400 to-pink-500',
  moving: 'from-rose-400 to-red-500',
  appliances: 'from-teal-400 to-cyan-500',
}

export default function Categories() {
  const { data, isLoading } = useQuery('allCategories', categoriesAPI.getAll)
  const categories = data?.data?.data || []

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-2xl"></div>
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">All Services</h1>
          <p className="text-primary-100 text-lg">Browse our wide range of home services</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.categorySlug] || Squares2X2Icon
            const gradient = categoryColors[category.categorySlug] || 'from-gray-400 to-gray-500'
            
            return (
              <Link 
                key={category.categoryId}
                to={`/categories/${category.categorySlug}`}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slideUp stagger-${(index % 4) + 1}`}
                style={{ animationFillMode: 'both' }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative p-6 lg:p-8 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors text-lg">
                    {category.categoryName}
                  </h3>
                  {category.serviceCount > 0 && (
                    <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mt-1">
                      {category.serviceCount} services
                    </p>
                  )}
                  {category.categoryDescription && (
                    <p className="text-sm text-gray-400 group-hover:text-white/70 transition-colors mt-2 line-clamp-2">
                      {category.categoryDescription}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <Squares2X2Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-500">Check back later for new services</p>
          </div>
        )}
      </div>
    </div>
  )
}
