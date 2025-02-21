import React, { useContext, useState, useEffect } from 'react'
import "../assets/css/Result.css"
import { useForm } from "react-hook-form"
import { ethers } from "ethers"
import { AuthContext } from '../context/AuthContext'
import VotingSystemABI from "../assets/VotingSystemABI.json"
import { useNavigate } from 'react-router-dom'
import Spinner from "../components/Spinner"

const Result = () => {
  const [partyCodeForResult, setPartyCodeForResult] = useState("")
  const [submitPartyCodeForResult, setSubmitPartyCodeForResult] = useState(false)
  const [winnersAndSession, setWinnersAndSession] = useState({})
  const [tempUserRole, setTempUserRole] = useState("")
  const [getRoleFormAtResult, setGetRoleFormAtResult] = useState(false)
  const [winnersAndSessionFetched, setWinnersAndSessionFetched] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [connetBtnLoading, setConnetBtnLoading] = useState(false)
  const [contractAddress, setContractAddress] = useState("0x98d5765D22A267A3C70Ee7Db3E92410501f5Ad83")
  const [contratABI, setContratABI] = useState(VotingSystemABI)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [userOtp, setUserOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")

  const { register, handleSubmit, setValue, setError, reset, formState: { errors, isSubmitting } } = useForm()
  const { userRole, setUserRole, userAddress, setUserAddress, contract, setContract, setDisplayTitles, setNavigateToResult, setGetRoleForm } = useContext(AuthContext)
  const FAST2SMS_API_KEY = "uV2jBeI8bnd9AtLsiZpzJ4ckK1yTG0ER3r7M6lhxqmwHDYaOQNFq3uxQ70Anz4VeohXy5IrSa1B962CY"

  useEffect(() => {
    if (localStorage.getItem("organizerUser")) {
      localStorage.removeItem("organizerUser")
    } else if (localStorage.getItem("voterUser")) {
      localStorage.removeItem("voterUser")
    }
  }, [])

  const processData = (data, candidates) => {
    const tempVotesOfEachCandidate = []
    for (let i = 0; i < data[1].length; i++) {
      tempVotesOfEachCandidate[i] = parseInt(data[1][i])
    }

    const processedData = {
      session: {
        partyCode: parseInt(data[0][0]),
        title: data[0][1],
        organizer: data[0][2],
        candidateCount: parseInt(data[0][4]),
        totalVoteCount: data[0][5].length
      },
      votesOfEachCandidate: tempVotesOfEachCandidate,
      winners: data[2],
      candidates: candidates
    }
    return processedData
  }

  const onSubmitPartyCodeForResult = async (data) => {
    try {
      setSubmitPartyCodeForResult(true)
      setWinnersAndSession({})
      setWinnersAndSessionFetched(false)
      console.log("Submitted party code data:", data)
      const partyCodes = await contract.getAllPartyCodes()
      console.log("All party codes:", partyCodes)
      if (data.partyCodeForResult >= 1000 && data.partyCodeForResult <= 9999) {
        if (partyCodes.includes(BigInt(data.partyCodeForResult))) {
          console.log("Party code exists. Fetching result...")
          const fetchedData = Array.from(await contract.getWinnersAndSession(data.partyCodeForResult))
          console.log("Candidates fetched : ", fetchedData)

          const fetchedCandidates = Array.from(await contract.getCandidates(data.partyCodeForResult))
          console.log("Candidates fetched : ", fetchedCandidates)

          setWinnersAndSession(processData(fetchedData, fetchedCandidates))
          setWinnersAndSessionFetched(true)
          reset()
        } else {
          setError("partyCodeForResult", { type: "manual", message: "Invalid party code" })
        }
      } else {
        setError("partyCodeForResult", { type: "manual", message: "Party code must be between 1000 and 9999" })
      }
    } catch (error) {
      console.error("Failed to fetch voting result : ", error)
    } finally {
      setSubmitPartyCodeForResult(false)
    }
  }

  const haldleConnectWalletForResult = async () => {
    try {
      if (window.ethereum) {
        setConnetBtnLoading(true)
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
        } else if (role == 2) {
          setUserRole("voter")
          localStorage.setItem("voterUser", JSON.stringify({ userRole: "voter", userAddress: address }))
          setDisplayTitles(false)
        } else {
          setGetRoleFormAtResult(true)
        }
      } else {
        alert("Please install MetaMask!")
      }
    } catch (error) {
      console.error("Failed to connect account : ", error)
    } finally {
      setConnetBtnLoading(false)
      setDisplayTitles(false)
    }
  }

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

  const registerUser = async (e) => {
    e.preventDefault()
    try {
      if (!otpVerified) {
        document.querySelector("#otpError").innerHTML = "Please verify OTP before signing up."
        return
      }
      if (tempUserRole && contract) {
        setSignupLoading(true)
        const roleIndex = tempUserRole === "organizer" ? 1 : 2
        const tx = await contract.registerUser(roleIndex)
        console.log("Transaction sent, waiting for confirmation...")
        const receipt = await tx.wait()
        setUserRole(tempUserRole)
        if (tempUserRole === "organizer") {
          localStorage.setItem("organizerUser", JSON.stringify({ userRole: "organizer", userAddress: userAddress }))
          setDisplayTitles(false)
        } else if (tempUserRole == "voter") {
          localStorage.setItem("voterUser", JSON.stringify({ userRole: "voter", userAddress: userAddress }))
          setDisplayTitles(false)
        }
        setGetRoleFormAtResult(false)
        console.log("User registered successfully : ", receipt)
      } else {
        document.querySelector("#roleError").innerHTML = "Select a role"
      }
    } catch (error) {
      console.error("Failed to register user : ", error)
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <main className="mainContent">
      <section className="flex jusify-center items-center flex-col gap1">
        <div className="resultTitlesContainer flex justify-center items-center flex-col">
          <h1>Results</h1>
          <p>Discover Your Future Winning Candidate Here</p>
        </div>
        {(userRole === "organizer" || userRole === "voter") ? (
          <div className="partyCodeForResultFormContainer">
            <form onSubmit={handleSubmit(onSubmitPartyCodeForResult)} className="flex justify-between items-center gap1">
              <div className="partyCodeForResultFieldContainers">
                <div className="partyCodeForResultContainer">
                  <label htmlFor="partyCodeForResult" className={partyCodeForResult ? "partyCodeForResultLabelActive" : ""}>Party Code <span className="requiredRed">*</span></label>
                  <input autoComplete="off" {...register("partyCodeForResult", { required: { value: true, message: "Enter party code" } })} className="inputs" type="number" id="partyCodeForResult" value={partyCodeForResult} onChange={(e) => setPartyCodeForResult(e.target.value === "" ? "" : parseInt(e.target.value))} />
                </div>
                {errors.partyCodeForResult && <div className="errors">{errors.partyCodeForResult.message}</div>}
              </div>
              <div className="btnWrappers relative">
                <input style={{ color: submitPartyCodeForResult ? "gray" : "" }} disabled={isSubmitting} id="submit" className="primaryBtn cur-p loadingBtns" type="submit" value="Submit" />
                {submitPartyCodeForResult && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
              </div>
            </form>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <div className="btnWrappers relative">
              <button className="secondaryBtn loadingBtns cur-p" disabled={connetBtnLoading} style={{ color: connetBtnLoading ? "transparent" : "" }} onClick={haldleConnectWalletForResult}>Connect Metamask Wallet</button>
              {connetBtnLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
            </div>
          </div>
        )}
        {getRoleFormAtResult && !otpVerified && (
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
                  <button disabled={otpLoading} className="primaryBtn cur-p" onClick={sendOtp}>
                    {otpLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
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
                    <button disabled={otpLoading} className="primaryBtn cur-p" onClick={verifyOtp}>
                      {otpLoading ? "Verifying OTP..." : "Verify OTP"}
                    </button>
                  </div>
                  {otpError && <div className="errors" id="otpError">{otpError}</div>}
                </>
              )}
            </form>
          </section>
        )}
        {getRoleFormAtResult && otpVerified && (
          <section className="roleFormContainer flex justify-center items-center p1">
            <form className="flex justify-center items-center flex-col p1 gapHalf relative">
              <div className="selectRoleWrapper"><h3>Select a Role :</h3></div>
              <div className="radioBtnContainer">
                <label className="cur-p flex items-center gap1">
                  <input onChange={(e) => setTempUserRole(e.target.value)} className="customRadio cur-p" type="radio" name="role" value="organizer" />
                  Organizer
                </label>
              </div>
              <div className="radioBtnContainer">
                <label className="cur-p flex items-center gap1 mb1">
                  <input onChange={(e) => setTempUserRole(e.target.value)} className="customRadio cur-p" type="radio" name="role" value="voter" />
                  Voter
                </label>
              </div>
              <div id="roleError"></div>
              <div className="btnWrappers relative">
                <input style={{ color: signupLoading ? "gray" : "" }} disabled={signupLoading} onClick={(e) => registerUser(e)} id="submit" className="primaryBtn cur-p loadingBtns" type="submit" value="Sign UP" />
                {signupLoading && <Spinner borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
              </div>
            </form>
          </section>
        )}
        <div className="winnersContainer flex justify-center items-center flex-col">
          {(winnersAndSessionFetched && (userRole === "organizer" || userRole === "voter")) && (
            <>
              {(winnersAndSession != {}) ? (
                <>
                  <h1>{winnersAndSession.session.title}</h1>
                  {winnersAndSession.winners.length == 0 ? (
                    <h3>Nobody Voted...</h3>
                  ) : winnersAndSession.winners.length == 1 ? (
                    <h3>Winner : {winnersAndSession.winners[0]}</h3>
                  ) : (winnersAndSession.winners.length == 2) ? (
                    <h3>It was a tie between {winnersAndSession.winners[0]} and {winnersAndSession.winners[1]}</h3>
                  ) : (winnersAndSession.winners.length > 2) && (
                    <h3>It was a tie between {winnersAndSession.winners.slice(0, -1).join(", ") + " and " + winnersAndSession.winners.slice(-1)}</h3>
                  )}
                  <div className={`resultTableContainer ${winnersAndSession.candidates.length > 4 ? "scrollable" : "justify-center"}`}>
                    <table className="resultTable">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Candidates</th>
                          <th>Votes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {winnersAndSession.candidates.length > 0 && (
                          <>
                            {winnersAndSession.candidates.map((candidate, index) => {
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{candidate}</td>
                                  <td>{winnersAndSession.votesOfEachCandidate[index]}</td>
                                </tr>
                              )
                            })}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p>Nobody voted...</p>
              )}
            </>
          )}
        </div>
      </section >
    </main >
  )
}

export default Result