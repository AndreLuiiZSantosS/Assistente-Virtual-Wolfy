// ==========================================
// 0. ESTILIZACAO DO BALÃO DO WOLFY
// ==========================================
const estiloWolfy = document.createElement('style');
estiloWolfy.innerHTML = `
    .wolfy-wrap {
        position: fixed; bottom: 30px; right: 30px; width: 25vw; min-width: 380px; max-width: 450px;
        display: flex; align-items: center; justify-content: flex-end; gap: 15px; z-index: 9999999;
        font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
    }
    .wolfy-bubble {
        background: #ffffff; border: 3px solid #222222; border-radius: 20px; padding: 20px;
        position: relative; color: #222222; box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        display: flex; flex-direction: column; gap: 10px; width: 100%;
    }
    .wolfy-bubble::after { content: ''; position: absolute; top: 50%; right: -18px; transform: translateY(-50%); border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 18px solid #222222; }
    .wolfy-bubble::before { content: ''; position: absolute; top: 50%; right: -13px; transform: translateY(-50%); border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 15px solid #ffffff; z-index: 1; }
    
    .wolfy-avatar { width: 130px; height: 130px; object-fit: contain; flex-shrink: 0; filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.1)); }
    
    .wolfy-btn {
        padding: 8px 16px; border: 2px solid #222222; border-radius: 8px; cursor: pointer;
        font-weight: bold; font-size: 14px; background: #f0f0f0; transition: transform 0.2s;
        font-family: inherit; color: #222222; /* CORREÇÃO: Letra preta no botão padrão (Não) */
    }
    .wolfy-btn:hover { transform: scale(1.05); }
    
    .wolfy-btn-primary { background: #1a73e8; color: white; border-color: #1a73e8; }
    .wolfy-btn-primary:hover { background: #1557b0; }
`;
document.head.appendChild(estiloWolfy);

// Função auxiliar para injetar o Wolfy na tela rapidamente
function criarPainelWolfy(conteudoHTML) {
    const painel = document.createElement("div");
    painel.className = "wolfy-wrap";
    painel.innerHTML = `
        <div class="wolfy-bubble">${conteudoHTML}</div>
        <img class="wolfy-avatar" src="${chrome.runtime.getURL('wolfy.png')}">
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
    
    if (!query) return false; // Não é uma pesquisa

    const pesquisa = query.toLowerCase().trim();

    // Cenário A: Digitou google.com no Google
    if (pesquisa === 'google.com' || pesquisa === 'www.google.com') {
        const painel = criarPainelWolfy(`
            <h3 style="margin: 0; font-size: 18px; font-family: Arial, sans-serif;">Aviso Amigável!</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.4; font-family: Arial, sans-serif;">Opa! Parece que você tentou ir para o site do Google, mas a boa notícia é que você já está nele!</p>
            <div style="display: flex; justify-content: flex-end; margin-top: 5px;">
                <button id="btn-entendi" class="wolfy-btn wolfy-btn-primary">Entendi</button>
            </div>
        `);
        document.getElementById('btn-entendi').onclick = () => painel.remove();
        return true; 
    }

    // Cenário B: Digitou qualquer outro site .com no Google
    if (pesquisa.includes('.com')) {
        // Extrai o domínio (ex: facebook.com)
        const matchDominio = pesquisa.match(/[a-z0-9-]+\.com(\.[a-z]{2})?/i);
        const dominioAlvo = matchDominio ? matchDominio[0] : pesquisa;

        const painel = criarPainelWolfy(`
            <h3 style="margin: 0; font-size: 18px; font-family: Arial, sans-serif;">Dica de Ouro!</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.4; font-family: Arial, sans-serif;" id="texto-dica">Notei que você pesquisou o endereço de um site (<strong>${dominioAlvo}</strong>). Tem um jeito mais rápido de chegar lá, sem precisar pesquisar. Quer que eu te ensine?</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px;" id="botoes-dica">
                <button id="btn-dica-nao" class="wolfy-btn">Não precisa</button>
                <button id="btn-dica-sim" class="wolfy-btn wolfy-btn-primary">Me ensine!</button>
            </div>
        `);

        document.getElementById('btn-dica-nao').onclick = () => painel.remove();
        
        document.getElementById('btn-dica-sim').onclick = () => {
            // O usuário aceitou a dica. Salva o domínio alvo no banco
            chrome.storage.local.set({ "aguardando_sucesso_url": dominioAlvo });
            
            // Muda a tela para a instrução
            document.getElementById('texto-dica').innerHTML = `Para ir direto, digite <strong>${dominioAlvo}</strong> na barra de endereços (aquela barra comprida lá no topo do seu navegador) e aperte a tecla Enter!`;
            document.getElementById('botoes-dica').innerHTML = `<button id="btn-dica-ok" class="wolfy-btn wolfy-btn-primary">Vou tentar!</button>`;
            
            document.getElementById('btn-dica-ok').onclick = () => painel.remove();
        };
        return true;
    }
    return false;
}

// ==============================
// 2. FUNÇÃO DO TOUR MULTI-PASSOS
// ==============================
// 
function iniciarTour() {
    const roteiro = [
        {
            seletor: 'textarea[name="q"], input[name="q"]', usaContainerPai: true,
            titulo: "A Barra de Pesquisa",
            texto: "Aqui é onde a mágica acontece. Digite o que você quer encontrar na internet e aperte a tecla Enter do seu teclado."
        },
        {
            seletor: '[aria-label*="voz" i]', usaContainerPai: false,
            titulo: "Pesquisa por Voz",
            texto: "Não quer digitar? Clique neste microfone e simplesmente fale o que você deseja buscar de forma simples."
        },
        {
            seletor: 'a[href*="mail.google.com"]', usaContainerPai: false,
            titulo: "Atalho do E-mail",
            texto: "Sempre que precisar ler ou enviar e-mails, você pode clicar direto neste atalho rápido para ir ao Gmail."
        }
    ];

    let passoAtual = 0;
    let elementoDestacadoAnterior = null;

    const dica = document.createElement("div");
    dica.className = "wolfy-wrap";
    document.body.appendChild(dica);
    document.body.style.overflow = 'hidden';

    function mostrarPasso(indice) {
        if (elementoDestacadoAnterior) {
            elementoDestacadoAnterior.style.boxShadow = "";
            elementoDestacadoAnterior.style.zIndex = "";
            elementoDestacadoAnterior.style.backgroundColor = "";
            elementoDestacadoAnterior.style.position = "";
        }

        if (indice >= roteiro.length) {
            dica.remove();
            document.body.style.overflow = '';
            chrome.storage.local.set({ "tour_google_concluido": true });
            return;
        }

        const dadosDoPasso = roteiro[indice];
        let elementoAlvo = document.querySelector(dadosDoPasso.seletor);

        if (elementoAlvo) {
            if (dadosDoPasso.usaContainerPai) {
                elementoAlvo = elementoAlvo.closest('div').parentElement;
                elementoAlvo.style.borderRadius = "24px";
            } else { elementoAlvo.style.borderRadius = "50%"; }

            elementoAlvo.style.position = "relative";
            elementoAlvo.style.zIndex = "999999"; 
            elementoAlvo.style.backgroundColor = "white"; 
            elementoAlvo.style.boxShadow = "0 0 0 9999px rgba(0,0,0,0.85)";
            elementoDestacadoAnterior = elementoAlvo;

            const textoBotao = (indice === roteiro.length - 1) ? "Finalizar Explicação" : "Próximo Passo";
            
            dica.innerHTML = `
                <div class="wolfy-bubble">
                    <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #1a73e8; letter-spacing: 1px;">Passo ${indice + 1} de ${roteiro.length}</span>
                    <h3 style="margin: 0; font-size: 18px; font-family: Arial, sans-serif;">${dadosDoPasso.titulo}</h3>
                    <p style="margin: 0; font-size: 14px; line-height: 1.4; font-family: Arial, sans-serif;">${dadosDoPasso.texto}</p>
                    <div style="display: flex; justify-content: flex-end; margin-top: 5px;">
                        <button id="btn-tour-acao" class="wolfy-btn wolfy-btn-primary">${textoBotao}</button>
                    </div>
                </div>
                <img class="wolfy-avatar" src="${chrome.runtime.getURL('86759.png')}">
            `;

            document.getElementById("btn-tour-acao").onclick = () => {
                passoAtual++;
                mostrarPasso(passoAtual);
            };
        } else {
            passoAtual++;
            mostrarPasso(passoAtual);
        }
    }
    mostrarPasso(passoAtual);
}

// ==========================================
// 3. O CÉREBRO: DECIDIR O QUE FAZER AO CARREGAR
// ==========================================
window.addEventListener('load', () => {
    const host = window.location.hostname;
    
    // VERIFICAÇÃO: O usuário acertou a lição da barra de endereços?
    chrome.storage.local.get(["aguardando_sucesso_url"], (res) => {
        if (res.aguardando_sucesso_url) {
            // Remove o www para garantir que encontre o site correto
            const alvo = res.aguardando_sucesso_url.replace('www.', '');
            
            if (host.includes(alvo)) {
                // Wolfy parabeniza o usuário
                const painel = criarPainelWolfy(`
                    <h3 style="margin: 0; font-size: 18px; font-family: Arial, sans-serif; color: #4CAF50;">Perfeito! 🎉</h3>
                    <p style="margin: 0; font-size: 14px; line-height: 1.4; font-family: Arial, sans-serif;">Você usou a barra de endereços corretamente. Viu como chegou ao destino muito mais rápido?</p>
                `);
                
                // Limpa o banco e some automaticamente após 5 segundos
                chrome.storage.local.remove("aguardando_sucesso_url");
                setTimeout(() => {
                    painel.style.transition = "opacity 0.5s ease";
                    painel.style.opacity = "0";
                    setTimeout(() => painel.remove(), 500);
                }, 5000);
                
                return; // Bloqueia outras execuções
            }
        }

        // Se estiver no Google, roda a rotina específica dele
        if (host.includes('google.com')) {
            const ehPesquisa = interceptarPesquisas();

            // Se não for uma tela de pesquisa, é a Home. Roda o onboarding
            if (!ehPesquisa) {
                chrome.storage.local.get(["tour_google_concluido"], (resultado) => {
                    if (!resultado.tour_google_concluido) {
                        const painel = criarPainelWolfy(`
                            <h3 style="margin: 0; font-size: 18px; font-family: Arial, sans-serif;">Olá!</h3>
                            <p style="margin: 0; font-size: 14px; line-height: 1.4; font-family: Arial, sans-serif;">Notei que esta é a sua primeira vez aqui. Você quer que eu te ensine como usar o computador de forma mais prática?</p>
                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px;">
                                <button id="btn-nao" class="wolfy-btn">Já sei usar</button>
                                <button id="btn-sim" class="wolfy-btn wolfy-btn-primary">Sim, me ensine!</button>
                            </div>
                        `);
                        
                        document.getElementById('btn-sim').onclick = () => { painel.remove(); iniciarTour(); };
                        document.getElementById('btn-nao').onclick = () => {
                            chrome.storage.local.set({ "tour_google_concluido": true });
                            painel.remove();
                        };
                    }
                });
            }
        }
    });
});