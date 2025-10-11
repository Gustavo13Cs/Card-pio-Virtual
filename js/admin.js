firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuário autenticado:', user.email);
        displayCategories();
    } else {
        console.log('Acesso não autorizado. Redirecionando para login...');
        window.location.href = 'login.html';
    }
});

const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut();
});


async function displayCategories() {
    const categoryListDiv = document.getElementById('category-list');
    categoryListDiv.innerHTML = '<p>Carregando categorias...</p>';

    const snapshot = await db.collection('categorias').orderBy('ordem').get();
    
    if (snapshot.empty) {
        categoryListDiv.innerHTML = '<p>Nenhuma categoria encontrada.</p>';
        return;
    }

    let html = '';
    snapshot.forEach(doc => {
        const categoria = doc.data();
        html += `
            <div class="category-list-item" data-id="${doc.id}">
                <span>${categoria.ordem}. ${categoria.nome}</span>
                <div>
                    <button class="btn-ver-itens">Ver Itens</button>
                    <button class="btn-editar">Editar</button>
                    <button class="btn-excluir">Excluir</button>
                </div>
            </div>
        `;
    });

    categoryListDiv.innerHTML = html;
}

const addCategoryForm = document.getElementById('add-category-form');
addCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('category-name').value;
    const ordem = parseInt(document.getElementById('category-order').value);
    const precoFixoInput = document.getElementById('category-price').value;

    const novaCategoria = {
        nome: nome,
        ordem: ordem,
        itens: []
    };

    if (precoFixoInput) {
        novaCategoria.precoFixo = parseFloat(precoFixoInput);
    }

    try {
        await db.collection('categorias').add(novaCategoria);
        Toastify({ text: "Categoria adicionada com sucesso!", style: { background: "linear-gradient(to right, #4CAF50, #81C784)" } }).showToast();
        addCategoryForm.reset(); 
        displayCategories(); 
    } catch (error) {
        console.error("Erro ao adicionar categoria: ", error);
        Toastify({ text: "Erro ao adicionar categoria.", style: { background: "linear-gradient(to right, #E57373, #F06292)" } }).showToast();
    }
});