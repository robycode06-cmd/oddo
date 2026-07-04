import React, { useState } from 'react'
import TimeOffModal from './components/TimeOffModal'
import AdminLeaveTable from './components/AdminLeaveTable'

const App = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    
    <>
      <AdminLeaveTable />
      <TimeOffModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)} 
      />

    </>
  )
}

export default App