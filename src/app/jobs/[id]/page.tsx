'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { MapPin, Clock, Briefcase, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Job = {
  id: string
  title: string
  company_name: string
  location: string
  description: string
  pay: string
  created_at: string
  employer_id: string
}

type Application = {
  id: string
  job_id: string
  student_id: string
  applied_at: string
  status: string
}

export default function JobDetails({ params }: { params: { id: string } }) {
  const { profile } = useAuth()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [applying, setApplying] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchJobDetails()
    if (profile?.user_type === 'student') {
      checkApplicationStatus()
    }
  }, [params.id, profile])

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('status', 'approved')
        .single()

      if (error) throw error
      setJob(data)
    } catch (error) {
      console.error('Error fetching job details:', error)
      router.push('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', params.id)
        .eq('student_id', profile?.id)
        .single()

      if (data) setApplication(data)
    } catch (error) {
      // No application found, which is fine
    }
  }

  const handleApply = async () => {
    if (!profile || profile.user_type !== 'student') return

    setApplying(true)
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: params.id,
          student_id: profile.id,
          status: 'pending'
        })

      if (error) throw error

      // Refresh application status
      await checkApplicationStatus()
      
      // Show success message or redirect
      alert('Application submitted successfully!')
    } catch (error: any) {
      console.error('Error applying to job:', error.message)
      alert('Error submitting application. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const getApplicationStatusColor = (status: string) => {
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

  if (!job) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or is no longer available.</p>
          <Link href="/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const canApply = profile?.user_type === 'student' && !application
  const hasApplied = !!application

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/jobs" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <p className="text-xl text-primary-600 font-medium mb-4">{job.company_name}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  <span className="text-green-600 font-semibold">{job.pay}</span>
                </div>
              </div>

              {/* Application Status */}
              {hasApplied && (
                <div className="mb-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApplicationStatusColor(application.status)}`}>
                    <User className="h-4 w-4 mr-1" />
                    Application {application.status}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Applied on {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="mt-6 md:mt-0 md:ml-6">
              {profile?.user_type === 'student' && (
                <div className="text-right">
                  {canApply ? (
                    <Button
                      onClick={handleApply}
                      disabled={applying}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      {applying ? 'Applying...' : 'Apply Now'}
                    </Button>
                  ) : hasApplied ? (
                    <div className="text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getApplicationStatusColor(application.status)}`}>
                        Applied ({application.status})
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              
              {profile?.user_type === 'employer' && (
                <p className="text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
                  You're viewing this as an employer. Students will see an apply button here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        {hasApplied && application.status === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Congratulations! Your application was accepted.
            </h3>
            <p className="text-green-700 mb-4">
              You can now contact the employer directly through our messaging system.
            </p>
            <Link href="/messages">
              <Button variant="success">Send Message</Button>
            </Link>
          </div>
        )}

        {/* Additional Actions */}
        <div className="flex justify-center">
          <Link href="/jobs">
            <Button variant="outline">Browse More Jobs</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}