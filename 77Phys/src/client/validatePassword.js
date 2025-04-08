// validatePassword.js
export default function validatePassword(password) {
  const hasUppercase = /[A-Z]/.test(password);    // at least one uppercase letter
  const hasLowercase = /[a-z]/.test(password);    // at least one lowercase letter
  const hasNumber = /[0-9]/.test(password);       // at least one number
  const hasSpecialChar = /[!@#$%*]/.test(password); // at least one special character

  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

