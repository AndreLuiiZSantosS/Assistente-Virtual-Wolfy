// ==========================================
// 0. ESTILIZACAO DO BALÃO DO WOLFY E DA TELA
// ==========================================
const estiloWolfy = document.createElement('style');
estiloWolfy.innerHTML = `
    .wolfy-wrap {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 650px;          
        min-height: 280px;     
        display: flex;
        align-items: flex-end; 
        gap: 15px;
        z-index: 1000000;
        font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
        pointer-events: none;
    }

    .wolfy-bubble, .wolfy-avatar {
        pointer-events: auto;
    }

    .wolfy-bubble {
        flex: 1;
        background: #ffffff;
        border: 4px solid #222222;
        border-radius: 20px;
        padding: 26px 28px;
        position: relative;
        color: #222222;
        box-shadow: 6px 6px 0px rgba(0,0,0,0.18);
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 10px; 
    }

    .wolfy-bubble::after {
        content: '';
        position: absolute;
        top: 50%;
        right: -24px;
        transform: translateY(-50%);
        border-top: 16px solid transparent;
        border-bottom: 16px solid transparent;
        border-left: 24px solid #222222;
    }
    .wolfy-bubble::before {
        content: '';
        position: absolute;
        top: 50%;
        right: -18px;
        transform: translateY(-50%);
        border-top: 14px solid transparent;
        border-bottom: 14px solid transparent;
        border-left: 20px solid #ffffff;
        z-index: 1;
    }

    .wolfy-avatar {
        width: 210px;
        height: 280px; 
        flex-shrink: 0;
        object-fit: contain;
        object-position: bottom center;
    }

    .wolfy-btn {
        padding: 12px 24px;
        border: 2px solid #222222;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 18px; 
        background: #f0f0f0;
        transition: transform 0.15s;
        font-family: inherit;
        color: #222222;
    }
    .wolfy-btn:hover { transform: scale(1.04); }
    .wolfy-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .wolfy-btn-primary { background: #1a73e8; color: white; border-color: #1a73e8; }
    .wolfy-btn-primary:hover { background: #1557b0; }

    .wolfy-highlighter {
        position: fixed;
        z-index: 999998; 
        pointer-events: none;
        transition: all 0.3s ease;
        background: transparent;
    }
`;
document.head.appendChild(estiloWolfy);

function criarPainelWolfy(conteudoHTML) {
    const painel = document.createElement("div");
    painel.className = "wolfy-wrap";
    painel.innerHTML = `
        <div class="wolfy-bubble">${conteudoHTML}</div>
        <img class="wolfy-avatar" src="${chrome.runtime.getURL('wolfy_cropped.png')}">
    `;
    document.body.appendChild(painel);
    return painel;
}

// ==========================================
// 1. LÓGICA DE DETECÇÃO DE PESQUISA (.COM)
// ==========================================
function interceptarPesquisas() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (!query) return false;

    const pesquisa = query.toLowerCase().trim();

    if (pesquisa === 'google.com' || pesquisa === 'www.google.com') {
        const painel = criarPainelWolfy(`
            <h3 style="margin: 0; font-size: 24px; font-family: Arial, sans-serif;">Aviso Amigável!</h3>
            <p style="margin: 0; font-size: 18px; line-height: 1.4; font-family: Arial, sans-serif;">Opa! Parece que você tentou ir para o site do Google, mas a boa notícia é que você já está nele!</p>
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <button id="btn-entendi" class="wolfy-btn wolfy-btn-primary">Entendi</button>
            </div>
        `);
        document.getElementById('btn-entendi').onclick = () => painel.remove();
        return true;
    }

    if (pesquisa.includes('.com')) {
        const matchDominio = pesquisa.match(/[a-z0-9-]+\.com(\.[a-z]{2})?/i);
        const dominioAlvo = matchDominio ? matchDominio[0] : pesquisa;

        const painel = criarPainelWolfy(`
            <h3 style="margin: 0; font-size: 24px; font-family: Arial, sans-serif;">Dica de Ouro!</h3>
            <p style="margin: 0; font-size: 18px; line-height: 1.4; font-family: Arial, sans-serif;" id="texto-dica">Notei que você pesquisou o endereço de um site (<strong>${dominioAlvo}</strong>). Tem um jeito mais rápido de chegar lá, sem precisar pesquisar. Quer que eu te ensine?</p>
            <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px;" id="botoes-dica">
                <button id="btn-dica-nao" class="wolfy-btn">Não precisa</button>
                <button id="btn-dica-sim" class="wolfy-btn wolfy-btn-primary">Me ensine!</button>
            </div>
        `);

        document.getElementById('btn-dica-nao').onclick = () => painel.remove();
        document.getElementById('btn-dica-sim').onclick = () => {
            chrome.storage.local.set({ "aguardando_sucesso_url": dominioAlvo });
            document.getElementById('texto-dica').innerHTML = `Para ir direto, digite <strong>${dominioAlvo}</strong> na barra de endereços (aquela barra comprida lá no topo do seu navegador) e aperte a tecla Enter!`;
            document.getElementById('botoes-dica').innerHTML = `<button id="btn-dica-ok" class="wolfy-btn wolfy-btn-primary">Vou tentar!</button>`;
            document.getElementById('btn-dica-ok').onclick = () => painel.remove();
        };
        return true;
    }
    return false;
}

// ==============================
// 2. O MOTOR DO TOUR (REUTILIZÁVEL E PACIENTE)
// ==============================
function executarMotorDeTour(roteiro, callbackFim) {
    let passoAtual = 0;
    let elementoDestacadoAnterior = null;

    const highlighter = document.createElement("div");
    highlighter.className = "wolfy-highlighter";
    document.body.appendChild(highlighter);

    const dica = document.createElement("div");
    dica.className = "wolfy-wrap";
    document.body.appendChild(dica);
    document.body.style.overflow = 'hidden';

    function mostrarPasso(indice, tentativas = 0) {
        if (indice >= roteiro.length) {
            if (elementoDestacadoAnterior) {
                elementoDestacadoAnterior.style.position = "";
                elementoDestacadoAnterior.style.zIndex = "";
                elementoDestacadoAnterior.style.pointerEvents = "";
            }
            dica.remove();
            highlighter.remove();
            document.body.style.overflow = '';
            if (callbackFim) callbackFim();
            return;
        }

        const dadosDoPasso = roteiro[indice];
        let elementoAlvo = null;

        // ============================================================
        // 🚀 FILTRO ANTI-FANTASMAS TURBINADO
        // Agora ele checa se tem largura, altura, se não tá transparente
        // e se não tá perdido fora da tela (top negativo)!
        // ============================================================
        const possiveisAlvos = document.querySelectorAll(dadosDoPasso.seletor);
        for (let el of possiveisAlvos) {
            const rect = el.getBoundingClientRect();
            const estilo = window.getComputedStyle(el);
            if (rect.width > 0 && rect.height > 0 && estilo.opacity !== '0' && estilo.visibility !== 'hidden' && rect.top >= 0) {
                elementoAlvo = el;
                break; 
            }
        }

        if (elementoAlvo) {
            if (elementoDestacadoAnterior) {
                elementoDestacadoAnterior.style.position = "";
                elementoDestacadoAnterior.style.zIndex = "";
                elementoDestacadoAnterior.style.pointerEvents = "";
            }

            if (dadosDoPasso.usaContainerPai) {
                elementoAlvo = elementoAlvo.closest('div').parentElement;
            }

            elementoAlvo.style.position = "relative";
            elementoAlvo.style.zIndex = "999999";

            const rect = elementoAlvo.getBoundingClientRect();
            highlighter.style.display = "block";
            
            let respiro = dadosDoPasso.aumentarDestaque ? 8 : 0;
            highlighter.style.top = (rect.top - respiro) + "px";
            highlighter.style.left = (rect.left - respiro) + "px";
            highlighter.style.width = (rect.width + respiro * 2) + "px";
            highlighter.style.height = (rect.height + respiro * 2) + "px";

            if (dadosDoPasso.formato === "circulo") { highlighter.style.borderRadius = "50%"; } 
            else { highlighter.style.borderRadius = "12px"; }

            if (dadosDoPasso.aumentarDestaque) { highlighter.style.boxShadow = "0 0 0 4px white, 0 0 0 9999px rgba(0,0,0,0.85)"; } 
            else { highlighter.style.boxShadow = "0 0 0 9999px rgba(0,0,0,0.85)"; }

            elementoDestacadoAnterior = elementoAlvo;

            if (!dadosDoPasso.passoExtraAoClicar) {
                elementoAlvo.style.pointerEvents = "none";
            } else {
                elementoAlvo.style.pointerEvents = "auto";
                elementoAlvo.addEventListener('click', function capturaClique() {
                    elementoAlvo.removeEventListener('click', capturaClique);
                    
                    if (dadosDoPasso.marcarStorageAoClicar) {
                        chrome.storage.local.set({ [dadosDoPasso.marcarStorageAoClicar]: true });
                    }

                    const btnAtual = document.getElementById("btn-tour-acao");
                    if (btnAtual) btnAtual.disabled = true;

                    const extras = Array.isArray(dadosDoPasso.passoExtraAoClicar) ? dadosDoPasso.passoExtraAoClicar : [dadosDoPasso.passoExtraAoClicar];
                    roteiro.splice(indice + 1, 0, ...extras);
                    
                    passoAtual++;
                    // Pequeno delay pra gaveta abrir no tour normal
                    setTimeout(() => mostrarPasso(passoAtual), 400); 
                });
            }

            const textoBotao = (indice === roteiro.length - 1) ? "Finalizar Explicação" : "Próximo Passo";
            
            let indicadorTopo = "DICA DO WOLFY";
            if (dadosDoPasso.isExtra) {
                indicadorTopo = dadosDoPasso.passoNum ? `PASSO EXTRA (${dadosDoPasso.passoNum})` : "EXPLICAÇÃO EXTRA";
            } else if (dadosDoPasso.passoNum) {
                indicadorTopo = `PASSO ${dadosDoPasso.passoNum} DE 6`;
            }

            dica.innerHTML = `
                <div class="wolfy-bubble">
                    <span style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: #1a73e8; letter-spacing: 1px;">${indicadorTopo}</span>
                    <h3 style="margin: 0; font-size: 24px; font-family: Arial, sans-serif; transition: color 0.3s;">${dadosDoPasso.titulo}</h3>
                    <p style="margin: 0; font-size: 18px; line-height: 1.4; font-family: Arial, sans-serif;">${dadosDoPasso.texto}</p>
                    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                        <button id="btn-tour-acao" class="wolfy-btn wolfy-btn-primary">${textoBotao}</button>
                    </div>
                </div>
                <img class="wolfy-avatar" src="${chrome.runtime.getURL('wolfy_cropped.png')}">
            `;

            document.getElementById("btn-tour-acao").onclick = () => {
                passoAtual++;
                setTimeout(() => mostrarPasso(passoAtual), 100);
            };
        } else {
            if (tentativas < 20) { 
                // Ele tenta achar a gaveta 20 vezes a cada 100ms
                setTimeout(() => mostrarPasso(indice, tentativas + 1), 100);
            } else {
                if (elementoDestacadoAnterior) {
                    elementoDestacadoAnterior.style.position = "";
                    elementoDestacadoAnterior.style.zIndex = "";
                    elementoDestacadoAnterior.style.pointerEvents = "";
                }
                highlighter.style.display = "none";
                passoAtual++;
                mostrarPasso(passoAtual);
            }
        }
    }
    mostrarPasso(passoAtual);
}

// ==============================
// 3. ROTEIROS E MONITORES PÓS-TOUR
// ==============================
function iniciarTourCompleto() {
    const roteiroPrincipal = [
        {
            passoNum: 1, seletor: 'textarea[name="q"], input[name="q"]', usaContainerPai: true, aumentarDestaque: false, formato: "arredondado",
            titulo: "1. A Barra de Pesquisa",
            texto: "Leve a setinha do seu mouse até este retângulo central. Se você clicar com o botão esquerdo, ele fica pronto para digitar. Mas por agora, apenas clique em 'Próximo Passo'."
        },
        {
            passoNum: 2, seletor: '[aria-label*="voz" i]', usaContainerPai: false, aumentarDestaque: true, formato: "circulo",
            titulo: "2. Pesquisa por Voz",
            texto: "Não quer digitar? Leve a setinha até este microfone colorido. Se você fosse pesquisar agora, bastaria clicar e falar."
        },
        {
            passoNum: 3, seletor: 'input[name="btnI"]', usaContainerPai: false, aumentarDestaque: true, formato: "arredondado",
            titulo: "3. Botão de Sorte?",
            texto: "Não é sorteio! Este botão leva direto ao primeiro site da lista de respostas, pulando as outras opções."
        },
        {
            passoNum: 4, seletor: 'a[href*="mail.google.com"]', usaContainerPai: false, aumentarDestaque: true, formato: "arredondado",
            titulo: "4. Atalho do E-mail",
            texto: "Sempre que precisar ler ou enviar e-mails, você clica aqui. (Não clique agora para não sairmos desta página!)"
        },
        {
            passoNum: 5, seletor: 'a[aria-label*="aplicativos" i], a[aria-label*="Google apps" i]', usaContainerPai: false, aumentarDestaque: true, formato: "circulo",
            titulo: "5. A Gaveta Secreta",
            texto: "Este quadrado de pontinhos guarda as ferramentas do Google. Tente clicar nele com o botão esquerdo para abrir, ou clique em 'Próximo Passo' se quiser pular.",
            marcarStorageAoClicar: "tour_google_gaveta_concluido",
            passoExtraAoClicar: {
                passoNum: "5.1", isExtra: true, 
                seletor: 'iframe[name="app"], iframe[src*="app"], div[aria-label*="Google apps" i], div[aria-label*="Aplicativos" i], #gvv', 
                usaContainerPai: false, aumentarDestaque: true, formato: "arredondado",
                titulo: "5.1. Janela de Aplicativos",
                texto: "Muito bem! 🌟 A TV vermelha é o YouTube para ver vídeos, e o mapa colorido serve para viajar. Clique em 'Próximo Passo' para continuarmos o tour."
            }
        },
        {
            passoNum: 6, seletor: 'a[aria-label*="Conta" i], a[aria-label*="Account" i], img[alt*="perfil" i]', usaContainerPai: false, aumentarDestaque: true, formato: "circulo",
            titulo: "6. A Sua Identidade",
            texto: "Aquela foto ali no topo representa você conectado. Tente clicar nela com o botão esquerdo, ou clique em 'Finalizar' se quiser terminar o tour agora.",
            marcarStorageAoClicar: "tour_google_perfil_concluido",
            passoExtraAoClicar: {
                passoNum: "6.1", isExtra: true, 
                seletor: 'iframe[name="account"], div[aria-label*="Conta do Google" i]', 
                usaContainerPai: false, aumentarDestaque: true, formato: "arredondado",
                titulo: "6.1. Seu Painel de Controle",
                texto: "Olha só! Clicando ali você vê o seu e-mail e as opções de privacidade. Para sair do computador com segurança, basta usar esse painel. Terminamos por aqui!"
            }
        }
    ];

    executarMotorDeTour(roteiroPrincipal, () => {
        chrome.storage.local.set({ "tour_google_concluido": true });
        verificarEAtivarMonitoresIsolados(); 
    });
}

function monitorarElementoAposTour(seletoresElemento, storageKey, roteiroIsolado) {
    const possiveisAlvos = document.querySelectorAll(seletoresElemento);
    const manipuladorClique = (e) => {
        chrome.storage.local.get([storageKey], (res) => {
            if (!res[storageKey]) {
                possiveisAlvos.forEach(el => el.removeEventListener('click', manipuladorClique));
                chrome.storage.local.set({ [storageKey]: true });
                
                // O SEGREDO ESTÁ AQUI: Aguardamos a gaveta animar/abrir na tela 
                // ANTES de chamar o motor isolado!
                setTimeout(() => {
                    executarMotorDeTour(roteiroIsolado); 
                }, 600); 
            }
        });
    };
    possiveisAlvos.forEach(el => el.addEventListener('click', manipuladorClique));
}

function verificarEAtivarMonitoresIsolados() {
    chrome.storage.local.get(["tour_google_gaveta_concluido", "tour_google_perfil_concluido"], (resultado) => {
        if (!resultado.tour_google_gaveta_concluido) {
            monitorarElementoAposTour(
                'a[aria-label*="aplicativos" i], a[aria-label*="Google apps" i]', 
                "tour_google_gaveta_concluido",
                [
                    {
                        isExtra: true, 
                        seletor: 'iframe[name="app"], iframe[src*="app"], div[aria-label*="Google apps" i], div[aria-label*="Aplicativos" i], #gvv', 
                        usaContainerPai: false, aumentarDestaque: true, formato: "arredondado",
                        titulo: "A Janela de Aplicativos",
                        texto: "Ah, você abriu a gaveta! 🌟 Aqui ficam as ferramentas gratuitas do Google. A TV vermelha é o YouTube para ver vídeos, e o mapa colorido serve para viajar. Bem legal, né?"
                    }
                ]
            );
        }
        if (!resultado.tour_google_perfil_concluido) {
            monitorarElementoAposTour(
                'a[aria-label*="Conta" i], a[aria-label*="Account" i], img[alt*="perfil" i]', 
                "tour_google_perfil_concluido",
                [
                    {
                        isExtra: true, 
                        seletor: 'iframe[name="account"], div[aria-label*="Conta do Google" i]', 
                        usaContainerPai: false, aumentarDestaque: true, formato: "arredondado",
                        titulo: "Seu Painel de Controle",
                        texto: "Excelente curiosidade! Clicando na sua foto você abre este painel. É aqui que você vê o seu e-mail e as opções de privacidade para sair com segurança."
                    }
                ]
            );
        }
    });
}

// ==========================================
// 4. O CÉREBRO: DECIDIR O QUE FAZER AO CARREGAR A PÁGINA
// ==========================================
window.addEventListener('load', () => {
    const host = window.location.hostname;
    chrome.storage.local.get(["aguardando_sucesso_url"], (res) => {
        if (res.aguardando_sucesso_url) {
            const alvo = res.aguardando_sucesso_url.replace('www.', '');
            if (host.includes(alvo)) {
                const painel = criarPainelWolfy(`
                    <h3 style="margin: 0; font-size: 24px; font-family: Arial, sans-serif; color: #4CAF50;">Perfeito! 🎉</h3>
                    <p style="margin: 0; font-size: 18px; line-height: 1.4; font-family: Arial, sans-serif;">Você usou a barra de endereços corretamente. Viu como chegou ao destino muito mais rápido?</p>
                `);
                chrome.storage.local.remove("aguardando_sucesso_url");
                setTimeout(() => {
                    painel.style.transition = "opacity 0.5s ease";
                    painel.style.opacity = "0";
                    setTimeout(() => painel.remove(), 500);
                }, 5000);
                return;
            }
        }
        if (host.includes('google.com')) {
            const ehPesquisa = interceptarPesquisas();
            if (!ehPesquisa) {
                chrome.storage.local.get(["tour_google_concluido"], (resultado) => {
                    if (!resultado.tour_google_concluido) {
                        const painel = criarPainelWolfy(`
                            <h3 style="margin: 0; font-size: 24px; font-family: Arial, sans-serif;">Olá!</h3>
                            <p style="margin: 0; font-size: 18px; line-height: 1.4; font-family: Arial, sans-serif;">Notei que esta é a sua primeira vez aqui. Você quer que eu te ensine como usar o computador de forma mais prática?</p>
                            <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px;">
                                <button id="btn-nao" class="wolfy-btn">Já sei usar</button>
                                <button id="btn-sim" class="wolfy-btn wolfy-btn-primary">Sim, me ensine!</button>
                            </div>
                        `);
                        document.getElementById('btn-sim').onclick = () => { painel.remove(); iniciarTourCompleto(); };
                        document.getElementById('btn-nao').onclick = () => {
                            chrome.storage.local.set({ "tour_google_concluido": true });
                            painel.remove();
                            verificarEAtivarMonitoresIsolados();
                        };
                    } else {
                        verificarEAtivarMonitoresIsolados();
                    }
                });
            }
        }
    });
});