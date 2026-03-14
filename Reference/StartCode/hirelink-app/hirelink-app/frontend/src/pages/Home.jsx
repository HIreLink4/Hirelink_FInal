import { Link } from 'react-router-dom'
import { 
  MagnifyingGlassIcon, 
  BoltIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const categories = [
  { name: 'Electrical', icon: BoltIcon, slug: 'electrical', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Plumbing', icon: WrenchScrewdriverIcon, slug: 'plumbing', color: 'bg-blue-100 text-blue-600' },
  { name: 'Cleaning', icon: SparklesIcon, slug: 'cleaning', color: 'bg-green-100 text-green-600' },
  { name: 'Carpentry', icon: HomeModernIcon, slug: 'carpentry', color: 'bg-amber-100 text-amber-600' },
]

const features = [
  { 
    title: 'Verified Professionals', 
    description: 'All service providers are KYC verified and background checked',
    icon: ShieldCheckIcon 
  },
  { 
    title: 'On-Time Service', 
    description: 'Guaranteed punctual arrival at your scheduled time',
    icon: ClockIcon 
  },
  { 
    title: 'Transparent Pricing', 
    description: 'No hidden charges, know the cost upfront',
    icon: CurrencyRupeeIcon 
  },
  { 
    title: 'Quality Assurance', 
    description: 'Satisfaction guaranteed with every service',
    icon: StarIcon 
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Expert Home Services at Your Doorstep
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Connect with verified local professionals for electrical, plumbing, cleaning, 
              and more. Book instantly, pay securely.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-2 shadow-lg flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="What service do you need?"
                  className="w-full px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <button className="btn-accent px-8 py-3">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Popular Services</h2>
            <p className="text-gray-600 mt-2">Choose from our wide range of home services</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.slug}
                to={`/categories/${category.slug}`}
                className="card p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className={`w-16 h-16 mx-auto rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/categories" className="btn-secondary">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose HireLink?</h2>
            <p className="text-gray-600 mt-2">We ensure quality service every time</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 mx-auto bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="text-gray-600 mt-2">Book a service in 3 easy steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose a Service', desc: 'Browse our categories and select the service you need' },
              { step: '2', title: 'Book a Time', desc: 'Pick a convenient date and time for the service' },
              { step: '3', title: 'Get It Done', desc: 'Our verified professional arrives and completes the job' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-accent-100 mb-8 text-lg">
            Join thousands of satisfied customers who trust HireLink for their home service needs.
          </p>
          <Link to="/register" className="btn bg-white text-accent-600 hover:bg-accent-50 px-8 py-3">
            Sign Up Now - It's Free
          </Link>
        </div>
      </section>
    </div>
  )
}
