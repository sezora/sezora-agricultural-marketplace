'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Briefcase, Users, Clock, Edit2, Plus } from 'lucide-react'
import Link from 'next/link'

type Job = {
  id: string
  title: string
  company_name: string
  location: string
  description: string
  pay: string
  status: 'pending' | 'approved'
  created_at: string
}

type Application = {
  id: string
  applied_at: string
  status: string
  job: Job
  student: {
    id: string
    name: string
    email: string
    age: number | null
    bio: string | null
  }
}

export function EmployerDashboard() {
  const { profile, updateProfile } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    company_name: profile?.company_name || '',
    bio: profile?.bio || ''
  })
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch employer's jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', profile?.id)
        .order('created_at', { ascending: false })

      // Fetch applications for employer's jobs
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*),
          student:users(id, name, email, age, bio)
        `)
        .in('job_id', jobsData?.map(job => job.id) || [])
        .order('applied_at', { ascending: false })
        .limit(10)

      setJobs(jobsData || [])
      setApplications(applicationsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({
        name: profileForm.name,
        company_name: profileForm.company_name,
        bio: profileForm.bio
      })
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const pendingJobs = jobs.filter(job => job.status === 'pending').length
  const approvedJobs = jobs.filter(job => job.status === 'approved').length
  const totalApplications = applications.length

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.name}!
            </h1>
            <p className="text-gray-600">Manage your job postings and find great candidates.</p>
          </div>
          <Link href="/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{approvedJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{pendingJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Company Profile</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  placeholder="Contact Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Company Name"
                  value={profileForm.company_name}
                  onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                  required
                />
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="About your company..."
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
                <div className="flex space-x-2">
                  <Button type="submit" size="sm">Save</Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="text-gray-600">
                  <span className="font-medium">Contact:</span> {profile?.name}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Company:</span> {profile?.company_name || 'Not set'}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Type:</span> Employer
                </div>
                {profile?.bio && (
                  <div className="text-gray-600">
                    <span className="font-medium">About:</span>
                    <p className="mt-1">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Jobs and Applications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Job Postings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Job Postings</h2>
              <Link href="/post-job">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            </div>
            
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                <Link href="/post-job">
                  <Button>Post Your First Job</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{job.location}</p>
                        <p className="text-green-600 font-medium">{job.pay}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <Link href="/applications">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            {applications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No applications received yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{application.student.name}</h4>
                      <p className="text-sm text-gray-600">Applied for: {application.job.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}