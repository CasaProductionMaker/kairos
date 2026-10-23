import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { themes } from '../themes'

function InfoMenu(props) {
	return (
		<div
			className="info-tab"
		>
			<h1>Info</h1>
			<h2>Discord</h2>
			<p>If you have feedback, please let me know by joining my Discord server. I'm really looking to improve this app into something people can use. Join at: <a href="https://discord.gg/3t2ReFSKUr">discord.gg/3t2ReFSKUr</a></p>
			<h2>AI Disclaimer</h2>
			<p>AI was used to understand some aspects of React that I was not previously familiar with. Direct output of AI was not used anywhere in this project.</p>
			<p>© 2026 Casa Nuestra. All rights reserved.</p>
		</div>
	)
}

export default InfoMenu