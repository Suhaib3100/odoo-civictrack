"use client"

import { useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/ui/navbar'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AuthNavbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    return user?.email || 'User'
  }

  return (
    <Navbar
      isLoggedIn={isAuthenticated}
      user={{
        name: getUserDisplayName(),
        email: user?.email || '',
        avatar: user?.avatar || undefined,
      }}
      auth={{
        login: { text: "Sign In", url: "/login" },
        signup: { text: "Get Started", url: "/signup" },
      }}
      onLogout={handleLogout}
    />
  )
} 