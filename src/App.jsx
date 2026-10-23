import { useEffect, useRef, useState } from 'react'
import Task from './Task';
import TimeMarker from './TimeMarker';
import { themes } from '../themes';
import SettingsMenu from './SettingsMenu'
import InfoMenu from './InfoMenu';
import PresetTab from './PresetTab';

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function isEllipsisActive(e) {
    return (e.offsetWidth < e.scrollWidth);
}

export function formatDecimalTime(decimal, cutoffMinutes = false) {
	const rawHours = Math.floor(decimal);
	const rawMinutes = Math.round((decimal % 1) * 60);
	if (cutoffMinutes) return `${rawHours % 12 == 0 ? "12" : rawHours % 12}${rawHours >= 12 ? "PM" : "AM"}`;
	return `${rawHours % 12 == 0 ? "12" : rawHours % 12}:${rawMinutes < 10 ? "0" : ""}${rawMinutes}${rawHours >= 12 ? "PM" : "AM"}`;
}

function setTheme(themeName) {
	if (themes[themeName] == null) {
		themeName = "default";
	}
	document.documentElement.style.setProperty('--main-theme', themes[themeName].mainTheme);
	document.documentElement.style.setProperty('--font', themes[themeName].font);
	document.documentElement.style.setProperty('--light-bg', themes[themeName].lightBG);
	document.documentElement.style.setProperty('--main-bg', themes[themeName].mainBG);
}

function App() {
	// consts
	const snapSize = 5;

	// state
	const [scrollOffset, setScrollOffset] = useState(0);
	const [hourWidth, setHourWidth] = useState(10);
	const [dragging, setDragging] = useState(false);
	const [initalScrollValue, setInitalScrollValue] = useState(0);
	const [initalPointerPos, setInitalPointerPos] = useState(0);
	const [isDrawingTask, setIsDrawingTask] = useState(0);
	const [namingTask, setNamingTask] = useState(null);
	const [resizingTask, setResizingTask] = useState(null);
	const [draggingTask, setDraggingTask] = useState(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [showSettings, setShowSettings] = useState(false);
	const [showPresetTab, setShowPresetTab] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const now = new Date();
	const currentHour = now.getHours(); 
	const currentMinutes = now.getMinutes(); 
	const [tasks, setTasks] = useState([
		{
			name: "Start using Kairos", 
			startTime: currentHour + (currentMinutes / 60), 
			endTime: currentHour + (currentMinutes / 60) + 1.5, 
			top: 40
		}
	]);
	const [presets, setPresets] = useState([
		{
			name: "Default Preset", 
			tasks: [
				{
					name: "Start using Kairos", 
					startTime: currentHour + (currentMinutes / 60), 
					endTime: currentHour + (currentMinutes / 60) + 1.5, 
					top: 40
				}
			]
		}
	]);
	const [currentTheme, setCurrentTheme] = useState("default");

	// refs
	const namingInputRef = useRef(null);
	const mainRef = useRef(null);
	const timeMarkerRef = useRef(null);
	const timeMarkerTimeRef = useRef(null);
	const nowMarkerRef = useRef(null);
	const trashRef = useRef(null);

	// Effects
	useEffect(() => {
		const savedTasks = localStorage.getItem('tasks');
		if (savedTasks) {
			setTasks(JSON.parse(savedTasks));
		}

		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			setCurrentTheme(savedTheme);
		}

		const savedPresets = localStorage.getItem('presets');
		if (savedPresets) {
			setPresets(JSON.parse(savedPresets));
		}
	}, []);

	useEffect(() => {
		setTheme(currentTheme);
	}, [currentTheme]);

	useEffect(() => {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}, [tasks]);

	useEffect(() => {
		localStorage.setItem('presets', JSON.stringify(presets));
	}, [presets]);

	useEffect(() => {
		setScrollOffset((prevOffset) => clamp(prevOffset, 0, 24 * hourWidth - 100));
	}, [hourWidth]);

	useEffect(() => {
		namingInputRef.current?.focus(({ preventScroll: true }));
	}, [namingTask]);

	useEffect(() => {
		const now = new Date();
		const decimalTime = now.getHours() + (now.getMinutes() / 60);
		setCurrentTime(decimalTime);

		timeoutCurrentDecimalTimeUpdate();
	}, []);

	useEffect(() => {
		if (nowMarkerRef.current) nowMarkerRef.current.style.left = `${currentTime * hourWidth - scrollOffset}%`;
	}, [hourWidth, scrollOffset, currentTime]);

	const timeMarkerElements = ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"].map((item, index) => {
		return (
			<TimeMarker index={index} hourWidth={hourWidth} scrollOffset={scrollOffset} item={item} key={item} />
		)
	});

	const tasksElements = tasks.map((task, index) => {
		return (
			<Task task={task} index={index} key={index} draggingTask={draggingTask} namingTask={namingTask} namingInputRef={namingInputRef} hourWidth={hourWidth} scrollOffset={scrollOffset} updateTask={updateTask} setNamingTask={setNamingTask} setResizingTask={setResizingTask} mainRef={mainRef} setDraggingTask={setDraggingTask} clickToDecimalTime={clickToDecimalTime} />
		)
	});

	function timeoutCurrentDecimalTimeUpdate() {
		const now = new Date();
		const timeoutDelay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

		setTimeout(() => {
			const now = new Date();
			const decimalTime = now.getHours() + (now.getMinutes() / 60);
			setCurrentTime(decimalTime);

			timeoutCurrentDecimalTimeUpdate();
		}, timeoutDelay);
	}

	function clickToDecimalTime(click, roundToMinutes = null) {
		let decimalAmount = click / window.innerWidth;
		let decimalTime = (decimalAmount * 100 + scrollOffset) / hourWidth;
		let decimalRounding = roundToMinutes / 60;
		if (roundToMinutes != null) {
			return Math.round(decimalTime / decimalRounding) * decimalRounding;
		}
		return decimalTime;
	}

	function roundDecimalTime(decimalTime, roundToMinutes) {
		let decimalRounding = roundToMinutes / 60;
		return Math.round(decimalTime / decimalRounding) * decimalRounding;
	}

	function clickToPercentage(click, roundToMinutes = null) {
		let decimalAmount = click / window.innerWidth;
		let percentageTime = decimalAmount * 100 + scrollOffset;
		let decimalRounding = roundToMinutes / (60 / hourWidth);
		if (roundToMinutes != null) {
			return Math.round(percentageTime / decimalRounding) * decimalRounding - scrollOffset;
		}
		return percentageTime;
	}

	function updatePointerTimeMarker(e) {
		if (timeMarkerRef.current) timeMarkerRef.current.style.left = `${clickToPercentage(e.clientX, snapSize)}%`;
		if (timeMarkerTimeRef.current) timeMarkerTimeRef.current.textContent = `${formatDecimalTime(clickToDecimalTime(e.clientX, snapSize))}`;
	}

	function updateTask(taskID, updates) {
		setTasks(prevTasks => {
			return prevTasks.map((item, i) => 
				i == taskID ? {
					...item, 
					...updates
				} : item
			);
		});
	}

	return (
		<>
			<header>
				<div style={{justifyContent: "start"}}>
					<button className="iconbutton" onClick={() => {
						setIsDrawingTask(true);
					}}>
						<svg
							width="100%"
							height="100%"
							viewBox="0 0 64 64"
							fill="none"
							stroke="currentColor"
							strokeWidth={4.17}
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path transform="translate(1 1)" d="M4,58L4,43L42.915,4.085L58,18L18.877,58.123L4,58Z" />
							<path d="M9,42L22.01,55.01" />
							<path transform="translate(29 -29)" d="M9,42L22.01,55.01" />
							<path transform="translate(1 -1)" d="M4,53L11.065,60.065" />
						</svg>
					</button>
				</div>
				<div style={{justifyContent: "end"}}>
					<button className="textbutton delete-hover-effect" onClick={() => {
						setTasks([]);
					}}>
						Clear All
					</button>
					<button className="textbutton" onClick={() => {
						setShowPresetTab(prevShowPresetTab => !prevShowPresetTab);
						setShowInfo(false);
						setShowSettings(false);
					}}>
						Presets
					</button>
					<button className="iconbutton" onClick={() => {
						setShowSettings(prevShowSettings => !prevShowSettings);
						setShowInfo(false);
						setShowPresetTab(false);
					}}>
						<svg
							width="100%"
							height="100%"
							viewBox="0 0 64 64"
							fill="none"
							stroke="currentColor"
							strokeWidth={4.17}
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M29.389,5.127C31.125,4.958 32.875,4.958 34.611,5.127L35.471,9.314C37.136,9.569 38.768,10.006 40.337,10.618L43.175,7.421C44.764,8.144 46.278,9.018 47.698,10.033L46.349,14.089C47.664,15.142 48.858,16.336 49.911,17.651L53.967,16.302C54.982,17.722 55.856,19.236 56.579,20.825L53.382,23.663C53.994,25.232 54.431,26.864 54.686,28.529L58.873,29.389C59.042,31.125 59.042,32.875 58.873,34.611L54.686,35.471C54.431,37.136 53.994,38.768 53.382,40.337L56.579,43.175C55.856,44.764 54.982,46.278 53.967,47.698L49.911,46.349C48.858,47.664 47.664,48.858 46.349,49.911L47.698,53.967C46.278,54.982 44.764,55.856 43.175,56.579L40.337,53.382C38.768,53.994 37.136,54.431 35.471,54.686L34.611,58.873C32.875,59.042 31.125,59.042 29.389,58.873L28.529,54.686C26.864,54.431 25.232,53.994 23.663,53.382L20.825,56.579C19.236,55.856 17.722,54.982 16.302,53.967L17.651,49.911C16.336,48.858 15.142,47.664 14.089,46.349L10.033,47.698C9.018,46.278 8.144,44.764 7.421,43.175L10.618,40.337C10.006,38.768 9.569,37.136 9.314,35.471L5.127,34.611C4.958,32.875 4.958,31.125 5.127,29.389L9.314,28.529C9.569,26.864 10.006,25.232 10.618,23.663L7.421,20.825C8.144,19.236 9.018,17.722 10.033,16.302L14.089,17.651C15.142,16.336 16.336,15.142 17.651,14.089L16.302,10.033C17.722,9.018 19.236,8.144 20.825,7.421L23.663,10.618C25.232,10.006 26.864,9.569 28.529,9.314L29.389,5.127Z"/>
							<circle cx="32" cy="32" r="14"/>
						</svg>
					</button>
					<button className="iconbutton" style={{fontSize: "2rem", color: "var(--font)"}} onClick={() => {
						setShowInfo(prevShowInfo => !prevShowInfo);
						setShowSettings(false);
						setShowPresetTab(false);
					}}>
						i
					</button>
					{showSettings && <SettingsMenu currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />}
					{showInfo && <InfoMenu />}
					{showPresetTab && <PresetTab presets={presets} setPresets={setPresets} setTasks={setTasks} tasks={tasks} />}
				</div>
			</header>
			<main
				onWheel={(e) => {
					// setHourWidth((prevHourWidth) => clamp(prevHourWidth + (e.deltaY * 0.25), 5, 50));
					// setScrollOffset((prevOffset) => clamp(prevOffset, 0, 24 * hourWidth - 100));
					const delta = e.deltaY;
					// const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
					setScrollOffset((prevOffset) => clamp(prevOffset + (delta * 0.25), 0, 24 * hourWidth - 100));
					updatePointerTimeMarker(e);
				}}
				onPointerDown={(e) => {
					setShowSettings(false);
					setShowInfo(false);
					setShowPresetTab(false);
					setDragging(true);
					if (isDrawingTask) {
						const rect = mainRef.current.getBoundingClientRect();
						const percent = ((e.clientY - rect.top) / rect.height) * 100;
						
						setTasks(prevTasks => {
							return [...prevTasks, {
								name: "new thingy!", 
								startTime: clickToDecimalTime(e.clientX, snapSize), 
								endTime: clickToDecimalTime(e.clientX, snapSize), 
								top: percent
							}];
						});
						return;
					}
					let percentPos = (e.clientX / window.innerWidth) * 100;
					setInitalScrollValue(scrollOffset);
					setInitalPointerPos(percentPos);
				}}
				onPointerMove={(e) => {
					updatePointerTimeMarker(e);
					if (dragging) {
						if (isDrawingTask) {
							setTasks(prevTasks => {
								return [...prevTasks.slice(0, -1), {
									name: "new thingy!", 
									startTime: prevTasks[prevTasks.length - 1].startTime, 
									endTime: clickToDecimalTime(e.clientX, snapSize), 
									top: prevTasks[prevTasks.length - 1].top
								}];
							})
							return;
						}
						setScrollOffset(() => {
							let percentPos = (e.clientX / window.innerWidth) * 100;
							return clamp(initalScrollValue + (initalPointerPos - percentPos), 0, 24 * hourWidth - 100);
						})
					}

					if (resizingTask != null) {
						updateTask(resizingTask.task, {[resizingTask.edge]: clickToDecimalTime(e.clientX, snapSize)});
					}

					if (draggingTask != null) {
						const rect = mainRef.current.getBoundingClientRect();
						const percent = ((e.clientY - rect.top) / rect.height) * 100;

						updateTask(draggingTask.task, {
							startTime: roundDecimalTime(clickToDecimalTime(e.clientX) + draggingTask.startOffset, snapSize), 
							endTime: roundDecimalTime(clickToDecimalTime(e.clientX) + draggingTask.endOffset, snapSize), 
							top: draggingTask.initalTop + (percent - draggingTask.topClick)
						});
					}
				}}
				onPointerUp={(e) => {
					if (draggingTask != null && trashRef.current != null) {
						const bounds = trashRef.current.getBoundingClientRect();
						if (e.clientX > bounds.left && e.clientX < bounds.right && e.clientY > bounds.top && e.clientY < bounds.bottom) {
							setTasks(prevTasks => prevTasks.filter((_, i) => i !== draggingTask.task));
						}
					}
					setDragging(false);
					setResizingTask(null);
					setDraggingTask(null);
					if (isDrawingTask) {
						setNamingTask(tasks.length - 1);
						setIsDrawingTask(false);
					}
				}}
				ref={mainRef}
			>
				<div className="schedule" style={{
					cursor: isDrawingTask ? "pointer" : "default"
				}}>
					{timeMarkerElements}
					<div className="schedule-tick ignore-events offset-time" ref={nowMarkerRef}>
						<p>Now</p>
					</div>
					{tasksElements}
					<div className="schedule-tick ignore-events current-time-selector" ref={timeMarkerRef}>
						<p ref={timeMarkerTimeRef}></p>
					</div>
				</div>
				<div className="info-bar ignore-events">
					<div className="info-bar-left">
						<p>Time: {formatDecimalTime(currentTime)}</p>
					</div>
					<div className="info-bar-right">
						<button onClick={() => {
							setHourWidth(prevHourWidth => clamp(prevHourWidth - 1, 5, 50));
							setScrollOffset((prevOffset) => clamp(prevOffset - clickToDecimalTime(window.innerWidth / 2), 0, 24 * clamp(hourWidth - 1, 5, 50) - 100)); // wow this works???
						}}>-</button>
						<p style={{width: `3rem`, textAlign: "center"}}>{Math.round(hourWidth * 10)}%</p>
						<button onClick={() => {
							setHourWidth(prevHourWidth => clamp(prevHourWidth + 1, 5, 50));
							setScrollOffset((prevOffset) => clamp(prevOffset + clickToDecimalTime(window.innerWidth / 2), 0, 24 * clamp(hourWidth + 1, 5, 50) - 100)); // wow this works???
						}}>+</button>
					</div>
				</div>
				<div ref={trashRef} className="trash" style={{width: draggingTask == null ? "0" : "12rem", height: draggingTask == null ? "0" : "8rem"}}></div>
			</main>
		</>
	)
}

export default App

