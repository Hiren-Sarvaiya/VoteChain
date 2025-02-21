import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Header from './common/Header'
import Footer from './common/Footer'
import Home from './pages/Home'
import Result from './pages/Result'
import CreateVotingSession from './pages/CreateVotingSession'
import Dashboard from './pages/Dashboard'
import AboutUs from './pages/AboutUs'
import { AuthProvider } from './context/AuthContext'

function App() {
  const Base = () => {
    return (
      <>
        <Header />
        <Outlet />
        <Footer />
      </>
    )
  }

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="" element={<Base />}>
              <Route path="" element={<Home />} />
              <Route path="/results" element={<Result />} />
              <Route path="/createvotingsession" element={<CreateVotingSession />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aboutus" element={<AboutUs />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App