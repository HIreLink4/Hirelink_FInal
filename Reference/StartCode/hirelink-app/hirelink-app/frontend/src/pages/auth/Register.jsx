import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../context/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState('CUSTOMER')
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    clearError()
    const result = await registerUser({
      ...data,
      userType
    })
    
    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Create Account
      </h2>

      {/* User Type Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setUserType('CUSTOMER')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            userType === 'CUSTOMER' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setUserType('PROVIDER')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            userType === 'PROVIDER' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          Service Provider
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
            className="input"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^[+]?[0-9]{10,15}$/,
                message: 'Enter a valid phone number'
              }
            })}
            className="input"
            placeholder="+91 9876543210"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            {...register('email', { 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address'
              }
            })}
            className="input"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              className="input pr-10"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            className="input"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start">
          <input 
            type="checkbox" 
            {...register('terms', { required: 'You must accept the terms' })}
            className="rounded text-primary-600 mt-1" 
          />
          <label className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-sm">{errors.terms.message}</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
