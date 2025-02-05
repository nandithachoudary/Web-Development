document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const dobInput = document.getElementById("dob");
    const phoneInput = document.getElementById("phone");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const dobError = document.getElementById("dobError");
    const phoneError = document.getElementById("phoneError");

    const strengthIndicator = document.getElementById("strengthIndicator");

    function validateName() {
        const nameRegex = /^[A-Z a-z\s]+$/;
        if (!nameRegex.test(nameInput.value.trim())) {
            nameError.textContent = "Name must contain only alphabets.";
            return false;
        }
        nameError.textContent = "";
        return true;
    }

    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = "Enter a valid email address.";
            return false;
        }
        emailError.textContent = "";
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        const strengthLevels = ["Weak", "Medium", "Strong"];
        let strengthScore = 0;

        if (password.length >= 8) strengthScore++;
        if (/[A-Z]/.test(password)) strengthScore++;
        if (/[a-z]/.test(password)) strengthScore++;
        if (/\d/.test(password)) strengthScore++;
        if (/[@$!%*?&]/.test(password)) strengthScore++;

        if (strengthScore < 3) {
            strengthIndicator.style.backgroundColor = "red";
            strengthIndicator.textContent = "Weak";
        } else if (strengthScore === 3 || strengthScore === 4) {
            strengthIndicator.style.backgroundColor = "orange";
            strengthIndicator.textContent = "Medium";
        } else {
            strengthIndicator.style.backgroundColor = "green";
            strengthIndicator.textContent = "Strong";
        }

        if (strengthScore < 4) {
            passwordError.textContent = "Password must be at least 8 characters, include uppercase, lowercase, number, and a special character.";
            return false;
        }
        passwordError.textContent = "";
        return true;
    }

    function validateDOB() {
        const dob = new Date(dobInput.value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();

        if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
            dobError.textContent = "You must be at least 18 years old.";
            return false;
        }
        dobError.textContent = "";
        return true;
    }

    function validatePhone() {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
            phoneError.textContent = "Phone number must be 10 digits.";
            return false;
        }
        phoneError.textContent = "";
        return true;
    }

    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    passwordInput.addEventListener("input", validatePassword);
    dobInput.addEventListener("input", validateDOB);
    phoneInput.addEventListener("input", validatePhone);

    form.addEventListener("submit", function (event) {
        const isValid =
            validateName() &&
            validateEmail() &&
            validatePassword() &&
            validateDOB() &&
            validatePhone();

        if (!isValid) {
            event.preventDefault(); 
          
        }
    });
});
