'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorList } from '../components/ErrorList';

export default function TwoFAPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/MV/api/2fa/qr", {
          method: "POST",
        });

        const data = await response.json();
        
        if (!response.ok) {
          setErrors([data.message || 'Failed to get QR code']);
          setIsLoading(false);
          return;
        }

        setQrCode(data.qrCode);
        console.log('QR Code received');
      } catch (error) {
        setErrors(["An unexpected error occurred. Please try again."]);
        console.error('QR fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCode();
  }, []);

  async function handle2FA(e) {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    const formData = new FormData(e.target);
    const code = formData.get('twoFACode');

    if (!code || code.length !== 6) {
      setErrors(['Authentication code entered is not 6 digits.']);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/MV/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setErrors([data.message || 'Verification failed']);
        setIsLoading(false);
        return;
      }

      if (data.backupCodes) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
      } else {
        // If no backup codes, redirect immediately
        router.replace('/MV/vault');
        router.refresh();
      }

    } catch (error) {
      setErrors(["An unexpected error occurred. Please try again."]);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleContinue = () => {
    setTimeout(() => {
      router.replace('/MV/vault');
      router.refresh();
    }, 1500);
  };

  return (
    <>
      {showBackupCodes ? (
        <div>
          <h2>Save these backup codes!</h2>
          <p>If you lose your authenticator app, use these codes to access your account.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {backupCodes.map((code, index) => (
              <span key={index} style={{ fontFamily: 'monospace', fontSize: '18px' }}>
                {code}
              </span>
            ))}
          </div>
          <button onClick={handleContinue}>I've saved my backup codes</button>
        </div>
      ) : (
        <>
          {qrCode && <img src={qrCode} alt="2FA QR Code" />}
          {!qrCode && !isLoading && <p>No QR code available. Please refresh.</p>}
          {isLoading && <p>Loading QR code...</p>}

          <form onSubmit={handle2FA}>
            {errors.length > 0 && <ErrorList list={errors} />}

            <p>Please enter your two-factor authentication code.</p>
            <input
              name="twoFACode"
              type="text"
              maxLength="6"
              pattern="[0-9]{6}"
              disabled={isLoading}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </button>
          </form>
        </>
      )}
    </>
  );
}