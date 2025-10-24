document.addEventListener("DOMContentLoaded", () => {
    // --- CONFIGURAÇÃO ---
    // Coloque o SEU e-mail aqui. Os logs serão enviados para ele.
    const EMAIL_DO_FORMULARIO = "andrez.silva.0366@gmail.com"; 
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
        
        Promise.all([
            // Coisa 1: Buscar o código no arquivo JSON
            fetch(pedidoUrl).then(res => res.json()),
            
            // Coisa 2: Enviar a prova para o FormSubmit
            enviarLog(pedidoId) // A função vai ler o email da constante
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

    // Função que envia a prova para o FormSubmit.co
    async function enviarLog(id) {
        const formData = new FormData();
        formData.append("pedido_id", id);
        formData.append("resgatado_em", new Date().toISOString());
        formData.append("user_agent", navigator.userAgent);
        
        // Campos especiais do FormSubmit
        formData.append("_subject", `[LOG DE RESGATE] Pedido: ${id}`);
        formData.append("_template", "table"); // Para formatar bonito no email
        formData.append("_captcha", "false"); // Desativa o captcha deles

        try {
            const response = await fetch(`https://formsubmit.co/${EMAIL_DO_FORMULARIO}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Erro ao enviar log para o FormSubmit:", error);
            // Mesmo se o log falhar, o cliente ainda precisa ver o código
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
