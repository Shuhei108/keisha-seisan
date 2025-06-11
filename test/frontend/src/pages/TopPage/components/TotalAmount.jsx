import {useState} from 'react'
import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import './TotalAmount.css'

const TotalAmount = () => {
    const { amount, setAmount, updateForms } = useInputInfo()

    const [checkInput,setCheckInput] = useState(true)
    const changeAmount = (val) => {
        setCheckInput(true)
        setAmount(val)
        const regex = /^[0-9]*$/;
        if (regex.test(val) && val !== "") {
            updateForms("totalAmount",true)
        } else {
            updateForms("totalAmount",false)
        }
    }
    const checkAmount = (val) => {
        const regex = /^[0-9]*$/;
        if (regex.test(val) && val !== "") {
            setCheckInput(true)
            updateForms("totalAmount",true)
        } else {
            setCheckInput(false)
            updateForms("totalAmount",false)
        }
    }
    return (
        <>
            <table>
                <thead>
                    <tr>
                        <td className="col-1"></td>
                        <td colSpan="3">
                            <h2>会計金額</h2>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td colSpan="3">
                            <div  className="total-amount">
                                <input type="text" value={amount}  onChange={(e) => {changeAmount(e.target.value)}} onBlur={(e) => {checkAmount(e.target.value)}} />円   
                            </div>
                        </td>
                    </tr>
                    { !checkInput && <tr><td></td><td className='error-message'>会計金額は半角数字で入力してください。</td></tr> }
                </tbody>
            </table>
        </>
    )
}

export default TotalAmount;