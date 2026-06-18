const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,16}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/;
const rateLimitStore = new Map();

export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return 'Username is required.';
  }
  if (!USERNAME_REGEX.test(username)) {
    return 'Username must be 3-16 characters and may only include letters, numbers, dots, and underscores.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
  }
  return null;
}

export function validateLoginPayload(username, password) {
  const errors = [];
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);

  if (usernameError || passwordError) {
    errors.push('Username or password is incorrect, please try again.');
  }

  return errors;
}

export function validateRegisterPayload(username, password, passwordConfirm) {
  const errors = [];
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);

  if (usernameError) {
    errors.push(usernameError);
  }

  if (passwordError) {
    errors.push(passwordError);
  }

  if (password !== passwordConfirm) {
    errors.push('Passwords do not match.');
  }

  return errors;
}

export function getClientIp(req) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export function enforceRateLimit(key, maxAttempts, windowSeconds) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return `Too many attempts. Try again in ${retryAfter} seconds.`;
  }

  record.count += 1;
  rateLimitStore.set(key, record);
  return null;
}

export function clearRateLimit(key) {
  rateLimitStore.delete(key);
}
