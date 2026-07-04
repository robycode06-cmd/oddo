import React, { useState } from 'react'
import TimeOffModal from './components/TimeOffModal'
import AdminLeaveTable from './components/AdminLeaveTable'

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <AdminLeaveTable token="" onNewRequest={() => setIsModalOpen(true)} />
      <TimeOffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token=""
      />
    </>
  )
}

export default App