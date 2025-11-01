import React, { useEffect, useMemo, useState } from 'react'
import defaultAvatar from '../assets/default.jpg'
import SearchModal from '../components/SearchModal'
import { RiMore2Fill } from 'react-icons/ri'

import chatData from '../data/chats'
import { formatTimestamp } from '../utils/formatTimestamp'

function ChatList() {
  
  const [chats, setChats] = useState([])
  
  useEffect(() => {
    setChats(chatData)
  }, [])

  const sortedChats = useMemo(() => {
    return [...chats].sort((a,b) => {
      // b.lastMessageTimestamp - a.lastMessageTimestamp
      const aTimestamp = a.lastMessageTimestamp.seconds + a.lastMessageTimestamp.nanoseconds /1e9;
      const bTimestamp = b.lastMessageTimestamp.seconds + b.lastMessageTimestamp.nanoseconds /1e9;

      return bTimestamp - aTimestamp;
    }
    )
  }, [chats])

  return (
    <section className='relative hidden lg:flex flex-col item-start justify-start bg-white 
    h-[100vh] w-[100%] md:w-[350px]'>
      
      <header className='flex items-center justify-between w-[100%] md:border-b border-b-1 
      border-[#898989b9] p-4 sticky md:static top-0 z-[100] border-r border-[#9090902c]'>
      
        <main className='flex items-center gap-3'>
      
          <img src={defaultAvatar} className='w-[44px] h-[44px] object-cover rounded-full' alt=''/>

          <span>
            <h3 className='p-0 font-semibold text-[#2A3D39] md:text-[17px]'>{"Chatfrik User"}</h3>
            <p className='p-0 font-light text-[#2A3D39] text-[15px]'>@ChatFrik</p>
          </span>
      
        </main>

        <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg">
          <RiMore2Fill color="#01AA85" className="w-[28px] h-[28px]"/>
        </button>
      
      </header>

      <div className='w-[100%] mt-[10px] px-5'>
        
        <header className='flex items-center justify-between'>
          <h3 className='text-[16px]'>Messages ({chats?.length || 0})</h3>
          <SearchModal />
        </header>

      </div>

      <main className='flex flex-col items-start mt-[1.5rem] pb-3 custom-scrollbar w-[100%] h-[100%]'>
        
        {sortedChats?.map((chat) => (

          <button key={chat?.uid} className="flex items-start justify-between w-[100%] border-b 
          border-[#9090902c] px-5 pb-3 pt-3">
            
            {
             chat?.users
              ?.filter((user) => user?.email !== 'baxo@mailinator.com')
              ?.map((user) => (

                <div className="flex items-start justify-between w-full">
                
                  <div className="flex items-start gap-3 flex-1">
                    
                    <img src={user?.image || defaultAvatar} className='w-[40px] h-[40px] rounded-full object-cover' 
                      alt='avatar' />

                    <span className="flex-1">
                    
                      <h2 className='p-0 font-semibold text-[#2A3d39] text-left text-[17px]'>
                        {user.fullName || user.displayName || 'Unknown User'}
                      </h2>

                      <p className='p-0 font-light text-[#2A3d39] text-left text-[14px]'>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    
                    </span>
                  
                  </div>
                
                  <p className='p-0 font-regular text-gray-400 text-left text-[11px] ml-3'>
                    {formatTimestamp(chat?.lastMessageTimestamp)}
                  </p>
                
                </div>

              ))
            }

          </button>
        
        ))}

      </main>
    
    </section>
  )
}

export default ChatList
