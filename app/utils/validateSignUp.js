// utils/validation.js

export const validateSignUp = ({
  fullName,
  email,
  password,
  confirmPassword,
  phoneNumber,
  address,
}) => {
  // Regex patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10,15}$/; // only numbers, 10-15 digits
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const addressPattern = /^.{5,}$/; // minimum 5 characters

  if (!fullName) {
    return { valid: false, message: "Full Name is required." };
  }
  if (!emailPattern.test(email)) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  if (!passwordPattern.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 6 characters and include letters and numbers.",
    };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  if (!phonePattern.test(phoneNumber)) {
    return {
      valid: false,
      message: "Phone number must be 10-15 digits only.",
    };
  }
  if (!addressPattern.test(address)) {
    return {
      valid: false,
      message: "Address must be at least 5 characters long.",
    };
  }

  return { valid: true };
};
