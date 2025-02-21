import React from 'react'

const Spinner = ({ borderColor, borderTopColor, borderTopSize, size }) => {
  return (
    <div style={{ height: size, width: size, borderTop: `${borderTopSize} solid`, borderColor: borderColor, borderTopColor: borderTopColor }} className="spinner"></div>
  )
}

export default Spinner