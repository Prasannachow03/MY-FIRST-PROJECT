// ===== Registration Form Validation =====
document.getElementById("regForm").addEventListener("submit", function(e) {
  e.preventDefault(); // stop auto submission

  let fullname = document.getElementById("fullname").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let dob = document.getElementById("dob").value.trim();
  let gender = document.querySelector('input[name="gender"]:checked');
  let errorMsg = document.getElementById("errorMsg");

  // Simple email regex
  let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (fullname === "" || email === "" || password === "" || dob === "" || !gender) {
    errorMsg.innerText = "⚠ All fields are required!";
    return;
  } 
  else if (!email.match(emailPattern)) {
    errorMsg.innerText = "⚠ Enter a valid email address!";
    return;
  } 
  else if (password.length < 6) {
    errorMsg.innerText = "⚠ Password must be at least 6 characters!";
    return;
  } 
  else {
    errorMsg.innerText = "";
    alert("✅ Registration Successful!\n\n" +
          "Name: " + fullname + "\n" +
          "Email: " + email + "\n" +
          "DOB: " + dob + "\n" +
          "Gender: " + gender.value);
    document.getElementById("regForm").reset();
  }
});
