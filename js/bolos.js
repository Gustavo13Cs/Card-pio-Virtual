document.addEventListener('DOMContentLoaded', () => {

    const btnAdicionarBolo = document.getElementById('btn-adicionar-bolo');
    const checkboxesRecheio = document.querySelectorAll('.recheios-group input[type="checkbox"]');
    const maxRecheios = 2;
    let pedidoTotal = []; 
    checkboxesRecheio.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selecionados = document.querySelectorAll('.recheios-group input[type="checkbox"]:checked');
            if (selecionados.length >= maxRecheios) {
                checkboxesRecheio.forEach(cb => {
                    if (!cb.checked) {
                        cb.disabled = true;
                    }
                });
            } else {
                checkboxesRecheio.forEach(cb => {
                    cb.disabled = false;
                });
            }
        });
    });

    
    btnAdicionarBolo.addEventListener('click', () => {
        
        const tamanhoSelecionado = document.querySelector('input[name="tamanho-bolo"]:checked');
        const massaSelecionada = document.querySelector('input[name="massa-bolo"]:checked');
        const recheiosSelecionados = document.querySelectorAll('input[name="recheio-bolo"]:checked');
        const adicionaisSelecionados = document.querySelectorAll('input[name="adicional-bolo"]:checked');

        if (!tamanhoSelecionado) {
            Swal.fire({ icon: 'warning', title: 'Opa!', text: 'Por favor, escolha o tamanho do bolo.', confirmButtonColor: 'var(--roxo-principal)' });
            return;
        }
        if (!massaSelecionada) {
            Swal.fire({ icon: 'warning', title: 'Quase lá...', text: 'Por favor, escolha a massa do bolo.', confirmButtonColor: 'var(--roxo-principal)' });
            return;
        }
        if (recheiosSelecionados.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Faltou o recheio!', text: 'Escolha pelo menos um recheio.', confirmButtonColor: 'var(--roxo-principal)' });
            return;
        }

        
        let precoBolo = parseFloat(tamanhoSelecionado.value);
        adicionaisSelecionados.forEach(adicional => {
            precoBolo += parseFloat(adicional.value);
        });

        
        const nomeRecheios = Array.from(recheiosSelecionados).map(r => r.dataset.nome).join(', ');
        const nomeAdicionais = Array.from(adicionaisSelecionados).map(a => a.dataset.nome).join(', ');
        let descricaoBolo = `<strong>${tamanhoSelecionado.dataset.nome}</strong><br><small>Massa: ${massaSelecionada.dataset.nome}<br>Recheios: ${nomeRecheios}${nomeAdicionais ? `<br>Adicionais: ${nomeAdicionais}` : ''}</small>`;

        const itemBolo = { descricao: descricaoBolo, preco: precoBolo };
        pedidoTotal.push(itemBolo);

        atualizarResumoGeral();
        resetarConfigurador();
        
        Toastify({
            text: "Bolo adicionado ao pedido!",
            duration: 2000,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #A086C4, #9175b8)",
            },
            className: "toast-custom"
        }).showToast();
    });

    // --- FUNÇÕES AUXILIARES ---
    function atualizarResumoGeral() {
        const resumoContainer = document.getElementById('resumo-pedido');
        const precoTotalEl = document.getElementById('preco-total');
        resumoContainer.querySelectorAll('.item-pedido').forEach(item => item.remove());
        let precoFinal = 0;

        pedidoTotal.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-pedido');
            itemDiv.innerHTML = `<div class="item-desc">${item.descricao}</div><div class="item-preco">R$ ${item.preco.toFixed(2)}</div>`;
            resumoContainer.insertBefore(itemDiv, resumoContainer.querySelector('.total-linha'));
            precoFinal += item.preco;
        });
        precoTotalEl.textContent = `R$ ${precoFinal.toFixed(2)}`;
    }

    function resetarConfigurador() {
        document.querySelectorAll('.bolo-configurator input').forEach(input => {
            input.checked = false;
            if (input.name === 'recheio-bolo') input.disabled = false;
        });
    }
    
    const style = document.createElement('style');
    style.innerHTML = `.item-pedido { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9em; } .item-desc { flex: 1; padding-right: 10px; } .item-preco { font-weight: 600; } #resumo-pedido small { color: #666; line-height: 1.4; }`;
    document.head.appendChild(style);
});