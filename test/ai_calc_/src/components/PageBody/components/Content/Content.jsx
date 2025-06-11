import { createContext, useContext, useState } from 'react'
import TopPage from '@/pages/TopPage/TopPage'
import Result from '@/pages/ResultPage/ResultPage'
import './Content.css'

const inputInfoContext = createContext()

const Content = () => {
    const [participants, setParticipants] = useState([
        {id: "first", name: "本部長", count: "1", weight: 50, payment: 0},
        {id: "second", name: "課長", count: "1", weight: 50, payment: 0} 
    ])
    const [rules, setRules] = useState([])
    const [amount, setAmount] = useState(100000)
    const [status, setStatus] = useState("top")
    const [forms, setForms] = useState([
        {id: "first", flag: true},
        {id: "second", flag: true},
        {id: "totalAmount", flag: true}
    ])
    const [calcError, setCalcError] = useState(false)
    const addForms = (inputId) => {
        const newForms = [...forms,{id: inputId, flag: false}]
        setForms(newForms)
    }
    const deleteForms = (target) => {
        const newForms = forms.filter((form) => (form.id !== target))
        setForms(newForms);
    }
    const updateForms = (target,val) => {
        const newForms = forms.map((form) => {
            if (form.id === target) {
                form.flag = val
            }
            return form
        })
        setForms(newForms)
    }
    const calculate = async () => {
        setStatus("loading")
        setCalcError(false)
        
        const url = 'http://127.0.0.1:8000/v1/calc'
        const reqData = {
            participants:{},
            rules: null,
            amount: null
        }

        for (let i = 0; i < participants.length; i++) { 
            reqData["participants"][participants[i].name] = {"人数": Number(participants[i].count), "重み": Number(participants[i].weight)  }
        }

        reqData["rules"] = rules.map((rule) => {return rule.value})

        reqData["amount"] = parseInt(amount,10)

        console.log(reqData)
        
        try {
            const response = await fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify(reqData)
            });

            const resData = await response.json();
            console.log(resData)
            const newParticipants = participants.map((participant, i) => {
                participant.payment = resData["settlement_plan"][i]["amount"]
                return participant
            })
            setParticipants(newParticipants)
        } catch (error) {
            setCalcError(true)
        }
        setStatus("result")
    }

    const viewControl = () => {
        if (status === "top") {
            return <TopPage />
        } else if (status === "loading") {
            return <h1>loading...</h1>
        } else if (status === "result") {
            return <Result />
        }
    }
    
    return (
        <inputInfoContext.Provider value={{ status, setStatus, participants, setParticipants, rules,
            setRules, amount, setAmount, forms, setForms, addForms, deleteForms, updateForms, calculate, calcError, setCalcError }}>
            <div className='content area'>
                { viewControl() }
            </div>
        </inputInfoContext.Provider>
    )
}

export default Content;
export const useInputInfo = () => useContext(inputInfoContext)