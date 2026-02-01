import { Link, createFileRoute } from '@tanstack/react-router'
import { useSite } from '../context/SiteContext'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { siteInfo } = useSite()

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{siteInfo.site_name}</h1>
        <nav className="flex gap-4">
          <Button
            variant="ghost"
            asChild
            className="text-white hover:bg-white/10 hover:text-white text-base"
          >
            <Link to="/login">登录</Link>
          </Button>
          <Button
            asChild
            className="bg-white text-blue-600 hover:bg-gray-100 text-base font-bold"
          >
            <Link to="/register">注册</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-5xl font-extrabold mb-6">
          {siteInfo.site_description}
        </h2>
        <p className="text-xl max-w-2xl mb-10 opacity-90">
          存储、整理和分享高质量照片的最佳平台。 安全、快速、随处可用。
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-600 text-lg font-bold rounded-full hover:bg-gray-100 transition shadow-lg"
          >
            立即加入
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 text-white border-2 border-white text-lg font-bold rounded-full hover:bg-white/10 transition"
          >
            用户登录
          </Link>
        </div>
      </main>

      <footer className="p-6 text-center opacity-60">
        &copy; {new Date().getFullYear()} {siteInfo.site_name}. All rights
        reserved.
      </footer>
    </div>
  )
}
