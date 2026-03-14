import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../context/authStore'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  })

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await userAPI.updateProfile(data)
      updateUser(response.data.data)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-primary-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.userType}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email', { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-3 border-b">
              <UserCircleIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 border-b">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{user?.phone}</p>
                {user?.isPhoneVerified && (
                  <span className="text-xs text-green-600">Verified</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 border-b">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
                {user?.isEmailVerified && (
                  <span className="text-xs text-green-600">Verified</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 py-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long' 
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/bookings')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
          >
            <span>My Bookings</span>
            <span className="text-gray-400">→</span>
          </button>
          <button 
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Saved Addresses</span>
            <span className="text-gray-400">→</span>
          </button>
          <button 
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Change Password</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full btn bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        Logout
      </button>
    </div>
  )
}
