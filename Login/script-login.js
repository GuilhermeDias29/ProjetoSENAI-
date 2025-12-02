const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, cpf: cpf })
        });

        const resultado = await response.json();

        if (response.ok) {
            localStorage.setItem('tipoUsuario', resultado.usuario.tipo);
            const tipo = resultado.usuario.tipo;

            if (tipo === 'admin') {
                // Caminho corrigido para a pasta CadastroDeVagas
                window.location.href = "../CadastroDeVagas/cadastro.html"; 
            } else {
                // CORREÇÃO AQUI: A pasta chama Visualizacao
                window.location.href = "../Visualizacao/visualizacao.html";
            }

        } else {
            alert("Erro: " + resultado.mensagem);
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("O servidor parece estar desligado.");
    }
});