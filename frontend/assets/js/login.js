/* ==================== login.js ====================
   Script khusus halaman login-admin.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) sudah dimuat lebih dulu.
   ==================================================== */

// toggle show/hide password
function togglePassword(){

    const password = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    if(password.type === "password"){
        password.type = "text";
        eyeIcon.classList.remove("bi-eye");
        eyeIcon.classList.add("bi-eye-slash");
    }else{
        password.type = "password";
        eyeIcon.classList.remove("bi-eye-slash");
        eyeIcon.classList.add("bi-eye");
    }

}

// LOGIN - terhubung ke backend PHP Native (POST /api/auth/login, table=admin)
document.getElementById("loginForm").addEventListener("submit", function(e){

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email === "" || password === ""){
        tampilkanToast("Email dan password harus diisi!", "danger");
        return;
    }

    DapurKostAPI.login(email, password, "admin")
        .then(function(){
            tampilkanToast("Login berhasil! Mengalihkan ke dashboard...", "success");

            setTimeout(function(){
                window.location.href = "dashboard-admin.html";
            }, 900);
        })
        .catch(function(err){
            tampilkanToast(err.message || "Email atau password salah!", "danger");
        });

});

// LOGIN GOOGLE (Dummy)
// TODO Backend: integrasikan Google OAuth di sisi backend PHP Native.
const googleLoginBtn = document.getElementById("googleLoginBtn");
if(googleLoginBtn){
    googleLoginBtn.addEventListener("click", function(){
        tampilkanToast("Fitur Google Login akan tersedia setelah integrasi backend.", "info");
    });
}
