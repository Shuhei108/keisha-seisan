import Participants from './components/Participants'
import Rules from './components/Rules'
import TotalAmount from './components/TotalAmount'
import Execute from './components/Execute'
import './TopPage.css'

const TopPage = () => {
    return (
        <div className='top-page'>
            <Participants/>
            <Rules/>
            <TotalAmount/>
            <Execute/>
        </div>
    )
}

export default TopPage;