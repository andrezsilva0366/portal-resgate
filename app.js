document.addEventListener("DOMContentLoaded", () => {
    // --- CONFIGURAÇÃO ---
    // Cole seu ID do Formspree aqui
    const FORMSPREE_ID = "xovkgn7nd"; 
    // --------------------

    const infoPedido = document.getElementById("info-pedido");
    const areaResgate = document.getElementById("area-resgate");
    const areaCodigo = document.getElementById("area-codigo");
    const btnResgatar = document.getElementById("btn-resgatar");
    const chkTermos = document.getElementById("termos");
    const codigoFinal = document.getElementById("codigo-final");
    const logInfo = document.getElementById("log-info");
    const erro = document.getElementById("erro");

    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    if (!pedidoId) {
        mostrarErro("ID do pedido não encontrado na URL.");
        return;
    }

    // O link para o arquivo JSON do pedido
    const pedidoUrl = `pedidos/${pedidoId}.json`;

    // 1. Tenta carregar o arquivo JSON do pedido
    fetch(pedidoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Pedido não encontrado ou inválido.");
            }
            return response.json();
        })
        .then(data => {
            // Sucesso! O arquivo JSON foi encontrado
            infoPedido.innerHTML = `<p>Exibindo pedido: <strong>${pedidoId}</strong></p>`;
            areaResgate.style.display = "block";
        })
        .catch(err => {
            mostrarErro(err.message);
        });

    // 2. Controla o checkbox
    chkTermos.addEventListener('change', () => {
        btnResgatar.disabled = !chkTermos.checked;
    });

    // 3. Ação de Resgatar
    btnResgatar.addEventListener('click', () => {
        btnResgatar.disabled = true;
        btnResgatar.textContent = "Processando...";
        
        // Duas coisas acontecem ao mesmo tempo
        Promise.all([
            // Coisa 1: Buscar o código no arquivo JSON
            fetch(pedidoUrl).then(res => res.json()),
            
            // Coisa 2: Enviar a prova para o Formspree
            enviarLog(pedidoId)
        ])
        .then(([pedidoData, logData]) => {
            // Sucesso!
            areaResgate.style.display = "none";
            areaCodigo.style.display = "block";
            codigoFinal.textContent = pedidoData.codigo; // Mostra o código do JSON
            
            const dataLog = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
            logInfo.textContent = `Código resgatado com sucesso em ${dataLog}.`;
        })
        .catch(err => {
            mostrarErro("Erro ao processar o resgate.");
        });
    });

    // Função que envia a prova para o Formspree
    async function enviarLog(id) {
        const formData = new FormData();
        formData.append("pedido_id", id);
        formData.append("resgatado_em", new Date().toISOString());
        formData.append("user_agent", navigator.userAgent);
        
        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Erro ao enviar log para o Formspree:", error);
            // Mesmo se o log falhar, o cliente ainda precisa ver o código
            // Então não vamos parar o processo aqui, só logar o erro
            return { ok: false };
        }
    }

    function mostrarErro(mensagem) {
        infoPedido.style.display = "none";
        areaResgate.style.display = "none";
        erro.style.display = "block";
        erro.textContent = mensagem;
    }
});
