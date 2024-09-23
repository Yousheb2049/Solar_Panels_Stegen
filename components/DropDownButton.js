import React, { useState } from 'react';
import English from '../assets/images/English.png'
import German from '../assets/images/German.png'

export const DropdownButton = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="dropdown-container">
      {/* Button to toggle the dropdown */}
      <button className="dropdown-button" onClick={toggleDropdown}>
        <img src={English} alt='English' height={'26'} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item">
            <img src = {German} alt='German' height={'26'} />
          </button>
          <button className="dropdown-item">
            <img src={English} alt='English' height={'26'} />
          </button>
        </div>
      )}
    </div>
  );
};