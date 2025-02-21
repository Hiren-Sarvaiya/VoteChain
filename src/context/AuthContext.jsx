import React, { createContext, useState } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [contract, setContract] = useState("")
  const [getRoleForm, setGetRoleForm] = useState(false)
  const [displayTitles, setDisplayTitles] = useState(true)
  const [copied, setCopied] = useState(false)
  const [displayNavLinks, setDisplayNavLinks] = useState(false)

  const trimAddress = (address) => {
    if (!address) { return "" }
    return `${address.slice(0, 7)}...${address.slice(-5)}`
  }

  const removeUser = async () => {
    try {
      if (confirm("All your data will be deleted")) {
        const tx = await contract.removeUser(userAddress)
        console.log("Transaction sent, waiting for confirmation...")

        const receipt = await tx.wait()
        setUserRole("")
        localStorage.removeItem("user")
        setUserAddress("")
        console.log("User removed successfully", receipt)
      }
    } catch (error) {
      console.error("Failed to remove user : ", error)
    }
  }

  const handleLogOut = () => {
    try {
      setUserRole("")
      localStorage.removeItem("user")
      setUserAddress("")
      console.log("User removed successfully")
    } catch (error) {
      console.error("Failed to log out : ", error)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, userAddress, setUserAddress, contract, setContract, getRoleForm, setGetRoleForm, displayTitles, setDisplayTitles, copied, setCopied, displayNavLinks, setDisplayNavLinks, handleCopy, trimAddress, removeUser, handleLogOut }}>
      {children}
    </AuthContext.Provider>
  )
}