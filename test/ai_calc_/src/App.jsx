import { useState } from 'react'
import PageHeader from './components/PageHeader/PageHeader'
import PageBody from './components/PageBody/PageBody'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PageHeader title={"AI calculater"}/>
      <PageBody />
    </>
  )
}

export default App
