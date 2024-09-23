import React from "react";
import {IconButton} from "./Icon_Button";
import {DataIconActive} from "../assets/svgs/data";
import {ProjectListingIcon} from "../assets/svgs/project_listing";
import {MapIcon} from "../assets/svgs/map";
import { KanbanIcon } from "../assets/svgs/kanban";
import { EmailIcon } from "../assets/svgs/email";
import { SettingsIcon } from "../assets/svgs/settings";
import { ProfileIcon } from "../assets/svgs/profile_icon";
import { Logo} from "../assets/svgs/applogo_new";

export const SideBar = () => {

    const handleClick = () => {
        console.log('IconButton clicked');
      };

    return (        
        <div className="side-bar"> 
            <IconButton onclick={handleClick} icon={<Logo />} />
                
            <button onclick={handleClick} >
                <img className="nav--user-img" src='../assets/images/profile_photo.png' alt="User"/>
            </button>
                             
             <IconButton onclick={handleClick} icon={<ProjectListingIcon color='#FFC371'/>} />                 

             <IconButton onclick={handleClick} icon={<MapIcon />} />
                   
             <IconButton onclick={handleClick} icon={<KanbanIcon color='#FFC371'/>} />
                  
             <IconButton onclick={handleClick} icon={<DataIconActive />} />
                 
             <IconButton onclick={handleClick} icon={<EmailIcon />} />
                 
             <IconButton onclick={handleClick} icon={<SettingsIcon />} />
                 
             <IconButton onclick={handleClick} icon={<ProfileIcon />} />
                 
            <div style={{position:'absolute', top: 700}}>
            <IconButton onclick={handleClick} icon={<MapIcon />} />
            </div>

        </div>
    );
}           
