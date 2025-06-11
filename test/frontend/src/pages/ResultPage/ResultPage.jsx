import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import EarchPayment from './components/EachPayment'
import './ResultPage.css'

const Result = () => {
    const { participants, setStatus, calculate, calcError, setCalcError } = useInputInfo()
    var totalAmount = 0;
    
    participants.map((participant) => {
        totalAmount += parseInt(participant.payment,10) * participant.count
    })

    return (
        <div className='result'>
            {calcError && <h2 className='error-message' style={{ textAlign: 'center' , margin: '8px 30px' }}>エラーが発生しました。<br/>しばらく時間を空けてから実行してください。</h2>}
            <table>
                <thead>
                    <tr>
                        <td colSpan="2"><h2>計算結果</h2></td>
                    </tr>
                </thead>
                <EarchPayment participants={participants} />
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