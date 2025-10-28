import { useState } from 'react'
import HelpModal from '@/components/Modal/Help' // モーダルをインポート
import './PageHeader.css'

const PageHeader = ({title}) => {
    const [isHelpOpen, setIsHelpOpen] = useState(false)

    return (
        <>
            <header>
                <h1 className='title'>{title}</h1>
                <div className='header-buttons'>
                    <button onClick={() => {window.location.reload()}}>Top</button>
                    <button onClick={() => setIsHelpOpen(true)}>About</button>
                </div>
            </header>
            {/* ヘルプモーダルの表示 */}
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    )
}

export default PageHeader;