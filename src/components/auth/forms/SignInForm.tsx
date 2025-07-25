'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { SignInProps, SignInFormData } from '@/types/auth'

export function SignInForm({ onToggle, onForgotPassword }: SignInProps) {
  const router = useRouter()
  const { signIn, user } = useAuth()
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [typing, setTyping] = useState(false)

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    if (id === 'password') {
      setTyping(true)
      setTimeout(() => setTyping(false), 1000)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(formData.email, formData.password)

      // Show success message
      toast.success('Login successful!')

      // Get redirect URL from query params
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo')
      
      if (redirectTo) {
        // If there's a specific redirect, use it
        router.replace(redirectTo)
      } else {
        // The AuthContext will handle the redirect via onAuthStateChange
        // Just redirect to root and let middleware handle role-based routing
        router.replace('/')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <Card className="w-full max-w-md shadow-lg relative bg-white">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <CardTitle className="text-xl font-semibold">
              <Image
                className="h-28 w-28 mb-2 rounded-sm"
                src="/images/logo/logo2.svg"
                alt="logo"
                width={75}
                height={75}
              />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-accent-foreground dark:text-accent">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-chart-1 focus-visible:border-chart-1 focus-visible:ring-chart-1/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="ml-1">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={typing ? 'text' : passwordVisible ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-chart-1 pr-10 focus-visible:border-chart-1 focus-visible:ring-chart-1/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-chart-1 hover:bg-chart-2 text-accent dark:text-accent-foreground duration-300 ease-in-out transition-all mt-2"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col justify-center w-full pt-4">
          {/* Add forgot password and sign up links if needed */}
        </CardFooter>
      </Card>
    </div>
  )
}