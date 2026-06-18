"use client";
import { useState } from 'react';
import { ErrorList } from '../components/ErrorList';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState([]);
  const [userFound, setUserFound] = useState(false);
  const [hasTwoFA, setHasTwoFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    const username = formData.get('Username')
    const password = formData.get('Password');
    
    const validationErrors = validateForm(username, password);
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
        body: JSON.stringify({username, password})
      });

      const data = await res.json();

      if (!res.ok)
      {
        setErrors(Array.isArray(data.message) ? data.message : [data.message || 'Login failed']);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        if (data.requires2FA) {
          setHasTwoFA(true);
          setUserFound(true);
          setIsLoading(false);
          return;
        }
        setHasTwoFA(false);
        setUserFound(true);
        setIsLoading(false);
        // router.replace('/MV/vault');
        // router.refresh();
        return;
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
    const code = formData.get('twoFACode');

    if (!code || code.length !== 6)
    {
      setErrors(['Authentication code entered is not 6 digits.']);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/MV/api/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      
      if (!res.ok)
      {
        setErrors(Array.isArray(data.message) ? data.message : [data.message || 'Verification failed']);
        setIsLoading(false);
        return;
      }

      if (res.ok)
      {
        router.replace('/MV/vault');
        router.refresh();
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

  const handleSkip2FA = () => {
    router.push('/MV/vault');
    router.refresh();
  };

  const handleSetup2FA = () => {
    router.push('/MV/2FA');
    router.refresh();
  };

  return (
    <>
      {!userFound ? (
        <form onSubmit={handleLogin}>
          {errors.length > 0 && <ErrorList list={errors} />}
          
          <label>Username</label> <br />
          <input 
            name="Username" 
            autoComplete="username" 
            disabled={isLoading}
            required
          /> <br />
          
          <label>Password</label> <br />
          <input 
            name="Password" 
            autoComplete="current-password" 
            type="password" 
            disabled={isLoading}
            required
          /> <br />

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
      ) : (
        <>
          {hasTwoFA ? (
            <form onSubmit={handle2FA}>
              {errors.length > 0 && <ErrorList list={errors} />}

              <p>Please enter your two-factor authentication code.</p>
              <input
                name="twoFACode"
                type="text"
                maxLength="6"
                pattern="[0-9]{6}"
                disabled={isLoading}
                placeholder="Enter 6-digit code"
                required
                autoFocus
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
              
              <p>
                <small>Lost access to your authenticator app? <a href="/MV/backup-codes">Use a backup code</a></small>
              </p>
            </form>
          ) : (
            <div>
              <h2>Would you like to set up 2-Factor Authentication?</h2>
              <p>Adding 2FA makes your account more secure.</p>
              
              <button onClick={handleSetup2FA}>
                Set Up 2FA
              </button>
              
              <button onClick={handleSkip2FA}>
                Skip For Now
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}