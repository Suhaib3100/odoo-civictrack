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
    avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Sneha Reddy",
    handle: "@sneha_change",
    text: "Joined CivicTrack last month and already helped resolve 3 community issues. This platform really works!",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Vikram Singh",
    handle: "@vikram_civic",
    text: "As a new resident, CivicTrack helped me understand and contribute to my community immediately.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Anita Joshi",
    handle: "@anita_community",
    text: "The transparency and real-time updates make civic engagement so much more effective and rewarding.",
  },
]

export function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const phone = formData.get('phone') as string

    // Split username into firstName and lastName
    const nameParts = username.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    try {
      await signup(email, password, firstName, lastName)
      toast.success("Account created successfully!")
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleGoogleSignIn = () => {
    toast.info("Google authentication coming soon!")
  }

  const handleCreateAccount = () => {
    router.push("/login")
  }

  return (
    <div className="relative">
      {/* Back Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <BackNavigation />
      </div>
      
      <SignInPage
        mode="signup"
        title={<span className="font-light text-white tracking-tighter">Join CivicTrack</span>}
        description="Create your account and start making a difference in your community today"
        heroImageSrc="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=2160&q=80"
        testimonials={civicTestimonials}
        onSignIn={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onCreateAccount={handleCreateAccount}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
