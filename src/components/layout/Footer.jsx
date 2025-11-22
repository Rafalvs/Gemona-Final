import { Link } from 'react-router-dom';

export default function Footer(){
    return(
        <>
        <footer>
        <Link to="/contact"><button>Sobre nós</button></Link>
        </footer>
        </>
    )
}