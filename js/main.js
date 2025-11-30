const REGEX = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    name: /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/,
    pass: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
    mobile: /^[0-9]{7,12}$/
};
function getUsersDB() {
    return JSON.parse(localStorage.getItem('auth_users')) || {};
}
function saveUsersDB(users) {
    localStorage.setItem('auth_users', JSON.stringify(users));
}
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
}
function switchView(viewName) {
    hideMessage();
    document.getElementById('view-register').classList.add('hidden');
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('view-recovery').classList.add('hidden');

    document.getElementById(`view-${viewName}`).classList.remove('hidden');
}
function showMessage(msg, type) {
    const box = document.getElementById('system-message');
    box.textContent = msg;
    box.className = `message-box ${type === 'error' ? 'message-error' : 'message-success'}`;
    box.style.display = 'block';
}
function hideMessage() {
    document.getElementById('system-message').style.display = 'none';
}
document.getElementById('form-register').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const mobile = document.getElementById('reg-mobile').value;
    const pass = document.getElementById('reg-pass').value;
    if (!REGEX.name.test(name)) return showMessage("Nombre inválido (solo letras y espacios).", "error");
    if (!REGEX.email.test(email)) return showMessage("Correo electrónico inválido.", "error");
    if (!REGEX.mobile.test(mobile)) return showMessage("Celular inválido (7-12 números).", "error");
    if (!REGEX.pass.test(pass)) return showMessage("Contraseña débil: Debe tener mayúscula, minúscula, número, símbolo y mín 6 caracteres.", "error");
    const users = getUsersDB();
    if (users[email]) {
        return showMessage("El correo ya está registrado.", "error");
    }
    users[email] = {
        name: name,
        mobile: mobile,
        pass: pass,
        attempts: 0,      
        isBlocked: false  
    };
    saveUsersDB(users);
    showMessage("Registro exitoso. Ahora inicia sesión.", "success");
    e.target.reset();
    setTimeout(() => switchView('login'), 2000);
});
document.getElementById('form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const users = getUsersDB();
    if (!users[email]) {
        return showMessage("Usuario o contraseña incorrectos.", "error");
    }
    const user = users[email];
    if (user.isBlocked) {
        return showMessage("Cuenta bloqueada por intentos fallidos. Utilice la opción '¿Olvidaste tu contraseña?' para recuperarla.", "error");
    }
    if (user.pass === pass) {
        user.attempts = 0;
        saveUsersDB(users);
        showMessage(`Bienvenido al sistema, ${user.name}`, "success");
    } else {
        user.attempts++;
        if (user.attempts >= 3) {
            user.isBlocked = true;
            saveUsersDB(users);
            return showMessage("Cuenta bloqueada por intentos fallidos. Debe recuperar su contraseña para desbloquearla.", "error");
        } else {
            saveUsersDB(users);
            return showMessage(`Usuario o contraseña incorrectos. Intentos restantes: ${3 - user.attempts}`, "error");
        }
    }
});
document.getElementById('form-recovery').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('rec-email').value;
    const newPass = document.getElementById('rec-pass').value;
    const users = getUsersDB();
    if (!users[email]) {
        return showMessage("El correo no está registrado en el sistema.", "error");
    }
    if (!REGEX.pass.test(newPass)) {
        return showMessage("La nueva contraseña no cumple con los requisitos de seguridad.", "error");
    }
    users[email].pass = newPass;
    users[email].attempts = 0;
    users[email].isBlocked = false;
    saveUsersDB(users);
    showMessage("Contraseña actualizada. Ahora puede iniciar sesión.", "success");
    e.target.reset();
    setTimeout(() => switchView('login'), 2000);
});