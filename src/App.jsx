import { useState } from 'react'
import './App.css'
import React from 'react'
import Hero from './components/ui/custom/Hero'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Hero />
    </>
  )
}

export default App
