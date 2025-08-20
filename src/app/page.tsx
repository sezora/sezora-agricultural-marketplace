'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/AuthForm'
import { Wheat, Users, MessageCircle, Clock } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will be redirected by middleware
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wheat className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Sezora</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Connect Agriculture
              <span className="text-green-600"> Students</span> with
              <span className="text-primary-600"> Opportunities</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Sezora bridges the gap between agricultural education and real-world farming experience. 
              Find meaningful work opportunities or discover talented students ready to contribute to your farm.
            </p>

            {/* Features */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">For Students</h3>
                  <p className="text-gray-600">Find hands-on agricultural work to gain real experience</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Wheat className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">For Farmers</h3>
                  <p className="text-gray-600">Connect with motivated students ready to work</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Direct Communication</h3>
                  <p className="text-gray-600">Chat directly with potential employers or workers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Matching</h3>
                  <p className="text-gray-600">Apply to jobs and get responses fast</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="lg:pl-8">
            <AuthForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Sezora. Connecting agricultural communities.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
