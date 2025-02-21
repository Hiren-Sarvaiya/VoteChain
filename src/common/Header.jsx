import React, { useContext, useState } from "react"
import "../assets/css/Header.css"
import { NavLink, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { RxHamburgerMenu } from "react-icons/rx"

const Header = () => {
  const { userRole, setUserRole, setUserAddress, setGetRoleForm, setDisplayTitles, displayNavLinks, setDisplayNavLinks } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogOutOrganizer = () => {
    try {
      setUserRole("")
      localStorage.removeItem("organizerUser")
      setUserAddress("")
      navigate("/")
      setDisplayTitles(true)
      setGetRoleForm(false)
      setDisplayNavLinks(false)
      console.log("User logged out successfully")
    } catch (error) {
      console.error("Failed to log out : ", error)
    }
  }

  return (
    <header>
      <nav className="flex justify-between p1 relative">
        <div className="logoContainer">
          <NavLink className="logoLink links flex justify-center items-center cur-p" to="/">
            <div className="logo">Vote</div>
            <img src="/chain.svg" alt="Chain" />
          </NavLink>
        </div>
        <div style={{ display: (userRole === "" || userRole === "voter") && "flex" }} className={displayNavLinks ? "navLinks flex gapHalf show" : "navLinks flex"}>
          <NavLink className="links" to="/aboutus"><button className="headerBtns cur-p">About Us</button></NavLink>
          <NavLink className="links" to="/results"><button className="headerBtns cur-p">Results</button></NavLink>
          {userRole == "organizer" &&
            <>
              <NavLink className="links" to="/dashboard"><button className="headerBtns cur-p">Dashboard</button></NavLink>
              <NavLink className="links" to="/dashboard"><button onClick={handleLogOutOrganizer} className="headerBtns cur-p links">Log Out</button></NavLink>
            </>
          }
        </div>
        <RxHamburgerMenu onClick={() => setDisplayNavLinks(!displayNavLinks)} style={{ display: (userRole === "" || userRole === "voter") && "none" }} className="hamburger cur-p" size="32px" />
      </nav>
    </header>
  )
}

export default Header