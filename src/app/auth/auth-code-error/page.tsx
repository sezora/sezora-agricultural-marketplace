'use client'

import Link from 'next/link'
import { Wheat, AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Wheat className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Sezora</span>
          </div>
          
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email Confirmation Failed
          </h1>
          
          <p className="text-gray-600 mb-6">
            We couldn't confirm your email address. This might happen if the confirmation link has expired or has already been used.
          </p>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Please try signing up again or contact support if the problem persists.
            </p>
            
            <Link 
              href="/" 
              className="inline-block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}