import { RingLoader } from 'react-spinners'
import './LoadingPage.css'

const loaderColor = "#36d7b7";

const LoadingPage = () => {
    return (
        <div className="loading-page-container">
            <h1 className="loading-title">loading...</h1>
            <div className="loading">
                <RingLoader
                    color={loaderColor}
                    size={100}
                    aria-label="Loading Spinner"
                />
            </div>
            <p className="loading-desc">計算には時間がかかります。</p>
        </div>
    )
}

export default LoadingPage;