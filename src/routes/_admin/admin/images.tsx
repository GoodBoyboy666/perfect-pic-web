import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { fetchClient } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import { Label } from '../../../components/ui/label'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_admin/admin/images')({
  component: AdminImagesComponent,
})

function AdminImagesComponent() {
  const [images, setImages] = useState<Array<any>>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [imgPrefix, setImgPrefix] = useState('')
  const [avatarPrefix, setAvatarPrefix] = useState('')
  const [uploader, setUploader] = useState<any>(null)

  // Search State
  const [inputId, setInputId] = useState('')
  const [inputUsername, setInputUsername] = useState('')
  const [activeId, setActiveId] = useState('')
  const [activeUsername, setActiveUsername] = useState('')
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  // Batch Delete State
  const [selectedIds, setSelectedIds] = useState<Array<number>>([])
  const [showBatchDelete, setShowBatchDelete] = useState(false)

  const loadImages = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })
      if (activeId) params.append('id', activeId)
      if (activeUsername) params.append('username', activeUsername)

      const res: any = await fetchClient(
        `/api/admin/images?${params.toString()}`,
      )
      const list = res.list || res.data || (Array.isArray(res) ? res : [])
      setImages(list)
      setTotal(res.total || 0)
    } catch (error: any) {
      toast.error(error.message || '加载图片失败')
    }
  }

  const loadPrefix = async () => {
    try {
      const res: any = await fetchClient('/api/image_prefix')
      setImgPrefix(res.image_prefix)
    } catch {}

    try {
      const res: any = await fetchClient('/api/avatar_prefix')
      setAvatarPrefix(res.avatar_prefix)
    } catch {}
  }

  const handleDelete = (id: number) => {
    setItemToDelete(id)
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleBatchDeleteConfirm = async () => {
    if (selectedIds.length === 0) return
    try {
      await fetchClient('/api/admin/images/batch', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedIds }),
      })
      toast.success('批量删除成功')
      setSelectedIds([])
      setShowBatchDelete(false)
      loadImages()
    } catch (error: any) {
      toast.error(error.message || '批量删除失败')
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await fetchClient(`/api/admin/images/${itemToDelete}`, {
        method: 'DELETE',
      })
      loadImages()
      toast.success('删除成功')
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    } finally {
      setItemToDelete(null)
    }
  }

  useEffect(() => {
    loadImages()
  }, [page, pageSize, activeId, activeUsername])

  useEffect(() => {
    loadPrefix()
  }, [])

  useEffect(() => {
    if (selectedImage?.user_id) {
      fetchClient(`/api/admin/users/${selectedImage.user_id}`)
        .then((res: any) => {
          // Handle potential wrapped response (e.g. { data: user }) or direct response
          const user = res.data || res
          setUploader(user)
        })
        .catch((e) => {
          console.error('Failed to load uploader info', e)
          setUploader(null)
        })
    } else {
      setUploader(null)
    }
  }, [selectedImage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveId(inputId)
    setActiveUsername(inputUsername)
    setPage(1)
  }

  const getFullUrl = (path: string) => {
    if (!path) return ''
    if (imgPrefix.startsWith('http')) {
      return `${imgPrefix}${path}`
    }
    return `${window.location.origin}${imgPrefix}${path}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('已复制到剪贴板'))
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">图片管理</h2>
          <p className="text-muted-foreground">管理全站所有上传的图片</p>
        </div>

        <div className="flex gap-2 items-center">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowBatchDelete(true)}
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除选中 ({selectedIds.length})
            </Button>
          )}
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap gap-2 items-center w-full md:w-auto"
          >
            <Input
              type="text"
              placeholder="图片ID"
              className="w-24"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
            />
            <Input
              type="text"
              placeholder="用户名"
              className="w-32"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </form>
        </div>
      </motion.div>
      <Separator className="my-6" />
      {images.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">暂无图片数据</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {images.map((img) => (
            <motion.div
              layoutId={`admin-img-${img.id}`}
              key={img.id}
              className={`group relative bg-card border rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedIds.includes(img.id)
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:shadow-md hover:border-primary/50'
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <div
                className="absolute top-2 left-2 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedIds.includes(img.id)}
                  onCheckedChange={() => toggleSelect(img.id)}
                  className="bg-white/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-slate-400"
                />
              </div>
              <div className="aspect-square bg-muted/30 p-2 overflow-hidden flex items-center justify-center">
                <img
                  src={`${imgPrefix}${img.path}`}
                  className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                  alt={img.filename}
                  loading="lazy"
                />
              </div>

              <div className="p-2 space-y-1 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/75">
                <div
                  className="text-xs font-medium truncate"
                  title={img.filename}
                >
                  {img.filename}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>ID: {img.id}</span>
                  <span className="flex items-center gap-1 truncate max-w-[50%]">
                    <User className="h-3 w-3" />
                    {img.username}
                  </span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(img.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页显示</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条</SelectItem>
              <SelectItem value="20">20条</SelectItem>
              <SelectItem value="50">50条</SelectItem>
            </SelectContent>
          </Select>
          <span>
            {images.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(
              page * pageSize,
              Math.max(total, images.length + (page - 1) * pageSize),
            )}{' '}
            共 {total} 条
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Button>
          <span className="text-sm font-medium">第 {page} 页</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-5xl w-full h-[85vh] p-0 overflow-hidden block">
          <DialogTitle className="sr-only">图片详情</DialogTitle>
          {selectedImage && (
            <div className="flex flex-col md:flex-row h-full w-full">
              {/* Left: Image */}
              <div className="flex-1 bg-muted/30 flex items-center justify-center border-r overflow-hidden relative group h-full">
                <img
                  src={`${imgPrefix}${selectedImage.path}`}
                  alt={selectedImage.filename}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right: Info */}
              <div className="w-full md:w-87.5 flex flex-col h-full bg-background">
                <div className="p-6 border-b space-y-4">
                  <div>
                    <h3
                      className="text-lg font-bold truncate mb-1"
                      title={selectedImage.filename}
                    >
                      {selectedImage.filename}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      上传于:{' '}
                      {new Date(
                        selectedImage.uploaded_at * 1000,
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          uploader?.avatar && avatarPrefix
                            ? `${avatarPrefix}${uploader.id}/${uploader.avatar}`
                            : ''
                        }
                      />
                      <AvatarFallback>
                        {selectedImage.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {selectedImage.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        User ID: {selectedImage.user_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>ID: {selectedImage.id}</span>
                    <span>{(selectedImage.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Direct Link</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={getFullUrl(selectedImage.path)}
                          className="font-mono text-xs h-8"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            copyToClipboard(getFullUrl(selectedImage.path))
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Markdown</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`![${selectedImage.filename}](${getFullUrl(selectedImage.path)})`}
                          className="font-mono text-xs h-8"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              `![${selectedImage.filename}](${getFullUrl(selectedImage.path)})`,
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>HTML</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`<img src="${getFullUrl(selectedImage.path)}" alt="${selectedImage.filename}" />`}
                          className="font-mono text-xs h-8"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              `<img src="${getFullUrl(selectedImage.path)}" alt="${selectedImage.filename}" />`,
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>BBCode</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`[img]${getFullUrl(selectedImage.path)}[/img]`}
                          className="font-mono text-xs h-8"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              `[img]${getFullUrl(selectedImage.path)}[/img]`,
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t mt-auto">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      handleDelete(selectedImage.id)
                      setSelectedImage(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除图片 (Admin)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBatchDelete} onOpenChange={setShowBatchDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除?</AlertDialogTitle>
            <AlertDialogDescription>
              您即将删除选中的 {selectedIds.length}{' '}
              张图片及其相关数据。此操作由管理员执行，不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBatchDeleteConfirm}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除该图片。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
