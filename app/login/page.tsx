"use client"
import { AuthForm } from '@/components/auth-form'
import React, { useEffect } from 'react'
import { useRouter } from "next/navigation"

const Login = () => {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          router.push("/")
        }
      } catch {
        // ignore
      }
    }
    check()
  }, [router])

  return (
    <AuthForm
      onSuccess={() => {
        router.push("/")
      }}
    />
  )
}

export default Login