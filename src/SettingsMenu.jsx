import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { themes } from '../themes'

function SettingsMenu(props) {
	const currentTheme = props.currentTheme;
	const setCurrentTheme = props.setCurrentTheme;
	const dropdownRef = useRef(null);

	const options = Object.keys(themes).map(id => {
		const theme = themes[id];
		return <li onClick={() => {
			dropdownRef.current?.classList.toggle("hidden", true);
			setCurrentTheme(id);
		}} key={id}>
			{theme.displayName}
			<div className="palette-display" style={{backgroundColor: theme.mainBG}}>
				<div style={{backgroundColor: theme.font}}></div>
				<div style={{backgroundColor: theme.mainTheme}}></div>
				<div style={{backgroundColor: theme.lightBG}}></div>
			</div>
		</li>
	})

	return (
		<div
			className="preferences-tab"
			onClick={() => {
				dropdownRef.current?.classList.toggle("hidden", true);
			}}
		>
			<h1>Preferences</h1>
			<div style={{display: "flex"}}>
				<span>Theme: </span>
				<div className="theme-select">
					<button className="select-button" onClick={(e) => {
						dropdownRef.current?.classList.toggle("hidden", false);
						e.stopPropagation();
					}}>{themes[currentTheme].displayName}</button>
					<ul className="hidden" ref={dropdownRef} >
						{options}
					</ul>
				</div>
			</div>
		</div>
	)
}

export default SettingsMenu