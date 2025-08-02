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
import { useState } from "react"

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
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    priority: "High",
    votes: 22,
    reportedBy: "Tom W.",
  },
  {
    id: 7,
    title: "Graffiti on public building wall",
    description: "Large graffiti tags appeared on the side of the community center building over the weekend.",
    category: "Public Buildings",
    status: "Reported",
    location: "Community Center - West Wall",
    reportedAt: "8 hours ago",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
    priority: "Low",
    votes: 5,
    reportedBy: "Emma S.",
  },
  {
    id: 8,
    title: "Blocked storm drain causing flooding",
    description: "Storm drain is completely blocked with debris, causing water to pool during rain.",
    category: "Water & Utilities",
    status: "In Progress",
    location: "Pine Street & 2nd Avenue",
    reportedAt: "12 hours ago",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
    priority: "High",
    votes: 19,
    reportedBy: "Chris P.",
  },
  {
    id: 9,
    title: "Damaged park bench needs replacement",
    description: "Wooden park bench has several broken slats and is unsafe for public use.",
    category: "Parks & Environment",
    status: "Resolved",
    location: "Central Park - North Path",
    reportedAt: "2 days ago",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    priority: "Low",
    votes: 7,
    reportedBy: "Rachel M.",
  },
]

export function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const issuesPerPage = 9
  const totalPages = Math.ceil(mockIssues.length / issuesPerPage)

  const currentIssues = mockIssues.slice((currentPage - 1) * issuesPerPage, currentPage * issuesPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-red-500/15 text-red-300 border-red-500/30"
      case "In Progress":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30"
      case "Resolved":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-gray-500/15 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Reported":
        return <AlertTriangle className="w-3 h-3" />
      case "In Progress":
        return <Clock className="w-3 h-3" />
      case "Resolved":
        return <CheckCircle className="w-3 h-3" />
      default:
        return <AlertTriangle className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Navigation */}
      <HeroSectionComponent />

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { label: "Active Citizens", value: "12,847", icon: Users },
              { label: "Issues Reported", value: "3,429", icon: AlertTriangle },
              { label: "Issues Resolved", value: "2,891", icon: CheckCircle },
              { label: "Success Rate", value: "84%", icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-2xl mb-6 group-hover:bg-white/10 transition-all duration-300">
                      <stat.icon className="w-7 h-7 text-white/80" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Issues Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Recent Community Reports</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See what your neighbors are reporting and track the progress of issues in your area.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search issues in your community..."
                className="pl-12 h-14 text-lg border-gray-800 bg-gray-900/50 text-white rounded-xl focus:border-gray-700 focus:bg-gray-900/70 transition-all"
              />
              <Button className="absolute right-2 top-2 h-10 px-6 bg-white text-black hover:bg-gray-100">Search</Button>
            </div>
          </div>

          {/* Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {currentIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 group cursor-pointer overflow-hidden backdrop-blur-sm">
                  <div className="relative overflow-hidden">
                    <img
                      src={issue.image || "/placeholder.svg"}
                      alt={issue.title}
                      className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-5 left-5">
                      <Badge
                        className={`${getStatusColor(issue.status)} flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border backdrop-blur-md`}
                      >
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </Badge>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-5 right-5">
                      <Badge className="bg-black/40 text-white/90 border-0 backdrop-blur-md px-3 py-1.5 text-xs font-medium">
                        {issue.category}
                      </Badge>
                    </div>

                    {/* Priority Indicator */}
                    <div className="absolute bottom-4 right-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          issue.priority === "High"
                            ? "bg-red-400"
                            : issue.priority === "Medium"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                        } shadow-lg`}
                      />
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors line-clamp-2 leading-tight">
                      {issue.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{issue.description}</p>

                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate font-medium">{issue.location}</span>
                      </div>
                      <span className="flex-shrink-0 text-gray-400">{issue.reportedAt}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          <span className="font-semibold text-white">{issue.votes}</span>
                          <span>votes</span>
                        </div>
                        <span className="text-gray-500">by {issue.reportedBy}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to make a difference?</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-400 leading-relaxed">
              Join thousands of citizens who are actively improving their communities. Your voice matters, and together
              we can create positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 shadow-lg" asChild>
                <Link href="/report">Report Your First Issue</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white bg-transparent transition-all duration-200"
                onClick={() => setIsLoggedIn(!isLoggedIn)}
              >
                {isLoggedIn ? "Sign Out" : "Sign In to Get Started"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
