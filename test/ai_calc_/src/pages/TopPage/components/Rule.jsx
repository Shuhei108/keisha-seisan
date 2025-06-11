import { useState } from 'react'

const Rule = ({ rule, deleteRule, changeRule, updateForms }) => {
    const [checkInput,setCheckInput] = useState(true)
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
    return (
        <>
            <tr>
                <td className='col-1'><button onClick={deleteRule}>-</button></td>
                <td colSpan="3">
                    <div className="rules">
                        <input type="text" value={rule.value} onChange={(e) => {changeRule(e.target.value); setCheckInput(true);}} onBlur={(e) => {checkRule(e.target.value)}} />
                    </div>
                </td>
            </tr>
            { !checkInput && <tr><td></td><td style={{color: 'red'}}>ルールを入力するか入力欄を削除してください。</td></tr> }
        </>
    )
}

export default Rule;
