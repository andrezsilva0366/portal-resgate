document.addEventListener("DOMContentLoaded", () => {

    // ####################################################################
    // #######################   CONFIGURAÇÃO AQUI   ######################
    // ####################################################################
    //
    // SUA CONFIGURAÇÃO DO FIREBASE (JÁ INSERIDA):
    //
    
    const firebaseConfig = {
      apiKey: "AIzaSyCwzDPSudClByCmv-vJHqS4czRnNnBNjRA",
      authDomain: "portal-resgate.firebaseapp.com",
      projectId: "portal-resgate",
      storageBucket: "portal-resgate.firebasestorage.app",
      messagingSenderId: "473246719179",
      appId: "1:473246719179:web:ee82f0a1dd602cf8180f4e",
      measurementId: "G-JST812NF67"
    };
    
    //
    // ####################################################################
    // #####################   FIM DA CONFIGURAÇÃO   ######################
    // ####################################################################


    // --- LÓGICA DO APLICATIVO (NÃO PRECISA MUDAR DAQUI PARA BAIXO) ---

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Elementos da página
    const infoPedido = document.getElementById("info-pedido");
    const areaResgate = document.getElementById("area-resgate");
    const areaCodigo = document.getElementById("area-codigo");
    const btnResgatar = document.getElementById("btn-resgatar");
    const chkTermos = document.getElementById("termos");
    const codigoFinal = document.getElementById("codigo-final");
    const logInfo = document.getElementById("log-info");
    const erro = document.getElementById("erro");

    // Pega o ID do pedido da URL (ex: ...html?id=DOCUMENTO_ID)
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    if (!pedidoId) {
        mostrarErro("ID do pedido não encontrado na URL.");
        return;
    }

    // Pega a referência do pedido no banco de dados
    const pedidoRef = db.collection("pedidos").doc(pedidoId);

    // 1. Tenta carregar os dados do pedido do Firebase
    pedidoRef.get()
        .then((doc) => {
            if (doc.exists) {
                // O pedido existe!
                const data = doc.data();
                if (data.resgatado) {
                    // Pedido já foi resgatado
                    mostrarCodigoResgatado(data.codigo, data.log_info);
                } else {
                    // Pedido pendente, mostra o botão
                    infoPedido.innerHTML = `<p>Exibindo pedido: <strong>${pedidoId}</strong></p>`;
                    areaResgate.style.display = "block";
                }
            } else {
                // Pedido não encontrado
                throw new Error("Pedido não encontrado ou inválido. Verifique o ID.");
            }
        })
        .catch((err) => {
            mostrarErro(err.message);
            console.error(err);
        });

    // 2. Controla o checkbox
    chkTermos.addEventListener('change', () => {
        btnResgatar.disabled = !chkTermos.checked;
    });

    // 3. Ação de Resgatar
    btnResgatar.addEventListener('click', () => {
        btnResgatar.disabled = true;
        btnResgatar.textContent = "Processando...";

        // Pega o código novamente para garantir
        pedidoRef.get().then((doc) => {
            if (!doc.exists) throw new Error("Erro de verificação do pedido.");
            
            const codigo = doc.data().codigo;
            const dataLog = new Date();
            
            // Esta é a PROVA que será salva
            const logInfoTexto = `Resgatado em ${dataLog.toLocaleString("pt-BR")} | User-Agent: ${navigator.userAgent}`;

            // Atualiza o pedido no Firebase com as provas do resgate
            // Isso só funciona se as suas Regras de Segurança estiverem corretas
            return pedidoRef.update({
                resgatado: true,
                data_resgate: dataLog,
                log_info: logInfoTexto
            }).then(() => {
                // Sucesso! Mostra o código e o log
                mostrarCodigoResgatado(codigo, logInfoTexto);
            });
        })
        .catch((err) => {
            mostrarErro("ERRO AO SALVAR PROVA: O resgate falhou. Verifique as 'Regras' de segurança do seu Firebase (Firestore).");
            console.error(err);
            btnResgatar.disabled = false;
            btnResgatar.textContent = "Tentar Novamente";
        });
    });
    
    // Função para mostrar o código (quando já resgatado ou sucesso)
    function mostrarCodigoResgatado(codigo, logTexto) {
        areaResgate.style.display = "none";
        infoPedido.style.display = "none";
        areaCodigo.style.display = "block";
        codigoFinal.textContent = codigo;
        logInfo.textContent = logTexto;
    }

    // Função para mostrar qualquer erro
    function mostrarErro(mensagem) {
        infoPedido.style.display = "none";
        areaResgate.style.display = "none";
        erro.style.display = "block";
        erro.textContent = mensagem;
    }
});
