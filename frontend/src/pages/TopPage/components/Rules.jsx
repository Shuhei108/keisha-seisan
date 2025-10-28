import { useState } from 'react'
import { useInputInfo } from '@/components/PageBody/components/Content/Content'
import Rule from './Rule'
import HelpModal from '@/components/Modal/RuleHelp'
import { FaQuestionCircle } from "react-icons/fa";
import './Rules.css'

const Rules = () => {
    const { rules, setRules, addForms, deleteForms, updateForms } = useInputInfo()
    const [isHelpOpen, setIsHelpOpen] = useState(false)

    const deleteRule = (id) => {
        const newRules = rules.filter((rule) => (rule.id !== id));
        deleteForms(id);
        setRules(newRules);
    }

    const generateId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`

    const addRule = () => {
        const inputId = generateId()
        const newRule = {id: inputId, value: ""}
        const newRules = [...rules, newRule]
        addForms(newRule.id);
        setRules(newRules);
    }
    const changeRule = (id,val) => {
        const newRules = rules.map((rule)=> {
            if (rule.id === id) {
                rule.value = val
                if (val !== "") {
                    updateForms(id,true)
                } else {
                    updateForms(id,false)
                }
            }
            return rule
        })
        setRules(newRules)
    }

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <td></td>
                        <td colSpan="3">
                            <div className="rules-header">
                                <h2>精算ルール</h2>
                                <FaQuestionCircle
                                    size={16}
                                    className="rules-help-icon"
                                    onClick={() => setIsHelpOpen(true)}
                                    title="参加者入力のヘルプ"
                                />
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {rules.map((rule) => (
                        <Rule
                            key={rule.id}
                            rule={rule}
                            deleteRule={() => {deleteRule(rule.id)}}
                            changeRule={(val) => {changeRule(rule.id,val)}}
                            updateForms={(val) => {updateForms(rule.id,val)}}
                        />
                    ))}
                    <tr>
                        <td className='col-1'><button onClick={addRule}>+</button></td>
                        <td colSpan="3"></td>
                    </tr>
                </tbody>
            </table>
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    )
}

export default Rules;