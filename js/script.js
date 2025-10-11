document.addEventListener('DOMContentLoaded', async () => {

    const cardapioContainer = document.getElementById('cardapio-main');
    let pedidoTotal = [];


    async function carregarTudo() {
        await gerarCardapio(); 
        inicializarLogicas();  
    }

    async function gerarCardapio() {
        try {
            const snapshot = await db.collection('categorias').orderBy('ordem').get();
            let htmlPromises = snapshot.docs.map(async (doc) => {
                const categoria = doc.data();
                let secaoHtml = '';

                if (categoria.nome === 'Bolos') {
                    secaoHtml = await gerarHtmlBolos(doc.id);
                } else {
                    secaoHtml = `<section id="${doc.id}" class="secao-escolha">
                                    <h2>${categoria.nome} ${categoria.precoFixo ? `- R$ ${categoria.precoFixo.toFixed(2).replace('.',',')}` : ''}</h2>
                                 <ul class="lista-opcoes">`;
                    if (categoria.itens) {
                        categoria.itens.forEach(item => {
                            if (typeof item === 'object' && item.nome && item.preco) {
                                secaoHtml += `<li data-nome="${item.nome}" data-preco="${item.preco}">${item.nome} - <strong>R$ ${item.preco.toFixed(2).replace('.',',')}</strong></li>`;
                            } else {
                                secaoHtml += `<li data-nome="${item}">${item}</li>`;
                            }
                        });
                    }
                    secaoHtml += `</ul></section>`;
                }
                return secaoHtml;
            });

            const htmlSections = await Promise.all(htmlPromises);
            cardapioContainer.innerHTML = htmlSections.join('');

        } catch (error) {
            console.error("Erro ao gerar o cardápio:", error);
            cardapioContainer.innerHTML = '<p style="text-align: center; color: red;">Não foi possível carregar o cardápio. Verifique sua conexão ou tente novamente mais tarde.</p>';
        }
    }

    async function gerarHtmlBolos(idCategoria) {
        const tamanhosSnap = await db.collection('categorias').doc(idCategoria).collection('tamanhos').get();
        const massasSnap = await db.collection('categorias').doc(idCategoria).collection('massas').get();
        const recheiosSnap = await db.collection('categorias').doc(idCategoria).collection('recheios').get();
        const adicionaisSnap = await db.collection('categorias').doc(idCategoria).collection('adicionais').get();

        let html = `<section id="${idCategoria}" class="secao-escolha"><h2>Bolos</h2><div class="bolo-configurator"><h3>1. Escolha o Tamanho:</h3><div class="choice-group">`;
        tamanhosSnap.forEach(doc => { const t = doc.data(); html += `<label><input type="radio" name="tamanho-bolo" value="${t.preco}" data-nome="${t.nome}">${t.descricao} - <strong>R$ ${t.preco.toFixed(2).replace('.',',')}</strong></label>`; });
        html += `</div><h3>2. Escolha a Massa (1 opção):</h3><div class="choice-group">`;
        massasSnap.forEach(doc => { const m = doc.data(); html += `<label><input type="radio" name="massa-bolo" data-nome="${m.nome}"> ${m.nome}</label>`; });
        html += `</div><h3>3. Escolha os Recheios (até 2 sabores):</h3><div class="choice-group recheios-group">`;
        recheiosSnap.forEach(doc => { const r = doc.data(); html += `<label><input type="checkbox" name="recheio-bolo" data-nome="${r.nome}"> ${r.nome}</label>`; });
        html += `</div><h3>4. Adicionais (opcional):</h3><div class="choice-group">`;
        adicionaisSnap.forEach(doc => { const a = doc.data(); html += `<label><input type="checkbox" name="adicional-bolo" value="${a.preco}" data-nome="${a.nome}">${a.nome} - <strong>R$ ${a.preco.toFixed(2).replace('.',',')}</strong></label>`; });
        html += `</div><button id="btn-adicionar-bolo" class="btn-adicionar">Adicionar Bolo ao Pedido</button></div></section>`;
        return html;
    }

    function inicializarLogicas() {
        initBoloConfigurator();
        initItensSimples();
        initFinalizarPedido();
        initRemoverItem();
        injectResumoStyles();
    }

    function initBoloConfigurator() {
        const btnAdicionarBolo = document.getElementById('btn-adicionar-bolo');
        if (!btnAdicionarBolo) return;
        const checkboxesRecheio = document.querySelectorAll('.recheios-group input[type="checkbox"]');
        const maxRecheios = 2;

        checkboxesRecheio.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selecionados = document.querySelectorAll('.recheios-group input[type="checkbox"]:checked');
                if (selecionados.length >= maxRecheios) {
                    checkboxesRecheio.forEach(cb => { if (!cb.checked) { cb.disabled = true; } });
                } else {
                    checkboxesRecheio.forEach(cb => { cb.disabled = false; });
                }
            });
        });

        btnAdicionarBolo.addEventListener('click', () => {
            const tamanhoSelecionado = document.querySelector('input[name="tamanho-bolo"]:checked');
            const massaSelecionada = document.querySelector('input[name="massa-bolo"]:checked');
            const recheiosSelecionados = document.querySelectorAll('input[name="recheio-bolo"]:checked');
            const adicionaisSelecionados = document.querySelectorAll('input[name="adicional-bolo"]:checked');
            if (!tamanhoSelecionado) { Swal.fire({ icon: 'warning', title: 'Opa!', text: 'Por favor, escolha o tamanho do bolo.', confirmButtonColor: 'var(--roxo-principal)' }); return; }
            if (!massaSelecionada) { Swal.fire({ icon: 'warning', title: 'Quase lá...', text: 'Por favor, escolha a massa do bolo.', confirmButtonColor: 'var(--roxo-principal)' }); return; }
            if (recheiosSelecionados.length === 0) { Swal.fire({ icon: 'warning', title: 'Faltou o recheio!', text: 'Escolha pelo menos um recheio.', confirmButtonColor: 'var(--roxo-principal)' }); return; }
            let precoBolo = parseFloat(tamanhoSelecionado.value);
            adicionaisSelecionados.forEach(adicional => { precoBolo += parseFloat(adicional.value); });
            const nomeRecheios = Array.from(recheiosSelecionados).map(r => r.dataset.nome).join(', ');
            const nomeAdicionais = Array.from(adicionaisSelecionados).map(a => a.dataset.nome).join(', ');
            let descricaoBolo = `<strong>${tamanhoSelecionado.dataset.nome}</strong><br><small>Massa: ${massaSelecionada.dataset.nome}<br>Recheios: ${nomeRecheios}${nomeAdicionais ? `<br>Adicionais: ${nomeAdicionais}` : ''}</small>`;
            pedidoTotal.push({ descricao: descricaoBolo, preco: precoBolo });
            atualizarResumoGeral();
            resetarConfigurador();
            notificarSucesso("Bolo personalizado adicionado!");
        });
    }

    function initItensSimples() {
        const itens = document.querySelectorAll('.lista-opcoes li');
        itens.forEach(item => {
            item.addEventListener('click', () => {
                const nome = item.dataset.nome;
                if (!nome) return;
                let preco = 0;
                if (item.dataset.preco) {
                    preco = parseFloat(item.dataset.preco);
                } else {
                    const h2 = item.closest('section').querySelector('h2');
                    const precoMatch = h2.textContent.match(/R\$\s*([\d,]+)/);
                    if (precoMatch && precoMatch[1]) {
                        preco = parseFloat(precoMatch[1].replace(',', '.'));
                    }
                }
                pedidoTotal.push({ descricao: nome, preco: preco });
                atualizarResumoGeral();
                notificarSucesso(`${nome} adicionado!`);
            });
        });
    }

    function initRemoverItem() {
        const resumoContainer = document.getElementById('resumo-pedido');
        resumoContainer.addEventListener('click', (event) => {
            const botaoRemover = event.target.closest('.btn-remover-item');
            if (botaoRemover) {
                const indexParaRemover = parseInt(botaoRemover.dataset.index);
                pedidoTotal.splice(indexParaRemover, 1);
                atualizarResumoGeral();
            }
        });
    }

    function initFinalizarPedido() {
        const btnWhatsapp = document.getElementById('btn-whatsapp');
        const numeroTelefone = "5579999798705";
        btnWhatsapp.addEventListener('click', () => {
            if (pedidoTotal.length === 0) {
                Swal.fire({ icon: 'error', title: 'Carrinho Vazio', text: 'Você precisa adicionar pelo menos um item ao pedido.', confirmButtonColor: 'var(--roxo-principal)' });
                return;
            }
            let mensagem = "Olá, Cintia! Gostaria de fazer o seguinte pedido:\n\n";
            let precoFinal = 0;
            pedidoTotal.forEach(item => {
                const descLimpa = item.descricao.replace(/<[^>]*>/g, " ").replace(/\s+/g, ' ').trim();
                mensagem += `*Item:* ${descLimpa}\n*Preço:* R$ ${item.preco.toFixed(2).replace('.',',')}\n\n`;
                precoFinal += item.preco;
            });
            mensagem += `*TOTAL DO PEDIDO: R$ ${precoFinal.toFixed(2).replace('.',',')}*`;
            const linkWhatsapp = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${encodeURIComponent(mensagem)}`;
            window.open(linkWhatsapp, '_blank');
        });
    }

    function atualizarResumoGeral() {
        const resumoContainer = document.getElementById('resumo-pedido');
        const precoTotalEl = document.getElementById('preco-total');
        resumoContainer.querySelectorAll('.item-pedido').forEach(item => item.remove());
        let precoFinal = 0;
        pedidoTotal.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-pedido');
            itemDiv.innerHTML = `<div class="item-desc">${item.descricao}</div><div class="item-preco">R$ ${item.preco.toFixed(2).replace('.',',')}</div><button class="btn-remover-item" data-index="${index}" title="Remover item"><i class="fa-solid fa-trash-can"></i></button>`;
            resumoContainer.insertBefore(itemDiv, resumoContainer.querySelector('.total-linha'));
            precoFinal += item.preco;
        });
        precoTotalEl.textContent = `R$ ${precoFinal.toFixed(2).replace('.',',')}`;
    }
    
    function resetarConfigurador() {
        const configurator = document.querySelector('.bolo-configurator');
        if (configurator) {
            configurator.querySelectorAll('input').forEach(input => {
                input.checked = false;
                if (input.name === 'recheio-bolo') input.disabled = false;
            });
        }
    }

    function notificarSucesso(mensagem) {
        Toastify({ text: mensagem, duration: 2500, gravity: "top", position: "right", stopOnFocus: true, style: { background: "linear-gradient(to right, #A086C4, #9175b8)" }, }).showToast();
    }
    
    function injectResumoStyles() {
        const style = document.createElement('style');
        style.innerHTML = `.item-pedido { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9em; } .item-desc { flex: 1; padding-right: 10px; } .item-preco { font-weight: 600; } #resumo-pedido small { color: #555; line-height: 1.5; } .btn-remover-item { background: none; border: none; color: #cc5f5f; cursor: pointer; padding: 0 5px; font-size: 1.1em; transition: color 0.2s; } .btn-remover-item:hover { color: #a02c2c; }`;
        document.head.appendChild(style);
    }

    carregarTudo();
});