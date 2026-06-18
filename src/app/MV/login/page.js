"use client";
import { useState } from 'react'
import { ErrorList } from '../components/ErrorList'
import { useRouter } from 'next/navigation';
import "./login.css"


export default function LoginPage()
{

  const router = useRouter();  
  const [errors, setErrors] = useState([]);
  const [userFound, setUserFound] = useState(false);
  const [hasTwoFA, setHasTwoFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');

  function validateForm(username, password)
  {
    const tempErrors = [];

    const userPattern = /^[a-zA-Z0-9._]+$/
    if (!userPattern.test(username))
    {
      tempErrors.push("Username or password is incorrect, please try again.")
      return tempErrors;
    }

    if (password.length < 8)
    {
      tempErrors.push("Username or password is incorrect, please try again.")
      return tempErrors;
    }

    const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;
    if (!passPattern.test(password))
    {
      tempErrors.push("Username or password is incorrect, please try again.")
      return tempErrors;
    }
    return tempErrors;
  }
  
  async function handleLogin(e)
  {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    // console.log(formData);

    const formUsername = formData.get('Username')
    setUsername(formUsername);
    const password = formData.get('Password');
    
    const validationErrors = validateForm(formUsername, password);
    setErrors(validationErrors);
    if (validationErrors.length > 0)
    {
      setIsLoading(false);
      return;
    }

    try
    {
      const res = await fetch("/MV/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username: formUsername, password})
      });

      const data = await res.json();
      // console.log("test", data);
      console.log("test", data)

      if (!res.ok)
      {
        setErrors(data.message);
        setIsLoading(false);
      }

      if (res.ok && data.twoFA)
      {
        setTimeout(() => {
          setUserFound(true);
          setIsLoading(false);
        }, 1500);

        setHasTwoFA(Boolean(data.twoFA))
      }
    }
    catch (error)
    {
      setErrors(["An unexpected error occurred. Please try again."]);
      setIsLoading(false);
    }
    finally
    {
      setIsLoading(false);
    }
  }
  
  async function handle2FA(e)
  {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    // console.log(formData);

    const code = formData.get('twoFACode');

    if (code.length != 6)
    {
      setErrors(['Authentication code entered is not 6 digits.']);
      setIsLoading(false);
      return;
    }

    try
    {
      const res = await fetch("/MV/api/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, code})
      });

      const data = await res.json();
      if (!res.ok)
      {
        setErrors(data.message);
        setIsLoading(false);
      }

      if (res.ok)
      {
        router.replace('/MV/vault');
      }

    }
    catch (error)
    {
      setErrors(["An unexpected error occurred. Please try again."]);
      setIsLoading(false);
    }
    finally
    {
      setIsLoading(false);
    }
  }
  
  return (
    <>
      <form onSubmit={handleLogin}>
        
        {errors.length > 0 && <ErrorList list={errors} />}
        
        <label>Username</label> <br />
        <input name="Username" autoComplete="username" disabled={isLoading}/> <br />
        <label>Password</label> <br />
        <input name="Password" autoComplete="current-password" type="password" disabled={isLoading}/> <br />

        <button
          type="submit"
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? (
            <>
              <span className="throbber" /> Logging In...
            </>
          ) : (
            'Log In'
          )}
        </button>
      </form>
      
      {userFound && (!hasTwoFA ? (
        <div>
        <h2>Would you like to set up 2-Factor Authentication?</h2>
        <button onClick={() => router.replace('/MV/2FA')}>
          Set Up 2FA
        </button>
        <button onClick={() => router.replace('/MV/vault')}>
          Skip For Now
        </button>
        </div>
      ) : (
        <form onSubmit={handle2FA}>
          {errors.length > 0 && <ErrorList list={errors} />}

          <p>Please enter your two-factor authentication code.</p>
          <input
            name="twoFACode"
            type="text"
            maxLength="6"
            pattern="[0-9]{6}"
            disabled={isLoading}  
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      ))}
    </>
  )
}