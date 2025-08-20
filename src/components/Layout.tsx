'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Wheat, User, Briefcase, MessageCircle, FileText, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()

  const studentNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Browse Jobs', href: '/jobs', icon: Briefcase },
    { name: 'My Applications', href: '/applications', icon: FileText },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
  ]

  const employerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Post Job', href: '/post-job', icon: Briefcase },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
  ]

  const navigation = profile?.user_type === 'student' ? studentNavigation : employerNavigation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <Wheat className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Sezora</span>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div>
                <div className="text-sm font-medium text-gray-700">{profile?.name}</div>
                <div className="text-sm text-gray-500 capitalize">{profile?.user_type}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="ml-auto"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="bg-white shadow px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Wheat className="h-6 w-6 text-green-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">Sezora</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="bg-white border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-8 px-4 py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}