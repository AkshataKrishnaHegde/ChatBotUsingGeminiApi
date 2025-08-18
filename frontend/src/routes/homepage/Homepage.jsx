import { Link } from 'react-router-dom'
import './homepage.css'
import { TypeAnimation } from 'react-type-animation';
import { useState } from 'react';
const Homepage=()=>{

    const [typingStatus,setTypingStatus]=useState("human1")
    return (
        <div className='homepage'>
            <img src="/orbital.png" alt="" className='orbital' />
            <div className="left">
                <h1>QueryNest</h1>
                {/* <h2>Unlock Intelligent Academic & Administrative Support</h2>
                <h3>
                CanBot is a smart AI assistant powered by Retrieval-Augmented Generation (RAG), specifically designed to transform academic and administrative workflows in educational institutions.
                </h3> */}
                <h2>QueryNest is a intelligent chatbot here to answer all your queries!</h2>
                <h3>Start your conversation now!</h3>
                <Link to='/dashboard'>Get Started</Link>
            </div>
            <div className="right">
                <div className="imgContainer">
                    <div className="bgContainer">
                        <div className="bg">

                        </div>

                    </div>
                    <img src="/bot1.png" alt="" className='bot'/>
                    <div className="chat">
                        <img src={typingStatus==="human1"?"/human1.webp":typingStatus==="human2"?"/human2.png":"bot1.png"} alt="" />

    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Human1: What is the full form of RAG?',
        1000, ()=>{
            setTypingStatus('bot')
        },
        'Bot: Retrieval Augmented Generation.',
        1000, ()=>{
            setTypingStatus('human2')
        },
        'Human2: Who is priminister of Inida?',
        1000, ()=>{
            setTypingStatus('bot')
        },
        'Bot: Narendra Modi is current prime minister of India',
        1000, ()=>{
            setTypingStatus('human1')
        },
      ]}
      wrapper="span"
      cursor={true}
      repeat={Infinity}
      omitDeletionAnimation={true}
    />
                    </div>
                </div>
            </div>
        <div className="terms">
            
        </div>
    </div>
)}
export default Homepage