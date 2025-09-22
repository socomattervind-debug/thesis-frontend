export const validateAdminSignUp = ({
  fullName,
  email,
  password,
  confirmPassword,
  phoneNumber,
  officialNumber,
  adminCode,
}) => {
  // Regex patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10,15}$/; // 10-15 digits
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  // min 6 characters, at least one letter and one number

  // Full Name
  if (!fullName || fullName.length < 3) {
    return {
      valid: false,
      message: "Full Name must be at least 3 characters.",
    };
  }

  // Email
  if (!emailPattern.test(email)) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  // Password
  if (!passwordPattern.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 6 characters and include letters and numbers.",
    };
  }

  // Confirm Password
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }

  // Phone Number
  if (!phonePattern.test(phoneNumber)) {
    return { valid: false, message: "Phone number must be 10-15 digits only." };
  }

  // Official Number
  if (!officialNumber || officialNumber.length < 5) {
    return {
      valid: false,
      message: "Official Number must be at least 5 characters long.",
    };
  }

  // Admin Code
  if (!adminCode || adminCode.length < 4) {
    return {
      valid: false,
      message: "Admin Code must be at least 4 characters long.",
    };
  }

  return { valid: true };
};
