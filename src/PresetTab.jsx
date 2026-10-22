import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { themes } from '../themes'
import { formatDecimalTime } from './App';

function PresetTab(props) {
	const [namingPreset, setNamingPreset] = useState(null);

	const namingInputRef = useRef(null);

	const presets = props.presets;
	const setPresets = props.setPresets;
	const tasks = props.tasks;
	const setTasks = props.setTasks;

	useEffect(() => {
		if (presets[presets.length - 1] != null && presets[presets.length - 1].isNaming) {
			setNamingPreset(presets.length - 1);
		}
		namingInputRef.current?.focus();
	}, [namingPreset, presets]);

	const presetLoading = presets.map((preset, id) => {
		// time calc
		let minTime = 24;
		let maxTime = 0;
		preset.tasks.forEach(task => {
			if (task.startTime < minTime) minTime = task.startTime;
			if (task.endTime < maxTime) maxTime = task.endTime;
		});

		let extraInfo = "(";
		if (preset.tasks.length == 0) {
			extraInfo = `(No Tasks`;
		} else if (preset.tasks.length == 1) {
			extraInfo = `(${preset.tasks[0].name}`;
		} else if (preset.tasks.length > 1) {
			extraInfo = `(${preset.tasks[0].name} + ${preset.tasks.length - 1} more`;
		}

		extraInfo += `, ${formatDecimalTime(minTime, true)} – ${formatDecimalTime(maxTime, true)})`;

		return <div className="preset" key={id}>
			{id == namingPreset ? 
				<input
					ref={namingInputRef}
					type="text"
					placeholder="Enter name..."
					onKeyDown={(e) => {
						if (e.key === "Enter") e.target.blur();
					}}
					onBlur={(e) => {
						setPresets(prevPresets => prevPresets.map(
							(currentPreset, index) => index == id ? {...currentPreset, name: e.target.value == "" ? "Unnamed Preset" : e.target.value, isNaming: false} : currentPreset
						));
						setNamingPreset(null);
					}}
				></input> : 
				<span onClick={() => {setNamingPreset(id)}}>{preset.name} {extraInfo}</span>
			}
			<div className="preset-actions">
				<button onClick={() => {
					setTasks(prevTasks => [
						...prevTasks, 
						...preset.tasks
					]);
				}}>Load Preset</button>
				<button className="delete-hover-effect" onClick={() => {
					setPresets(prevPresets => prevPresets.filter((_, i) => i !== id));
				}}>Delete</button>
			</div>
		</div>
	});
	return (
		<div
			className="preset-tab"
		>
			<h1>Presets</h1>
			{presetLoading}
			<button onClick={() => {
				setPresets(prevPresets => [...prevPresets, {
					name: "Unnamed Preset", 
					isNaming: true, 
					tasks: tasks
				}]);
			}}>+ Create Preset from Schedule</button>
		</div>
	)
}

export default PresetTab