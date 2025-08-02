"use client"

import type React from "react"
import { useState } from "react"

import { SignInPage, type Testimonial } from "@/components/ui/sign-in"
import { BackNavigation } from "@/components/ui/back-navigation"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const civicTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    name: "Priya Sharma",
    handle: "@priya_civic",
    text: "CivicTrack helped me report a pothole that was fixed within a week. Amazing platform for community engagement!",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Rajesh Kumar",
    handle: "@rajesh_community",
    text: "Finally, a platform where citizens can make a real difference. I've reported 5 issues and 4 are already resolved.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "Amit Patel",
    handle: "@amit_civic",
    text: "Love how transparent the process is. I can track the progress of my reports and see real change happening.",
  },
]

export function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await login(email, password)
      toast.success("Login successful!")
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleGoogleSignIn = () => {
    toast.info("Google authentication coming soon!")
  }

  const handleResetPassword = () => {
    toast.info("Password reset functionality coming soon!")
  }

  const handleCreateAccount = () => {
    router.push("/signup")
  }

  return (
    <div className="relative">
      {/* Back Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <BackNavigation />
      </div>
      
      <SignInPage
        mode="signin"
        title={<span className="font-light text-white tracking-tighter">Welcome Back</span>}
        description="Sign in to continue reporting and tracking civic issues in your community"
        heroImageSrc="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=2160&q=80"
        testimonials={civicTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
