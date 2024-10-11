export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password (at least 6 characters and one letter)
export const validatePassword = (password) => {
    const passwordRegex = /[A-Za-z]/;  // Checks for at least one letter
    return password.length >= 6 && passwordRegex.test(password);
};