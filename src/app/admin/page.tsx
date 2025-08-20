'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Clock, XCircle, Briefcase, MapPin, User, Search } from 'lucide-react'

type PendingJob = {
  id: string
  title: string
  company_name: string
  location: string
  description: string
  pay: string
  created_at: string
  employer: {
    id: string
    name: string
    email: string
    company_name: string | null
  }
}

export default function Admin() {
  const { profile } = useAuth()
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingJobId, setProcessingJobId] = useState<string | null>(null)

  const supabase = createClient()

  // Simple admin check - in production, you'd want proper role-based access control
  const isAdmin = profile?.email === 'admin@sezora.com'

  useEffect(() => {
    if (isAdmin) {
      fetchPendingJobs()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  const fetchPendingJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          employer:users!jobs_employer_id_fkey(id, name, email, company_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingJobs(data || [])
    } catch (error) {
      console.error('Error fetching pending jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateJobStatus = async (jobId: string, status: 'approved' | 'rejected') => {
    setProcessingJobId(jobId)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)

      if (error) throw error

      // Remove the job from pending list
      setPendingJobs(prev => prev.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error updating job status:', error)
    } finally {
      setProcessingJobId(null)
    }
  }

  const filteredJobs = pendingJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Review and approve job postings</p>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-900">
                {pendingJobs.length} pending approval{pendingJobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        {pendingJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by job title, company, or employer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Pending Jobs */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {pendingJobs.length === 0 ? 'No pending jobs' : 'No jobs match your search'}
            </h3>
            <p className="text-gray-600">
              {pendingJobs.length === 0 
                ? 'All job postings have been reviewed.'
                : 'Try adjusting your search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-primary-600 font-medium mb-2">{job.company_name}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{job.employer.name}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Job Description:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-semibold text-lg">{job.pay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Employer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Employer Information:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Contact Name:</span>
                        <span className="ml-2 font-medium">{job.employer.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{job.employer.email}</span>
                      </div>
                      {job.employer.company_name && (
                        <div>
                          <span className="text-gray-600">Company:</span>
                          <span className="ml-2 font-medium">{job.employer.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="danger"
                      onClick={() => updateJobStatus(job.id, 'rejected')}
                      disabled={processingJobId === job.id}
                    >
                      {processingJobId === job.id ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => updateJobStatus(job.id, 'approved')}
                      disabled={processingJobId === job.id}
                    >
                      {processingJobId === job.id ? 'Processing...' : 'Approve'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}