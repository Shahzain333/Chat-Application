import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

function Signup() {
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle signup logic here
        console.log(formData)
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 
        flex items-center justify-center px-4 py-16.5">
            
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Create your account
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Username and Email Fields - Flex on larger screens */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        
                        {/* Username Field */}
                        <div className="flex-1">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 
                            mb-2">
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
                        <div className="flex-1">
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
                    
                    </div>

                    <div className='flex flex-col sm:flex-row gap-4'>
                      {/* Password Field */}
                      <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                              Password *
                          </label>
                          <input 
                              id="password"
                              name="password"
                              type="password"
                              placeholder="Create a password"
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                              transition-all duration-200 outline-none"
                              required
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                        font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Create Account
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
    )
}

export default Signup