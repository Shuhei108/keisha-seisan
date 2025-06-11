import { useState } from 'react'
import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import Participant from './Participant'
import HelpModal from '@/components/Modal/ParticipantHelp' // モーダルをインポート
import { FaQuestionCircle } from "react-icons/fa";

const Participants = () => {
    const { participants, setParticipants, addForms, deleteForms, updateForms } = useInputInfo()

    const [checkInput,setCheckInput] = useState(true)
    const [isHelpOpen, setIsHelpOpen] = useState(false)

    const addParticipant = () => {
        const inputId = crypto.randomUUID()
        if (participants.length > 0) {
            const newParticipants = [...participants, {id: inputId, name: "", count: 1, weight: participants[participants.length-1].weight, payment: 0}];
            setParticipants(newParticipants);
        } else {
            setParticipants([{id: inputId, name: "", count: "1", weight: 50, payment: 0}])
        }
        addForms(inputId)
        setCheckInput(true)
    }

    const deleteParticipant = (target) => {
        const newParticipants = participants.filter((Participant) => (Participant.id !== target))
        setParticipants(newParticipants);
        deleteForms(target)
        if (newParticipants.length <= 0) {
            setCheckInput(false)
        }
    }

    const changeName = (id,val) => {
        const newParticipants = participants.map((participant)=> {
            if (participant.id === id) {
                participant.name = val
                if (val !== "") {
                    updateForms(id,true)
                } else {
                    updateForms(id,false)
                }
            }
            return participant
        })
        setParticipants(newParticipants)
    }

    const changeCount = (id,val) => {
        const newParticipants = participants.map((participant)=> {
            if (participant.id === id) {
                participant.count = val
            }
            return participant
        })
        setParticipants(newParticipants)
    }

    const changeWeight = (id,val) => {
        const regex = /^([1-9]|[1-9][0-9]|100)$/;
        let afterFlag = false
        const newParticipants = participants.map((participant)=> {
            if (participant.id === id) {
                afterFlag = true
                if (regex.test(val) || val === "") {
                    participant.weight = val
                } 
            }else if ((parseInt(participant.weight,10) >= parseInt(val,10) && afterFlag) ||
                (parseInt(participant.weight,10) <= parseInt(val,10) && !afterFlag)) {
                if (regex.test(val) || val === "") {
                    participant.weight = val
                } 
            }
            return participant
        })
        setParticipants(newParticipants)
    }

    const checkWeight = (id,val) => {
        const newParticipants = participants.map((participant)=> {
            if (participant.id === id) {
                if (val === "") {
                    participant.weight = 50
                } 
            }
            return participant
        })
        setParticipants(newParticipants)
    }

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <td></td>
                        <td colSpan="3" style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ marginRight: '8px' }}>参加者</h2>
                            <FaQuestionCircle 
                                size={16} 
                                style={{ cursor: 'pointer' }} 
                                onClick={() => setIsHelpOpen(true)} 
                                title="参加者入力のヘルプ" 
                            />
                        </td>
                    </tr>
                    <tr>
                        <th className='col-1'></th>
                        <th className='col-2'>職位（必須）</th>
                        <th className='col-3'>人数</th>
                        <th className='col-4'>重みづけ</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((participant) => {
                        return (
                            <Participant
                                key={participant.id}
                                participant={participant}
                                deleteParticipant={() => {deleteParticipant(participant.id)}}
                                changeName={(val) => {changeName(participant.id,val)}}
                                changeCount={(val) => {changeCount(participant.id,val)}}
                                changeWeight ={(val) => {changeWeight (participant.id,val)}}
                                checkWeight={(val) => {checkWeight(participant.id,val)}}
                                updateForms={(val) => {updateForms(participant.id,val)}}
                            />
                        )
                    })}
                    <tr>
                        <td className='col-1'><button onClick={addParticipant}>+</button></td>
                        <td colSpan="3"></td>
                    </tr>
                    { !checkInput && <tr><td></td><td style={{color: 'red'}}>参加者を設定してください。</td></tr> }
                </tbody>
            </table>

            {/* ヘルプモーダルの表示 */}
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    )
}

export default Participants;