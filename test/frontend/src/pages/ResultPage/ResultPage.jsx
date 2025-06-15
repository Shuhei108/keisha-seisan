import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import EarchPayment from './components/EachPayment'
import './ResultPage.css'

const Result = () => {
    const { participants, setStatus, calculate, calcError, setCalcError, surplus } = useInputInfo()
    var totalAmount = participants.reduce((total, p) => total + (p.payment * p.count), 0) + surplus;

    return (
        <div className='result'>
            {calcError && <h2 className='error-message' style={{ textAlign: 'center' , margin: '8px 30px' }}>エラーが発生しました。<br/>しばらく時間を空けてから実行してください。</h2>}
            <table>
                <thead>
                    <tr>
                        <td colSpan="2"><h2>計算結果</h2></td>
                    </tr>
                </thead>
                <tbody>
                    <EarchPayment participants={participants} />
                    {surplus !== 0 && <tr><td>余り</td><td>{surplus}円</td></tr>}
                </tbody>
                <tfoot>
                    <tr>
                        <td>合計金額</td>
                        <td>{totalAmount}円</td>
                    </tr>
                </tfoot>
            </table>
            <button onClick={()=>{setStatus("top"); setCalcError(false)}}>戻る</button>
            <button onClick={calculate}>再計算</button>
        </div>
    )
}

export default Result;