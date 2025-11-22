import Header from '../components/layout/Header'

import insta from '../assets/insta.png'
import whjats from '../assets/whjats.png'
import face from '../assets/face.png'
import email from '../assets/email.png'

export default function Contact(){
    return(
        <>
            <Header />
                <main>
                    <h2>Sobre nós</h2>
                    <p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p>
                    <h2>Como funciona nossa plataforma?</h2>
                    <p>Blábláblá Blábláblá Blábláblá Blábláblá Blábláblá Blábláblá Blábláblá Blábláblá Blábláblá</p>
                    <h2>Precisa de Ajuda? Contate-nos:</h2>
                    <img className="icon" id="insta" src={insta}></img>
                    <img className="icon" id="email" src={email}></img>
                    <img className="icon" id="whatsapp" src={whjats}></img>
                    <img className="icon" id="facebook" src={face}></img>
                </main>
        </>
    )
}