import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import './Execute.css'

const Execute = () => {
    const { participants, forms, calculate } = useInputInfo()

    return (
        <>
            {
                forms.every((form) => (form.flag === true)) && participants.length > 0 ?
                <button className="exe-btn" onClick={calculate} disabled={false}>計算する</button>:
                <button className="dummy-btn" disabled={true}>計算する</button>
            }
        </>
    )
}

export default Execute;