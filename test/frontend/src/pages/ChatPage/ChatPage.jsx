import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

const SendIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
    </svg>
)

function getInitialMessage(participants, surplus) {
    const total = participants.reduce((total, p) => total + (p.payment * p.count), 0) + surplus
    return [
        'ご質問や調整内容を入力してください。',
        '',
        '計算結果:',
        '役職名 | 人数 | 一人当たりの支払金額',
        '------------------------------',
        ...participants.map(p => `${p.name} | ${p.count} | ${p.payment}円`),
        surplus !== 0 ? `余り: ${surplus}円` : '',
        `合計金額: ${total}円`
    ].filter(Boolean).join('\n')
}

const ChatPage = () => {
    const { participants, handlePageChange, setCalcError, surplus } = useInputInfo()
    const [messages, setMessages] = useState([
        { role: 'ai', text: getInitialMessage(participants, surplus) }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    // スクロールを常に最新に
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // textareaの高さ自動調整
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [input])

    const handleInputChange = (e) => {
        setInput(e.target.value)
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return
        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setInput('')
        setLoading(true)
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        try {
            const res = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            })
            const data = await res.json()
            setMessages(prev => [...prev, { role: 'ai', text: data.message }])
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: 'AI応答の取得に失敗しました。' }])
        }
        setLoading(false)
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    const handleKeyDown = (e) => {
        if (isMobile) return // モバイルは何もしない（改行のみ）
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleBack = (e) => {
        handlePageChange("result")
    }

    return (
        <div className="chat-page-area">
            <a className="chat-back-btn" href="#" onClick={handleBack}>
                &lt;&nbsp;戻る
            </a>
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}
                    >
                        <div className="chat-bubble">{msg.text}</div>
                    </div>
                ))}
                {loading && (
                    <div className="chat-message ai">
                        <div className="chat-bubble">AIが応答中...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-row">
                <textarea
                    className="chat-input"
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="メッセージを入力..."
                    rows={1}
                    disabled={loading}
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    aria-label="送信"
                    type="button"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    )
}

export default ChatPage;