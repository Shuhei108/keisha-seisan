import { useState, useRef } from 'react'
import './Rule.css'

const Rule = ({ rule, deleteRule, changeRule, updateForms }) => {
    const [checkInput, setCheckInput] = useState(true)
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

    // 高さ自動調整
    const handleInput = (e) => {
        changeRule(e.target.value)
        setCheckInput(true)
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = textarea.scrollHeight + "px"
        }
    }

    return (
        <>
            <tr>
                <td className='col-1'><button onClick={deleteRule}>-</button></td>
                <td colSpan="3">
                    <div className="rules">
                        <textarea
                            ref={textareaRef}
                            value={rule.value}
                            onChange={handleInput}
                            onBlur={(e) => { checkRule(e.target.value) }}
                            className="rule-textarea"
                            rows={1}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                </td>
            </tr>
            { !checkInput && <tr><td></td><td className='error-message'>ルールを入力するか入力欄を削除してください。</td></tr> }
        </>
    )
}

export default Rule;
