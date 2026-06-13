import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: 'calc(100vh - 3rem)' }}>
          <p className="text-vermillion-500 text-sm mb-2">◆</p>
          <p className="text-ink-500 text-sm mb-1">页面加载异常</p>
          <p className="text-ink-600 text-[10px] mb-4">数据或组件渲染出错</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            className="text-[10px] text-gold-500/60 hover:text-gold-400 transition-colors">
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
