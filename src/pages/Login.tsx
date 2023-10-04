import { useState } from "react"

export function Login() {
	const [userName, setUserName] = useState('')
	const [password, setPassword] = useState('')


	const handleUserNameChange = (e) => {
		setUserName(e.target.value)
	}
	
	const handlePasswordChange = (e) => {
		setPassword(e.target.value)
	}

	return (
		<div>
			<h1>Login</h1>

			<input type="text" value={userName} onChange={handleUserNameChange} />
			<input type="password" value={password} onChange={handlePasswordChange} />
			<button>Submit</button>
		</div>
	)
}