"use client"

import Image from "next/image"
import Link from "next/link"
import { FC } from "react"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href="https://www.chatbotui.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="mb-2">
        <Image
          src={
            theme === "dark"
              ? "/White logo - no background.png"
              : "/Black logo - no background.png"
          }
          alt="Brand Logo"
          width={189}
          height={194}
          style={{ width: "auto", height: "300px" }}
        />
      </div>

      <div className="text-4xl font-bold tracking-wide"> </div>
    </Link>
  )
}
