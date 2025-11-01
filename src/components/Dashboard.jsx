import React from 'react'
import SideBar from './SideBar'
import Chatlist from './ChatList'
import Chatbox from './Chatbox' 

function Dashboard() {
  return (
    <div className='flex flex-row'>
      <SideBar />
      <Chatlist />
      <Chatbox />
    </div>
  )
}

export default Dashboard
