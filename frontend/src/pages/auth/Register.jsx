import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../context/authStore'
import toast from 'react-hot-toast'
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function Register() {
  const navigate = useNavigate()
  const {
    registerEmail,
    verifyRegistrationOtp,
    resendVerification,
    isLoading,
    error,
    clearError,
  } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState(null)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [otp, setOtp] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm()
  const password = watch('password')

  useEffect(() => {
    setRegisteredEmail(null)
    clearError()
    reset()
  }, [clearError, reset])

  const startResendCountdown = () => {
    setResendCountdown(60)
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleEmailRegister = async (data) => {
    clearError()
    const result = await registerEmail({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    })
    if (result.success) {
      setRegisteredEmail(data.email)
      startResendCountdown()
      toast.success('Registration successful! Check your email.')
    } else {
      toast.error(result.error)
    }
  }

  const handleResendVerification = async () => {
    if (resendCountdown > 0 || !registeredEmail) return
    clearError()
    const result = await resendVerification(registeredEmail)
    if (result.success) {
      startResendCountdown()
      toast.success('Verification code resent!')
    } else {
      toast.error(result.error)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setVerifyingOtp(true)
    const result = await verifyRegistrationOtp(registeredEmail, otp)
    setVerifyingOtp(false)

    if (result.success) {
      toast.success('Email verified successfully! Welcome to HireLink.')
      navigate('/')
    } else {
      toast.error(result.error || 'Invalid verification code')
    }
  }

  // ===== Email "check your inbox" screen =====
  if (registeredEmail) {
    return (
      <div className="animate-fadeIn">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <EnvelopeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-500 mt-3">We've sent a 6-digit verification code to</p>
          <p className="text-primary-600 font-semibold mt-1">{registeredEmail}</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
            <input 
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="input text-center text-2xl tracking-[1em] font-mono py-4"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={verifyingOtp || otp.length < 6}
            className="w-full btn-primary py-3.5 text-lg"
          >
            {verifyingOtp ? (
              <span className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Verifying...
              </span>
            ) : 'Verify & Continue'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-4">
          <p className="text-sm text-gray-500">Didn't receive the code?</p>
          <button 
            onClick={handleResendVerification} 
            disabled={resendCountdown > 0 || isLoading}
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 mt-6">{error}</div>}

        <p className="text-center text-gray-600 mt-8">
          Need help? <a href="#" className="text-primary-600 hover:underline">Contact Support</a>
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-2">Join HireLink to get started</p>
      </div>

      <form onSubmit={handleSubmit(handleEmailRegister)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              className={`input pl-12 ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe" />
          </div>
          {errors.name && <p className="text-red-500 text-sm mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email address' }
              })}
              className={`input pl-12 ${errors.email ? 'input-error' : ''}`}
              placeholder="john@example.com" />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>}
          <p className="text-xs text-gray-500 mt-2">We'll send a verification code to this email</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="tel"
              {...register('phone', { 
                required: 'Phone number is required', 
                pattern: { value: /^[+]?[0-9]{10,15}$/, message: 'Enter a valid phone number' } 
              })}
              className={`input pl-12 ${errors.phone ? 'input-error' : ''}`}
              placeholder="+91 9876543210" />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1.5">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
              className={`input pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
              placeholder="Minimum 8 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <CheckCircleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword', { required: 'Please confirm your password', validate: value => value === password || 'Passwords do not match' })}
              className={`input pl-12 ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Re-enter your password" />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start">
          <input type="checkbox"
            {...register('terms', { required: 'You must accept the terms' })}
            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <label className="ml-2 text-sm text-gray-600">
            I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

        <button type="submit" disabled={isLoading} className="w-full btn-primary py-3.5 text-lg mt-2">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
