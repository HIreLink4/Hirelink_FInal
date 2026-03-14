import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../context/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    clearError()
    const result = await login(data.phone, data.password)
    
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Welcome Back
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="rounded text-primary-600" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-primary-600 hover:underline">
            Forgot password?
          </a>
        </div>

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
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
