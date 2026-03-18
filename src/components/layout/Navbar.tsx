import { Share2, Bell, Settings, User } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-10">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">
          Social<span className="text-blue-500">Auto</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
        <div className="h-8 w-px bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-300" />
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-medium">User Name</span>
            <span className="text-xs text-slate-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </header>
  )
}
