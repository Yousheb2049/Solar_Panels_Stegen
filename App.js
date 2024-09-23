import React from 'react';
import Map from './components/Map';
import { SideBar } from './components/Left_sidebar';
import NavBar from './components/Navbar';

const App = () => {
  return (
    <div >
      <nav>      
          <NavBar />
      </nav>
      <div className='main'>
        <aside>
          <SideBar />
        </aside>
        <div style={{
          height: "100vh",
          width: '95.1vw',
          position: 'relative',
          margin: '68px 10px 10px 60px'
        }}
        >
        <Map />
        </div>
                  
      </div> 
    </div>
  );
};

export default App;
