import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

const SendIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
    </svg>
)

const ChatPage = () => {
    const { participants, setStatus, setCalcError, surplus,  } = useInputInfo()

    const [messages, setMessages] = useState([
        { 
            role: 'ai',
            text: 'ご質問や調整内容を入力してください。' 
                + '\n\n---計算結果---\n'
                + participants.map(p => `${p.name}: ${p.payment}円`).join('\n')
                + (surplus !== 0 ? `\n余り: ${surplus}円` : '')
                + '\n合計金額: '
                + (participants.reduce((total, p) => total + (p.payment * p.count), 0) + surplus)  + '円'
        }
    ])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    // スクロールを常に最新に
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // textareaの高さ自動調整
    const handleInputChange = (e) => {
        setInput(e.target.value)
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [input])

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { role: 'user', text: input }])
        setInput('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        // AI応答は未実装
    }

    // ...existing code...
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    const handleKeyDown = (e) => {
        if (isMobile) return // モバイルは何もしない（改行のみ）
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (    
        <div className="chat-page-area">
            <a className="chat-back-btn" href="#" onClick={(e) => {setStatus("result"); setCalcError(false); e.preventDefault();}}>
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
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim()}
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