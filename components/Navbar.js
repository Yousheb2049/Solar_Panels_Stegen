import React from "react";
import { IconButton } from "./Icon_Button";
import { ProjectListingIcon } from "../assets/svgs/project_listing";
import { MapIcon } from "../assets/svgs/map";
import { KanbanIcon } from "../assets/svgs/kanban";
import { UserIcon} from "../assets/svgs/user";
import {DropdownButton} from "./DropDownButton"

export default function NavBar () {
    return(
        <div className="Navbar"
        style={{
            position: "absolute",
            border: '1px solid black',
            display: "flex",
            flexDirection: "row",
            width: '95.1vw',
            top: 0,
            alignContent: 'flex-end',
            left: 60
          }}
        >
       
            <div style={{paddingTop: "5px"}}>
                <IconButton icon={ <ProjectListingIcon color='black' /> } />
            </div>

            <h1>Solar Projects Stegen - Map View</h1>
            <h3>Switch View</h3>

            <div style={{paddingTop: "5px"}}>
            <IconButton className='Icon-style' icon={ <ProjectListingIcon color='black' /> } />    
            </div>
            <div style={{paddingTop: "5px"}}>
            <IconButton className='Icon-style' icon={ <MapIcon color ='#FDCE69' />} />
            </div>
            <div style={{paddingTop: "5px"}}>
            <IconButton className='Icon-style' icon={ <KanbanIcon color ='black' />} />
            </div>


            <DropdownButton path1={'src/assets/images/English.png'} path2={'../assets/images/German.png'} alt1={'English'} alt2={'German'} />

            <button className="nav--button-logout">
                <UserIcon /> <p>logout</p> 

            </button>
        </div>
    )   
}