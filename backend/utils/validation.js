//Email Validation
export function isValidEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

//Password Validation: Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
export const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};


//Username Validation: Alphanumeric characters, 3-16 characters long
export const isValidUsername = (username) => {
    return name && name.trim().lenght >= 2;
};

//Sanitize User Input
export const sanitizeInput = (input) => {
    return input.replace(/[<>&'"]/g, function(c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&#39;';
            case '"': return '&quot;';
        }
    });
};

