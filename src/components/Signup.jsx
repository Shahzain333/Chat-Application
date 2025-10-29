import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { login, setLoading, setError, clearError, selectUser, selectLoading, 
    selectError } from '../store/authSlice'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import firebaseService from '../services/firebaseServices'

function Signup() {
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const user = useSelector(selectUser)
    const loading = useSelector(selectLoading)
    const error = useSelector(selectError)
    
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        dispatch(clearError())
    }

    const handleSubmit = async (e) => {
        
        e.preventDefault()

        dispatch(setLoading(true))
        dispatch(clearError())

        // Validation
        if (formData.password !== formData.confirmPassword) {
            dispatch(setError('Passwords do not match!'))
            return
        }

        if (formData.password.length < 6) {
            dispatch(setError('Password should be at least 6 characters'))
            return
        }

        try {

            const userCredential = await firebaseService.signUp(formData.email, formData.password)
            
            dispatch(login({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: formData.username || userCredential.user.email,
                photoURL: userCredential.user.photoURL || ""
            }))
            
            navigate('/dashboard')
            
        } catch (error) {
            dispatch(setError(error.message || 'Failed to create account'))
        }
    }

    return (
        <div>
            {user ? <DashboardPage/> : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 
                flex items-center justify-center px-4 py-4">
                    
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                        
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Create your account
                            </h1>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                        
                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input 
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all 
                                    duration-200 outline-none"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input 
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all 
                                    duration-200 outline-none"
                                    required
                                />
                            </div>
                            
                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input 
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                    transition-all duration-200 outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input 
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                    transition-all duration-200 outline-none"
                                    required
                                />
                            </div>
                            
                            {/* Terms and Conditions */}
                            <div className="flex items-center">
                                <input 
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 
                                    rounded"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link to="#" className="text-blue-600 hover:text-blue-500 font-medium">
                                        Terms and Conditions
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white 
                                font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>

                        </form>

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <NavLink to="/login" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                                    Sign in
                                </NavLink>
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </div>
        
    )
}

export default Signup