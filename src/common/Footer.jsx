import React, { useState } from 'react'
import '../assets/css/Footer.css'
import { NavLink } from 'react-router-dom'
import { FaLinkedin } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa"

const Footer = () => {
  const [displayFooterLinks, setDisplayFooterLinks] = useState(false)

  return (
    <footer className="p1 flex justify-between items-center">
      <div className="footerSlogan">Immutable Blockchain Voting</div>
      <div className="footerLinks flex justify-center items-center relative">
        <span className="flex items-center"><FaLinkedin onClick={() => setDisplayFooterLinks(!displayFooterLinks)} size="32px" className="linkedInLogo cur-p" /><span className="hideAfter625">&nbsp;&nbsp;:&nbsp;&nbsp;</span></span>
        <div className={displayFooterLinks ? "linkedInLinks flex justify-center items-center gapHalf show" : "linkedInLinks flex justify-center items-center gapHalf"}>
          <NavLink className="links flex justify-center items-center gapHalf" to="https://www.linkedin.com/in/hiren-sarvaiya-3562442aa" target="_blank"><span>Hiren<span className="hideAfter625">&nbsp;&nbsp;|</span></span></NavLink>
          <NavLink className="links flex justify-center items-center gapHalf" to="https://www.linkedin.com/in/vashishth-prajapati-408222275" target="_blank"><span>Vashishth<span className="hideAfter625">&nbsp;&nbsp;|</span></span></NavLink>
          <NavLink className="links flex justify-center items-center gapHalf" to="https://http://www.linkedin.com/in/deep-patel-b20573273" target="_blank"><span>Deep<span className="hideAfter625">&nbsp;&nbsp;|</span></span></NavLink>
          <NavLink className="links flex justify-center items-center gapHalf" to="https://www.linkedin.com/in/bhrugen-suthar-61a70b34b" target="_blank"><span>Bhrugen</span></NavLink>
        </div>
      </div>
    </footer>
  )
}

export default Footer