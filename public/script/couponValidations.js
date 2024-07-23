
function validateExpiryDate(){
     const input = document.getElementById('expiryDate');
     const divError = document.getElementById('errorExpiryDate');
     const date = new Date(input.value);
     console.log("Date ::"+date);
     const today = new Date();
     const maxDate = new Date(today);
     maxDate.setDate(today.getDate()+150);
     today.setHours(0,0,0,0);
     if (date < today || date > maxDate || date ==="" ) {
            divError.innerHTML = "Please input a valid Date !";
            input.value = today;
            input.setCustomValidity("Invalid Date");
    } else {
            divError.textContent = "";
            input.setCustomValidity("");
    } 
 }
function validateMaximum(){
     const input = document.getElementById('maximumAmount');
     const divError = document.getElementById('maximumError');
     const amount = parseFloat(input.value.trim());
     if (isNaN(amount) || amount < 50 || amount > 5000 || amount === "") {
            divError.innerHTML = "Please input a valid amount (between 50 and 5000)!";
            input.setCustomValidity("Invalid amount");
    } else {
            divError.textContent = "";
            input.setCustomValidity("");
            
    } 
 }
function validatePercentage(){
     const percent = document.getElementById('percent');
     const divError = document.getElementById('errorPercentage');
     const amount = parseFloat(percent.value.trim());
     if (isNaN(amount) || amount < 1 || amount > 70 || amount ==="") {
            divError.innerHTML = "Please input a valid amount(between 1 and 70)!";
            percent.setCustomValidity("Invalid amount");
    } else {
            divError.textContent = "";
            percent.setCustomValidity("");
    }
 }
 function validateMinimum(){
     const input = document.getElementById('minimumAmount');
     const divError = document.getElementById('errorAmount');
     const amount = parseFloat(input.value.trim());
     if (isNaN(amount) || amount < 50 || amount > 5000 || amount === "") {
            divError.innerHTML = "Please input a valid amount (between 50 and 5000)!";
            input.setCustomValidity("Invalid amount");
    } else {
            divError.textContent = "";
            input.setCustomValidity("");
    }
 }
function validateCouponForm() {
    console.log("INside validate form!!");
let isValid = true;
const name = document.getElementById('couponName').value.trim();
const description = document.getElementById('couponDescription').value.trim();
const percentage = document.getElementById('percent').value.trim();
const purchaseMinimum = document.getElementById('minimumAmount').value.trim();
const maximumAmount = document.getElementById('maximumAmount').value.trim();
const date = document.getElementById('expiryDate').value.trim();
// ERROR Div 
const errorName = document.getElementById('errorName');
const errorDescription = document.getElementById('errorDescription');
const errorAmount = document.getElementById('errorAmount');
const errorPercentage = document.getElementById('errorPercentage');
const errorMaximum = document.getElementById('maximumError');
const errorExpiryDate = document.getElementById('errorExpiryDate');
console.log("Inside Validation!! set value !!");
const exp = /^[a-zA-Z0-9]+$/;
const expAlphabets =  /^[a-zA-Z\s.]+$/;

if (name === "" || !exp.test(name)) {
    displayErrorMessage(errorName, "Input Name !");
    isValid = false;
} else {
    errorName.style.display = 'none';
}

if (description === "" || !expAlphabets.test(description)) {
displayErrorMessage(errorDescription, "Input Description !");
isValid = false;
} else {
errorDescription.style.display = 'none';
}
if (purchaseMinimum === "" || isNaN(purchaseMinimum)) {
displayErrorMessage(errorAmount, "Purchase minimum amount field Error!");
isValid = false;
} else {
errorAmount.style.display = 'none';
}
if(percentage === "" || isNaN(percentage)) {
displayErrorMessage(errorPercentage, "Percentage field Error!");
isValid = false;
} else {
errorPercentage.style.display = 'none';
}
if (maximumAmount === "" || isNaN(maximumAmount)) {
displayErrorMessage(errorMaximum, "Maximum Amount field Error!");
isValid = false;
} else {
errorMaximum.style.display = 'none';
}

if (date === "") {
displayErrorMessage(errorExpiryDate, "Expiry Date field Error!");
isValid = false;
} else {
errorExpiryDate.style.display = 'none';
}

return isValid;
}

function displayErrorMessage(element, message) {
    element.style.display = 'block';
    element.innerHTML = message;
}