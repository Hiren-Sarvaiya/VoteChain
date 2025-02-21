import React, { useState, useContext, useEffect } from "react"
import { MdDelete } from "react-icons/md"
import { useForm } from "react-hook-form"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/Spinner"
import "../assets/css/CreateVotingSession.css"
import { useNavigate } from "react-router-dom"

const CreateVotingSession = () => {
  const { userRole, userAddress, contract, trimAddress } = useContext(AuthContext)
  const [totalInputFields, setTotalInputFields] = useState([
    { key: "candidate1", value: "" },
    { key: "candidate2", value: "" },
  ])
  const [fieldCounter, setFieldCounter] = useState(3)
  const [sessionName, setSessionName] = useState("")
  const [partyCode, setPartyCode] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (userRole === "") {
      navigate("/", { replace: true })
    }
  }, [userRole])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  const handleAddInputField = () => {
    if (totalInputFields.length < 16) {
      const newKey = `candidate${fieldCounter}`
      setTotalInputFields(prev => [...prev, { key: newKey, value: "" }])
      setValue(newKey, "")
      setFieldCounter(prev => prev + 1)
    } else {
      alert("Max number of candidates is 16!")
    }
  }

  const handleInputChange = (key, value) => {
    setTotalInputFields(prev =>
      prev.map(item => (item.key === key ? { ...item, value } : item))
    )
    setValue(key, value)
  }

  const handleDeleteField = (key) => {
    setTotalInputFields(prev => prev.filter(item => item.key !== key))
    setValue(key, "")
  }

  const isPartyCodeDuplicate = async (partyCode) => {
    try {
      console.log("Fetching existing party codes...")
      const existingCodes = await contract.getPartyCodesOrganizer()
      return existingCodes.includes(BigInt(partyCode))
    } catch (error) {
      console.error("Error fetching party codes : ", error)
      return false
    }
  }

  const createVotingSession = async (candidateArray) => {
    console.log("Creating new voting session...")
    const tx = await contract.createVotingSession(partyCode, sessionName, candidateArray)
    console.log("Transaction sent, waiting for confirmation...")
    const receipt = await tx.wait()
    console.log("Voting session created successfully : ", receipt)
  }

  const onSubmit = async (tempData) => {
    try {
      setSubmitLoading(true)
      if (contract) {
        const data = {
          sessionName: tempData[Object.keys(tempData)[0]],
          partyCode: parseInt(tempData[Object.keys(tempData)[1]])
        }
        let count = 1
        const keys = Object.keys(tempData)
        for (let i = 2; i < keys.length; i++) {
          let key = keys[i]
          if (tempData[key] !== "") {
            data[`candidate${count}`] = tempData[key]
            count++
          }
        }
        console.log("Session data :", data)
        const candidateArray = []
        for (const key in data) {
          if (key.startsWith("candidate")) {
            candidateArray.push(data[key])
          }
        }
        console.log("Candidate Array :", candidateArray)
        if (data.partyCode >= 1000 && data.partyCode <= 9999) {
          if (!(await isPartyCodeDuplicate(data.partyCode))) {
            await createVotingSession(candidateArray)
            setSubmitLoading(false)
            reset()
            navigate("/dashboard", { replace: true })
          } else {
            setError("partyCode", { type: "manual", message: "Party code already taken" })
          }
        } else {
          setError("partyCode", { type: "manual", message: "Party code must between 1000 and 9999" })
        }
      }
    } catch (error) {
      console.error("Failed to create session : ", error)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <main className="mainContent p1">
      <section>
        {userRole === "organizer" && (
          <div className="createVotingSessionContainer">
            <form onSubmit={handleSubmit(onSubmit)} className="flex justify-center items-center flex-col">
              <h1>Shape The Outcome</h1>
              <div className="inputFieldContainers">
                <div className="sessionNameContainer">
                  <label htmlFor="sessionName" className={sessionName ? "roleLabelActive" : ""}>Election Name <span className="requiredRed">*</span></label>
                  <input autoComplete="off" {...register("sessionName", { required: { value: true, message: "Enter session name" } })} className="inputs" type="text" id="sessionName" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
                </div>
                {errors.sessionName && <div className="errors createSessionErrors">{errors.sessionName.message}</div>}
              </div>
              <div className="inputFieldContainers">
                <div className="partyCodeContainer">
                  <label htmlFor="partyCode" className={(partyCode || partyCode === 0) ? "roleLabelActive" : ""}>Party Code <span className="requiredRed">*</span></label>
                  <input autoComplete="off" {...register("partyCode", { required: { value: true, message: "Enter party code" } })} className="inputs" type="number" id="partyCode" value={partyCode} onChange={(e) => setPartyCode(e.target.value === "" ? "" : parseInt(e.target.value))} />
                </div>
                {errors.partyCode && <div className="errors createSessionErrors">{errors.partyCode.message}</div>}
              </div>
              <div className={`candidateFieldsContainer flex items-center flex-col ${totalInputFields.length > 2 ? "scrollable justify-start" : "justify-center"}`}>
                <div className="inputFieldContainers">
                  <div className="candidateContainers">
                    <label htmlFor="candidate1" className={totalInputFields[0].value ? "roleLabelActive" : ""}>Candidate 1 <span className="requiredRed">*</span></label>
                    <input autoComplete="off" {...register("candidate1", { required: { value: true, message: "Enter first candidate" } })} className="inputs" type="text" id="candidate1" value={totalInputFields[0].value} onChange={(e) => handleInputChange("candidate1", e.target.value)} />
                  </div>
                  {errors.candidate1 && <div className="errors createSessionErrors">{errors.candidate1.message}</div>}
                </div>
                <div className="inputFieldContainers">
                  <div className="candidateContainers">
                    <label htmlFor="candidate2" className={totalInputFields[1].value ? "roleLabelActive" : ""}>Candidate 2 <span className="requiredRed">*</span></label>
                    <input autoComplete="off" {...register("candidate2", { required: { value: true, message: "Enter second candidate" } })} className="inputs" type="text" id="candidate2" value={totalInputFields[1].value} onChange={(e) => handleInputChange("candidate2", e.target.value)} />
                  </div>
                  {errors.candidate2 && <div className="errors createSessionErrors">{errors.candidate2.message}</div>}
                </div>
                {totalInputFields.slice(2).map((field, index) => (
                  <div className="inputFieldContainers" key={field.key}>
                    <div className="candidateContainers">
                      <label htmlFor={field.key} className={field.value ? "roleLabelActive" : ""}>{`Candidate ${index + 3}`}</label>
                      <input autoComplete="off" {...register(field.key, { required: { value: false } })} className="inputs" type="text" id={field.key} value={field.value || ""} onChange={(e) => handleInputChange(field.key, e.target.value)} />
                      <MdDelete className="deleteBtn cur-p" onClick={() => handleDeleteField(field.key)} />
                    </div>
                    {errors[field.key] && <div className="errors createSessionErrors">{errors[field.key].message}</div>}
                  </div>
                ))}
              </div>
              <div className="formFooter flex gap1">
                <div className="btnWrappers relative">
                  <input style={{ color: submitLoading ? "gray" : "" }} disabled={isSubmitting} id="submit" className="primaryBtn cur-p loadingBtns" type="submit" value="Submit" />
                  {submitLoading && <Spinner className="spinner" borderColor="#ffffff4d" borderTopSize="4px" size="24px" />}
                </div>
                <input onClick={handleAddInputField} disabled={isSubmitting} id="addMore" className="secondaryBtn cur-p" type="button" value="Add More" />
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  )
}

export default CreateVotingSession