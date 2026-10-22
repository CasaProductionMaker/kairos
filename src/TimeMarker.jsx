import { useEffect, useRef, useState } from 'react'

function TimeMarker(props) {
	const item = props.item;
	const index = props.index;
	const hourWidth = props.hourWidth;
	const scrollOffset = props.scrollOffset;

	return (
		<div
			className="schedule-tick ignore-events"
			style={{
				left: `${index * hourWidth - scrollOffset}%`
			}}
		>
			<p>{item}</p>
		</div>
	)
}

export default TimeMarker

/* 
#a393bf, #9882ac, #73648a, #453750, #0c0910
#c0e0de, #9eefe5, #4f7cac, #3c474b, #162521
#c2e7d9, #a6cfd5, #26408b, #0f084b, #0d0221
*/