import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { userAPI, providersAPI, categoriesAPI } from '../services/api'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  LinkIcon,
  ClockIcon,
  CameraIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import LocationPicker from '../components/LocationPicker'

export default function Profile() {
  const { user, updateUser, setPassword } = useAuthStore()
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [addressLocation, setAddressLocation] = useState(null)

  // Email verification state
  const [emailVerifyMethod, setEmailVerifyMethod] = useState(null) // 'otp' | 'link'
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtp, setEmailOtp] = useState('')
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false)
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(0)
  const [linkSent, setLinkSent] = useState(false)

  useEffect(() => {
    if (emailOtpCountdown > 0) {
      const timer = setTimeout(() => setEmailOtpCountdown(emailOtpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [emailOtpCountdown])

  const handleSendEmailOtp = async () => {
    setEmailVerifyLoading(true)
    try {
      await userAPI.sendEmailOtp()
      setEmailOtpSent(true)
      setEmailOtpCountdown(60)
      toast.success('OTP sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setEmailVerifyLoading(false)
    }
  }

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    setEmailVerifyLoading(true)
    try {
      const response = await userAPI.verifyEmailOtp(emailOtp)
      const updatedUser = response.data.data
      updateUser(updatedUser)
      setEmailVerifyMethod(null)
      setEmailOtpSent(false)
      setEmailOtp('')
      toast.success('Email verified successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setEmailVerifyLoading(false)
    }
  }

  const handleSendVerificationLink = async () => {
    setEmailVerifyLoading(true)
    try {
      await userAPI.sendVerificationLink()
      setLinkSent(true)
      toast.success('Verification link sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification link')
    } finally {
      setEmailVerifyLoading(false)
    }
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, watch: watchPassword, formState: { errors: passwordErrors } } = useForm()

  const { register: registerAddress, handleSubmit: handleAddressSubmit, reset: resetAddress, setValue: setAddressValue, formState: { errors: addressErrors } } = useForm()

  // Handle location selection for address form
  const handleAddressLocationSelect = (location) => {
    setAddressLocation(location)
    if (location) {
      if (location.address) {
        setAddressValue('addressLine1', location.address.split(',')[0] || '')
      }
      if (location.city) {
        setAddressValue('city', location.city)
      }
      if (location.state) {
        setAddressValue('state', location.state)
      }
      if (location.pincode) {
        setAddressValue('pincode', location.pincode)
      }
    }
  }

  const { data: addressData, isLoading: addressLoading } = useQuery(
    'addresses',
    userAPI.getAddresses
  )

  const updateMutation = useMutation(
    (data) => userAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.data.data)
        toast.success('Profile updated successfully')
        setEditMode(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  const addAddressMutation = useMutation(
    (data) => userAPI.addAddress(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses')
        toast.success('Address added successfully')
        setShowAddressForm(false)
        resetAddress()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add address')
      }
    }
  )

  const deleteAddressMutation = useMutation(
    (id) => userAPI.deleteAddress(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses')
        toast.success('Address deleted')
      }
    }
  )

  const addresses = addressData?.data?.data || []

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  const onAddAddress = (data) => {
    addAddressMutation.mutate(data)
  }

  const onSetPassword = async (data) => {
    setIsSettingPassword(true)
    const result = await setPassword(data.password)
    setIsSettingPassword(false)
    
    if (result.success) {
      toast.success('Password set successfully! You can now login with your phone/email and password.')
      setShowPasswordForm(false)
      resetPassword()
    } else {
      toast.error(result.error)
    }
  }

  const uploadProfileMutation = useMutation(
    (file) => userAPI.uploadProfilePicture(file),
    {
      onSuccess: (response) => {
        updateUser(response.data.data)
        toast.success('Profile picture updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile picture')
      }
    }
  )

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      uploadProfileMutation.mutate(file)
    }
  }

  // Check if user is verified (can set password)
  const isVerified = user?.isPhoneVerified || user?.isEmailVerified
  const hasPassword = user?.hasPassword
  const isGoogleUser = user?.authProvider === 'GOOGLE'
  const isProvider = user?.roles?.includes('PROVIDER') || user?.userType === 'PROVIDER'

  const [editProviderMode, setEditProviderMode] = useState(false)

  const { data: providerData, isLoading: providerLoading, isError: providerError } = useQuery(
    'providerProfile',
    () => providersAPI.getMyProfile(),
    {
      enabled: !!isProvider,
      staleTime: 0,
      refetchOnMount: true,
      retry: 1,
    }
  )
  const providerProfile = providerData?.data?.data

  const updateProviderMutation = useMutation(
    (data) => providersAPI.updateMyProfile({
      businessName: data.businessName,
      businessDescription: data.businessDescription,
      tagline: data.tagline,
      experienceYears: parseInt(data.experienceYears, 10) || 0,
      serviceRadiusKm: parseInt(data.serviceRadiusKm, 10) || 10
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('providerProfile')
        toast.success('Provider details updated successfully')
        setEditProviderMode(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update provider details')
      }
    }
  )

  const [editingService, setEditingService] = useState(null)

  const updateServiceMutation = useMutation(
    ({ serviceId, data }) => providersAPI.updateService(serviceId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('providerProfile')
        toast.success('Service updated successfully')
        setEditingService(null)
        resetEditService()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update service')
      }
    }
  )

  const { register: registerEditService, handleSubmit: handleEditServiceSubmit, reset: resetEditService, formState: { errors: editServiceErrors } } = useForm()

  const handleEditClick = (service) => {
    setEditingService(service)
    resetEditService({
      serviceName: service.serviceName,
      basePrice: service.basePrice,
      serviceDescription: service.serviceDescription,
      isActive: service.isActive
    })
  }

  const onUpdateService = (data) => {
    updateServiceMutation.mutate({
      serviceId: editingService.serviceId,
      data: {
        ...data,
        basePrice: parseFloat(data.basePrice)
      }
    })
  }

  const { register: registerProvider, handleSubmit: handleProviderSubmit, reset: resetProvider, formState: { errors: providerErrors } } = useForm()

  useEffect(() => {
    if (providerProfile && !editProviderMode) {
      resetProvider({
        businessName: providerProfile.businessName || '',
        businessDescription: providerProfile.businessDescription || '',
        tagline: providerProfile.tagline || '',
        experienceYears: providerProfile.experienceYears || 0,
        serviceRadiusKm: providerProfile.serviceRadiusKm || 10
      })
    }
  }, [providerProfile, editProviderMode, resetProvider])

  const [showAddServiceForm, setShowAddServiceForm] = useState(false)
  const { data: categoriesData } = useQuery(
    'providerCategories', 
    () => categoriesAPI.getAll({ hideEmpty: false }),
    {
      staleTime: 0,
      refetchOnMount: true
    }
  )
  const categories = categoriesData?.data?.data || []

  const addServiceMutation = useMutation(
    (data) => providersAPI.addService(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('providerProfile')
        toast.success('Service added successfully')
        setShowAddServiceForm(false)
        resetAddService()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add service')
      }
    }
  )

  const { register: registerAddService, handleSubmit: handleAddServiceSubmit, reset: resetAddService, formState: { errors: addServiceErrors } } = useForm()

  const onAddService = (data) => {
    addServiceMutation.mutate({
      ...data,
      basePrice: parseFloat(data.basePrice),
      categoryId: parseInt(data.categoryId, 10)
    })
  }

  const onProviderSubmit = (data) => {
    updateProviderMutation.mutate(data)
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {user?.profileImageUrl ? (
                <>
                  <img 
                    src={user.profileImageUrl.startsWith('http') 
                      ? user.profileImageUrl 
                      : `${import.meta.env.VITE_API_URL || '/api'}${user.profileImageUrl}`} 
                    alt={user.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = 'flex';
                      }
                    }}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                  <div className="w-20 h-20 bg-white rounded-full items-center justify-center text-primary-600 text-2xl font-bold shadow-sm hidden">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <label 
                htmlFor="profile-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                {uploadProfileMutation.isLoading ? (
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <CameraIcon className="h-6 w-6" />
                )}
              </label>
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handleProfilePictureUpload}
                disabled={uploadProfileMutation.isLoading}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-primary-100">{user?.userType?.toLowerCase()} account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="btn-ghost text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className={`input pl-12 ${errors.name ? 'input-error' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className="input pl-12"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={updateMutation.isLoading} className="btn-primary">
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEditMode(false); reset(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user?.email || 'Not provided'}</p>
                    {user?.email && (
                      user?.isEmailVerified
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3" />Verified</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><ExclamationTriangleIcon className="h-3 w-3" />Not verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Provider Info */}
        {isProvider && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Shown publicly on your provider profile</p>
              </div>
              {!editProviderMode && !providerLoading && !providerError && (
                <button
                  onClick={() => setEditProviderMode(true)}
                  className="btn-ghost text-sm"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {providerLoading ? (
              <div className="flex items-center gap-2 text-gray-500 py-4">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading your business details...</span>
              </div>
            ) : providerError ? (
              <div className="text-sm text-red-500 py-4">
                Could not load business details. Please refresh the page or restart the backend server.
              </div>
            ) : editProviderMode ? (
              <form onSubmit={handleProviderSubmit(onProviderSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Business Name</label>
                  <input
                    {...registerProvider('businessName', { required: 'Business Name is required' })}
                    className={`input ${providerErrors.businessName ? 'input-error' : ''}`}
                    placeholder="Enter business name"
                  />
                  {providerErrors.businessName && <p className="text-red-500 text-sm mt-1">{providerErrors.businessName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Business Description</label>
                  <textarea
                    {...registerProvider('businessDescription')}
                    className="input min-h-[100px]"
                    placeholder="Describe your business and services"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Tagline</label>
                  <input
                    {...registerProvider('tagline')}
                    className="input"
                    placeholder="A catchy tagline for your business"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    {...registerProvider('experienceYears')}
                    className="input"
                    placeholder="Years of experience"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Service Radius (KM)</label>
                  <input
                    type="number"
                    min="1"
                    {...registerProvider('serviceRadiusKm')}
                    className="input"
                    placeholder="Service radius in km"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={updateProviderMutation.isLoading} className="btn-primary">
                    {updateProviderMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setEditProviderMode(false); resetProvider(); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* show at-a-glance if all fields are empty */}
                {!providerProfile?.businessName && !providerProfile?.tagline && !providerProfile?.businessDescription && !providerProfile?.experienceYears ? (
                  <div className="text-center py-8 text-gray-400">
                    <WrenchScrewdriverIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No business details set yet.</p>
                    <button onClick={() => setEditProviderMode(true)} className="btn-primary mt-4 text-sm">
                      Add Business Details
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Business Name</p>
                      <p className="font-semibold text-gray-900">{providerProfile?.businessName || <span className="text-gray-400 font-normal">Not provided</span>}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tagline</p>
                      <p className="font-semibold text-gray-900 italic">{providerProfile?.tagline || <span className="text-gray-400 font-normal not-italic">Not provided</span>}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                      <p className="font-semibold text-gray-900">
                        {providerProfile?.experienceYears ? `${providerProfile.experienceYears} Years` : <span className="text-gray-400 font-normal">Not provided</span>}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Service Radius</p>
                      <p className="font-semibold text-gray-900">
                        {providerProfile?.serviceRadiusKm ? `${providerProfile.serviceRadiusKm} KM` : <span className="text-gray-400 font-normal">10 KM (Default)</span>}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Business Description</p>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {providerProfile?.businessDescription || <span className="text-gray-400">Not provided</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Services Section */}
        {isProvider && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Services</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage your service offerings and pricing</p>
              </div>
              {!showAddServiceForm && (
                <button 
                  onClick={() => setShowAddServiceForm(true)}
                  className="btn-primary flex items-center gap-1.5 py-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Service
                </button>
              )}
            </div>

            {showAddServiceForm && (
              <form onSubmit={handleAddServiceSubmit(onAddService)} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">Add New Service</h3>
                  <button 
                    type="button" 
                    onClick={() => { setShowAddServiceForm(false); resetAddService(); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Service Name *</label>
                    <input
                      {...registerAddService('serviceName', { required: 'Service name is required' })}
                      className={`input ${addServiceErrors.serviceName ? 'input-error' : ''}`}
                      placeholder="e.g. Deep Home Cleaning"
                    />
                    {addServiceErrors.serviceName && <p className="text-red-500 text-xs mt-1">{addServiceErrors.serviceName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Category *</label>
                    <select
                      {...registerAddService('categoryId', { required: 'Category is required' })}
                      className={`input ${addServiceErrors.categoryId ? 'input-error' : ''}`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                    {addServiceErrors.categoryId && <p className="text-red-500 text-xs mt-1">{addServiceErrors.categoryId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      {...registerAddService('basePrice', { required: 'Price is required', min: 0 })}
                      className={`input ${addServiceErrors.basePrice ? 'input-error' : ''}`}
                      placeholder="0.00"
                    />
                    {addServiceErrors.basePrice && <p className="text-red-500 text-xs mt-1">{addServiceErrors.basePrice.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      {...registerAddService('serviceDescription')}
                      className="input min-h-[80px]"
                      placeholder="Provide details about what's included in this service"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={addServiceMutation.isLoading}
                    className="btn-primary"
                  >
                    {addServiceMutation.isLoading ? 'Adding...' : 'Add Service'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowAddServiceForm(false); resetAddService(); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {providerLoading ? (
              <div className="flex items-center gap-2 text-gray-500 py-4">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading services...</span>
              </div>
            ) : providerProfile?.services?.length > 0 ? (
              <div className="space-y-4">
                {providerProfile.services.map((service) => (
                  <div key={service.serviceId}>
                    {editingService?.serviceId === service.serviceId ? (
                      <form onSubmit={handleEditServiceSubmit(onUpdateService)} className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-primary-900">Edit Service</h3>
                          <button 
                            type="button" 
                            onClick={() => setEditingService(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">Service Name *</label>
                            <input
                              {...registerEditService('serviceName', { required: 'Service name is required' })}
                              className={`input ${editServiceErrors.serviceName ? 'input-error' : ''}`}
                            />
                            {editServiceErrors.serviceName && <p className="text-red-500 text-xs mt-1">{editServiceErrors.serviceName.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Base Price (₹) *</label>
                            <input
                              type="number"
                              {...registerEditService('basePrice', { required: 'Price is required', min: 0 })}
                              className={`input ${editServiceErrors.basePrice ? 'input-error' : ''}`}
                            />
                            {editServiceErrors.basePrice && <p className="text-red-500 text-xs mt-1">{editServiceErrors.basePrice.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Status</label>
                            <select
                              {...registerEditService('isActive')}
                              className="input"
                            >
                              <option value={true}>Active</option>
                              <option value={false}>Inactive</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                              {...registerEditService('serviceDescription')}
                              className="input min-h-[80px]"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button 
                            type="submit" 
                            disabled={updateServiceMutation.isLoading}
                            className="btn-primary"
                          >
                            {updateServiceMutation.isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setEditingService(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:border-primary-100 transition-colors group">
                        <div className="flex-1 mb-3 sm:mb-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{service.serviceName}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{service.category?.categoryName}</p>
                          
                          <div className="flex items-center text-primary-600 font-bold">
                            <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                            <span>{service.basePrice}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditClick(service)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Edit service"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">You haven't listed any services yet.</p>
              </div>
            )}
          </div>
        )}


        {/* Email Verification Banner */}
        {user?.email && !user?.isEmailVerified && !isGoogleUser && (
          <div className="card p-6 border-l-4 border-amber-400">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Verify Your Email</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your email <span className="font-medium text-gray-800">{user.email}</span> is not verified.
              Verify it to secure your account and enable email-based login.
            </p>

            {/* Method selection */}
            {!emailVerifyMethod && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEmailVerifyMethod('otp')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  Verify with OTP
                </button>
              </div>
            )}

            {/* OTP flow */}
            {emailVerifyMethod === 'otp' && (
              <div className="space-y-4">
                {!emailOtpSent ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSendEmailOtp}
                      disabled={emailVerifyLoading}
                      className="btn-primary text-sm"
                    >
                      {emailVerifyLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : 'Send OTP to Email'}
                    </button>
                    <button
                      onClick={() => setEmailVerifyMethod(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm">
                      OTP sent to <span className="font-medium">{user.email}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                        className="input text-center text-xl tracking-[0.4em] font-mono w-48"
                        placeholder="------"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleVerifyEmailOtp}
                        disabled={emailVerifyLoading || emailOtp.length !== 6}
                        className="btn-primary text-sm"
                      >
                        {emailVerifyLoading ? 'Verifying...' : 'Verify'}
                      </button>
                      <button
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpCountdown > 0 || emailVerifyLoading}
                        className={`inline-flex items-center gap-1 text-sm ${
                          emailOtpCountdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
                        }`}
                      >
                        <ArrowPathIcon className="h-3.5 w-3.5" />
                        {emailOtpCountdown > 0 ? `Resend in ${emailOtpCountdown}s` : 'Resend OTP'}
                      </button>
                      <button
                        onClick={() => { setEmailVerifyMethod(null); setEmailOtpSent(false); setEmailOtp('') }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Addresses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="btn-primary text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Address
              </button>
            )}
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddressSubmit(onAddAddress)} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
              {/* Location Picker */}
              <LocationPicker 
                onLocationSelect={handleAddressLocationSelect}
                showManualEntry={false}
                className="mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Address Label</label>
                  <input
                    {...registerAddress('addressLabel')}
                    className="input"
                    placeholder="e.g., Home, Office"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Address Line 1 *</label>
                  <input
                    {...registerAddress('addressLine1', { required: true })}
                    className={`input ${addressErrors.addressLine1 ? 'input-error' : ''}`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Address Line 2</label>
                  <input {...registerAddress('addressLine2')} className="input" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City *</label>
                  <input
                    {...registerAddress('city', { required: true })}
                    className={`input ${addressErrors.city ? 'input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State *</label>
                  <input
                    {...registerAddress('state', { required: true })}
                    className={`input ${addressErrors.state ? 'input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pincode *</label>
                  <input
                    {...registerAddress('pincode', { required: true, pattern: /^[0-9]{6}$/ })}
                    className={`input ${addressErrors.pincode ? 'input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Landmark</label>
                  <input {...registerAddress('landmark')} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...registerAddress('isDefault')} className="rounded" />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={addAddressMutation.isLoading} className="btn-primary">
                  {addAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowAddressForm(false); resetAddress(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {addressLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.addressId} className="flex items-start justify-between p-4 border rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.addressLabel || address.addressType}</span>
                        {address.isDefault && (
                          <span className="badge-primary text-xs">Default</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAddressMutation.mutate(address.addressId)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No saved addresses</p>
          )}
        </div>

        {/* Security - Set/Change Password */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
          </div>

          {/* Google OAuth User */}
          {isGoogleUser && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <svg className="h-8 w-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div>
                <p className="font-medium text-blue-900">Signed in with Google</p>
                <p className="text-sm text-blue-700">Your account is secured by Google authentication</p>
              </div>
            </div>
          )}

          {/* Verified user without password */}
          {!isGoogleUser && isVerified && !hasPassword && (
            <>
              {!showPasswordForm ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <LockClosedIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Set up password login</p>
                      <p className="text-sm text-amber-700 mt-1">
                        You're currently using OTP to login. Set a password for faster access in the future.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn-primary"
                  >
                    <LockClosedIcon className="h-4 w-4 mr-2" />
                    Set Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit(onSetPassword)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...registerPassword('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          pattern: {
                            value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/,
                            message: 'Password must contain uppercase, lowercase, number and special character'
                          }
                        })}
                        className={`input pl-12 pr-12 ${passwordErrors.password ? 'input-error' : ''}`}
                        placeholder="Min 8 chars, 1 upper, 1 lower, 1 num, 1 special"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerPassword('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === watchPassword('password') || 'Passwords do not match'
                        })}
                        className={`input pl-12 pr-12 ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSettingPassword}
                      className="btn-primary"
                    >
                      {isSettingPassword ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Setting Password...
                        </>
                      ) : (
                        'Set Password'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        resetPassword()
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Verified user with password */}
          {!isGoogleUser && hasPassword && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Password is set</p>
                <p className="text-sm text-green-700">
                  You can login using your {user?.phone ? 'phone' : 'email'} and password
                </p>
              </div>
            </div>
          )}

          {/* Not verified user */}
          {!isGoogleUser && !isVerified && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Verify your account first</p>
                <p className="text-sm text-gray-500 mt-1">
                  Please verify your phone or email via OTP before setting a password.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium capitalize">{user?.userType?.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Status</span>
              <span className="badge-success">{user?.accountStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Login Method</span>
              <span className="font-medium">
                {isGoogleUser ? 'Google' : hasPassword ? 'Password / OTP' : 'OTP'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone Verified</span>
              <span className={user?.isPhoneVerified ? 'text-green-600' : 'text-gray-400'}>
                {user?.isPhoneVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email Verified</span>
              <span className={user?.isEmailVerified ? 'text-green-600' : 'text-gray-400'}>
                {user?.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Become a Provider CTA - only for customers who haven't applied yet */}
        {user?.roles?.includes('CUSTOMER') && !user?.roles?.includes('PROVIDER') && !user?.providerApplicationStatus && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="relative flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1">Become a Service Provider</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                  Start earning by offering your skills on HireLink. Set up your provider profile, list your services, and connect with customers in your area.
                </p>
                <Link
                  to="/become-provider"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  Get Started
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Provider Application Pending */}
        {user?.providerApplicationStatus === 'PENDING' && !user?.roles?.includes('PROVIDER') && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-6 text-white shadow-lg">
            <div className="relative flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1">Provider Application Pending</h3>
                <p className="text-amber-100 text-sm leading-relaxed">
                  Your provider application is under review. You'll be notified once it's approved by our team.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
