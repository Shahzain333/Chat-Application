import React, { useState } from 'react'
import { RiSearchLine } from 'react-icons/ri'
import { FaXmark } from 'react-icons/fa6'
import defaultAvatar from '../assets/default.jpg'
import firebaseService from '../services/firebaseServices'

function SearchModal({ startChat }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [users,setUsers] = useState([])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleSearch = async () => {
    if(!searchTerm.trim()) {
      alert("Please Enter a Search Term")
      return
    }

    try {
  
      const searchUser = await firebaseService.searchUsers(searchTerm)
  
      setUsers(searchUser)
      setSearchTerm('')

      if(searchUser.length === 0){
        alert("No User Found!")
      }
    
    } catch (error) {
      console.log(error)
    }
  
  }

  return (
    <div>

      <button onClick={openModal} className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg cursor-pointer">
        <RiSearchLine color="#01AA85" className="w-[18px] h-[18px]" />
      </button>

      {isModalOpen && (
        <div onClick={closeModal} className='fixed inset-0 z-[100] flex justify-center items-center 
        bg-[#00170cb7]'>
          <div onClick={(e) => e.stopPropagation()} className='relative p-4 w-[100%] max-w-md max-h-full'>
            <div className='relative bg-[#01AA85] w-full rounded-md shadow-lg'>
              <div className='flex items-center justify-between p-4 md:p-5 border-b border-gray-300'>
                <h3 className='text-xl font-semibold text-white'>Search Chat</h3>
                <button onClick={closeModal} className='text-white bg-transparent hover:bg-[#d9f2ed] hover:text-[#01AA85] rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer'>
                  <FaXmark className='text-xl'/>
                </button>
              </div>

              <div className='p-4 md:p-5'>
                <div className='space-y-4'>
                  <div className='flex gap-2'>
                    <input 
                      type='text'
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg outline-none w-full p-2.5" 
                      placeholder="Search users" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if(e.key === 'Enter'){
                          handleSearch()
                        }
                      }}
                    />
                    <button onClick={handleSearch} className='bg-green-900 text-white px-3 py-2 rounded-lg cursor-pointer'>
                      <RiSearchLine />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {users.map((user, index) => (
                    <div 
                      onClick={() => {
                        startChat(user);
                        closeModal();
                      }}
                      className='flex items-start gap-3 bg-[#15eabc34] p-2 mb-3 rounded-lg cursor-pointer border border-[#ffffff20] shadow-lg'
                      key={index}>
                      <img src={user?.image || defaultAvatar} className="h-[40px] w-[40px] rounded-full" alt=''/>
                      <span>
                        <h2 className="p-0 font-semibold text-white text-[18px]">{user?.fullName}</h2>
                        <p className="text-[13px] text-white">@{user?.username}</p>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchModal
