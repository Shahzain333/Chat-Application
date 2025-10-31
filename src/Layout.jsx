import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/header/Header'

function Layout() {

  return (
    <div className="app-background">
      <Header />
      <Outlet /> {/* or your router component */}
    </div>
  )
}

export default Layout