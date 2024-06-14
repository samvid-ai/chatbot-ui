"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { signInWithGoogle } from "@/lib/auth-actions"
import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// const googleLogin = async () => {
//   await signIn("google", {
//     callbackUrl: "/",
//     redirect: true,
//   });
// };
const supabase = createClientComponentClient()

const handleSignInWithGoogle = async () => {
  console.log("ram")
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      },
      redirectTo: "/${homeWorkspace.id}/chat"
    }
  })
}

const SignInButton = () => {
  return (
    <div className="mt-3 space-y-3">
      <button
        type="button"
        className="relative inline-flex w-full items-center justify-center rounded-md border border-gray-400 bg-white px-3.5 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black focus:outline-none"
        // onClick={() => signIn('google', { url: '/' })}
        // onClick={() =>signInWithGoogle}
        onClick={handleSignInWithGoogle}
      >
        <span className="mr-2 inline-block"></span>
        <Image
          src="/google_icon.png"
          height={30}
          width={30}
          alt="Google Icon"
          className="mr-3"
        />
        Sign in with Google
      </button>
    </div>
  )
}

export default SignInButton
