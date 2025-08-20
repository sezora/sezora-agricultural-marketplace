'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Clock, User, Briefcase, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

type StudentApplication = {
  id: string
  applied_at: string
  status: string
  job: {
    id: string
    title: string
    company_name: string
    location: string
    pay: string
    created_at: string
  }
}

type EmployerApplication = {
  id: string
  applied_at: string
  status: string
  job_id: string
  student: {
    id: string
    name: string
    email: string
    age: number | null
    bio: string | null
  }
  job: {
    id: string
    title: string
    company_name: string
    location: string
  }
}

export default function Applications() {
  const { profile } = useAuth()
  const [applications, setApplications] = useState<(StudentApplication | EmployerApplication)[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      fetchApplications()
    }
  }, [profile])

  const fetchApplications = async () => {
    try {
      if (profile?.user_type === 'student') {
        // Fetch student's applications
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs(id, title, company_name, location, pay, created_at)
          `)
          .eq('student_id', profile.id)
          .order('applied_at', { ascending: false })

        if (error) throw error
        setApplications(data || [])
      } else if (profile?.user_type === 'employer') {
        // Fetch applications for employer's jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('employer_id', profile.id)

        if (jobsError) throw jobsError

        const jobIds = jobsData?.map(job => job.id) || []

        if (jobIds.length > 0) {
          const { data, error } = await supabase
            .from('applications')
            .select(`
              *,
              student:users(id, name, email, age, bio),
              job:jobs(id, title, company_name, location)
            `)
            .in('job_id', jobIds)
            .order('applied_at', { ascending: false })

          if (error) throw error
          setApplications(data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error

      // Refresh applications
      await fetchApplications()
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            {profile?.user_type === 'student' 
              ? 'Track your job applications and their status'
              : 'Review applications from students for your job postings'
            }
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600 mb-6">
              {profile?.user_type === 'student' 
                ? "You haven't applied to any jobs yet. Start browsing opportunities!"
                : "No one has applied to your jobs yet. Make sure your jobs are approved and visible."
              }
            </p>
            <Link href={profile?.user_type === 'student' ? '/jobs' : '/post-job'}>
              <Button>
                {profile?.user_type === 'student' ? 'Browse Jobs' : 'Post a Job'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {profile?.user_type === 'student' ? (
                    // Student view - showing job details
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {(application as StudentApplication).job.title}
                        </h3>
                        <p className="text-primary-600 font-medium mb-3">
                          {(application as StudentApplication).job.company_name}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{(application as StudentApplication).job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-green-600 font-semibold">
                            {(application as StudentApplication).job.pay}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                            {application.status === 'accepted' && (
                              <Link href="/messages">
                                <Button size="sm">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Employer view - showing student details
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex-shrink-0">
                              <User className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {(application as EmployerApplication).student.name}
                              </h3>
                              <p className="text-gray-600">{(application as EmployerApplication).student.email}</p>
                            </div>
                          </div>
                          
                          <div className="ml-11">
                            <p className="text-sm text-gray-600 mb-2">
                              Applied for: <span className="font-medium">{(application as EmployerApplication).job.title}</span>
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              Applied {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                            
                            {(application as EmployerApplication).student.age && (
                              <p className="text-sm text-gray-600 mb-2">
                                Age: {(application as EmployerApplication).student.age}
                              </p>
                            )}
                            
                            {(application as EmployerApplication).student.bio && (
                              <p className="text-sm text-gray-600 mb-4">
                                {(application as EmployerApplication).student.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                          
                          {application.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => updateApplicationStatus(application.id, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {application.status === 'accepted' && (
                            <Link href="/messages">
                              <Button size="sm">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}