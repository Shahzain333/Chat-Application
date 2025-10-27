import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className='container text-2xl text-center mt-6'>Hello World</h1>
    </>
  )
}

export default App
