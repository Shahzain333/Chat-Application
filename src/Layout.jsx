import React from 'react'
import { Outlet } from 'react-router-dom'
import Login from './components/Login'

function Layout() {

  return (
    <div className="app-background">
      {/* <Login /> */}
      <Outlet /> {/* or your router component */}
    </div>
  )
}

export default Layout