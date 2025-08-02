"use client"

import type React from "react"
import { useState } from "react"
import { SignInPage, type Testimonial } from "@/components/ui/sign-in"
import { BackNavigation } from "@/components/ui/back-navigation"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const civicTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Sneha Reddy",
    handle: "@sneha_change",
    text: "Joined CivicTract last month and already helped resolve 3 community issues. This platform really works!",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Vikram Singh",
    handle: "@vikram_civic",
    text: "As a new resident, CivicTract helped me understand and contribute to my community immediately.",
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
  const { register, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string

      if (!email || !password) {
        toast.error('Please fill in all required fields')
        return
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }

      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })
    } catch (error: any) {
      console.error('Registration failed:', error)
      
      // Check if the error is about user already existing
      if (error.message && error.message.includes('already exists')) {
        toast.error(
          <div>
            <p>{error.message}</p>
            <button 
              onClick={() => router.push('/login')}
              className="text-blue-500 underline mt-1"
            >
              Click here to login instead
            </button>
          </div>,
          { duration: 5000 }
        )
      } else {
        toast.error(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = () => {
    toast.info('Google sign-in will be available soon!')
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
        title={<span className="font-light text-white tracking-tighter">Join CivicTract</span>}
        description="Create your account and start making a difference in your community today"
        heroImageSrc="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=2160&q=80"
        testimonials={civicTestimonials}
        onSignIn={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  )
}
