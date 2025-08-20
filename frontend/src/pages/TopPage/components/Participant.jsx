import {useState} from 'react'
import './Participant.css'

const Participant = ({ deleteParticipant, participant, changeName, changeCount, changeWeight, checkWeight, updateForms }) => {
    const [checkInput,setCheckInput] = useState(true)
    const checkName = (val) => {
        changeName(val)
        if (val !== "") {
            setCheckInput(true)
            updateForms(true)
        } else {
            setCheckInput(false)
            updateForms(false)
        }
    }
    const maxCount = 100;
    const options = () => {
        const list = [];
        for ( let i=1; i<maxCount; i++) {
            if (i === parseInt(participant.count,10)) {
                list.push(<option key={i} value={i} >{i}</option>)
            } else {
                list.push(<option key={i} value={i}>{i}</option>)
            }
        }
        return list;
    }

    return (
        <>
            <tr className='participant'>
                <td><button onClick={deleteParticipant}>-</button></td>
                <td><input type="text" placeholder="役職" value={participant.name} onChange={(e) => {changeName(e.target.value); setCheckInput(true);} } onBlur={(e) => {checkName(e.target.value)}}/></td>
                <td>
                    <select value={participant.count} onChange={(e) => {changeCount(e.target.value)}} >
                        { options() }
                    </select>
                </td>
                <td>
                    <div className='weight'>
                        <div className='sp'>{participant.weight}</div>
                        <input type="range" min="0" max="100" value={participant.weight} onChange={(e) => changeWeight(e.target.value)}/>
                        <input type="number" value={participant.weight} onChange={(e) => {changeWeight(e.target.value)}} onBlur={(e) => {checkWeight(e.target.value)}}/>
                    </div>
                </td>
            </tr>
            { !checkInput && <tr><td></td><td className='error-message'>職位は必須項目です。</td></tr> }
        </>
        
    )
}

export default Participant;