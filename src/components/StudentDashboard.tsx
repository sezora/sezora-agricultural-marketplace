'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Briefcase, MapPin, Clock, User, Edit2 } from 'lucide-react'
import Link from 'next/link'

type Job = {
  id: string
  title: string
  company_name: string
  location: string
  description: string
  pay: string
  created_at: string
}

type Application = {
  id: string
  applied_at: string
  status: string
  job: Job
}

export function StudentDashboard() {
  const { profile, updateProfile } = useAuth()
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    age: profile?.age || '',
    bio: profile?.bio || ''
  })
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch recent approved jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3)

      // Fetch user applications with job details
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('student_id', profile?.id)
        .order('applied_at', { ascending: false })
        .limit(5)

      setRecentJobs(jobsData || [])
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
        age: profileForm.age ? parseInt(profileForm.age.toString()) : null,
        bio: profileForm.bio
      })
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.name}!
            </h1>
            <p className="text-gray-600">Ready to find your next agricultural opportunity?</p>
          </div>
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
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
                  placeholder="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about yourself..."
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
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{profile?.name}</span>
                </div>
                {profile?.age && (
                  <div className="text-gray-600">
                    <span className="font-medium">Age:</span> {profile.age}
                  </div>
                )}
                <div className="text-gray-600">
                  <span className="font-medium">Type:</span> Student
                </div>
                {profile?.bio && (
                  <div className="text-gray-600">
                    <span className="font-medium">Bio:</span>
                    <p className="mt-1">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs and Applications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Job Opportunities</h2>
              <Link href="/jobs">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No jobs available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-primary-600 font-medium">{job.company_name}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="mr-4">{job.location}</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                        <p className="text-green-600 font-medium mt-2">{job.pay}</p>
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
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
              <p className="text-gray-500 text-center py-8">You haven't applied to any jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{application.job.title}</h4>
                      <p className="text-sm text-gray-600">{application.job.company_name}</p>
                      <p className="text-xs text-gray-500">
                        Applied {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        application.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
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