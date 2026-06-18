'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import logOutStyles from './Logout.module.css'

export function LogoutButton()
{
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try
    {
      const res = await fetch('/MV/api/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok)
      {
        setShowDialog(false)
        router.refresh()
      }
      else
      {
        console.error('logout failed')
      }
    }
    catch (error)
    {
      console.error('logout failed, error: ', error)
    }
    finally
    {
      setIsLoading(false)
    }
  }

  return (
    <>
    <button
      onClick={() => setShowDialog(true)}
      className={logOutStyles.logoutButton}
    >
      Logout
    </button>
    
    {showDialog && (
      <div className={logOutStyles.dialogOverlay}>
        <div className={logOutStyles.dialog}>
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to logout?</p>
          <div className={logOutStyles.dialogActions}>
            <button
              onClick={() => setShowDialog(false)}
              className={logOutStyles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              onClick={handleLogout}
              className={logOutStyles.confirmButton}
              disabled={isLoading}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}