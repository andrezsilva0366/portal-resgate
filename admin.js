document.addEventListener("DOMContentLoaded", () => {

    // ####################################################################
    // #######################   CONFIGURAÇÃO AQUI   ######################
    // ####################################################################
    
    const firebaseConfig = {
      apiKey: "AIzaSyCwzDPSudClByCmv-vJHqS4czRnNnBNjRA",
      authDomain: "portal-resgate.firebaseapp.com",
      projectId: "portal-resgate",
      storageBucket: "portal-resgate.firebasestorage.app",
      messagingSenderId: "473246719179",
      appId: "1:473246719179:web:ee82f0a1dd602cf8180f4e",
      measurementId: "G-JST812NF67"
    };
    
    // ####################################################################
    // #####################   FIM DA CONFIGURAÇÃO   ######################
    // ####################################################################


    // --- LÓGICA DO PAINEL ADMIN ---

    // Inicializa Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // Elementos da Página
    const areaLogin = document.getElementById("area-login");
    const areaAdmin = document.getElementById("area-admin");
    const btnLogin = document.getElementById("btn-login");
    
    const userEmail = document.getElementById("user-email");
    const codigoInput = document.getElementById("codigo-input");
    const btnGerar = document.getElementById("btn-gerar");
    
    const areaResultado = document.getElementById("area-resultado");
    const linkGeradoInput = document.getElementById("link-gerado");
    const btnCopiarLink = document.getElementById("btn-copiar-link");

    // --- Gerenciamento de Login ---

    // 1. Botão de Login
    btnLogin.onclick = () => {
        auth.signInWithPopup(provider).catch((error) => {
            console.error("Erro no login:", error);
            alert("Erro ao fazer login: " + error.message);
        });
    };

    // 2. Observador de Login (Muda a tela)
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Usuário está logado
            areaLogin.style.display = "none";
            areaAdmin.style.display = "block";
            userEmail.textContent = user.email;
        } else {
            // Usuário não está logado
            areaLogin.style.display = "block";
            areaAdmin.style.display = "none";
        }
    });

    // --- Geração de Link ---
    btnGerar.onclick = () => {
        const codigo = codigoInput.value;
        if (!codigo) {
            alert("Por favor, insira um código.");
            return;
        }

        btnGerar.disabled = true;
        btnGerar.textContent = "Gerando...";

        // 1. Cria o documento no Firebase (SÓ FUNCIONA SE ESTIVER LOGADO COMO ADMIN)
        db.collection("pedidos").add({
            codigo: codigo,
            resgatado: false,
            log_info: "Pendente"
        })
        .then((docRef) => {
            // Sucesso! 'docRef.id' é o ID automático
            const novoId = docRef.id;
            
            // 2. Monta o link final
            // Pega a URL base (ex: https://usuario.github.io/repositorio/)
            const baseUrl = window.location.href.replace("admin.html", "");
            const linkFinal = `${baseUrl}resgatar.html?id=${novoId}`;
            
            // 3. Mostra o resultado
            linkGeradoInput.value = linkFinal;
            areaResultado.style.display = "block";
            
            btnGerar.disabled = false;
            btnGerar.textContent = "Gerar Link";
            codigoInput.value = ""; // Limpa o campo
        })
        .catch((error) => {
            // Isso vai falhar se as regras de segurança estiverem erradas
            console.error("Erro ao adicionar documento: ", error);
            alert("ERRO! Você não tem permissão para criar códigos. Verifique seu UID nas Regras do Firestore.");
            btnGerar.disabled = false;
            btnGerar.textContent = "Gerar Link";
        });
    };
    
    // --- Botão de Copiar o Link ---
    btnCopiarLink.onclick = () => {
        linkGeradoInput.select();
        document.execCommand("copy"); // (Simples e funciona)
        
        btnCopiarLink.textContent = "Link Copiado!";
        btnCopiarLink.disabled = true;
        setTimeout(() => {
            btnCopiarLink.textContent = "Copiar Link";
            btnCopiarLink.disabled = false;
        }, 2000);
    };
});
