import React, { useState, useContext, useEffect } from "react"
import "../assets/css/Dashboard.css"
import { AuthContext } from "../context/AuthContext"
import { NavLink, useNavigate } from "react-router-dom"
import { MdDelete } from "react-icons/md"
import Spinner from "../components/Spinner"
import { BiSolidCopy } from "react-icons/bi"

const Dashboard = () => {
  const { userRole, setUserRole, userAddress, setUserAddress, contract, copied, handleCopy, trimAddress } = useContext(AuthContext)
  const [votingSessions, setVotingSessions] = useState([])
  const [removeUserBtnLoading, setRemoveUserBtnLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [isDeletingVS, setIsDeletingVS] = useState(false)
  const navigate = useNavigate()
  const [isLessThan775, setIsLessThan775] = useState(window.innerWidth < 775)

  useEffect(() => {
    const handleResize = () => setIsLessThan775(window.innerWidth < 775)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (userRole === "") {
      navigate("/", { replace: true })
    }
  }, [userRole])

  useEffect(() => {
    if (userRole === "organizer") {
      fetchVotingSessions()
    }
  }, [])

  const fetchVotingSessions = async () => {
    if (!userAddress || !contract) return

    try {
      const sessions = await contract.getOrganizerSessions()
      const formattedSessions = await Promise.all(
        sessions.map(async (session) => ({
          partyCode: session.partyCode.toString(),
          name: session.name,
          organizer: session.organizer,
          exists: session.exists,
          candidates: await fetchCandidates(session.partyCode),
          candidateCount: session.candidateCount.toString(),
          voters: session.voters || []
        }))
      )
      console.log(JSON.stringify(formattedSessions, null, 2))
      setVotingSessions(formattedSessions)
    } catch (error) {
      console.error("Error fetching voting sessions:", error)
    }
  }

  const fetchCandidates = async (partyCode) => {
    try {
      console.log("Fetching candidates for partyCode", partyCode)
      const candidates = await contract.getCandidates(partyCode)
      return candidates || []
    } catch (error) {
      console.error("Error fetching candidates: ", error)
      return []
    }
  }

  const removeUser = async () => {
    try {
      if (confirm("All your data will be deleted")) {
        setRemoveUserBtnLoading(true)
        const tx = await contract.removeUser(userAddress)
        console.log("Transaction sent, waiting for confirmation...")

        const receipt = await tx.wait()
        setUserRole("")
        localStorage.removeItem("organizerUser")
        setUserAddress("")
        console.log("User removed successfully", receipt)
      }
    } catch (error) {
      console.error("Failed to remove user : ", error)
    } finally {
      setRemoveUserBtnLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshLoading(true)
    await fetchVotingSessions()
    setRefreshLoading(false)
  }

  const handleDeleteVotingSession = async (partyCode) => {
    try {
      setIsDeletingVS(true)
      console.log("Deleting voting session...", partyCode)
      const tx = await contract.terminateVotingSession(partyCode)
      console.log("Transaction sent, waiting for confirmation...")
      const receipt = await tx.wait()
      console.log("Voting session deleted successfully:", receipt)
      await handleRefresh()
    } catch (error) {
      console.error("Failed to delete session:", error)
    } finally {
      setIsDeletingVS(false)
    }
  }

  return (
    <main>
      <section className="p1">
        {userRole === "organizer" && (
          <div className="dashboardContainer">
            <div className="headingContainer flex justify-between items-center">
              <div className="container5">
                <h1 className="mainHeading">Organizer's Dashboard</h1>
                <div title={userAddress} className="addressContainer flex items-center gapHalf">
                  <p>{trimAddress(userAddress)}</p>
                  {<BiSolidCopy onClick={handleCopy} className="copyBtn cur-p" />}
                  {copied && (
                    <div className="copiedMessageContainer flex items-center flex-col">
                      <div className="triangle"></div>
                      <div className="message">Copied</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="container6 flex gap1">
                {votingSessions.length ? (
                  <NavLink to="/createvotingsession">
                    <button className="createSessionBtn secondaryBtn cur-p">Create Another Session</button>
                  </NavLink>
                ) : <></>}
                {!isLessThan775 && (
                  <>
                    <NavLink to="/"><button disabled={removeUserBtnLoading} className="secondaryBtn loadingBtns cur-p">Vote</button></NavLink>
                    <div className="btnWrappers relative">
                      <button disabled={removeUserBtnLoading} style={{ color: removeUserBtnLoading ? "transparent" : "" }} onClick={removeUser} className="secondaryBtn loadingBtns cur-p">Delete Account</button>
                      {removeUserBtnLoading && <Spinner borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="votingSessionsContainers">
              <div className="container7 flex justify-between">
                <h3>Voting Sessions :</h3>
                <div className="btnWrappers relative">
                  <button style={{ color: refreshLoading ? "gray" : "" }} disabled={refreshLoading} onClick={handleRefresh} className="primaryBtn cur-p">Refresh</button>
                  {refreshLoading && <Spinner borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
                </div>
              </div>
              {votingSessions.length > 0 ? (
                <div className={`sessionTableContainer ${votingSessions.length > 8 ? "scrollable" : "justify-center"}`}>
                  <table className="sessionsTable">
                    <thead>
                      <tr>
                        <th>Party Code</th>
                        <th>Name</th>
                        <th>Candidates</th>
                        <th>Total Votes</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {votingSessions.map((session) => (
                        <tr key={session.partyCode}>
                          <td>{session.partyCode}</td>
                          <td className="textAlignLeft">{session.name}</td>
                          <td className="textAlignLeft">{session.candidates && session.candidates.join(", ")}</td>
                          <td>{session.voters ? session.voters.length : 0}</td>
                          <td>
                            <button disabled={isDeletingVS} onClick={() => handleDeleteVotingSession(session.partyCode)} className="deleteVSBtnWrapperBtn cur-p">
                              <MdDelete fill="white" size={20} className="deleteVSBtn cur-p" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <p>No voting sessions found.</p>
                  <NavLink to="/createvotingsession"><button id="createSessionBottom" className="secondaryBtn cur-p">Create Another Session</button></NavLink>
                </>
              )}
            </div>
            {isLessThan775 && (
              <div className="btnsContainerForPhone flex justify-between">
                <NavLink to="/"><button disabled={removeUserBtnLoading} className="secondaryBtn loadingBtns cur-p">Vote</button></NavLink>
                <div className="btnWrappers relative">
                  <button disabled={removeUserBtnLoading} style={{ color: removeUserBtnLoading ? "transparent" : "" }} onClick={removeUser} className="secondaryBtn loadingBtns cur-p">Delete Account</button>
                  {removeUserBtnLoading && <Spinner borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default Dashboard