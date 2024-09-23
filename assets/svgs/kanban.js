import React from 'react'

export const KanbanIcon = (props) =>{
    return (
        <svg width="25" height="26.25" viewBox="0 0 25 26.25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5013 4.78008H17.5013C17.573 4.78008 17.6346 4.84168 17.6346 4.91341V16.5801C17.6346 16.6518 17.573 16.7134 17.5013 16.7134H2.5013C2.42957 16.7134 2.36797 16.6518 2.36797 16.5801V4.91341C2.36797 4.84168 2.42957 4.78008 2.5013 4.78008Z" stroke={props.color} stroke-width="1.4"/>
            <rect x="6.5" y="4.08008" width="1.16667" height="13.3333" fill={props.color}/>
            <rect x="12.332" y="4.08008" width="1.16667" height="13.3333" fill={props.color}/>
            <defs>
            <linearGradient id="paint0_linear" x1="5.96709" y1="10.9388" x2="8.21598" y2="11.1356" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FBDA61"/>
            <stop offset="1" stop-color="#FFC371"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="11.7991" y1="10.9388" x2="14.048" y2="11.1356" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FBDA61"/>
            <stop offset="1" stop-color="#FFC371"/>
            </linearGradient>
            </defs>
        </svg>
    )
}
// #FFC371
