import { useState } from 'react'
import HelpModal from '@/components/Modal/Help' // モーダルをインポート
import './PageHeader.css'

const PageHeader = ({title}) => {
    const [isHelpOpen, setIsHelpOpen] = useState(false)

    return (
        <>
            <header>
                <div>{title}</div>
                <button onClick={() => {window.location.reload()}}>Top</button>
                <button onClick={() => setIsHelpOpen(true)}>About</button>
            </header>
            {/* ヘルプモーダルの表示 */}
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    )
}

export default PageHeader;