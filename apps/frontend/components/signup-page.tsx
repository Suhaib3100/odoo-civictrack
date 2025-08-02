"use client"

import type React from "react"

import { SignInPage, type Testimonial } from "@/components/ui/sign-in"
import { BackNavigation } from "@/components/ui/back-navigation"
import { useRouter } from "next/navigation"

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

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())

    console.log("Sign Up submitted:", data)

    // Simulate successful signup
    localStorage.setItem(
      "civictrack_user",
      JSON.stringify({
        email: data.email,
        name: data.username,
        phone: data.phone,
        isLoggedIn: true,
      }),
    )

    // Redirect to home page
    router.push("/")
  }

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked")
    // Simulate Google signup
    localStorage.setItem(
      "civictrack_user",
      JSON.stringify({
        email: "user@gmail.com",
        name: "Google User",
        isLoggedIn: true,
      }),
    )
    router.push("/")
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
      />
    </div>
  )
}
