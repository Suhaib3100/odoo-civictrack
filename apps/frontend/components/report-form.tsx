"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  ArrowLeft,
  Upload,
  Camera,
  MapIcon,
  CheckCircle,
  X,
  Plus,
  Navigation,
  AlertTriangle,
  FileText,
  ImageIcon,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const categories = [
  { value: "roads", label: "Roads & Infrastructure", icon: "🛣️" },
  { value: "lighting", label: "Street Lighting", icon: "💡" },
  { value: "water", label: "Water & Utilities", icon: "💧" },
  { value: "waste", label: "Waste Management", icon: "🗑️" },
  { value: "safety", label: "Safety & Security", icon: "🛡️" },
  { value: "parks", label: "Parks & Environment", icon: "🌳" },
  { value: "transport", label: "Public Transport", icon: "🚌" },
  { value: "buildings", label: "Public Buildings", icon: "🏢" },
  { value: "other", label: "Other", icon: "📋" },
]

const priorities = [
  { value: "low", label: "Low", color: "text-green-400", description: "Minor inconvenience" },
  { value: "medium", label: "Medium", color: "text-yellow-400", description: "Moderate impact" },
  { value: "high", label: "High", color: "text-orange-400", description: "Significant problem" },
  { value: "critical", label: "Critical", color: "text-red-400", description: "Safety hazard" },
]

export function ReportForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    priority: "",
    anonymous: false,
    images: [] as File[],
    location: {
      address: "",
      landmark: "",
      coordinates: { lat: 0, lng: 0 },
      useCurrentLocation: false,
    },
    contactInfo: {
      name: "",
      phone: "",
      email: "",
    },
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).slice(0, 5 - formData.images.length)
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles].slice(0, 5),
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              useCurrentLocation: true,
            },
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const getSubcategories = (category: string) => {
    const subcategories: Record<string, string[]> = {
      roads: ["Potholes", "Road Damage", "Traffic Signals", "Road Markings", "Speed Bumps"],
      lighting: ["Street Lights", "Traffic Lights", "Park Lighting", "Building Lighting"],
      water: ["Water Leaks", "Drainage Issues", "Water Quality", "Pipe Bursts", "Flooding"],
      waste: ["Garbage Collection", "Overflowing Bins", "Illegal Dumping", "Recycling Issues"],
      safety: ["Crime", "Vandalism", "Unsafe Areas", "Missing Signs", "Broken Equipment"],
      parks: ["Playground Issues", "Garden Maintenance", "Tree Problems", "Park Facilities"],
      transport: ["Bus Stops", "Bus Routes", "Metro Issues", "Parking Problems"],
      buildings: ["Maintenance", "Accessibility", "Cleanliness", "Security"],
      other: ["Noise Pollution", "Air Quality", "Animal Issues", "Other Concerns"],
    }
    return subcategories[category] || []
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/[0.02] border border-white/10 text-center overflow-hidden">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Issue Reported Successfully!</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Thank you for helping improve your community. We've received your report and will review it shortly.
                You'll receive updates on the progress.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full bg-white text-black hover:bg-gray-100">
                  <Link href="/my-issues">View My Issues</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6 bg-gray-700" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">Report New Issue</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <span>Step {currentStep} of 4</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step <= currentStep
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-gray-400 border-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`hidden sm:block w-24 h-0.5 mx-4 ${step < currentStep ? "bg-white" : "bg-gray-600"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 text-center">
              <span className={currentStep >= 1 ? "text-white" : ""}>Basic Info</span>
              <span className={currentStep >= 2 ? "text-white" : ""}>Photos & Location</span>
              <span className={currentStep >= 3 ? "text-white" : ""}>Details</span>
              <span className={currentStep >= 4 ? "text-white" : ""}>Review & Submit</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <FileText className="w-6 h-6" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Issue Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white font-medium">
                        Issue Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Brief, descriptive title of the issue"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Be specific and clear (e.g., "Large pothole on Main Street near City Hall")
                      </p>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white font-medium">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value, subcategory: "" }))
                        }
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select issue category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-800">
                              <div className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subcategory */}
                    {formData.category && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategory" className="text-white font-medium">
                          Subcategory
                        </Label>
                        <Select
                          value={formData.subcategory}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                        >
                          <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                            <SelectValue placeholder="Select specific type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {getSubcategories(formData.category).map((subcat) => (
                              <SelectItem key={subcat} value={subcat} className="text-white hover:bg-gray-800">
                                {subcat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Priority Level *</Label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {priorities.map((priority) => (
                          <div
                            key={priority.value}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              formData.priority === priority.value
                                ? "border-white bg-white/5"
                                : "border-gray-700 hover:border-gray-600"
                            }`}
                            onClick={() => setFormData((prev) => ({ ...prev, priority: priority.value }))}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className={`w-4 h-4 ${priority.color}`} />
                              <span className={`font-medium ${priority.color}`}>{priority.label}</span>
                            </div>
                            <p className="text-xs text-gray-400">{priority.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.title || !formData.category || !formData.priority}
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Next: Photos & Location
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Photos & Location */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Photo Upload */}
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Add Photos (Up to 5)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive ? "border-white bg-white/5" : "border-gray-600 hover:border-gray-500"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Drag and drop photos here, or click to browse</p>
                      <p className="text-sm text-gray-400 mb-4">
                        PNG, JPG up to 10MB each. Clear photos help authorities understand the issue better.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file) || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-700"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {formData.images.length < 5 && (
                          <div
                            className="w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location */}
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Current Location */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Use Current Location
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <MapIcon className="w-4 h-4 mr-2" />
                        Pick on Map
                      </Button>
                    </div>

                    {/* Address Input */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-white font-medium">
                        Address *
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter the exact location address"
                        value={formData.location.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: { ...prev.location, address: e.target.value },
                          }))
                        }
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Landmark */}
                    <div className="space-y-2">
                      <Label htmlFor="landmark" className="text-white font-medium">
                        Nearby Landmark
                      </Label>
                      <Input
                        id="landmark"
                        placeholder="e.g., Near City Mall, Opposite Bus Stand"
                        value={formData.location.landmark}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: { ...prev.location, landmark: e.target.value },
                          }))
                        }
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* Location Status */}
                    {formData.location.useCurrentLocation && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-400">
                          <Navigation className="w-4 h-4" />
                          <span className="font-medium">Location detected</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Coordinates: {formData.location.coordinates.lat.toFixed(6)},{" "}
                          {formData.location.coordinates.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.location.address}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    Next: Details
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Detailed Description */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Detailed Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white font-medium">
                        Detailed Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Provide a detailed description of the issue. Include when you first noticed it, how it affects the community, and any other relevant information..."
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Be as detailed as possible. This helps authorities understand and prioritize the issue.
                      </p>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Contact Information (Optional)</h3>
                      <p className="text-sm text-gray-400">
                        Providing contact details helps authorities reach you for clarifications or updates.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white font-medium">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                contactInfo: { ...prev.contactInfo, name: e.target.value },
                              }))
                            }
                            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-white font-medium">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.contactInfo.phone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                contactInfo: { ...prev.contactInfo, phone: e.target.value },
                              }))
                            }
                            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.contactInfo.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value },
                            }))
                          }
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Anonymous Option */}
                    <div className="flex items-center space-x-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                      <Checkbox
                        id="anonymous"
                        checked={formData.anonymous}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, anonymous: checked as boolean }))
                        }
                        className="border-gray-600"
                      />
                      <div className="flex-1">
                        <Label htmlFor="anonymous" className="text-white font-medium cursor-pointer">
                          Report anonymously
                        </Label>
                        <p className="text-sm text-gray-400">
                          Your identity will not be shared publicly, but authorities may still contact you if needed.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    disabled={!formData.description}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    Review & Submit
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Review Your Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Issue Title</h4>
                          <p className="text-white">{formData.title}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Category</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30">
                              {categories.find((c) => c.value === formData.category)?.label}
                            </Badge>
                            {formData.subcategory && (
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {formData.subcategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Priority</h4>
                          <Badge
                            className={`${priorities.find((p) => p.value === formData.priority)?.color} bg-transparent border-current`}
                          >
                            {priorities.find((p) => p.value === formData.priority)?.label}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
                          <p className="text-white">{formData.location.address}</p>
                          {formData.location.landmark && (
                            <p className="text-sm text-gray-400">Near: {formData.location.landmark}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                          <p className="text-white text-sm leading-relaxed">{formData.description}</p>
                        </div>
                        {formData.images.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">
                              Photos ({formData.images.length})
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {formData.images.map((file, index) => (
                                <img
                                  key={index}
                                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-16 object-cover rounded border border-gray-700"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(formData.contactInfo.name || formData.contactInfo.phone || formData.contactInfo.email) && (
                      <div className="border-t border-gray-800 pt-6">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Contact Information</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          {formData.contactInfo.name && (
                            <div>
                              <span className="text-gray-400">Name: </span>
                              <span className="text-white">{formData.contactInfo.name}</span>
                            </div>
                          )}
                          {formData.contactInfo.phone && (
                            <div>
                              <span className="text-gray-400">Phone: </span>
                              <span className="text-white">{formData.contactInfo.phone}</span>
                            </div>
                          )}
                          {formData.contactInfo.email && (
                            <div>
                              <span className="text-gray-400">Email: </span>
                              <span className="text-white">{formData.contactInfo.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Anonymous Notice */}
                    {formData.anonymous && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Anonymous Report</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          This report will be submitted anonymously. Your identity will not be publicly visible.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-black hover:bg-gray-100 min-w-32"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
