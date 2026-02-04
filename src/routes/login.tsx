import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { fetchClient } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'

export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const { login, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [error, setError] = useState('')

  const fetchCaptcha = async () => {
    try {
      const res: any = await fetchClient('/api/captcha')
      setCaptchaId(res.captcha_id)
      setCaptchaImage(res.captcha_image)
    } catch (e) {
      console.error('Failed to fetch captcha')
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  useEffect(() => {
    if (user && !isLoading) {
      navigate({ to: '/dashboard/overview' })
    }
  }, [user, isLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({
        username,
        password,
        captcha_id: captchaId,
        captcha_answer: captchaAnswer,
      })
      // navigate is handled by useEffect
    } catch (err: any) {
      setError(err.message || '登录失败')
      fetchCaptcha() // Refresh captcha on failure
      setCaptchaAnswer('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              登录 Perfect Pic
            </CardTitle>
            <CardDescription className="text-center">
              输入您的凭据以访问控制台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-destructive text-sm text-center font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="您的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    忘记密码?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="captcha">验证码</Label>
                <div className="flex gap-2">
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="输入验证码"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                  />
                  {captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="验证码"
                      className="h-9 w-24 rounded border cursor-pointer object-cover bg-white"
                      onClick={fetchCaptcha}
                      title="点击刷新验证码"
                    />
                  ) : (
                    <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                登录
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              没有账号?{' '}
              <Link to="/register" className="text-primary hover:underline">
                立即注册
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
