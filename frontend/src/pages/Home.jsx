import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      <div className="space-y-6">
        <p className="text-ink-500 text-sm tracking-[0.3em]">粉墨数据台</p>
        <h1 className="font-title text-6xl text-gold-500 tracking-[0.15em] leading-relaxed">
          京剧数据集
        </h1>
        <p className="text-jade-200/40 text-sm tracking-wider max-w-md mx-auto leading-relaxed">
          以数据为谱，以屏幕为台，让京剧在数字空间中重新开场
        </p>
        <div className="pt-8">
          <Link
            to="/overview"
            className="inline-block px-10 py-3 border border-gold-500/50 text-gold-400
                       hover:bg-gold-500/10 transition-colors tracking-widest text-sm"
          >
            开 戏
          </Link>
        </div>
      </div>
    </div>
  )
}
