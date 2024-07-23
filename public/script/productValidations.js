function validateProductForm() {
    let isValid = true;
    document.querySelectorAll('.alert-danger').forEach(el => el.style.display = 'none');
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const brand = document.getElementById('brand').value.trim();
    const rating = document.getElementById('rating').value.trim();
    const images = document.getElementById('fileInput').files;
    const expr = /^[A-Za-z\s]+$/;
    if (name === "" || !expr.test(name)) {
        displayErrorMessage('errorName', "Valid product name is required!");
        isValid = false;
    }
    if (description === "" || !/^[a-zA-Z0-9\s.]*$/.test(description)) {
           displayErrorMessage('errorDescription', "Description Error!");
           isValid = false;
    }
    if (category === "" ) {
        displayErrorMessage('errorCategory', "Category is required!");
        isValid = false;
    }
    if (brand === "" || !expr.test(brand)) {
        displayErrorMessage('errorBrand', "Brand is required!");
        isValid = false;
    }
    if (rating === "" || isNaN(rating) || rating < 1 || rating > 5) {
        displayErrorMessage('errorRating', "Rating must be a number between 1 and 5!");
        isValid = false;
    }
    if (images.length === 0) {
        displayErrorMessage('errorImage', "At least one image is required!");
        isValid = false;
    }
    if(variant.length === 0){
          displayErrorMessage('errorVarient', "At least one image is required!");
          isValid = false;
    }
    return isValid;
}
function displayErrorMessage(id, message) {
    const element = document.getElementById(id);
    element.style.display = 'block';
    element.innerHTML = message;
}