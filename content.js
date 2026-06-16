// ==========================================
// content.js - Wolfy dinamico e resiliente
// ==========================================
(function iniciarWolfy() {
    "use strict";

    if (window !== window.top) {
        console.log("[Wolfy] Ignorando iframe secundario.");
        return;
    }

    if (window.__wolfyContentScriptCarregado) return;
    window.__wolfyContentScriptCarregado = true;

    const WOLFY_IMG = chrome.runtime.getURL("wolfy_cropped.png");
    const Z = {
        holofote: 2147483001,
        alvo: 2147483002,
        painel: 2147483003,
        botao: 2147483004
    };

    let tourEmExecucao = false;

    function quandoDocumentoPronto(callback) {
        if (document.body) {
            callback();
            return;
        }

        document.addEventListener("DOMContentLoaded", callback, { once: true });
    }

    function quandoPaginaCarregada(callback) {
        if (document.readyState === "complete") {
            callback();
            return;
        }

        window.addEventListener("load", callback, { once: true });
    }

    function escaparHTML(valor) {
        return String(valor || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function inserirEstilosWolfy() {
        if (document.getElementById("wolfy-estilos-base")) return;

        const estiloWolfy = document.createElement("style");
        estiloWolfy.id = "wolfy-estilos-base";
        estiloWolfy.textContent = `
            .wolfy-wrap {
                position: fixed !important;
                right: 24px !important;
                bottom: 24px !important;
                width: min(650px, calc(100vw - 32px)) !important;
                min-height: 260px !important;
                display: flex !important;
                align-items: flex-end !important;
                gap: 15px !important;
                z-index: ${Z.painel} !important;
                font-family: Arial, Helvetica, sans-serif !important;
                pointer-events: none !important;
                box-sizing: border-box !important;
            }

            .wolfy-bubble,
            .wolfy-avatar {
                pointer-events: auto !important;
            }

            .wolfy-bubble {
                flex: 1 1 auto !important;
                background: #ffffff !important;
                border: 4px solid #222222 !important;
                border-radius: 20px !important;
                padding: 26px 28px !important;
                position: relative !important;
                color: #222222 !important;
                box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.18) !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 16px !important;
                margin-bottom: 10px !important;
                line-height: 1.4 !important;
                box-sizing: border-box !important;
            }

            .wolfy-bubble::after {
                content: "" !important;
                position: absolute !important;
                top: 50% !important;
                right: -24px !important;
                transform: translateY(-50%) !important;
                border-top: 16px solid transparent !important;
                border-bottom: 16px solid transparent !important;
                border-left: 24px solid #222222 !important;
            }

            .wolfy-bubble::before {
                content: "" !important;
                position: absolute !important;
                top: 50% !important;
                right: -18px !important;
                transform: translateY(-50%) !important;
                border-top: 14px solid transparent !important;
                border-bottom: 14px solid transparent !important;
                border-left: 20px solid #ffffff !important;
                z-index: 1 !important;
            }

            .wolfy-bubble h3 {
                margin: 0 !important;
                font-size: 24px !important;
                line-height: 1.2 !important;
                font-weight: 800 !important;
                color: #222222 !important;
            }

            .wolfy-bubble p {
                margin: 0 !important;
                font-size: 18px !important;
                line-height: 1.45 !important;
                color: #222222 !important;
            }

            .wolfy-avatar {
                width: 210px !important;
                height: 280px !important;
                flex: 0 0 auto !important;
                object-fit: contain !important;
                object-position: bottom center !important;
            }

            .wolfy-actions {
                display: flex !important;
                justify-content: flex-end !important;
                align-items: center !important;
                flex-wrap: wrap !important;
                gap: 15px !important;
                margin-top: 8px !important;
            }

            .wolfy-btn {
                appearance: none !important;
                padding: 12px 24px !important;
                border: 2px solid #222222 !important;
                border-radius: 10px !important;
                cursor: pointer !important;
                font-weight: 800 !important;
                font-size: 18px !important;
                line-height: 1.2 !important;
                background: #f2f2f2 !important;
                color: #222222 !important;
                transition: transform 0.15s ease, background 0.15s ease !important;
                font-family: Arial, Helvetica, sans-serif !important;
                min-height: 48px !important;
            }

            .wolfy-btn:hover {
                transform: scale(1.04) !important;
            }

            .wolfy-btn:focus-visible,
            .wolfy-trigger:focus-visible {
                outline: 4px solid #ffbf47 !important;
                outline-offset: 3px !important;
            }

            .wolfy-btn:disabled {
                opacity: 0.55 !important;
                cursor: wait !important;
                transform: none !important;
            }

            .wolfy-btn-primary {
                background: #1a73e8 !important;
                color: #ffffff !important;
                border-color: #1a73e8 !important;
            }

            .wolfy-btn-primary:hover {
                background: #1557b0 !important;
            }

            .wolfy-trigger {
                position: fixed !important;
                left: 18px !important;
                bottom: 18px !important;
                z-index: ${Z.botao} !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 14px !important;
                max-width: min(430px, calc(100vw - 36px)) !important;
                min-height: 74px !important;
                padding: 16px 32px !important;
                border: 3px solid #ffffff !important;
                border-radius: 50px !important;
                background: #1a73e8 !important;
                color: #ffffff !important;
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38), 0 0 0 4px rgba(26, 115, 232, 0.25) !important;
                cursor: pointer !important;
                font: bold 22px/1.2 Arial, Helvetica, sans-serif !important;
                text-align: left !important;
                box-sizing: border-box !important;
            }

            .wolfy-trigger:hover {
                background: #1557b0 !important;
                transform: translateY(-2px) scale(1.02) !important;
            }

            .wolfy-trigger[disabled] {
                opacity: 0.7 !important;
                cursor: wait !important;
                transform: none !important;
            }

            .wolfy-trigger img {
                width: 48px !important;
                height: 48px !important;
                object-fit: contain !important;
                flex: 0 0 auto !important;
            }

            .wolfy-highlighter {
                position: fixed !important;
                z-index: ${Z.holofote} !important;
                pointer-events: none !important;
                background: transparent !important;
                border: 3px solid #ffffff !important;
                box-sizing: border-box !important;
                transition: top 0.22s ease, left 0.22s ease, width 0.22s ease, height 0.22s ease, border-radius 0.22s ease !important;
                display: none;
            }

            .wolfy-step-label {
                font-size: 14px !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                color: #1a73e8 !important;
                letter-spacing: 1px !important;
            }

            @media (max-width: 760px) {
                .wolfy-wrap {
                    right: 12px !important;
                    bottom: 84px !important;
                    width: calc(100vw - 24px) !important;
                    min-height: auto !important;
                    gap: 8px !important;
                }

                .wolfy-avatar {
                    width: 92px !important;
                    height: 132px !important;
                }

                .wolfy-bubble {
                    padding: 20px !important;
                }

                .wolfy-bubble::before,
                .wolfy-bubble::after {
                    display: none !important;
                }

                .wolfy-bubble h3 {
                    font-size: 21px !important;
                }

                .wolfy-bubble p,
                .wolfy-btn {
                    font-size: 17px !important;
                }

                .wolfy-trigger {
                    left: 10px !important;
                    bottom: 10px !important;
                    min-height: 64px !important;
                    padding: 12px 18px !important;
                    font-size: 18px !important;
                    max-width: calc(100vw - 20px) !important;
                }

                .wolfy-trigger img {
                    width: 40px !important;
                    height: 40px !important;
                }
            }
        `;

        document.head.appendChild(estiloWolfy);
    }

    function removerPaineisWolfy() {
        document.querySelectorAll(".wolfy-wrap[data-wolfy-ignore='true']").forEach((painel) => painel.remove());
    }

    function criarPainelWolfy(conteudoHTML, opcoes = {}) {
        if (opcoes.substituir !== false) removerPaineisWolfy();

        const painel = document.createElement("div");
        painel.className = "wolfy-wrap";
        painel.setAttribute("data-wolfy-ignore", "true");
        painel.innerHTML = `
            <div class="wolfy-bubble">${conteudoHTML}</div>
            <img class="wolfy-avatar" src="${WOLFY_IMG}" alt="">
        `;

        document.body.appendChild(painel);
        return painel;
    }

    function normalizarDominio(valor) {
        return String(valor || "")
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split(/[/?#]/)[0]
            .replace(/:\d+$/, "")
            .replace(/\.$/, "");
    }

    function extrairDominioDaPesquisa(valor) {
        const texto = String(valor || "").toLowerCase().trim();
        const match = texto.match(/(?:https?:\/\/)?((?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.com(?:\.[a-z]{2})?)/i);
        return match ? normalizarDominio(match[1]) : "";
    }

    function hostBateComDominio(host, dominio) {
        const hostNormalizado = normalizarDominio(host);
        const dominioNormalizado = normalizarDominio(dominio);

        return Boolean(
            dominioNormalizado &&
            (hostNormalizado === dominioNormalizado || hostNormalizado.endsWith(`.${dominioNormalizado}`))
        );
    }

    function obterSitesAprendidos(callback) {
        chrome.storage.local.get(["sites_aprendidos"], (res) => {
            const sites = Array.isArray(res?.sites_aprendidos) ? res.sites_aprendidos : [];
            const limpos = sites
                .map(normalizarDominio)
                .filter(Boolean)
                .filter((site, indice, lista) => lista.indexOf(site) === indice)
                .slice(0, 30);

            callback(limpos);
        });
    }

    function registrarSiteAprendido() {
        const dominioAtual = normalizarDominio(window.location.hostname);
        if (!dominioAtual) return;

        obterSitesAprendidos((sites) => {
            if (sites.includes(dominioAtual)) return;

            chrome.storage.local.set({
                sites_aprendidos: [...sites, dominioAtual].slice(-30)
            });
        });
    }

    function chaveCachePaginaAtual() {
        return `wolfy_cache_${window.location.hostname}${window.location.pathname}`;
    }

    function roteiroCacheValido(roteiro) {
        return Array.isArray(roteiro) &&
            roteiro.length > 0 &&
            roteiro.length <= 5 &&
            roteiro.every((passo) => (
                passo &&
                typeof passo.seletor === "string" &&
                typeof passo.titulo === "string" &&
                typeof passo.texto === "string" &&
                (passo.formato === "circulo" || passo.formato === "arredondado") &&
                typeof passo.aumentarDestaque === "boolean"
            ));
    }

    function obterTourDoCache(callback) {
        const chave = chaveCachePaginaAtual();

        chrome.storage.local.get([chave], (res) => {
            const roteiro = res?.[chave];

            if (roteiroCacheValido(roteiro)) {
                callback(roteiro, chave);
                return;
            }

            if (roteiro !== undefined) {
                chrome.storage.local.remove(chave);
            }

            callback(null, chave);
        });
    }

    function salvarTourNoCache(roteiro, callback) {
        const chave = chaveCachePaginaAtual();

        if (!roteiroCacheValido(roteiro)) {
            if (typeof callback === "function") callback(false);
            return;
        }

        chrome.storage.local.set({ [chave]: roteiro }, () => {
            if (typeof callback === "function") callback(!chrome.runtime.lastError);
        });
    }

    function verificarSucessoUrlPendente() {
        chrome.storage.local.get(["aguardando_sucesso_url"], (res) => {
            const dominioAguardado = res?.aguardando_sucesso_url;
            if (!dominioAguardado) return;

            if (!hostBateComDominio(window.location.hostname, dominioAguardado)) return;

            const painel = criarPainelWolfy(`
                <h3 style="color: #2e7d32 !important;">Perfeito!</h3>
                <p>Voce usou a barra de enderecos corretamente. Viu como chegou ao destino de um jeito mais direto?</p>
            `);

            chrome.storage.local.remove("aguardando_sucesso_url");

            setTimeout(() => {
                if (!painel.isConnected) return;
                painel.style.transition = "opacity 0.5s ease";
                painel.style.opacity = "0";
                setTimeout(() => painel.remove(), 500);
            }, 5000);
        });
    }

    function interceptarPesquisas() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("q");
        if (!query) return false;

        const pesquisa = String(query).toLowerCase().trim();
        const pesquisaComoDominio = normalizarDominio(pesquisa);
        const estaNoGoogle = hostBateComDominio(window.location.hostname, "google.com") || hostBateComDominio(window.location.hostname, "google.com.br");

        if (estaNoGoogle && (pesquisaComoDominio === "google.com" || pesquisaComoDominio === "google.com.br")) {
            const painel = criarPainelWolfy(`
                <h3>Aviso Amigavel!</h3>
                <p>Opa! Parece que voce tentou ir para o site do Google, mas a boa noticia e que voce ja esta nele.</p>
                <div class="wolfy-actions">
                    <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar>Entendi</button>
                </div>
            `);

            painel.querySelector("[data-wolfy-fechar]").addEventListener("click", () => painel.remove());
            return true;
        }

        if (pesquisa.includes(".com")) {
            const dominioAlvo = extrairDominioDaPesquisa(pesquisa);
            if (!dominioAlvo) return false;

            const painel = criarPainelWolfy(`
                <h3>Dica de Ouro!</h3>
                <p data-wolfy-texto-dica>Notei que voce pesquisou o endereco de um site (<strong>${escaparHTML(dominioAlvo)}</strong>). Tem um jeito mais rapido de chegar la, sem precisar pesquisar. Quer que eu te ensine?</p>
                <div class="wolfy-actions" data-wolfy-botoes-dica>
                    <button type="button" class="wolfy-btn" data-wolfy-nao>Nao precisa</button>
                    <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-sim>Me ensine!</button>
                </div>
            `);

            painel.querySelector("[data-wolfy-nao]").addEventListener("click", () => painel.remove());
            painel.querySelector("[data-wolfy-sim]").addEventListener("click", () => {
                chrome.storage.local.set({ aguardando_sucesso_url: dominioAlvo });
                painel.querySelector("[data-wolfy-texto-dica]").innerHTML =
                    `Para ir direto, digite <strong>${escaparHTML(dominioAlvo)}</strong> na barra de enderecos, aquela barra comprida no topo do navegador, e aperte Enter.`;
                painel.querySelector("[data-wolfy-botoes-dica]").innerHTML =
                    `<button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-ok>Vou tentar!</button>`;
                painel.querySelector("[data-wolfy-ok]").addEventListener("click", () => painel.remove());
            });

            return true;
        }

        return false;
    }

    function zIndexNumerico(elemento) {
        const valor = window.getComputedStyle(elemento).zIndex;
        if (!valor || valor === "auto") return 0;

        const numero = Number.parseInt(valor, 10);
        return Number.isFinite(numero) ? numero : 0;
    }

    function elementoEstaNoCentroOuTopo(rect) {
        const centroX = window.innerWidth / 2;
        const centroY = window.innerHeight / 2;
        const cruzaCentro = rect.left <= centroX && rect.right >= centroX && rect.top <= centroY && rect.bottom >= centroY;
        const estaNoTopoUtil = rect.top >= 0 && rect.top <= window.innerHeight * 0.45;

        return cruzaCentro || estaNoTopoUtil;
    }

    function pontuarPossivelGavetaModal(elemento) {
        if (!elemento || elemento === document.body || elemento === document.documentElement) return 0;
        if (elementoEhDoWolfy(elemento) || !elementoEstaVisivel(elemento, true)) return 0;

        const rect = elemento.getBoundingClientRect();
        const estilo = window.getComputedStyle(elemento);
        const role = String(elemento.getAttribute("role") || "").toLowerCase();
        const zIndex = zIndexNumerico(elemento);

        if (rect.width < 140 || rect.height < 90) return 0;
        if (!elementoEstaNoCentroOuTopo(rect)) return 0;

        const temRoleDeJanela = ["dialog", "menu", "listbox", "tree", "grid", "alertdialog"].includes(role);
        const pareceSobreposto = ["fixed", "absolute", "sticky"].includes(estilo.position) && zIndex >= 100;
        const modalNativo = elemento.tagName.toLowerCase() === "dialog" && elemento.hasAttribute("open");
        const ariaModal = elemento.getAttribute("aria-modal") === "true";

        if (!temRoleDeJanela && !pareceSobreposto && !modalNativo && !ariaModal) return 0;

        let score = 0;
        if (temRoleDeJanela) score += 80;
        if (role === "dialog" || role === "alertdialog") score += 40;
        if (role === "menu" || role === "listbox") score += 35;
        if (ariaModal || modalNativo) score += 45;
        if (zIndex >= 1000) score += 35;
        else if (zIndex >= 100) score += 20;
        if (estilo.position === "fixed") score += 25;
        if (rect.top <= 180) score += 12;
        if (rect.width < window.innerWidth * 0.92 && rect.height < window.innerHeight * 0.92) score += 16;
        if (elemento.querySelector("input, textarea, button, a, [role='button'], [role='menuitem']")) score += 24;

        return score;
    }

    function detectarGavetaOuModalAberto() {
        const candidatos = new Set();
        const seletoresDiretos = [
            "[role='dialog']",
            "[role='alertdialog']",
            "[role='menu']",
            "[role='listbox']",
            "[aria-modal='true']",
            "dialog[open]"
        ];

        seletoresDiretos.forEach((seletor) => {
            try {
                document.querySelectorAll(seletor).forEach((elemento) => candidatos.add(elemento));
            } catch (_) {
                // Ignora seletores nao suportados pelo navegador.
            }
        });

        document.querySelectorAll("div, section, aside, nav, ul, ol, form, [role]").forEach((elemento) => {
            if (elementoEhDoWolfy(elemento)) return;
            const estilo = window.getComputedStyle(elemento);
            const zIndex = zIndexNumerico(elemento);
            if (zIndex >= 100 && ["fixed", "absolute", "sticky"].includes(estilo.position)) {
                candidatos.add(elemento);
            }
        });

        const ranqueados = Array.from(candidatos)
            .map((elemento) => ({ elemento, score: pontuarPossivelGavetaModal(elemento) }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score);

        return ranqueados[0]?.elemento || null;
    }

    function cssEscape(valor) {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(String(valor));
        }

        return String(valor).replace(/[^a-zA-Z0-9_-]/g, (caractere) => `\\${caractere.charCodeAt(0).toString(16)} `);
    }

    function escaparAtributoCss(valor) {
        return String(valor || "")
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, " ")
            .trim();
    }

    function seletorApontaParaElemento(seletor, elemento) {
        try {
            const encontrados = document.querySelectorAll(seletor);
            return encontrados.length === 1 && encontrados[0] === elemento;
        } catch (_) {
            return false;
        }
    }

    function gerarCaminhoEstrutural(elemento) {
        const partes = [];
        let atual = elemento;

        while (atual && atual.nodeType === Node.ELEMENT_NODE && atual !== document.documentElement) {
            const tag = atual.tagName.toLowerCase();
            let parte = tag;

            if (atual.id) {
                parte += `#${cssEscape(atual.id)}`;
                partes.unshift(parte);
                const tentativaComId = partes.join(" > ");
                if (seletorApontaParaElemento(tentativaComId, elemento)) return tentativaComId;
            } else {
                const pai = atual.parentElement;
                if (pai) {
                    const irmaosMesmoTipo = Array.from(pai.children).filter((filho) => filho.tagName === atual.tagName);
                    if (irmaosMesmoTipo.length > 1) {
                        parte += `:nth-of-type(${irmaosMesmoTipo.indexOf(atual) + 1})`;
                    }
                }

                partes.unshift(parte);
                const tentativa = partes.join(" > ");
                if (seletorApontaParaElemento(tentativa, elemento)) return tentativa;
            }

            atual = atual.parentElement;
        }

        return partes.join(" > ") || elemento.tagName.toLowerCase();
    }

    function seletorUnico(elemento) {
        const tag = elemento.tagName.toLowerCase();
        const tentativas = [];

        if (elemento.id) {
            tentativas.push(`#${cssEscape(elemento.id)}`);
            tentativas.push(`${tag}#${cssEscape(elemento.id)}`);
        }

        [
            "data-testid",
            "data-test",
            "data-cy",
            "data-qa",
            "aria-label",
            "name",
            "placeholder",
            "title",
            "href"
        ].forEach((atributo) => {
            const valor = elemento.getAttribute(atributo);
            if (!valor || valor.length > 220) return;
            tentativas.push(`${tag}[${atributo}="${escaparAtributoCss(valor)}"]`);
            tentativas.push(`[${atributo}="${escaparAtributoCss(valor)}"]`);
        });

        const role = elemento.getAttribute("role");
        if (role) {
            tentativas.push(`${tag}[role="${escaparAtributoCss(role)}"]`);
        }

        const classes = Array.from(elemento.classList || [])
            .filter((classe) => classe && !classe.startsWith("wolfy-") && classe.length <= 80)
            .slice(0, 4);

        for (let tamanho = 1; tamanho <= Math.min(classes.length, 3); tamanho += 1) {
            const seletorClasse = `${tag}.${classes.slice(0, tamanho).map(cssEscape).join(".")}`;
            tentativas.push(seletorClasse);
        }

        for (const tentativa of tentativas) {
            if (seletorApontaParaElemento(tentativa, elemento)) return tentativa;
        }

        return gerarCaminhoEstrutural(elemento);
    }

    function textoVisivel(elemento) {
        const candidatos = [
            elemento.getAttribute("aria-label"),
            elemento.getAttribute("placeholder"),
            elemento.getAttribute("title"),
            elemento.getAttribute("alt"),
            elemento.value,
            elemento.innerText,
            elemento.textContent,
            elemento.getAttribute("name")
        ];

        const textos = [];
        candidatos.forEach((valor) => {
            const limpo = String(valor || "").replace(/\s+/g, " ").trim();
            if (limpo && !textos.includes(limpo)) textos.push(limpo);
        });

        return textos.join(" | ").slice(0, 160);
    }

    function elementoEhDoWolfy(elemento) {
        return Boolean(elemento.closest?.("[data-wolfy-ignore='true'], #wolfy-floating-trigger"));
    }

    function elementoEstaVisivel(elemento, exigirViewport = true) {
        if (!elemento || elementoEhDoWolfy(elemento)) return false;

        const rect = elemento.getBoundingClientRect();
        const estilo = window.getComputedStyle(elemento);
        const opacidade = Number.parseFloat(estilo.opacity || "1");

        if (estilo.display === "none") return false;
        if (estilo.visibility === "hidden" || estilo.visibility === "collapse") return false;
        if (Number.isFinite(opacidade) && opacidade <= 0) return false;
        if (rect.width <= 0 || rect.height <= 0) return false;
        if (elemento.disabled || elemento.getAttribute("aria-hidden") === "true") return false;

        if (!exigirViewport) return true;

        return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
    }

    function normalizarElementoInterativo(elemento) {
        if (!elemento || elementoEhDoWolfy(elemento)) return null;

        const interativoPai = elemento.closest("input, textarea, button, a, [role='button']");
        if (interativoPai && !elementoEhDoWolfy(interativoPai)) return interativoPai;

        return elemento;
    }

    function areaDoElemento(rect, elemento) {
        if (elemento.closest("header, nav, [role='navigation']") || rect.top <= 160) return "topo ou menu superior";
        if (rect.left <= 120) return "lateral esquerda";
        if (rect.right >= window.innerWidth - 120) return "lateral direita";
        if (rect.top > window.innerHeight * 0.66) return "parte inferior";
        return "centro da tela";
    }

    function classificarImportancia(elemento, texto) {
        const tag = elemento.tagName.toLowerCase();
        const tipo = String(elemento.getAttribute("type") || "").toLowerCase();
        const role = String(elemento.getAttribute("role") || "").toLowerCase();
        const rect = elemento.getBoundingClientRect();
        const t = `${texto} ${elemento.id || ""} ${elemento.className || ""} ${elemento.name || ""}`.toLowerCase();

        let score = 100;

        if (tag === "input" && ["search", "text", ""].includes(tipo)) score -= 42;
        if (tag === "textarea") score -= 28;
        if (tag === "button" || role === "button" || tipo === "submit" || tipo === "button") score -= 22;
        if (tag === "a") score -= 8;

        if (/(pesquis|buscar|busca|procurar|search|lupa)/i.test(t)) score -= 48;
        if (/(entrar|login|log in|sign in|acessar|minha conta|account|perfil|profile)/i.test(t)) score -= 44;
        if (/(carrinho|sacola|cart|basket|checkout|comprar|compra)/i.test(t)) score -= 40;
        if (/(menu|categorias|departamentos|navigation|nav)/i.test(t)) score -= 34;
        if (/(continuar|avancar|proximo|salvar|enviar|confirmar|começar|comecar)/i.test(t)) score -= 20;

        if (elemento.closest("header, nav, [role='navigation']")) score -= 24;
        if (rect.top <= 160) score -= 18;
        if (rect.top <= window.innerHeight * 0.35) score -= 10;
        if (rect.width >= 220 && rect.height >= 30) score -= 8;

        if (/^(ok|sim|nao|não|x|fechar)$/i.test(texto.trim())) score += 18;
        if (!texto.trim()) score += 20;

        score += Math.min(24, Math.max(0, rect.top / 80));
        return score;
    }

    function escanearTela(raizEscaneamento = document.body, descricaoEscopo = "pagina inteira") {
        const raiz = raizEscaneamento && raizEscaneamento.querySelectorAll ? raizEscaneamento : document.body;

        const contexto = {
            nomeDoSite: normalizarDominio(window.location.hostname) || window.location.hostname,
            urlAtual: window.location.href.slice(0, 240),
            tituloDaPagina: document.title.slice(0, 160),
            pathname: window.location.pathname || "/",
            descricaoDaPagina:
                document.querySelector('meta[name="description"]')?.content?.slice(0, 240) ||
                document.querySelector('meta[property="og:description"]')?.content?.slice(0, 240) ||
                "",
            larguraTela: window.innerWidth,
            alturaTela: window.innerHeight,
            escopo: descricaoEscopo,
            escopoLimitado: raiz !== document.body,
            elementos: []
        };

        const elementos = new Set();
        const seletoresBase = "input, textarea, button, a, [role='button']";

        if (raiz.matches?.(seletoresBase)) {
            const normalizado = normalizarElementoInterativo(raiz);
            if (normalizado) elementos.add(normalizado);
        }

        raiz.querySelectorAll(seletoresBase).forEach((elemento) => {
            const normalizado = normalizarElementoInterativo(elemento);
            if (normalizado) elementos.add(normalizado);
        });

        const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT);
        let atual = walker.nextNode();

        while (atual) {
            if (!elementoEhDoWolfy(atual)) {
                const estilo = window.getComputedStyle(atual);
                if (estilo.cursor === "pointer") {
                    const normalizado = normalizarElementoInterativo(atual);
                    if (normalizado) elementos.add(normalizado);
                }
            }
            atual = walker.nextNode();
        }

        const seletoresVistos = new Set();
        const candidatos = [];
        let ordem = 0;

        elementos.forEach((elemento) => {
            if (!elementoEstaVisivel(elemento, true)) return;

            const seletor_css = seletorUnico(elemento);
            if (!seletor_css || seletoresVistos.has(seletor_css)) return;

            try {
                if (!document.querySelector(seletor_css)) return;
            } catch (_) {
                return;
            }

            seletoresVistos.add(seletor_css);

            const rect = elemento.getBoundingClientRect();
            const texto = textoVisivel(elemento);
            const tipo = elemento.tagName.toLowerCase();
            const role = elemento.getAttribute("role") || "";
            const importancia = classificarImportancia(elemento, texto);

            candidatos.push({
                ordem: ordem++,
                importancia,
                tipo,
                seletor_css,
                texto_visivel: texto || "Sem texto visivel",
                role,
                area: areaDoElemento(rect, elemento),
                tamanho: `${Math.round(rect.width)}x${Math.round(rect.height)}`
            });
        });

        contexto.elementos = candidatos
            .sort((a, b) => a.importancia - b.importancia || a.ordem - b.ordem)
            .slice(0, 12)
            .map(({ importancia, ordem: _ordem, ...resto }) => resto);

        return contexto;
    }

    function encontrarElementoDoPasso(seletor) {
        try {
            const encontrados = document.querySelectorAll(seletor);
            for (const elemento of encontrados) {
                if (elementoEstaVisivel(elemento, false)) return elemento;
            }
        } catch (erro) {
            console.warn("[Wolfy] Seletor invalido ignorado:", seletor, erro);
        }

        return null;
    }

    function executarMotorDeTour(roteiro, callbackFim) {
        const passos = Array.isArray(roteiro) ? roteiro.slice(0, 5) : [];

        if (!passos.length) {
            criarPainelWolfy(`
                <h3>Nao encontrei um caminho seguro</h3>
                <p>Eu li a pagina, mas nao encontrei botoes ou campos claros para explicar agora.</p>
                <div class="wolfy-actions">
                    <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar>Fechar</button>
                </div>
            `).querySelector("[data-wolfy-fechar]").addEventListener("click", (evento) => {
                evento.currentTarget.closest(".wolfy-wrap").remove();
            });
            return;
        }

        tourEmExecucao = true;
        definirBotaoOcupado(true);
        removerPaineisWolfy();

        const highlighter = document.createElement("div");
        highlighter.className = "wolfy-highlighter";
        highlighter.setAttribute("data-wolfy-ignore", "true");
        document.body.appendChild(highlighter);

        const painel = document.createElement("div");
        painel.className = "wolfy-wrap";
        painel.setAttribute("data-wolfy-ignore", "true");
        document.body.appendChild(painel);

        let indiceAtual = 0;
        let alvoAtual = null;
        let estilosOriginais = null;
        let algumPassoMostrado = false;
        let tourEncerrado = false;

        function limparDestaque() {
            if (alvoAtual && estilosOriginais) {
                alvoAtual.style.position = estilosOriginais.position;
                alvoAtual.style.zIndex = estilosOriginais.zIndex;
                alvoAtual.style.outline = estilosOriginais.outline;
                alvoAtual.style.outlineOffset = estilosOriginais.outlineOffset;
            }

            alvoAtual = null;
            estilosOriginais = null;
        }

        function reposicionarHolofote() {
            if (!alvoAtual || !alvoAtual.isConnected) {
                highlighter.style.display = "none";
                return;
            }

            const passo = passos[indiceAtual] || {};
            const rect = alvoAtual.getBoundingClientRect();
            const respiro = passo.aumentarDestaque ? 14 : 8;
            const topo = Math.max(6, rect.top - respiro);
            const esquerda = Math.max(6, rect.left - respiro);
            const largura = Math.min(window.innerWidth - esquerda - 6, rect.width + respiro * 2);
            const altura = Math.min(window.innerHeight - topo - 6, rect.height + respiro * 2);

            highlighter.style.display = "block";
            highlighter.style.top = `${topo}px`;
            highlighter.style.left = `${esquerda}px`;
            highlighter.style.width = `${Math.max(20, largura)}px`;
            highlighter.style.height = `${Math.max(20, altura)}px`;
            highlighter.style.borderRadius = passo.formato === "circulo" ? "999px" : "14px";
            highlighter.style.boxShadow = passo.aumentarDestaque
                ? "0 0 0 5px #ffffff, 0 0 0 99999px rgba(0, 0, 0, 0.82)"
                : "0 0 0 3px #ffffff, 0 0 0 99999px rgba(0, 0, 0, 0.78)";
        }

        function removerEventosDoTour() {
            window.removeEventListener("resize", reposicionarHolofote, true);
            window.removeEventListener("scroll", reposicionarHolofote, true);
            document.removeEventListener("keydown", fecharComEsc, true);
        }

        function finalizarTour(concluido = false) {
            if (tourEncerrado) return;
            tourEncerrado = true;

            limparDestaque();
            if (highlighter.isConnected) highlighter.remove();
            if (painel.isConnected) painel.remove();
            tourEmExecucao = false;
            definirBotaoOcupado(false);
            removerEventosDoTour();
            if (typeof callbackFim === "function") {
                callbackFim({ concluido: Boolean(concluido && algumPassoMostrado) });
            }
        }

        function fecharComEsc(evento) {
            if (evento.key === "Escape") finalizarTour(false);
        }

        function mostrarMensagemFinalAcolhedora() {
            limparDestaque();
            highlighter.style.display = "none";
            highlighter.style.boxShadow = "none";
            highlighter.style.border = "0";
            if (highlighter.isConnected) highlighter.remove();
            removerEventosDoTour();

            painel.innerHTML = `
                <div class="wolfy-bubble">
                    <h3>Estou por aqui</h3>
                    <p>Se tiver alguma dúvida ou esquecer algum passo, é só me perguntar que estou aqui pra te ajudar!</p>
                    <div class="wolfy-actions">
                        <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar-final>Entendi / Fechar</button>
                    </div>
                </div>
                <img class="wolfy-avatar" src="${WOLFY_IMG}" alt="">
            `;

            painel.querySelector("[data-wolfy-fechar-final]").addEventListener("click", () => finalizarTour(true));
        }

        function pularPasso() {
            limparDestaque();
            highlighter.style.display = "none";
            indiceAtual += 1;
            setTimeout(() => mostrarPasso(indiceAtual), 0);
        }

        function aplicarDestaque(elemento, passo) {
            limparDestaque();

            alvoAtual = elemento;
            estilosOriginais = {
                position: elemento.style.position,
                zIndex: elemento.style.zIndex,
                outline: elemento.style.outline,
                outlineOffset: elemento.style.outlineOffset
            };

            const posicaoComputada = window.getComputedStyle(elemento).position;
            if (posicaoComputada === "static") {
                elemento.style.position = "relative";
            }

            elemento.style.zIndex = String(Z.alvo);
            elemento.style.outline = passo.aumentarDestaque ? "4px solid #ffffff" : "2px solid #ffffff";
            elemento.style.outlineOffset = "3px";
            reposicionarHolofote();
        }

        function renderizarPainelDoPasso(passo, indice) {
            const ultimo = indice === passos.length - 1;
            const textoBotao = ultimo ? "Finalizar explicacao" : "Proximo passo";

            painel.innerHTML = `
                <div class="wolfy-bubble">
                    <span class="wolfy-step-label">Passo ${indice + 1} de ${passos.length}</span>
                    <h3>${escaparHTML(passo.titulo || "Dica do Wolfy")}</h3>
                    <p>${escaparHTML(passo.texto || "Este item ajuda voce a continuar nesta pagina com mais seguranca.")}</p>
                    <div class="wolfy-actions">
                        <button type="button" class="wolfy-btn" data-wolfy-cancelar>Fechar</button>
                        <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-proximo>${textoBotao}</button>
                    </div>
                </div>
                <img class="wolfy-avatar" src="${WOLFY_IMG}" alt="">
            `;

            painel.querySelector("[data-wolfy-cancelar]").addEventListener("click", () => finalizarTour(false));
            painel.querySelector("[data-wolfy-proximo]").addEventListener("click", () => {
                indiceAtual += 1;
                mostrarPasso(indiceAtual);
            });
        }

        function mostrarPasso(indice, inicioTentativa = performance.now()) {
            if (indice >= passos.length) {
                mostrarMensagemFinalAcolhedora();
                return;
            }

            indiceAtual = indice;
            const passo = passos[indice];

            if (!passo || !passo.seletor) {
                pularPasso();
                return;
            }

            const elemento = encontrarElementoDoPasso(passo.seletor);
            if (!elemento) {
                if (performance.now() - inicioTentativa < 3000) {
                    setTimeout(() => mostrarPasso(indice, inicioTentativa), 150);
                    return;
                }

                pularPasso();
                return;
            }

            elemento.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });

            setTimeout(() => {
                if (!elementoEstaVisivel(elemento, true)) {
                    if (performance.now() - inicioTentativa < 3000) {
                        setTimeout(() => mostrarPasso(indice, inicioTentativa), 150);
                        return;
                    }

                    pularPasso();
                    return;
                }

                algumPassoMostrado = true;
                aplicarDestaque(elemento, passo);
                renderizarPainelDoPasso(passo, indice);
            }, 260);
        }

        window.addEventListener("resize", reposicionarHolofote, true);
        window.addEventListener("scroll", reposicionarHolofote, true);
        document.addEventListener("keydown", fecharComEsc, true);

        mostrarPasso(indiceAtual);
    }

    function definirBotaoOcupado(ocupado) {
        const botao = document.getElementById("wolfy-floating-trigger");
        if (!botao) return;

        botao.disabled = ocupado;
        botao.setAttribute("aria-busy", ocupado ? "true" : "false");
    }

    function iniciarAjudaComIA() {
        if (tourEmExecucao) {
            criarPainelWolfy(`
                <h3>Ja estou te guiando</h3>
                <p>Termine a explicacao atual ou feche o painel para pedir uma nova ajuda.</p>
                <div class="wolfy-actions">
                    <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar>Entendi</button>
                </div>
            `).querySelector("[data-wolfy-fechar]").addEventListener("click", (evento) => {
                evento.currentTarget.closest(".wolfy-wrap").remove();
            });
            return;
        }

        obterTourDoCache((roteiroCacheado) => {
            const gavetaOuModal = detectarGavetaOuModalAberto();
            if (gavetaOuModal) {
                confirmarAjudaEmGaveta(gavetaOuModal);
                return;
            }

            if (roteiroCacheado) {
                mostrarConviteDeRecapitulacao(roteiroCacheado);
                return;
            }

            solicitarTourComIA(document.body, "pagina inteira", { salvarNoCache: true });
        });
    }

    function mostrarConviteDeRecapitulacao(roteiroCacheado) {
        const painel = criarPainelWolfy(`
            <h3>Vamos recapitular</h3>
            <p>Esqueceu como o site ${escaparHTML(window.location.hostname)} funciona ou está com dúvida? Tudo bem, isso acontece com todo mundo, vamos recapitular!</p>
            <div class="wolfy-actions">
                <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-comecar-cache>Começar</button>
            </div>
        `);

        painel.querySelector("[data-wolfy-comecar-cache]").addEventListener("click", () => {
            painel.remove();
            executarMotorDeTour(roteiroCacheado, (resultado) => {
                if (resultado?.concluido) registrarSiteAprendido();
            });
        });
    }

    function confirmarAjudaEmGaveta(gavetaOuModal) {
        const painel = criarPainelWolfy(`
            <h3>Notei uma janela aberta</h3>
            <p>Notei que voce abriu um menu ou janela. Voce quer ajuda apenas com esta parte?</p>
            <div class="wolfy-actions">
                <button type="button" class="wolfy-btn" data-wolfy-nao-gaveta>Nao</button>
                <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-sim-gaveta>Sim</button>
            </div>
        `);

        painel.querySelector("[data-wolfy-nao-gaveta]").addEventListener("click", () => {
            painel.remove();
            const painelTudoBem = criarPainelWolfy(`
                <h3>Tudo bem</h3>
                <p>Se precisar de algo, e so me chamar pelo botao azul.</p>
                <div class="wolfy-actions">
                    <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar>Combinado</button>
                </div>
            `);
            painelTudoBem.querySelector("[data-wolfy-fechar]").addEventListener("click", () => painelTudoBem.remove());
        });

        painel.querySelector("[data-wolfy-sim-gaveta]").addEventListener("click", () => {
            painel.remove();
            solicitarTourComIA(gavetaOuModal, "menu ou janela aberta", { salvarNoCache: false });
        });
    }

    function solicitarTourComIA(raizEscaneamento, descricaoEscopo, opcoes = {}) {
        definirBotaoOcupado(true);
        const painelLoading = criarPainelWolfy(`
            <h3>Analisando a página...</h3>
            <p>Estou lendo os botoes e campos visiveis desta pagina para preparar uma explicacao simples para voce.</p>
        `);

        const contexto = escanearTela(raizEscaneamento, descricaoEscopo);
        if (!contexto.elementos.length) {
            definirBotaoOcupado(false);
            if (painelLoading.isConnected) painelLoading.remove();

            criarPainelWolfy(`
                <h3>Nao achei botoes claros</h3>
                <p>Esta parte da pagina nao mostrou campos ou botoes visiveis que eu consiga explicar com seguranca agora.</p>
                <div class="wolfy-actions">
                    <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar>Fechar</button>
                </div>
            `).querySelector("[data-wolfy-fechar]").addEventListener("click", (evento) => {
                evento.currentTarget.closest(".wolfy-wrap").remove();
            });
            return;
        }

        obterSitesAprendidos((sitesAprendidos) => {
            contexto.sites_aprendidos = sitesAprendidos;

            chrome.runtime.sendMessage({ acao: "wolfy:gerarTour", contexto, sites_aprendidos: sitesAprendidos }, (resposta) => {
                definirBotaoOcupado(false);
                if (painelLoading.isConnected) painelLoading.remove();

                if (chrome.runtime.lastError) {
                    mostrarErroIA(chrome.runtime.lastError.message);
                    return;
                }

                if (resposta?.sucesso && Array.isArray(resposta.roteiro)) {
                    const iniciarTourGerado = () => executarMotorDeTour(resposta.roteiro, (resultado) => {
                        if (resultado?.concluido) registrarSiteAprendido();
                    });

                    if (opcoes.salvarNoCache) {
                        salvarTourNoCache(resposta.roteiro, iniciarTourGerado);
                    } else {
                        iniciarTourGerado();
                    }

                    return;
                }

                mostrarErroIA(resposta?.erro || "erro desconhecido");
            });
        });
    }

    function mostrarErroIA(erro) {
        criarPainelWolfy(`
            <h3 style="color: #b00020 !important;">Opa, me perdi</h3>
            <p>Nao consegui montar o guia desta vez. Tente novamente em alguns instantes.</p>
            <p style="font-size: 14px !important; color: #666666 !important;">${escaparHTML(erro)}</p>
            <div class="wolfy-actions">
                <button type="button" class="wolfy-btn wolfy-btn-primary" data-wolfy-fechar>Fechar</button>
            </div>
        `).querySelector("[data-wolfy-fechar]").addEventListener("click", (evento) => {
            evento.currentTarget.closest(".wolfy-wrap").remove();
        });
    }

    function criarBotaoFlutuante() {
        if (document.getElementById("wolfy-floating-trigger")) return;

        const botao = document.createElement("button");
        botao.id = "wolfy-floating-trigger";
        botao.className = "wolfy-trigger";
        botao.type = "button";
        botao.setAttribute("data-wolfy-ignore", "true");
        botao.setAttribute("aria-label", "Pedir ajuda ao Wolfy");
        botao.setAttribute("aria-busy", "false");
        botao.innerHTML = `
            <img src="${WOLFY_IMG}" alt="">
            <span>Pedir ajuda ao Wolfy</span>
        `;
        botao.addEventListener("click", iniciarAjudaComIA);
        document.body.appendChild(botao);
    }

    quandoDocumentoPronto(() => {
        inserirEstilosWolfy();
        criarBotaoFlutuante();
    });

    quandoPaginaCarregada(() => {
        verificarSucessoUrlPendente();
        interceptarPesquisas();
    });
})();
