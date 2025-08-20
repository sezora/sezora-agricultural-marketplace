'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { StudentDashboard } from '@/components/StudentDashboard'
import { EmployerDashboard } from '@/components/EmployerDashboard'

export default function Dashboard() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return null // Will be redirected by middleware
  }

  return (
    <Layout>
      {profile.user_type === 'student' ? <StudentDashboard /> : <EmployerDashboard />}
    </Layout>
  )
}