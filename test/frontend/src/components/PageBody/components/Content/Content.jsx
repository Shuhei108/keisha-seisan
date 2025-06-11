import { createContext, useContext, useState } from 'react'
import TopPage from '@/pages/TopPage/TopPage'
import Result from '@/pages/ResultPage/ResultPage'
import LodadingPage from '@/pages/LoadingPage/LoadingPage'
import './Content.css'

const inputInfoContext = createContext()

const modelNameMap = {
    "Gemini 1.5": "gemini-1.5-flash",
    "Gemini 2.0": "gemini-2.0-flash",
    "Gemini 2.5": "gemini-2.5-flash-preview-05-20",
}

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
    const [model, setModel] = useState("Gemini 2.0")
    const models = ["Gemini 1.5", "Gemini 2.0", "Gemini 2.5"]
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
        
        const url = 'http://192.168.11.2:8000/v1/calc'
        const reqData = {
            participants:{},
            rules: null,
            amount: null,
            model: null
        }

        for (let i = 0; i < participants.length; i++) { 
            reqData["participants"][participants[i].name] = {"人数": Number(participants[i].count), "重み": Number(participants[i].weight)  }
        }

        reqData["rules"] = rules.map((rule) => {return rule.value})

        reqData["amount"] = parseInt(amount,10)

        reqData["model"] = modelNameMap[model]

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
            return <LodadingPage />
        } else if (status === "result") {
            return <Result />
        }
    }
    
    return (
        <inputInfoContext.Provider value={{ status, setStatus, participants, setParticipants, rules,
            setRules, amount, setAmount, forms, setForms, addForms, deleteForms, updateForms, calculate, calcError, setCalcError, model, setModel, models }}>
            <div className='content area'>
                { viewControl() }
            </div>
        </inputInfoContext.Provider>
    )
}

export default Content;
export const useInputInfo = () => useContext(inputInfoContext)