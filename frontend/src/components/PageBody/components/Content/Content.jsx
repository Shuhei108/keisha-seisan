import { createContext, useContext, useState } from 'react'
import TopPage from '@/pages/TopPage/TopPage'
import Result from '@/pages/ResultPage/ResultPage'
import LodadingPage from '@/pages/LoadingPage/LoadingPage'
import ChatPage from '@/pages/ChatPage/ChatPage'
import './Content.css'

const inputInfoContext = createContext()

const modelNameMap = {
    "Gemini 2.0": "gemini-2.0-flash",
    "Gemini 2.5 Lite": "gemini-2.5-flash-lite",
    "Gemini 2.5": "gemini-2.5-flash",
    "Gemini 2.5 Pro": "gemini-2.5-pro"
}

const DEFAULT_MODEL_INDEX = 2;

const Content = () => {
    const [participants, setParticipants] = useState([
        {id: "first", name: "部長", count: "1", weight: 70, payment: 0},
        {id: "second", name: "次長", count: "1", weight: 60, payment: 0},
        {id: "third", name: "課長", count: "1", weight: 50, payment: 0},
    ])
    const [rules, setRules] = useState([
        {id: "first", value: "最小単位は500円とする"},
        {id: "second", value: "会計金額と計算結果の合計金額の差が500円未満になるまで計算する"}
    ])
    const [amount, setAmount] = useState("")
    const [status, setStatus] = useState("top")
    const [forms, setForms] = useState([
        {id: "first", flag: true},
        {id: "second", flag: true},
        {id: "totalAmount", flag: false}
    ])
    const [calcError, setCalcError] = useState(false)
    const models = Object.keys(modelNameMap);
    const [model, setModel] = useState(models[DEFAULT_MODEL_INDEX])
    const [surplus, setSurplus] = useState(0)
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
    
    const handlePageChange = (newStatus) => {
        window.scrollTo(0, 0)
        setStatus(newStatus)
    }

    const calculate = async () => {
        handlePageChange("loading")
        setCalcError(false)

        const url = '/api/v1/calc'
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
            const newParticipants = participants.map((participant, i) => {
                participant.payment = resData["settlement_plan"][i]["amount"]
                return participant
            })
            setParticipants(newParticipants)

            const newSurplus = resData["surplus"]
            setSurplus(0)
            if (newSurplus) {
                setSurplus(newSurplus)
            }
        } catch (error) {
            setCalcError(true)
        }
        handlePageChange("result")
    }


    const viewControl = () => {
        if (status === "top") {
            return <TopPage />
        } else if (status === "loading") {
            return <LodadingPage />
        } else if (status === "result") {
            return <Result />
        } else if (status === "chat") {
            return <ChatPage />
        } else {
            return <TopPage />
        }
    }
    
    return (
        <inputInfoContext.Provider value={{ status, handlePageChange, participants, setParticipants, rules,
            setRules, amount, setAmount, forms, setForms, addForms, deleteForms, updateForms, calculate,
            calcError, setCalcError, model, setModel, models, surplus }}>
            <div className='content area'>
                { viewControl() }
            </div>
        </inputInfoContext.Provider>
    )
}

export default Content;
export const useInputInfo = () => useContext(inputInfoContext)