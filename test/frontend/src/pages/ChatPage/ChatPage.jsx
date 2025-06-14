import { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

const SendIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
    </svg>
)

const ChatPage = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'ご質問や調整内容を入力してください。' }
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="chat-page-area">
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