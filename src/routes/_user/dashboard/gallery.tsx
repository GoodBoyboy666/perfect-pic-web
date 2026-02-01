import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Copy, Search, Trash2 } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_user/dashboard/gallery')({
  component: GalleryComponent,
})

interface Image {
  id: number
  filename: string
  path: string
  [key: string]: any
}

function GalleryComponent() {
  const [images, setImages] = useState<Array<Image>>([])
  const [loading, setLoading] = useState(true)
  const [imgPrefix, setImgPrefix] = useState('')
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)

  // Pagination & Search
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  // Search Inputs
  const [filenameInput, setFilenameInput] = useState('')
  const [idInput, setIdInput] = useState('')

  // Active Filters (trigger reload)
  const [activeFilename, setActiveFilename] = useState('')
  const [activeId, setActiveId] = useState('')

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  // Batch Delete State
  const [selectedIds, setSelectedIds] = useState<Array<number>>([])
  const [showBatchDelete, setShowBatchDelete] = useState(false)

  // Load Prefix once
  useEffect(() => {
    fetchClient('/api/image_prefix')
      .then((res: any) => setImgPrefix(res.image_prefix || ''))
      .catch(() => {})
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })
      if (activeFilename) params.append('filename', activeFilename)
      if (activeId) params.append('id', activeId)

      const res: any = await fetchClient(
        `/api/user/images?${params.toString()}`,
      )

      const list = res.list || res.data || (Array.isArray(res) ? res : [])
      setImages(list)
      setTotal(res.total || 0)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, activeFilename, activeId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFilename(filenameInput)
    setActiveId(idInput)
    setPage(1)
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    e.preventDefault()
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await fetchClient(`/api/user/images/${itemToDelete}`, {
        method: 'DELETE',
      })
      loadData()
      toast.success('删除成功')
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    } finally {
      setItemToDelete(null)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleBatchDeleteConfirm = async () => {
    if (selectedIds.length === 0) return
    try {
      await fetchClient('/api/user/images/batch', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedIds }),
      })
      toast.success('批量删除成功')
      setSelectedIds([])
      setShowBatchDelete(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || '批量删除失败')
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">我的画廊</h2>
          <p className="text-muted-foreground">查看和管理您上传的所有图片</p>
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
              placeholder="ID"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              className="w-24"
            />
            <Input
              type="text"
              placeholder="文件名..."
              value={filenameInput}
              onChange={(e) => setFilenameInput(e.target.value)}
              className="w-48"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
          </form>
        </div>
      </div>

      <Separator className="my-6" />

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">未找到图片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Image Grid Items */}
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative aspect-square bg-muted/30 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                selectedIds.includes(img.id)
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
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
                  className="bg-white/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              </div>

              <img
                src={`${imgPrefix}${img.path}`}
                alt={img.filename}
                className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <div className="text-white text-xs font-medium truncate mb-1">
                  {img.filename}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-[10px]">
                    ID: {img.id}
                  </span>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={(e) => handleDelete(e, img.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页显示</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-25 h-8">
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
            {Math.min(page * pageSize, total)} 共 {total} 条
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
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open: boolean) => !open && setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-5xl w-full h-[80vh] p-0 overflow-hidden block">
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
                <div className="p-6 border-b">
                  <h3
                    className="text-lg font-bold truncate mb-1"
                    title={selectedImage.filename}
                  >
                    {selectedImage.filename}
                  </h3>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>ID: {selectedImage.id}</span>
                    <span>{(selectedImage.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(
                      selectedImage.uploaded_at * 1000,
                    ).toLocaleString()}
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
                    onClick={(e) => {
                      handleDelete(e, selectedImage.id)
                      setSelectedImage(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    永久删除图片
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
      <AlertDialog open={showBatchDelete} onOpenChange={setShowBatchDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除?</AlertDialogTitle>
            <AlertDialogDescription>
              您即将删除选中的 {selectedIds.length} 张图片。此操作无法撤销。
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
    </div>
  )
}
