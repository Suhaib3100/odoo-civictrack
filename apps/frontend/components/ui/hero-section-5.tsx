"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AwardBadge } from "@/components/ui/award-badge"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronRight } from "lucide-react"
import { useScroll, motion } from "framer-motion"

export function HeroSectionComponent() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <section className="bg-black">
          <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
            <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                {/* Award Badge */}
                <div className="flex justify-center lg:justify-start mb-8">
                  <AwardBadge type="bytecrew-team" link="https://www.odoo.com/hackathon" />
                </div>

                <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl text-white font-bold">
                  Build Better Communities with <span className="text-gray-300">CivicTrack</span>
                </h1>
                <p className="mt-8 max-w-2xl text-balance text-lg text-gray-400">
                  Report, track, and resolve civic issues in your neighborhood. Join thousands of citizens making a
                  difference in their communities.{" "}
                  <span className="text-slate-300 font-medium">Built by the talented ByteCrew team</span> for Odoo
                  Hackathon 2024.
                </p>
                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full pl-5 pr-3 text-base bg-white text-black hover:bg-gray-100 shadow-lg"
                  >
                    <Link href="/report">
                      <span className="text-nowrap">Start Reporting</span>
                      <ChevronRight className="ml-1" />
                    </Link>
                  </Button>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-12 rounded-full px-5 text-base hover:bg-gray-900 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700"
                  >
                    <Link href="/map">
                      <span className="text-nowrap">Explore Issues</span>
                    </Link>
                  </Button>
                </div>

                {/* ByteCrew Attribution */}
                <div className="mt-8 flex items-center justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Crafted with</span>
                    <span className="text-red-400">❤️</span>
                    <span>by the</span>
                    <span className="text-slate-300 font-semibold">ByteCrew</span>
                    <span>team guys</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-[2/3] absolute inset-1 overflow-hidden rounded-3xl border border-gray-800 sm:aspect-video lg:rounded-[3rem]">
              <img
                className="size-full object-cover opacity-30"
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop&q=80"
                alt="Community collaboration"
              />
            </div>
          </div>
        </section>
        <section className="bg-black pb-2">
          <div className="group relative m-auto max-w-7xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:border-gray-800 md:pr-6">
                <p className="text-end text-sm text-gray-500">Trusted by communities</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit invert opacity-30"
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=40&fit=crop&q=80"
                      alt="City Hall"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit invert opacity-30"
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=32&fit=crop&q=80"
                      alt="Municipal Services"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit invert opacity-30"
                      src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=32&fit=crop&q=80"
                      alt="Community Center"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit invert opacity-30"
                      src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=40&fit=crop&q=80"
                      alt="Public Works"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit invert opacity-30"
                      src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&h=40&fit=crop&q=80"
                      alt="Local Government"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit invert opacity-30"
                      src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=32&fit=crop&q=80"
                      alt="City Services"
                      height="16"
                      width="auto"
                    />
                  </div>
                </InfiniteSlider>
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black"></div>
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black"></div>
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

const menuItems = [
  { name: "Issues", href: "/map" },
  { name: "Report", href: "/report" },
  { name: "Community", href: "/community" },
  { name: "About", href: "/about" },
]

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollYProgress } = useScroll()

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > 0.05)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  return (
    <header>
      <nav data-state={menuState && "active"} className="group fixed z-20 w-full pt-2">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-3xl px-6 transition-all duration-300 lg:px-12",
            scrolled && "bg-black/80 backdrop-blur-2xl border border-gray-800",
          )}
        >
          <motion.div
            key={1}
            className={cn(
              "relative flex flex-wrap items-center justify-between gap-6 py-3 duration-200 lg:gap-0 lg:py-6",
              scrolled && "lg:py-4",
            )}
          >
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200 text-white" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 text-white" />
              </button>
              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-gray-400 hover:text-white block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-gray-900 group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-800 p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-gray-400 hover:text-white block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                >
                  <Link href="/login">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-white text-black hover:bg-gray-100">
                  <Link href="/signup">
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </nav>
    </header>
  )
}

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-xl font-bold text-white">CivicTrack</span>
    </div>
  )
}
