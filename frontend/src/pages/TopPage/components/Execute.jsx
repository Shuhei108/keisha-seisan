import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import './Execute.css'

const Execute = () => {
    const { participants, forms, calculate, model, setModel, models } = useInputInfo()
    const changeModel = (val) => {
        if (models.includes(val)) {
            setModel(val)
        }
    }
    const modelOptions = () => {
        return models.map((model) => {
            return <option key={model} value={model}>{model}</option>
        })
    }

    return (
        <div className="execute-row">
            {
                forms.every((form) => (form.flag === true)) && participants.length > 0 ?
                <button className="exe-btn" onClick={calculate} disabled={false}>計算する</button>:
                <button className="exe-btn dummy-btn" disabled={true}>計算する</button>
            }
            <select
                className="model-select"
                value={model}
                onChange={(e) => changeModel(e.target.value)}
            >
                {modelOptions()}
            </select>
        </div>
    )
}

export default Execute;