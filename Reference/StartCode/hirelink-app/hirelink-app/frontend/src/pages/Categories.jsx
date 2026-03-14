import { Link } from 'react-router-dom'
import { 
  BoltIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  HomeModernIcon,
  PaintBrushIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BugAntIcon,
  FireIcon,
  WrenchIcon
} from '@heroicons/react/24/outline'

const categories = [
  { 
    name: 'Electrical', 
    slug: 'electrical',
    icon: BoltIcon, 
    color: 'bg-yellow-100 text-yellow-600',
    description: 'Wiring, repairs, installations',
    services: ['Fan Installation', 'Wiring Repair', 'Switch Board', 'Inverter Setup']
  },
  { 
    name: 'Plumbing', 
    slug: 'plumbing',
    icon: WrenchScrewdriverIcon, 
    color: 'bg-blue-100 text-blue-600',
    description: 'Pipes, taps, drainage',
    services: ['Tap Repair', 'Pipe Fitting', 'Drainage', 'Water Tank']
  },
  { 
    name: 'Cleaning', 
    slug: 'cleaning',
    icon: SparklesIcon, 
    color: 'bg-green-100 text-green-600',
    description: 'Deep cleaning, sanitization',
    services: ['Home Cleaning', 'Sofa Cleaning', 'Kitchen Deep Clean', 'Bathroom Cleaning']
  },
  { 
    name: 'Carpentry', 
    slug: 'carpentry',
    icon: HomeModernIcon, 
    color: 'bg-amber-100 text-amber-600',
    description: 'Furniture, woodwork',
    services: ['Furniture Repair', 'Door Fitting', 'Cabinet Work', 'Bed Assembly']
  },
  { 
    name: 'Painting', 
    slug: 'painting',
    icon: PaintBrushIcon, 
    color: 'bg-pink-100 text-pink-600',
    description: 'Interior & exterior painting',
    services: ['Wall Painting', 'Texture Painting', 'Wood Polish', 'Waterproofing']
  },
  { 
    name: 'AC & Appliances', 
    slug: 'ac-appliances',
    icon: CpuChipIcon, 
    color: 'bg-cyan-100 text-cyan-600',
    description: 'Repair & maintenance',
    services: ['AC Service', 'AC Installation', 'Fridge Repair', 'Washing Machine']
  },
  { 
    name: 'Masonry', 
    slug: 'masonry',
    icon: FireIcon, 
    color: 'bg-orange-100 text-orange-600',
    description: 'Tiles, flooring, construction',
    services: ['Tile Work', 'Flooring', 'Wall Repair', 'Waterproofing']
  },
  { 
    name: 'Welding', 
    slug: 'welding',
    icon: WrenchIcon, 
    color: 'bg-gray-200 text-gray-600',
    description: 'Metal fabrication & repair',
    services: ['Gate Repair', 'Grill Work', 'Metal Fabrication', 'Welding Repair']
  },
  { 
    name: 'Pest Control', 
    slug: 'pest-control',
    icon: BugAntIcon, 
    color: 'bg-red-100 text-red-600',
    description: 'Insects, termites, rodents',
    services: ['General Pest Control', 'Termite Treatment', 'Cockroach Control', 'Bed Bug Treatment']
  },
  { 
    name: 'Home Security', 
    slug: 'home-security',
    icon: ShieldCheckIcon, 
    color: 'bg-purple-100 text-purple-600',
    description: 'CCTV, locks, alarms',
    services: ['CCTV Installation', 'Smart Lock', 'Alarm System', 'Video Doorbell']
  },
]

export default function Categories() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Services</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our comprehensive range of home services. All our professionals are 
          verified and trained to deliver quality work.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.slug}
            to={`/categories/${category.slug}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <category.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{category.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.services.slice(0, 3).map((service, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {category.services.length > 3 && (
                      <span className="text-xs text-primary-600 px-2 py-1">
                        +{category.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-primary-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Can't find what you're looking for?
        </h2>
        <p className="text-gray-600 mb-4">
          Contact our support team and we'll help you find the right service.
        </p>
        <button className="btn-primary">
          Contact Support
        </button>
      </div>
    </div>
  )
}
