'use client'

import { X, Mail, CheckCircle } from 'lucide-react'

interface EmailConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export function EmailConfirmationModal({ isOpen, onClose, email }: EmailConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="h-16 w-16 text-blue-500" />
              <CheckCircle className="h-6 w-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Created Successfully!
          </h3>
          
          <p className="text-gray-600 mb-4">
            We've sent a confirmation email to:
          </p>
          
          <p className="font-medium text-gray-900 bg-gray-50 rounded-lg p-3 mb-4">
            {email}
          </p>
          
          <div className="text-sm text-gray-600 space-y-2 mb-6">
            <p>Please check your inbox and click the confirmation link to activate your account.</p>
            <p>Don't forget to check your spam folder if you don't see the email.</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  )
}