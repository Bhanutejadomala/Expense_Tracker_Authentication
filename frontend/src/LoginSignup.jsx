import React, { useState } from 'react'
import './LoginSignup.css'
const LoginSignup = () => {

    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''

    })

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    const login = async (e) => {
        console.log(e)
        e.preventDefault()
        console.log("login function executed", formData);
        let responseData;
        await fetch('http://localhost:7000/login', {
            method: 'POST',
            headers: {
                Accept: 'application/form-data',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),

        }).then((response) => response.json()).then((data) => responseData = data)
         console.log(responseData)
        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace("/expense")
        }
        else {
            setState("Sign Up")
        }
    }

    const signup = async (e) => {
        e.preventDefault()
        console.log("signup function executed", formData);
        let responseData;
        await fetch('http://localhost:7000/signup', {
            method: 'POST',
            headers: {
                Accept: 'application/form-data',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),

        }).then((response) => response.json()).then((data) => responseData = data)
         console.log(responseData)
        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace("/expense")
        }
        else {
            alert(responseData.errors);
        }
    }


    return (
        <form className='loginsignup-fields' id='loginForm' onSubmit={state==='Login'? login:signup}>
            {state==='Login'?<h1>LOGIN</h1>:<></>}
            {state==='Sign Up'?<h1>CREATE ACCOUNT</h1>:<></>}
            {state === "Sign Up" ? <input type='text' name='username' value={formData.username} onChange={changeHandler} placeholder='Your Name' required/> : <></>}
            <input name='email' value={formData.email} onChange={changeHandler} type='email' placeholder='Email Address' required />
            <input name='password' value={formData.password} onChange={changeHandler} type='password' placeholder='password' required />
            <button type='submit' >{state==="Login"?"Login":"Sign Up"}</button>
            {state==="Sign Up"?
            <p> 
            Already have an account?
            <span onClick={() => setState('Login')} style={{ color: 'blue', cursor: 'pointer' }}>
              Login here
            </span>
            </p>:<></>
            }
        </form>
            
        
    )
}

export default LoginSignup
