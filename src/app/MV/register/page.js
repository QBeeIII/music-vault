"use client";
import { useState } from 'react'
import { ErrorList } from '../components/ErrorList'
import { useRouter } from 'next/navigation';
import "./register.css"


export default function RegisterPage()
{

  const router = useRouter();  
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validateForm(username, passwordA, passwordB)
  {
    const tempErrors = [];
    if (username.length < 3 || username.length > 16)
    {
      tempErrors.push("Username must be between 3 and 16 characters.");
    }

    const userPattern = /^[a-zA-Z0-9._]+$/
    if (!userPattern.test(username))
    {
      tempErrors.push("Username contains invalid characters. Only letters, numbers, dots, and underscores are allowed.")
    }

    if (passwordA != passwordB)
    {
      tempErrors.push("Passwords do not match.");
      return tempErrors;
    }

    if (passwordA.length < 8)
    {
      tempErrors.push("Password must be at least 8 characters long.");
    }

    const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;
    if (!passPattern.test(passwordA))
    {
      tempErrors.push("Password must have at least one uppercase letter, lowercase letter, number, and special character.");
    }
    return tempErrors;
  }
  
  
  async function handleSubmit(e)
  {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    // console.log(formData);

    const username = formData.get('Username');
    const passA = formData.get('PasswordA');
    const passB = formData.get('PasswordB');
    
    const validationErrors = validateForm(username, passA, passB);
    setErrors(validationErrors);
    if (validationErrors.length > 0)
    {
      setIsLoading(false);
      return;
    }

    

    try
    {
      const res = await fetch("/MV/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, passA, passB})
      });

      const data = await res.json();
      // console.log("test", data);
      // console.log("test", data)

      if (!res.ok)
      {
        setErrors(data.message);
        setIsLoading(false);
      }

      if (res.ok)
      {
        //success stuff
        setTimeout(() => {
          setSuccess(true);
          setIsLoading(false);
        }, 1500);
        // console.log(data.userID);
        // router.replace('/MV/vault');
      }


    }
    catch (error)
    {
      setErrors(["An unexpected error occurred."]);
      setIsLoading(false);
    }
  }
  
  
  
  return (
    <>
    {/* <p>{process.env.TEST}</p> */}
      <form onSubmit={handleSubmit}>
        
        {errors.length > 0 && <ErrorList list={errors} />}
        
        <label>Username</label> <br />
        <input name="Username" disabled={isLoading}/> <br />
        <label>Password</label> <br />
        <input name="PasswordA" type="password" disabled={isLoading}/> <br />
        <label>Verify New Password</label> <br />
        <input name="PasswordB" type="password" disabled={isLoading}/> <br />

        <button
          type="submit"
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? (
            <>
              <span className="throbber" /> Creating Account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>
      
      {success && (
        <div>
        <h2>Would you like to set up 2-Factor Authentication?</h2>
        <button onClick={() => {router.replace('/MV/2FA'); router.refresh()}}>
          Set Up 2FA
        </button>
        <button onClick={() => {router.replace('/MV/vault'); router.refresh()}}>
          Skip For Now
        </button>
        </div>
      )}
    </>
  )
}