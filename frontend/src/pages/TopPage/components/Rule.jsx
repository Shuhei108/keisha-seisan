import { useState, useRef, useEffect } from 'react'
import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import './Rule.css'

const Rule = ({ rule, deleteRule, changeRule, updateForms }) => {
    const { participants } = useInputInfo()
    const [checkInput, setCheckInput] = useState(true)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [highlightIdx, setHighlightIdx] = useState(-1)
    const [suggestions, setSuggestions] = useState([])
    const textareaRef = useRef(null)

    const checkRule = (val) => {
        changeRule(val)
        if (val !== "") {
            setCheckInput(true)
            updateForms(true)
        } else {
            setCheckInput(false)
            updateForms(false)
        }
    }

    const handleInput = (e) => {
        changeRule(e.target.value)
        setCheckInput(true)
        setShowSuggestions(true)
        setHighlightIdx(-1)
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = textarea.scrollHeight + "px"
        }
    }

    // フォーカス時に候補を動的生成
    const handleFocus = () => {
        let firstName = "○○"
        let lastName = "○○"
        if (participants && participants.length > 0) {
            if (participants[0].name?.trim()) firstName = participants[0].name
            if (participants[participants.length - 1].name?.trim()) lastName = participants[participants.length - 1].name
        }
        setSuggestions([
            "最小単位は500円とする",
            "会計金額と計算結果の合計金額の差が500円未満になるまで計算する",
            `${lastName}が端数を支払う`,
            `${firstName}の支払金額は${lastName}の2倍未満とする`,
        ])
        setShowSuggestions(true)
    }

    // 画面描画時にも高さ自動調整
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = textarea.scrollHeight + "px"
        }
    }, [rule.value])

    // 候補クリック時
    const handleSuggestionClick = (suggestion) => {
        changeRule(suggestion)
        setCheckInput(true)
        setShowSuggestions(false)
    }

    const filteredSuggestions = suggestions.filter(s => s.includes(rule.value))
    const handleKeyDown = (e) => {
        if (!showSuggestions || filteredSuggestions.length === 0) return
        if (e.key === "ArrowDown") {
            setHighlightIdx(idx => Math.min(idx + 1, filteredSuggestions.length - 1))
            e.preventDefault()
        } else if (e.key === "ArrowUp") {
            setHighlightIdx(idx => Math.max(idx - 1, 0))
            e.preventDefault()
        } else if (e.key === "Enter" && highlightIdx >= 0) {
            handleSuggestionClick(filteredSuggestions[highlightIdx])
            e.preventDefault()
        }
    }

    return (
        <>
            <tr>
                <td className='col-1'><button onClick={deleteRule}>-</button></td>
                <td colSpan="3">
                    <div className="rules" style={{ position: 'relative' }}>
                        <textarea
                            ref={textareaRef}
                            value={rule.value}
                            onChange={handleInput}
                            onFocus={handleFocus}
                            onBlur={(e) => { 
                                checkRule(e.target.value)
                                setTimeout(() => setShowSuggestions(false), 100);
                            }}
                            className="rule-textarea"
                            rows={1}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                                handleKeyDown(e);
                            }}
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="suggestion-list-container">
                                <ul className="suggestion-list">
                                    {filteredSuggestions.map((s, idx) => (
                                        <li
                                            key={idx}
                                            className={`suggestion-item${highlightIdx === idx ? ' highlighted' : ''}`}
                                            onMouseDown={() => handleSuggestionClick(s)}
                                            onMouseEnter={() => setHighlightIdx(idx)}
                                        >
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
            { !checkInput && <tr><td></td><td className='error-message'>ルールを入力するか入力欄を削除してください。</td></tr> }
        </>
    )
}

export default Rule;
