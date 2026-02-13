import { render } from 'preact'

import { cssVars } from '$exporter/data'
import { App } from './app.tsx'
import './app.css'

document.documentElement.style.cssText = cssVars()
render(<App />, document.getElementById('app')!)
