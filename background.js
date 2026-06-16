// ==========================================
// background.js - Wolfy dinamico com Gemini
// Cole sua chave Gemini abaixo.
// ==========================================
const GEMINI_API_KEY = "";
const GEMINI_MODEL = "gemini-2.5-flash";

function montarPrompt(contexto) {
    const raioX = Array.isArray(contexto.elementos) ? contexto.elementos : [];
    const seletoresPermitidos = raioX.map((item) => item.seletor_css);
    const sitesAprendidos = Array.isArray(contexto.sites_aprendidos) ? contexto.sites_aprendidos : [];
    const titulo = contexto.tituloDaPagina || "pagina sem titulo";
    const pathname = contexto.pathname || "/";

    return `Você é o Wolfy, assistente paciente para idosos. O usuário está na página '${titulo}' (Caminho: ${pathname}). O usuário JÁ SABE usar os seguintes sites: ${JSON.stringify(sitesAprendidos)}. SE houver sites conhecidos na lista, faça analogias diretas e lúdicas com eles para explicar a página atual. Retorne APENAS um array JSON de até 5 passos, sem markdown, com esta estrutura exata: [{"seletor": "[exatamente igual ao raioX]", "titulo": "...", "texto": "...", "formato": "arredondado", "aumentarDestaque": true}].

Contexto completo da página:
- Site atual: ${contexto.nomeDoSite || "desconhecido"}
- URL atual: ${contexto.urlAtual || ""}
- Título da página: ${titulo}
- Pathname: ${pathname}
- Descrição: ${contexto.descricaoDaPagina || "sem descricao"}
- Escopo analisado: ${contexto.escopo || "pagina inteira"}
- Escopo limitado a menu/modal: ${contexto.escopoLimitado ? "sim" : "nao"}

RaioX dos elementos interativos visíveis encontrados pelo scanner, já ordenados por importância:
${JSON.stringify(raioX, null, 2)}

Seletores CSS permitidos:
${JSON.stringify(seletoresPermitidos, null, 2)}

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS um array JSON válido. Nenhum texto antes ou depois. Nenhum markdown. Nenhuma crase.
2. O array deve ter no máximo 5 objetos.
3. Cada objeto deve ter exatamente estes campos:
   - "seletor": string
   - "titulo": string
   - "texto": string
   - "formato": "circulo" ou "arredondado"
   - "aumentarDestaque": boolean
4. O campo "seletor" deve ser exatamente um dos seletores CSS permitidos no RaioX. Não invente seletor. Não altere letras, espaços, aspas ou símbolos.
5. Se o escopo analisado for "menu ou janela aberta", explique apenas os elementos dessa janela/menu e ignore o site de fundo.
6. Se o caminho indicar carrinho, checkout, categoria, produto, conta, busca ou outra subpágina, adapte o roteiro para essa subpágina. Não repita explicações genéricas de página inicial.
7. Se sites_aprendidos tiver itens, use analogias simples com esses sites. Exemplo: "Lembra da barra do Google? Aqui ela funciona como uma plaquinha parecida para procurar produtos."
8. O campo "texto" deve usar linguagem simples para idosos, em 2 ou 3 frases curtas, com analogias do mundo real.
9. Evite termos técnicos como HTML, CSS, input, seletor, interface, componente ou API.
10. Priorize, quando existirem: barra de busca, menu superior, entrar/login, conta/perfil, carrinho/sacola de compras, botões principais e controles dentro de menus abertos.
11. Use "circulo" para ícones, fotos de perfil e botões redondos. Use "arredondado" para caixas de busca, links, menus e botões retangulares.
12. Use "aumentarDestaque": true nos passos mais importantes, principalmente nos 2 primeiros.`;
}

function extrairTextoResposta(data) {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts) || parts.length === 0) return null;

    const textos = parts
        .filter((part) => !part.thought && typeof part.text === "string")
        .map((part) => part.text.trim())
        .filter(Boolean);

    if (textos.length > 0) return textos.join("\n");

    const fallback = parts
        .filter((part) => typeof part.text === "string")
        .map((part) => part.text.trim())
        .filter(Boolean);

    return fallback.length > 0 ? fallback.join("\n") : null;
}

function parsearArrayJson(texto) {
    if (!texto) throw new Error("A IA retornou uma resposta vazia.");

    const limpo = texto
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .trim();

    try {
        const direto = JSON.parse(limpo);
        if (Array.isArray(direto)) return direto;
    } catch (_) {
        // Continua para a extracao defensiva abaixo.
    }

    const inicio = limpo.indexOf("[");
    const fim = limpo.lastIndexOf("]");
    if (inicio === -1 || fim === -1 || fim <= inicio) {
        throw new Error("Nenhum array JSON foi encontrado na resposta da IA.");
    }

    const trecho = limpo.slice(inicio, fim + 1);
    const parseado = JSON.parse(trecho);
    if (!Array.isArray(parseado)) {
        throw new Error("O JSON retornado nao e um array.");
    }

    return parseado;
}

function textoSeguro(valor, limite) {
    return String(valor || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, limite);
}

function validarRoteiro(roteiro, contexto) {
    const seletoresPermitidos = new Set((contexto.elementos || []).map((item) => item.seletor_css));

    return roteiro
        .filter((passo) => passo && seletoresPermitidos.has(passo.seletor))
        .slice(0, 5)
        .map((passo) => ({
            seletor: passo.seletor,
            titulo: textoSeguro(passo.titulo, 80) || "Dica do Wolfy",
            texto: textoSeguro(passo.texto, 420) || "Este item ajuda voce a continuar nesta pagina com mais seguranca.",
            formato: passo.formato === "circulo" ? "circulo" : "arredondado",
            aumentarDestaque: Boolean(passo.aumentarDestaque)
        }));
}

async function chamarGemini(contexto) {
    const chave = GEMINI_API_KEY.trim();
    if (!chave) {
        throw new Error("Configure a chave do Gemini em background.js antes de usar o Wolfy.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(chave)}`;

    const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: montarPrompt(contexto) }]
                }
            ],
            generationConfig: {
                temperature: 0.15,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
            }
        })
    });

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(`Erro HTTP ${resposta.status} ao chamar Gemini: ${detalhe.slice(0, 600)}`);
    }

    const data = await resposta.json();
    const textoIA = extrairTextoResposta(data);
    const roteiroBruto = parsearArrayJson(textoIA);
    const roteiro = validarRoteiro(roteiroBruto, contexto);

    if (!roteiro.length) {
        throw new Error("A IA nao retornou nenhum passo com seletores validos do scanner.");
    }

    return roteiro;
}

chrome.runtime.onMessage.addListener((mensagem, remetente, enviarResposta) => {
    const acao = mensagem?.acao;
    if (acao !== "wolfy:gerarTour" && acao !== "chamarIA") return false;

    const contexto = mensagem.contexto || {};
    if (!Array.isArray(contexto.sites_aprendidos) && Array.isArray(mensagem.sites_aprendidos)) {
        contexto.sites_aprendidos = mensagem.sites_aprendidos;
    }

    chamarGemini(contexto)
        .then((roteiro) => enviarResposta({ sucesso: true, roteiro }))
        .catch((erro) => {
            console.error("[Wolfy] Erro ao gerar roteiro dinamico:", erro);
            enviarResposta({ sucesso: false, erro: erro.message });
        });

    return true;
});
