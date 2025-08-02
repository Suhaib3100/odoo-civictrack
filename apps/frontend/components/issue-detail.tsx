"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Lens } from "@/components/ui/lens"
import { MapPin, ArrowLeft, Calendar, User, MessageSquare, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"

const mockIssue = {
  id: 1,
  title: "Large pothole on Main Street causing traffic issues",
  description:
    "There's a significant pothole on Main Street near the intersection with Oak Avenue. It's been causing cars to swerve and creating dangerous driving conditions. The hole is approximately 2 feet wide and 6 inches deep.",
  category: "Roads & Infrastructure",
  status: "In Progress",
  reportedAt: "2024-01-15T10:30:00Z",
  reportedBy: "Anonymous",
  location: "Main Street & Oak Avenue",
  images: [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  ],
  timeline: [
    {
      status: "Reported",
      date: "2024-01-15T10:30:00Z",
      description: "Issue reported by citizen",
    },
    {
      status: "Acknowledged",
      date: "2024-01-15T14:20:00Z",
      description: "Report reviewed and acknowledged by city maintenance",
    },
    {
      status: "In Progress",
      date: "2024-01-16T09:00:00Z",
      description: "Repair crew assigned and work scheduled",
    },
  ],
  comments: [
    {
      id: 1,
      author: "City Maintenance",
      content: "Thank you for reporting this issue. We have scheduled a repair crew for tomorrow morning.",
      timestamp: "2024-01-15T15:00:00Z",
    },
    {
      id: 2,
      author: "Anonymous",
      content: "Great to see quick response! This has been a safety concern for weeks.",
      timestamp: "2024-01-15T16:30:00Z",
    },
  ],
}

interface IssueDetailProps {
  issueId: string
}

export function IssueDetail({ issueId }: IssueDetailProps) {
  const [newComment, setNewComment] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-red-100 text-red-700 border-red-200"
      case "Acknowledged":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Reported":
        return <AlertTriangle className="w-4 h-4" />
      case "In Progress":
        return <Clock className="w-4 h-4" />
      case "Resolved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/map">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Map
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CivicTrack</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Issue Header */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{mockIssue.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Reported {formatDate(mockIssue.reportedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>By {mockIssue.reportedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{mockIssue.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(mockIssue.status)}>
                    {getStatusIcon(mockIssue.status)}
                    <span className="ml-1">{mockIssue.status}</span>
                  </Badge>
                  <Badge variant="outline">{mockIssue.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{mockIssue.description}</p>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {mockIssue.images.map((image, index) => (
                  <Lens key={index} zoomFactor={2} lensSize={150}>
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Issue photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </Lens>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockIssue.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}
                    >
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{event.status}</h4>
                        <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Comments & Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockIssue.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {/* Add Comment */}
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Add a comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button className="mt-2">Post Comment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
