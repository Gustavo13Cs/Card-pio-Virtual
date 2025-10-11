firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        displayCategories();
        setupEventListeners();
    } else {
        window.location.href = 'login.html';
    }
});

document.getElementById('logout-button').addEventListener('click', () => firebase.auth().signOut());
let currentCategoryId = null;

function showView(viewId) {
    document.getElementById('category-view').style.display = 'none';
    document.getElementById('item-view').style.display = 'none';
    document.getElementById('bolo-view').style.display = 'none';
    document.getElementById(viewId).style.display = 'block';
}

async function displayCategories() {
    const div = document.getElementById('category-list');
    div.innerHTML = '<p>Carregando...</p>';
    const snapshot = await db.collection('categorias').orderBy('ordem').get();
    if (snapshot.empty) {
        div.innerHTML = '<p>Nenhuma categoria.</p>';
        return;
    }
    let html = '';
    snapshot.forEach(doc => {
        const c = doc.data();
        html += `
            <div class="category-list-item" data-id="${doc.id}" data-name="${c.nome}">
                <span>${c.ordem}. ${c.nome}</span>
                <div class="item-actions">
                    <button class="btn-ver-itens" title="Ver Itens"><i class="fa-solid fa-list"></i></button>
                    <button class="btn-editar-categoria" title="Editar Categoria"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-excluir-categoria" title="Excluir Categoria"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>`;
    });
    div.innerHTML = html;
}

async function displayItemsForCategory(categoryId) {
    currentCategoryId = categoryId;
    const doc = await db.collection('categorias').doc(categoryId).get();
    const data = doc.data();
    showView('item-view');
    document.getElementById('item-view-title').textContent = `Itens da: ${data.nome}`;
    const listDiv = document.getElementById('item-list');
    document.getElementById('item-price').style.display = data.precoFixo ? 'none' : 'block';
    if (!data.itens || data.itens.length === 0) {
        listDiv.innerHTML = '<p>Nenhum item.</p>';
    } else {
        let html = '';
        data.itens.forEach((item, index) => {
            const itemData = (typeof item === 'object') ? `${item.nome} - R$ ${item.preco.toFixed(2)}` : item;
            html += `
                <div class="item-list-item" data-index="${index}">
                    <span>${itemData}</span>
                    <div class="item-actions">
                        <button class="btn-editar-item-array" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn-excluir-item-array" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>`;
        });
        listDiv.innerHTML = html;
    }
}

async function displayBoloManagement(categoryId) {
    currentCategoryId = categoryId;
    showView('bolo-view');
    renderBoloOptions('tamanhos');
    renderBoloOptions('massas');
    renderBoloOptions('recheios');
    renderBoloOptions('adicionais');
}

async function renderBoloOptions(subCollectionName) {
    const listDiv = document.getElementById(`${subCollectionName}-list`);
    listDiv.innerHTML = '<p>Carregando...</p>';
    const snapshot = await db.collection('categorias').doc(currentCategoryId).collection(subCollectionName).get();
    let html = '';
    snapshot.forEach(doc => {
        const item = doc.data();
        let itemText = item.nome;
        if (item.descricao) itemText += ` (${item.descricao})`;
        if (item.preco !== undefined) itemText += ` - R$ ${item.preco.toFixed(2)}`;
        html += `
            <div class="item-list-item" data-id="${doc.id}">
                <span>${itemText}</span>
                <div class="item-actions">
                    <button class="btn-editar-item-subcolecao" data-subcollection="${subCollectionName}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-excluir-item-subcolecao" data-subcollection="${subCollectionName}" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>`;
    });
    listDiv.innerHTML = html || '<p>Nenhuma opção.</p>';
}

function setupEventListeners() {
    document.getElementById('add-category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = e.target.elements['category-name'].value;
        const ordem = parseInt(e.target.elements['category-order'].value);
        const precoFixoInput = e.target.elements['category-price'].value;
        const novaCategoria = { nome, ordem, itens: [] };
        if (precoFixoInput) {
            novaCategoria.precoFixo = parseFloat(precoFixoInput);
        }
        await db.collection('categorias').add(novaCategoria);
        e.target.reset();
        displayCategories();
        Toastify({ text: "Categoria adicionada!" }).showToast();
    });

    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentCategoryId) return;
        const nome = e.target.elements['item-name'].value;
        const preco = e.target.elements['item-price'].value;
        const ref = db.collection('categorias').doc(currentCategoryId);
        const doc = await ref.get();
        const data = doc.data();
        let item;
        if (data.precoFixo) {
            item = nome;
        } else {
            if (!preco) {
                alert('Informe o preço.');
                return;
            }
            item = { nome: nome, preco: parseFloat(preco) };
        }
        await ref.update({ itens: firebase.firestore.FieldValue.arrayUnion(item) });
        e.target.reset();
        displayItemsForCategory(currentCategoryId);
        Toastify({ text: "Item adicionado!" }).showToast();
    });

    document.getElementById('add-tamanho-form').addEventListener('submit', async (e) => { e.preventDefault(); const [n, d, p] = e.target.elements; await db.collection('categorias').doc(currentCategoryId).collection('tamanhos').add({ nome: n.value, descricao: d.value, preco: parseFloat(p.value) }); e.target.reset(); renderBoloOptions('tamanhos'); Toastify({ text: "Tamanho adicionado!" }).showToast(); });
    document.getElementById('add-massa-form').addEventListener('submit', async (e) => { e.preventDefault(); const [n] = e.target.elements; await db.collection('categorias').doc(currentCategoryId).collection('massas').add({ nome: n.value }); e.target.reset(); renderBoloOptions('massas'); Toastify({ text: "Massa adicionada!" }).showToast(); });
    document.getElementById('add-recheio-form').addEventListener('submit', async (e) => { e.preventDefault(); const [n] = e.target.elements; await db.collection('categorias').doc(currentCategoryId).collection('recheios').add({ nome: n.value }); e.target.reset(); renderBoloOptions('recheios'); Toastify({ text: "Recheio adicionado!" }).showToast(); });
    document.getElementById('add-adicional-form').addEventListener('submit', async (e) => { e.preventDefault(); const [n, p] = e.target.elements; await db.collection('categorias').doc(currentCategoryId).collection('adicionais').add({ nome: n.value, preco: parseFloat(p.value) }); e.target.reset(); renderBoloOptions('adicionais'); Toastify({ text: "Adicional adicionado!" }).showToast(); });
    document.getElementById('back-to-categories-btn').addEventListener('click', () => showView('category-view'));
    document.getElementById('back-to-categories-from-bolo-btn').addEventListener('click', () => showView('category-view'));

    const mainContainer = document.querySelector('.admin-main');
    mainContainer.addEventListener('click', async (e) => {
        const verBtn = e.target.closest('.btn-ver-itens');
        const excluirCatBtn = e.target.closest('.btn-excluir-categoria');
        const excluirItemSubBtn = e.target.closest('.btn-excluir-item-subcolecao');
        const excluirItemArrayBtn = e.target.closest('.btn-excluir-item-array');
        const editarCatBtn = e.target.closest('.btn-editar-categoria');
        const editarItemSubBtn = e.target.closest('.btn-editar-item-subcolecao');
        const editarItemArrayBtn = e.target.closest('.btn-editar-item-array');

        if (verBtn) {
            const item = verBtn.closest('.category-list-item');
            const id = item.dataset.id;
            const name = item.dataset.name;
            if (name === 'Bolos') {
                displayBoloManagement(id);
            } else {
                displayItemsForCategory(id);
            }
        }
        if (excluirCatBtn) {
            const item = excluirCatBtn.closest('.category-list-item');
            const id = item.dataset.id;
            const name = item.dataset.name;
            const { isConfirmed } = await Swal.fire({ title: 'Tem certeza?', text: `Isso apagará a categoria "${name}" e todos os seus itens.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, excluir!', cancelButtonText: 'Cancelar' });
            if (isConfirmed) {
                await db.collection('categorias').doc(id).delete();
                Toastify({ text: "Categoria excluída." }).showToast();
                displayCategories();
            }
        }
        if (excluirItemSubBtn) {
            const item = excluirItemSubBtn.closest('.item-list-item');
            const id = item.dataset.id;
            const sub = excluirItemSubBtn.dataset.subcollection;
            const { isConfirmed } = await Swal.fire({ title: 'Tem certeza?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim!', cancelButtonText: 'Não' });
            if (isConfirmed) {
                await db.collection('categorias').doc(currentCategoryId).collection(sub).doc(id).delete();
                renderBoloOptions(sub);
                Toastify({ text: "Opção excluída." }).showToast();
            }
        }
        if (excluirItemArrayBtn) {
            const itemDiv = excluirItemArrayBtn.closest('.item-list-item');
            const idx = parseInt(itemDiv.dataset.index);
            const { isConfirmed } = await Swal.fire({ title: 'Tem certeza?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim!', cancelButtonText: 'Não' });
            if (isConfirmed) {
                const ref = db.collection('categorias').doc(currentCategoryId);
                const doc = await ref.get();
                const data = doc.data();
                const itemToRemove = data.itens[idx];
                await ref.update({ itens: firebase.firestore.FieldValue.arrayRemove(itemToRemove) });
                displayItemsForCategory(currentCategoryId);
                Toastify({ text: "Item excluído." }).showToast();
            }
        }
        if (editarCatBtn) {
            const item = editarCatBtn.closest('.category-list-item');
            const id = item.dataset.id;
            const ref = db.collection('categorias').doc(id);
            const doc = await ref.get();
            const data = doc.data();
            const { value: form } = await Swal.fire({ title: 'Editar Categoria', html: `<input id="swal-nome" class="swal2-input" value="${data.nome}"><input id="swal-ordem" type="number" class="swal2-input" value="${data.ordem}"><input id="swal-preco" type="number" step="0.01" class="swal2-input" placeholder="Preço Fixo (opcional)" value="${data.precoFixo || ''}">`, focusConfirm: false, showCancelButton: true, confirmButtonText: 'Salvar', preConfirm: () => ({ nome: document.getElementById('swal-nome').value, ordem: parseInt(document.getElementById('swal-ordem').value), precoFixo: parseFloat(document.getElementById('swal-preco').value) || null }) });
            if (form) {
                if (form.precoFixo === null) {
                    form.precoFixo = firebase.firestore.FieldValue.delete();
                }
                await ref.update(form);
                displayCategories();
                Toastify({ text: "Categoria atualizada!" }).showToast();
            }
        }
        if (editarItemSubBtn) {
            const item = editarItemSubBtn.closest('.item-list-item');
            const id = item.dataset.id;
            const sub = editarItemSubBtn.dataset.subcollection;
            const ref = db.collection('categorias').doc(currentCategoryId).collection(sub).doc(id);
            const doc = await ref.get();
            const data = doc.data();
            let html = `<input id="swal-nome" class="swal2-input" value="${data.nome}">`;
            if (data.descricao !== undefined) {
                html += `<input id="swal-descricao" class="swal2-input" value="${data.descricao}">`;
            }
            if (data.preco !== undefined) {
                html += `<input id="swal-preco" type="number" step="0.01" class="swal2-input" value="${data.preco}">`;
            }
            const { value: form } = await Swal.fire({ title: 'Editar Opção', html: html, focusConfirm: false, showCancelButton: true, confirmButtonText: 'Salvar', preConfirm: () => { const d = { nome: document.getElementById('swal-nome').value }; if (document.getElementById('swal-descricao')) d.descricao = document.getElementById('swal-descricao').value; if (document.getElementById('swal-preco')) d.preco = parseFloat(document.getElementById('swal-preco').value); return d; } });
            if (form) {
                await ref.update(form);
                renderBoloOptions(sub);
                Toastify({ text: "Opção atualizada!" }).showToast();
            }
        }
        if (editarItemArrayBtn) {
            const itemDiv = editarItemArrayBtn.closest('.item-list-item');
            const itemIndex = parseInt(itemDiv.dataset.index);
            const categoryRef = db.collection('categorias').doc(currentCategoryId);
            const doc = await categoryRef.get();
            const data = doc.data();
            const itemParaEditar = data.itens[itemIndex];
            const isObject = typeof itemParaEditar === 'object';
            let htmlInputs = isObject ? `<input id="swal-nome" class="swal2-input" value="${itemParaEditar.nome}"><input id="swal-preco" type="number" step="0.01" class="swal2-input" value="${itemParaEditar.preco}">` : `<input id="swal-nome" class="swal2-input" value="${itemParaEditar}">`;
            const { value: formValues } = await Swal.fire({ title: 'Editar Item', html: htmlInputs, focusConfirm: false, showCancelButton: true, confirmButtonText: 'Salvar', preConfirm: () => { const nome = document.getElementById('swal-nome').value; if (!nome) { Swal.showValidationMessage('O nome é obrigatório'); return; } if (isObject) { const preco = parseFloat(document.getElementById('swal-preco').value); if (isNaN(preco)) { Swal.showValidationMessage('O preço é obrigatório'); return; } return { nome, preco }; } return nome; } });
            if (formValues) {
                const novoArrayDeItens = data.itens;
                novoArrayDeItens[itemIndex] = formValues;
                await categoryRef.update({ itens: novoArrayDeItens });
                displayItemsForCategory(currentCategoryId);
                Toastify({ text: "Item atualizado!" }).showToast();
            }
        }
    });
}