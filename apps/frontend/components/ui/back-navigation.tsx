"use client"

import { ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackNavigationProps {
  className?: string
}

export function BackNavigation({ className = "" }: BackNavigationProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/")}
      className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${className}`}
      aria-label="Go back to home page"
    >
      <ArrowLeft className="w-4 h-4" />
      <Home className="w-4 h-4" />
      <span className="text-sm font-medium">Back to Home</span>
    </button>
  )
} 