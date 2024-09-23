import React from 'react'

export const IconButton = ({ onClick, icon,}) => {
  return (
    <button onClick={onClick} className="icon-button">
      {icon}
    </button>
  );
};