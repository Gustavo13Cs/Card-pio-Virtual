const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const email = emailInput.value;
    const password = passwordInput.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login bem-sucedido!
            console.log('Login realizado com sucesso:', userCredential.user);
            window.location.href = 'admin.html'; // Redireciona para o painel de admin
        })
        .catch((error) => {
            // Falha no login
            console.error('Erro no login:', error);
            errorMessage.textContent = 'E-mail ou senha inválidos.';
            errorMessage.style.display = 'block';
        });
});