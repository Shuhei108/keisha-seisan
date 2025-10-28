import { useEffect, useRef } from 'react'
import './Ad.css'

const Ad = () => {
    const adRef = useRef(null)

    useEffect(() => {
        // スクリプトがまだ読み込まれていなければ追加
        if (!window.adsbygoogle && !document.getElementById('adsbygoogle-js')) {
            const script = document.createElement('script')
            script.id = 'adsbygoogle-js'
            script.async = true
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2002766874566798'
            script.crossOrigin = 'anonymous'
            document.body.appendChild(script)
        }
        // 広告の初期化
        if (window.adsbygoogle && adRef.current) {
            try {
                window.adsbygoogle.push({})
            } catch (e) {
                // 2回目以降のpushはエラーになることがあるので握りつぶす
            }
        }
    }, [])

    return (
        <div className='ad area'>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-2002766874566798"
                data-ad-slot="5188368564"
                data-ad-format="auto"
                data-full-width-responsive="true"
                ref={adRef}
            />
        </div>
    )
}

export default Ad;