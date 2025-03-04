"use client"

import { Brand } from "@/components/ui/brand"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { theme } = useTheme() // Get theme
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // Ensures hydration before rendering
  }, [])

  const currentTheme =
    mounted && (theme === "dark" || theme === "light") ? theme : "dark" // Fallback when not mounted

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        {mounted ? <Brand theme={currentTheme} /> : <Brand theme="dark" />} 
        {/* Show a fallback dark logo to prevent empty space */}
      </div>

      <div className="mt-2 text-4xl font-bold">Chatbot UI</div>

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
        href="/login"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
