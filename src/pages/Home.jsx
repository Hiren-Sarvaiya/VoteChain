import React, { useState, useEffect, useContext } from "react"
import "../assets/css/Home.css"
import { ethers } from "ethers"
import VotingSystemABI from "../assets/VotingSystemABI.json"
import Spinner from "../components/Spinner"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { useForm } from "react-hook-form"
import { BiSolidCopy } from "react-icons/bi"

const Home = () => {
  const [contractAddress, setContractAddress] = useState("0x98d5765d22a267a3c70ee7db3e92410501f5ad83")
  const [contratABI, setContratABI] = useState(VotingSystemABI)
  const [tempUserRole, setTempUserRole] = useState("")
  const [candidates, setCandidates] = useState([])
  const [partyCodeFromVoter, setPartyCodeFromVoter] = useState("")
  const [sessionTitleForVoting, setSessionTitleForVoting] = useState("")
  const [mainBtnLoading, setMainBtnLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [submitPartyCodeFromVoterLoading, setSubmitPartyCodeFromVoterLoading] = useState(false)
  const [removeUserBtnLoading, setRemoveUserBtnLoading] = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)
  const [isRadioDisabled, setIsRadioDisabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [userOtp, setUserOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [votePhoneNumber, setVotePhoneNumber] = useState("")
  const [voteGeneratedOtp, setVoteGeneratedOtp] = useState("")
  const [voteUserOtp, setVoteUserOtp] = useState("")
  const [voteOtpSent, setVoteOtpSent] = useState(false)
  const [voteOtpVerified, setVoteOtpVerified] = useState(false)
  const [voteOtpLoading, setVoteOtpLoading] = useState(false)
  const [voteOtpError, setVoteOtpError] = useState("")
  const navigate = useNavigate()

  const { userRole, setUserRole, userAddress, setUserAddress, contract, setContract, getRoleForm, setGetRoleForm, displayTitles, setDisplayTitles, copied, trimAddress, handleCopy } = useContext(AuthContext)
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm()
  const { register: voteRegister, handleSubmit: handleVoteSubmit, setError: setVoteError, reset: voteReset, formState: { errors: voteErrors, isSubmitting: isVoteSubmitting } } = useForm()
  const FAST2SMS_API_KEY = "uV2jBeI8bnd9AtLsiZpzJ4ckK1yTG0ER3r7M6lhxqmwHDYaOQNFq3uxQ70Anz4VeohXy5IrSa1B962CY"

  useEffect(() => {
    if (localStorage.getItem("organizerUser")) {
      localStorage.removeItem("organizerUser")
    } else if (localStorage.getItem("voterUser")) {
      localStorage.removeItem("voterUser")
    }
    if (userRole === "") {
      setDisplayTitles(true)
    } else {
      setDisplayTitles(false)
    }
  }, [])

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const sendOtp = async () => {
    if (!phoneNumber) {
      setOtpError("Please enter a valid phone number.")
      return
    }
    setOtpLoading(true)
    setOtpError("")
    const otp = generateOtp()
    setGeneratedOtp(otp)
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&flash=0&numbers=${phoneNumber}`
    try {
      const response = await fetch(url, { method: "GET" })
      const data = await response.json()
      if (data.return) {
        setOtpSent(true)
      } else {
        setOtpError(data.message || "Failed to send OTP.")
      }
    } catch (error) {
      setOtpError("Error sending OTP.")
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyOtp = async () => {
    setOtpLoading(true)
    setOtpError("")
    if (userOtp === generatedOtp) {
      setOtpVerified(true)
    } else {
      setOtpError("Invalid OTP. Please try again.")
    }
    setOtpLoading(false)
  }

  // ----- Voting OTP Functions -----
  const generateVoteOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const sendVoteOtp = async () => {
    if (!votePhoneNumber) {
      setVoteOtpError("Please enter a valid phone number.")
      return
    }
    setVoteOtpLoading(true)
    setVoteOtpError("")
    const otp = generateVoteOtp()
    setVoteGeneratedOtp(otp)
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&flash=0&numbers=${votePhoneNumber}`
    try {
      const response = await fetch(url, { method: "GET" })
      const data = await response.json()
      if (data.return) {
        setVoteOtpSent(true)
      } else {
        setVoteOtpError(data.message || "Failed to send OTP.")
      }
    } catch (error) {
      setVoteOtpError("Error sending OTP.")
    } finally {
      setVoteOtpLoading(false)
    }
  }

  const verifyVoteOtp = async () => {
    setVoteOtpLoading(true)
    setVoteOtpError("")
    if (voteUserOtp === voteGeneratedOtp) {
      setVoteOtpVerified(true)
    } else {
      setVoteOtpError("Invalid OTP. Please try again.")
    }
    setVoteOtpLoading(false)
  }

  const haldleConnectWallet = async () => {
    try {
      if (window.ethereum) {
        setMainBtnLoading(true)
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setUserAddress(address)
        const contractInstance = new ethers.Contract(contractAddress, contratABI, signer)
        setContract(contractInstance)
        const role = await contractInstance.getUserRole(address)
        if (role == 1) {
          setUserRole("organizer")
          localStorage.setItem("organizerUser", JSON.stringify({ userRole: "organizer", userAddress: address }))
          setDisplayTitles(false)
          navigate("/dashboard")
        } else if (role == 2) {
          setUserRole("voter")
          localStorage.setItem("voterUser", JSON.stringify({ userRole: "voter", userAddress: address }))
          setDisplayTitles(false)
        } else {
          setGetRoleForm(true)
          setDisplayTitles(false)
        }
      } else {
        alert("Please install MetaMask!")
      }
    } catch (error) {
      console.error("Failed to connect account : ", error)
    } finally {
      setMainBtnLoading(false)
      setDisplayTitles(false)
    }
  }

  const registerUser = async (e) => {
    e.preventDefault()
    if (!otpVerified) {
      document.querySelector("#otpError").innerHTML = "Please verify OTP before signing up."
      return
    }
    try {
      if (tempUserRole && contract) {
        setSignupLoading(true)
        setDisplayTitles(false)
        const roleIndex = tempUserRole === "organizer" ? 1 : 2
        const tx = await contract.registerUser(roleIndex)
        const receipt = await tx.wait()
        setUserRole(tempUserRole)
        if (tempUserRole === "organizer") {
          localStorage.setItem("organizerUser", JSON.stringify({ userRole: "organizer", userAddress: userAddress }))
          navigate("/dashboard")
        } else if (tempUserRole === "voter") {
          localStorage.setItem("voterUser", JSON.stringify({ userRole: "voter", userAddress: userAddress }))
        }
        setGetRoleForm(false)
      } else {
        document.querySelector("#roleError").innerHTML = "Select a role"
      }
    } catch (error) {
      console.error("Failed to register user : ", error)
    } finally {
      setSignupLoading(false)
    }
  }

  const handleLogOutVoter = () => {
    try {
      setMainBtnLoading(true)
      setDisplayTitles(true)
      setUserRole("")
      localStorage.removeItem("voterUser")
      setUserAddress("")
      setPartyCodeFromVoter("")
      setCandidates([])
      reset()
      voteReset()
    } catch (error) {
      console.error("Failed to log out : ", error)
    } finally {
      setMainBtnLoading(false)
    }
  }

  const removeUser = async () => {
    try {
      if (confirm("All your data will be deleted")) {
        setRemoveUserBtnLoading(true)
        const tx = await contract.removeUser(userAddress)
        const receipt = await tx.wait()
        setUserRole("")
        localStorage.removeItem("organizerUser")
        setUserAddress("")
        setDisplayTitles(true)
        reset()
        voteReset()
      }
    } catch (error) {
      console.error("Failed to remove user : ", error)
    } finally {
      setRemoveUserBtnLoading(false)
    }
  }

  const onSubmitPartyCodeForVote = async (data) => {
    try {
      setSubmitPartyCodeFromVoterLoading(true)
      setCandidates([])
      const partyCodes = await contract.getAllPartyCodes()
      if (data.partyCodeFromVoter >= 1000 && data.partyCodeFromVoter <= 9999) {
        if (partyCodes.includes(BigInt(data.partyCodeFromVoter))) {
          const fetchedSessionTitle = (await contract.getVotingSession(data.partyCodeFromVoter))[1]
          setSessionTitleForVoting(fetchedSessionTitle)
          const fetchedCandidates = Array.from(await contract.getCandidates(data.partyCodeFromVoter))
          setCandidates(fetchedCandidates)
          reset()
          voteReset()
        } else {
          setError("partyCodeFromVoter", { type: "manual", message: "Invalid party code" })
        }
      } else {
        setError("partyCodeFromVoter", { type: "manual", message: "Party code must be between 1000 and 9999" })
      }
    } catch (error) {
      console.error("Failed to fetch voting session : ", error)
    } finally {
      setSubmitPartyCodeFromVoterLoading(false)
    }
  }

  const onVote = async (data) => {
    try {
      setVoteLoading(true)
      setIsRadioDisabled(true)
      if (!voteOtpVerified) {
        setVoteError("selectedCandidate", { type: "manual", message: "Please verify OTP before voting." })
        return
      }
      const tx = await contract.vote(partyCodeFromVoter, candidates.indexOf(data.selectedCandidate))
      const receipt = await tx.wait()
      setCandidates([])
      reset()
      voteReset()
    } catch (error) {
      console.error("Failed to vote : ", error)
      if (error.message && error.message.includes("Already voted")) {
        setVoteError("selectedCandidate", { type: "manual", message: "You already voted in this session" })
      }
    } finally {
      setIsRadioDisabled(false)
      setVoteLoading(false)
    }
  }

  return (
    <main className="mainContent relative">
      <section className="mainTitle flex flex-col justify-center items-center">
        {displayTitles && (
          <div className="container1 flex flex-col items-center">
            <div className="title">BLOCKCHAIN BASED VOTING SYSTEM</div>
            <div className="subTitle">A PLATFORM YOU CAN TRUST</div>
          </div>
        )}
        <div className="container2 flex justify-center items-center flex-col gap1">
          <div className="btnWrappers relative">
            {userRole === "" && (
              <div className="btnWrappers relative">
                <button disabled={mainBtnLoading} className="secondaryBtn loadingBtns cur-p" style={{ color: mainBtnLoading ? "transparent" : "" }} onClick={haldleConnectWallet}>Connect Metamask Wallet</button>
                {mainBtnLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
              </div>
            )}
            {mainBtnLoading && (
              <Spinner borderColor="#ffffff4d" borderTopSize="4px" size="24px" />
            )}
          </div>
        </div>
      </section>
      {userRole === "voter" && (
        <div title={userAddress} className="addressContainerHome flex items-center gapHalf">
          <p>{trimAddress(userAddress)}</p>
          <BiSolidCopy onClick={handleCopy} className="copyBtn cur-p" />
          {copied && (
            <div className="copiedMessageContainer flex items-center flex-col">
              <div className="triangle"></div>
              <div className="message">Copied</div>
            </div>
          )}
        </div>
      )}
      {userRole === "voter" && (
        <div className="outBtnsContainer flex gap1">
          <div className="btnWrappers relative">
            <button disabled={mainBtnLoading} className="secondaryBtn loadingBtns cur-p" style={{ color: mainBtnLoading ? "transparent" : "" }} onClick={handleLogOutVoter}>Log Out</button>
            {mainBtnLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
          </div>
          <div className="btnWrappers relative">
            <button disabled={removeUserBtnLoading} className="secondaryBtn loadingBtns cur-p" style={{ color: removeUserBtnLoading ? "transparent" : "" }} onClick={removeUser}>Delete Account</button>
            {removeUserBtnLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
          </div>
        </div>
      )}
      {getRoleForm && !otpVerified && (
        <section className="otpVerification flex flex-col justify-center items-center p1">
          <form className="flex justify-center items-center flex-col">
            <h3>Verify Your Phone Number</h3>
            <div className="inputFieldContainers">
              <div className="phoneNumberContainer">
                <label htmlFor="phoneNumber" className={phoneNumber ? "roleLabelActive" : ""}>Mobile No <span className="requiredRed">*</span></label>
                <input autoComplete="off" className="inputs" type="number" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div id="phoneNumberError"></div>
            </div>
            {!otpSent ? (
              <div className="btnWrappers relative">
                <button disabled={otpLoading} className="primaryBtn cur-p" onClick={sendOtp}>{otpLoading ? "Sending OTP..." : "Send OTP"}</button>
              </div>
            ) : (
              <>
                <div className="inputFieldContainers">
                  <div className="userOtpContainer">
                    <label htmlFor="userOtp" className={userOtp ? "roleLabelActive" : ""}>Otp <span className="requiredRed">*</span></label>
                    <input autoComplete="off" className="inputs" type="number" id="userOtp" value={userOtp} onChange={(e) => setUserOtp(e.target.value)} />
                  </div>
                  <div id="userOtpError"></div>
                </div>
                <div className="btnWrappers relative">
                  <button disabled={otpLoading} className="primaryBtn cur-p" onClick={verifyOtp}>{otpLoading ? "Verifying OTP..." : "Verify OTP"}</button>
                </div>
                {otpError && <div className="errors" id="otpError">{otpError}</div>}
              </>
            )}
          </form>
        </section>
      )}
      {getRoleForm && otpVerified && (
        <section className="roleFormContainer flex justify-center items-center p1">
          <form className="flex justify-center items-center flex-col p1 gapHalf relative" onSubmit={registerUser}>
            <div className="selectRoleWrapper"><h3>Select a Role :</h3></div>
            <div className="radioBtnContainer">
              <label style={{ cursor: isRadioDisabled ? "not-allowed" : "pointer" }} className="cur-p flex items-center gap1">
                <input onChange={(e) => setTempUserRole(e.target.value)} name="role" className="customRadio cur-p" type="radio" disabled={isRadioDisabled} value="organizer" />
                Organizer
              </label>
            </div>
            <div className="radioBtnContainer">
              <label style={{ cursor: isRadioDisabled ? "not-allowed" : "pointer" }} className="cur-p flex items-center gap1 mb1">
                <input onChange={(e) => setTempUserRole(e.target.value)} name="role" className="customRadio cur-p" type="radio" disabled={isRadioDisabled} value="voter" />
                Voter
              </label>
            </div>
            <div id="roleError"></div>
            <div className="btnWrappers relative">
              <input style={{ color: signupLoading ? "gray" : "" }} disabled={signupLoading} onClick={(e) => registerUser(e)} id="submit" className="primaryBtn cur-p loadingBtns" type="submit" value="Sign UP" />
              {signupLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
            </div>
          </form>
        </section>
      )}
      {(userRole === "voter" || userRole === "organizer") && (
        <section className="voteFormWrapper flex justify-center items-center flex-col gap1">
          <div className="voteTitlesContainer flex justify-center items-center flex-col">
            <h1>Vote</h1>
            <p>Casting Votes in Digital Age</p>
          </div>
          <div className="voteFormContainer flex justify-center items-center flex-col gapHalf">
            <form onSubmit={handleSubmit(onSubmitPartyCodeForVote)} className="flex justify-between items-center gap1">
              <div className="partyCodeFromVoterFieldContainers">
                <div className="partyCodeFromVoterContainer">
                  <label htmlFor="partyCodeFromVoter" className={(partyCodeFromVoter || partyCodeFromVoter === 0) ? "roleLabelActive" : ""}>Party Code <span className="requiredRed">*</span></label>
                  <input autoComplete="off" {...register("partyCodeFromVoter", { required: { value: true, message: "Enter party code" } })} className="inputs" type="number" id="partyCodeFromVoter" value={partyCodeFromVoter} onChange={(e) => setPartyCodeFromVoter(e.target.value === "" ? "" : parseInt(e.target.value))} />
                </div>
                {errors.partyCodeFromVoter && <div className="errors">{errors.partyCodeFromVoter.message}</div>}
              </div>
              <div className="btnWrappers relative">
                <input style={{ color: submitPartyCodeFromVoterLoading ? "gray" : "" }} disabled={isSubmitting} id="submit" className="primaryBtn cur-p loadingBtns" type="submit" value="Submit" />
                {submitPartyCodeFromVoterLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
              </div>
            </form>
            {candidates.length > 0 && !voteOtpVerified && (
              <section className="otpVerification2 flex flex-col justify-center items-center p1">
                <form className="flex justify-center items-center flex-col">
                  <h3>Verify Your Phone Number to Vote</h3>
                  <div className="inputFieldContainers">
                    <div className="votePhoneNumberContainer">
                      <label htmlFor="votePhoneNumber" className={votePhoneNumber ? "roleLabelActive" : ""}>Mobile No <span className="requiredRed">*</span></label>
                      <input autoComplete="off" className="inputs" type="number" id="votePhoneNumber" value={votePhoneNumber} onChange={(e) => setVotePhoneNumber(e.target.value)} />
                    </div>
                    <div id="votePhoneNumberError"></div>
                  </div>
                  {!voteOtpSent ? (
                    <div className="btnWrappers relative">
                      <button disabled={voteOtpLoading} className="primaryBtn cur-p" onClick={sendVoteOtp}>
                        {voteOtpLoading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="inputFieldContainers">
                        <div className="voteUserOtpContainer">
                          <label htmlFor="voteUserOtp" className={voteUserOtp ? "roleLabelActive" : ""}>Otp <span className="requiredRed">*</span></label>
                          <input autoComplete="off" className="inputs" type="number" id="voteUserOtp" value={voteUserOtp} onChange={(e) => setVoteUserOtp(e.target.value)} />
                        </div>
                        <div id="voteUserOtpError"></div>
                      </div>
                      <div className="btnWrappers relative">
                        <button disabled={voteOtpLoading} className="primaryBtn cur-p" onClick={verifyVoteOtp}>
                          {voteOtpLoading ? "Verifying OTP..." : "Verify OTP"}
                        </button>
                      </div>
                      {voteOtpError && <div className="errors">{voteOtpError}</div>}
                    </>
                  )}                                                                                                                                                                
                </form>
              </section>
            )}
            {candidates.length > 0 && voteOtpVerified && (
              <form onSubmit={handleVoteSubmit(onVote)} className="flex flex-col justify-center items-center">
                <div className="sessionTitleWrapper"><h1>{sessionTitleForVoting} :</h1></div>
                <div className={`candidatesContainer flex flex-col gapHalf ${candidates.length > 4 ? "scrollable justify-start" : "justify-center"}`}>
                  {candidates.map((cName, index) => (
                    <div key={index} className="radioBtnContainer">
                      <label style={{ cursor: isRadioDisabled ? "not-allowed" : "pointer" }} className="cur-p flex items-center gap1">
                        <input className="customRadio cur-p" type="radio" disabled={isRadioDisabled} value={cName} {...voteRegister("selectedCandidate", { required: { value: true, message: "Select a candidate" } })} />
                        {cName}
                      </label>
                    </div>
                  ))}
                </div>
                {voteErrors.selectedCandidate && <div className="errors" id="voteError">{voteErrors.selectedCandidate.message}</div>}
                <div className="btnWrappers relative">
                  <input style={{ color: voteLoading ? "gray" : "" }} disabled={isVoteSubmitting} id="submit" className="primaryBtn cur-p loadingBtns" type="submit" value="Vote" />
                  {voteLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default Home