import React from 'react'
import "../assets/css/AboutUs.css"

const AboutUs = () => {
  return (
    <main className="mainContent p1">
      <div className="aboutSiteContainer">
        <div className="aboutSite">
          <h1 className="aboutH1s">VoteChain | Immutable Blockchain Voting</h1>
          <h2 className="aboutH2s">Overview</h2>
          <p className="aboutPs">VoteChain is a decentralized voting platform designed to eliminate election fraud, ensure transparency, and provide a seamless voting experience. By leveraging blockchain technology, it guarantees immutability, security, and real-time verifiability of votes, making it tamper-proof and trustless.</p>

          <h2 className="aboutH2s">Technical Architecture</h2>

          <h3 className="aboutH3s">1. Modern Frontend Architecture</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>Framework :</strong> Built using Vite + React for fast and modular UI.</li>
            <li className="aboutLIs"><strong>Wallet Integration :</strong> Uses ethers.js to connect with MetaMask.</li>
          </ul>

          <h3 className="aboutH3s">2. Secure Smart Contracts</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>On-Chain Voting :</strong> Votes are stored immutably and verifiable on Ethereum Sepolia.</li>
            <li className="aboutLIs"><strong>Access Control :</strong> Role-based permissions—organizers create sessions, voters cast votes.</li>
          </ul>

          <h3 className="aboutH3s">3. Decentralized & Trustless System</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>Blockchain Storage :</strong> All votes are recorded on-chain, eliminating central control.</li>
            <li className="aboutLIs"><strong>Tamper-Proof :</strong> Cryptographic hashing secures votes from manipulation.</li>
          </ul>

          <h3 className="aboutH3s">4. Real-Time Vote Counting</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>Instant Processing :</strong> Votes are tallied live on-chain.</li>
            <li className="aboutLIs"><strong>Public Verification :</strong> Results are accessible via Etherscan or VoteChain UI.</li>
          </ul>

          <h3 className="aboutH3s">5. User Authentication & Role Management</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>Organizer Role :</strong> Manages elections and generates Party Codes.</li>
            <li className="aboutLIs"><strong>Voter Role :</strong> Uses Party Code to participate.</li>
          </ul>

          <h3 className="aboutH3s">6. Smart Contract Security</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>Replay Attack Prevention :</strong> Uses nonces and hashing.</li>
            <li className="aboutLIs"><strong>Auditing :</strong> Contracts are tested manually before deployment on Etherscan.</li>
          </ul>

          <h3 className="aboutH3s">7. User-Friendly Interface</h3>
          <ul className="aboutULs">
            <li className="aboutLIs"><strong>Optimized UI/UX :</strong> Designed for ease of use and mobile responsiveness.</li>
            <li className="aboutLIs"><strong>Multi-Device Support :</strong> Works on mobile, desktop, and Web3 browsers.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default AboutUs