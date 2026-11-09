import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { themes } from '../themes'

function Popup(props) {
	const payload = props.payload;
	/*
	{
		header: "", 
		description: "", 
		buttons: [
			{
				name: "Close", 
				color: "#XXX", 
				trigger: Function
			}, 
			{
				name: "Proceed", 
				color: "#XXX", 
				trigger: Function
			}
		]
	}
	*/

	const buttons = payload.buttons.map((button, id) => 
		<button key={id} onClick={button.trigger} style={{backgroundColor: button.color}}>{button.name}</button>
	)

	return (
		<div
			className="popup-container"
		>
			<div className="popup">
				<h1>{payload.header}</h1>
				<p>{payload.description}</p>
				<div className="button-bar">
					{buttons}
				</div>
			</div>
		</div>
	)
}

export default Popup