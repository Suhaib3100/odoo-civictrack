"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const { forgotPassword, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    try {
      await forgotPassword(email)
      toast.success("Password reset email sent! Check your inbox.")
      router.push("/login")
    } catch (error: any) {
      console.error("Forgot password failed:", error)
      toast.error(error.message || "Failed to send reset email. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-white text-2xl">Forgot Password?</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading || isSubmitting}
              >
                {(loading || isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-gray-400 hover:text-white"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 