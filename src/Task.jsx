import { useLayoutEffect, useRef, useState } from 'react'

function isEllipsisActive(e) {
	return (e.offsetWidth < e.scrollWidth);
}

function Task(props) {
	const task = props.task;
	const index = props.index;
	const draggingTask = props.draggingTask;
	const namingTask = props.namingTask;
	const namingInputRef = props.namingInputRef;
	const hourWidth = props.hourWidth;
	const scrollOffset = props.scrollOffset;
	const updateTask = props.updateTask;
	const setNamingTask = props.setNamingTask;
	const setResizingTask = props.setResizingTask;
	const setDraggingTask = props.setDraggingTask;
	const clickToDecimalTime = props.clickToDecimalTime;
	const mainRef = props.mainRef;

	const [truncated, setTruncated] = useState(false);

	const nameRef = useRef(null);

	useLayoutEffect(() => {
		if (nameRef.current == null) {
			setTruncated(false);
			return;
		}
		setTruncated(isEllipsisActive(nameRef.current));
	}, [task.name, index === namingTask, task.startTime, task.endTime, hourWidth])

	if (index == namingTask || task.name == "testest") console.log(nameRef.current)

	return (
		<div
			className="schedule-task ignore-events"
			style={draggingTask != null && draggingTask.task == index ? {
				left: `${task.startTime * hourWidth - scrollOffset}%`,
				width: `${(task.endTime - task.startTime) * hourWidth}%`, 
				top: `calc(${task.top}% - 1.5rem)`, 
				zIndex: 100
			} : {
				left: `${task.startTime * hourWidth - scrollOffset}%`,
				width: `${(task.endTime - task.startTime) * hourWidth}%`, 
				top: `calc(${task.top}% - 1.5rem)`
			}}
		>
			{index == namingTask ? 
				<input
					onFocus={(e) => {
						e.target.scrollIntoView({ behavior: "instant", block: "nearest" });
					}}
					ref={namingInputRef}
					type="text"
					placeholder="Enter name..."
					onKeyDown={(e) => {
						if (e.key === "Enter") e.target.blur();
					}}
					onBlur={(e) => {
						updateTask(index, {name: e.target.value == "" ? "Unnamed Task" : e.target.value});
						setNamingTask(null);
					}}
				></input> : 
				<p onClick={(e) => {
					e.stopPropagation();
					setNamingTask(index);
				}} ref={nameRef}>
					{task.name}
				</p>
			}
			<div className="left-handle" onPointerDown={(e) => {
				e.target.setPointerCapture(e.pointerId);
				e.stopPropagation();
				setResizingTask({
					task: index, 
					edge: "startTime"
				})
			}}></div>
			<div className="right-handle" onPointerDown={(e) => {
				e.target.setPointerCapture(e.pointerId);
				e.stopPropagation();
				setResizingTask({
					task: index, 
					edge: "endTime"
				})
			}}></div>
			<div className="top-handle" onPointerDown={(e) => {
				e.target.setPointerCapture(e.pointerId);
				e.stopPropagation();

				const rect = mainRef.current.getBoundingClientRect();
				const percent = ((e.clientY - rect.top) / rect.height) * 100;
				setDraggingTask({
					task: index, 
					startOffset: task.startTime - clickToDecimalTime(e.clientX), 
					endOffset: task.endTime - clickToDecimalTime(e.clientX), 
					topClick: percent, 
					initalTop: task.top
				});
			}}></div>
			{ truncated &&
				<div className="name-popup">
					<p>
						{task.name}
					</p>
				</div>
			}
		</div>
	)
}

export default Task