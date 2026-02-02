import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Lock, Upload, User } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { fetchClient } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar'
import { Separator } from '../../../components/ui/separator'

export const Route = createFileRoute('/_user/dashboard/profile')({
  component: ProfileComponent,
})

function ProfileComponent() {
  const { user, refreshUser } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [avatarPrefix, setAvatarPrefix] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchClient('/api/avatar_prefix')
      .then((res: any) => setAvatarPrefix(res.avatar_prefix))
      .catch(() => {})
  }, [])

  const getAvatarUrl = () => {
    if (!user?.avatar || avatarPrefix === null) return null
    return `${avatarPrefix}${user.id}/${user.avatar}`
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      await fetchClient('/api/user/avatar', {
        method: 'PATCH',
        body: formData,
      })
      await refreshUser()
      toast.success('头像上传成功')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: any) {
      toast.error(error.message || '上传失败')
    }
  }

  const handleUpdateUsername = async () => {
    try {
      await fetchClient('/api/user/username', {
        method: 'PATCH',
        body: { username },
      })
      await refreshUser()
      toast.success('用户名修改成功')
    } catch (e: any) {
      toast.error(e.message || '修改失败')
    }
  }

  const handleUpdatePassword = async () => {
    try {
      await fetchClient('/api/user/password', {
        method: 'PATCH',
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      })
      setOldPassword('')
      setNewPassword('')
      toast.success('密码修改成功')
    } catch (e: any) {
      toast.error(e.message || '修改失败')
    }
  }

  return (
    <motion.div
      className="max-w-2xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-0.5"
      >
        <h2 className="text-2xl font-bold tracking-tight">编辑资料</h2>
        <p className="text-muted-foreground">管理您的个人信息和账户安全设置</p>
      </motion.div>
      <Separator className="my-6" />

      {/* Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>修改头像</CardTitle>
            <CardDescription>
              点击上传新头像，支持 JPG, PNG, GIF
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar
              className="h-24 w-24 border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              {getAvatarUrl() ? (
                <AvatarImage src={getAvatarUrl()!} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-2xl font-bold">
                {user?.username.slice(0, 2).toUpperCase() || 'USER'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                选择图片
              </Button>
              <p className="text-xs text-muted-foreground">
                建议尺寸 200x200 像素
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Username Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>更新您的公开用户名</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleUpdateUsername}>更新</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>安全设置</CardTitle>
            <CardDescription>修改您的登录密码</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-pass">旧密码</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="old-pass"
                  type="password"
                  placeholder="••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-pass">新密码</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-pass"
                  type="password"
                  placeholder="••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleUpdatePassword}>修改密码</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
