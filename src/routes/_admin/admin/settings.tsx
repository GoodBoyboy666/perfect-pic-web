import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { fetchClient } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Label } from '../../../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_admin/admin/settings')({
  component: AdminSettingsComponent,
})

function AdminSettingsComponent() {
  const [settings, setSettings] = useState<
    Array<{ Key: string; Value: string; Desc: string }>
  >([])
  const [originalSettings, setOriginalSettings] = useState<
    Array<{ Key: string; Value: string; Desc: string }>
  >([])

  const loadSettings = async () => {
    try {
      const res = await fetchClient('/api/admin/settings')
      const data = Array.isArray(res) ? res : []
      setSettings(data)
      // Deep copy to avoid reference issues
      setOriginalSettings(JSON.parse(JSON.stringify(data)))
    } catch (error: any) {
      toast.error(error.message || '加载设置失败')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Only send changed settings
      const changedSettings = settings.filter((s) => {
        const original = originalSettings.find((os) => os.Key === s.Key)
        return original && original.Value !== s.Value
      })

      if (changedSettings.length === 0) {
        toast.info('没有需要保存的更改')
        return
      }

      const payload = changedSettings.map((s) => ({
        key: s.Key,
        value: s.Value,
      }))

      await fetchClient('/api/admin/settings', {
        method: 'PATCH',
        body: payload,
      })
      toast.success('设置已更新')
      loadSettings()
    } catch (error: any) {
      toast.error(error.message || '更新失败')
    }
  }

  const handleChange = (key: string, val: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.Key === key ? { ...s, Value: val } : s)),
    )
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <motion.div
      className="space-y-6 max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold tracking-tight">系统设置</h2>
        <p className="text-muted-foreground">配置网站全局参数</p>
      </motion.div>

      <Separator className="my-6" />
      <Card>
        <CardHeader>
          <CardTitle>通用设置</CardTitle>
          <CardDescription>修改后请点击保存</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            {settings.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                暂无可用设置
              </div>
            )}

            {settings.map((setting, index) => (
              <div key={setting.Key} className="grid gap-2">
                <Label className="text-base font-semibold">
                  {setting.Desc || setting.Key}
                </Label>

                {/* Simple heuristic for boolean-like values */}
                {setting.Value === 'true' || setting.Value === 'false' ? (
                  <Select
                    value={setting.Value}
                    onValueChange={(val) => handleChange(setting.Key, val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">开启 (True)</SelectItem>
                      <SelectItem value="false">关闭 (False)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={setting.Value}
                    onChange={(e) => handleChange(setting.Key, e.target.value)}
                  />
                )}
                <p className="text-[10px] text-muted-foreground font-mono">
                  Key: {setting.Key}
                </p>
                {index < settings.length - 1 && <Separator className="my-2" />}
              </div>
            ))}

            {settings.length > 0 && (
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                保存更改
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
