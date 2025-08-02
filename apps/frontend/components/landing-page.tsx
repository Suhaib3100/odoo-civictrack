"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HeroSectionComponent } from "@/components/ui/hero-section-5"
import {
  MapPin,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const mockIssues = [
  {
    id: 1,
    title: "Streetlight malfunction on Oak Avenue",
    description:
      "Multiple streetlights have been out for over a week, creating safety concerns for pedestrians during evening hours.",
    category: "Safety & Security",
    status: "In Progress",
    location: "Oak Avenue & 5th Street",
    reportedAt: "2 hours ago",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    priority: "High",
    votes: 24,
    reportedBy: "Sarah M.",
  },
  {
    id: 2,
    title: "Large pothole causing traffic delays",
    description:
      "A significant pothole has formed on the main thoroughfare, causing vehicles to swerve and creating potential safety hazards.",
    category: "Infrastructure",
    status: "Reported",
    location: "Main Street near City Hall",
    reportedAt: "5 hours ago",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    priority: "High",
    votes: 18,
    reportedBy: "Mike R.",
  },
  {
    id: 3,
    title: "Overflowing waste bins in Central Park",
    description:
      "Several waste bins in the park have been overflowing for days, attracting pests and creating unsanitary conditions.",
    category: "Waste Management",
    status: "Resolved",
    location: "Central Park - Main Entrance",
    reportedAt: "1 day ago",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    priority: "Medium",
    votes: 12,
    reportedBy: "Anna K.",
  },
  {
    id: 4,
    title: "Water leak on Elm Street sidewalk",
    description: "Continuous water leak from underground pipe creating slippery conditions and potential water waste.",
    category: "Water & Utilities",
    status: "In Progress",
    location: "Elm Street & 3rd Avenue",
    reportedAt: "3 hours ago",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
    priority: "High",
    votes: 15,
    reportedBy: "David L.",
  },
  {
    id: 5,
    title: "Broken playground equipment",
    description: "Swing set chains are broken and pose safety risk to children using the playground.",
    category: "Parks & Environment",
    status: "Reported",
    location: "Riverside Park",
    reportedAt: "6 hours ago",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    priority: "Medium",
    votes: 8,
    reportedBy: "Lisa T.",
  },
  {
    id: 6,
    title: "Missing stop sign at intersection",
    description:
      "Stop sign was knocked down during recent storm and hasn't been replaced, creating traffic safety hazard.",
    category: "Safety & Security",
    status: "Reported",
    location: "Maple Street & Oak Avenue",
    reportedAt: "4 hours ago",
    image: "https://images.unsplash.com/photo-1545459720-aac8509aa6c3?w=400&h=300&fit=crop",
    priority: "High",
    votes: 22,
    reportedBy: "Tom B.",
  },
]

export function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0)

  // Redirect authenticated users to map
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/map')
    }
  }, [isAuthenticated, loading, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Reported":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="w-4 h-4" />
      case "In Progress":
        return <Clock className="w-4 h-4" />
      case "Reported":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const nextIssue = () => {
    setCurrentIssueIndex((prev) => (prev + 1) % mockIssues.length)
  }

  const prevIssue = () => {
    setCurrentIssueIndex((prev) => (prev - 1 + mockIssues.length) % mockIssues.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-white text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect to map
  }

  return (
    <div className="min-h-screen bg-black">
      <HeroSectionComponent isLoggedIn={false} />

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose CivicTract?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform makes civic engagement simple, transparent, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Location-Based Reporting</h3>
              <p className="text-gray-400">
                Report issues with precise location data and get updates on nearby problems.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-Time Tracking</h3>
              <p className="text-gray-400">
                Follow the progress of your reports with real-time status updates and notifications.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community Engagement</h3>
              <p className="text-gray-400">
                Connect with neighbors, vote on issues, and build stronger communities together.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Recent Community Issues
            </h2>
            <p className="text-xl text-gray-400">
              See what's happening in communities around the world
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevIssue}
                className="text-gray-400 hover:text-white mr-4"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="max-w-2xl mx-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={mockIssues[currentIssueIndex].image}
                        alt={mockIssues[currentIssueIndex].title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(mockIssues[currentIssueIndex].status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(mockIssues[currentIssueIndex].status)}
                              {mockIssues[currentIssueIndex].status}
                            </div>
                          </Badge>
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                            {mockIssues[currentIssueIndex].priority}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {mockIssues[currentIssueIndex].title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {mockIssues[currentIssueIndex].description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{mockIssues[currentIssueIndex].location}</span>
                          <span>{mockIssues[currentIssueIndex].reportedAt}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextIssue}
                className="text-gray-400 hover:text-white ml-4"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                {mockIssues.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIssueIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIssueIndex ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of citizens who are already making their communities better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
