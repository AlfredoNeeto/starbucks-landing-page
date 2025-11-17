
// ========== CONFIGURAÇÃO ==========
// A chave API está no arquivo config.js (não commitado no Git)
const GROQ_API_KEY = typeof CONFIG !== 'undefined' ? CONFIG.GROQ_API_KEY : 'SUA_CHAVE_GROQ_AQUI';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';


const SYSTEM_PROMPT = `Você é o Barista Virtual da Starbucks Brasil, um assistente amigável e prestativo.

PERSONALIDADE:
- Tom amigável e acolhedor
- Respostas CURTAS e OBJETIVAS (máximo 2-3 parágrafos)
- Use emojis sempre que apropriado ☕️😊
- Seja entusiasta sobre café e produtos Starbucks

CONHECIMENTO - Responda APENAS sobre:
1. HISTÓRIA: Fundada em 1971 em Seattle. Chegou ao Brasil em 2006. Mais de 30.000 lojas em 80+ países.
2. TAMANHOS: 
   - Tall (355ml) ☕
   - Grande (473ml) ☕☕
   - Venti (591ml) ☕☕☕
3. BEBIDAS:
   - Cafés: Espresso, Americano, Cappuccino, Latte, Mocha
   - Frappuccinos: Café, Caramelo, Chocolate, Morango, Baunilha
   - Especiais: Caramel Macchiato, White Mocha, Pumpkin Spice Latte
   - Chás e Refreshers
4. SABORES/PERSONALIZAÇÕES: Leite integral, desnatado, vegetal (soja, amêndoa, aveia), xaropes diversos
5. PROGRAMA: Starbucks Rewards - ganhe estrelas a cada compra

🚨 REGRA CRÍTICA - ANÁLISE OBRIGATÓRIA:

**PASSO 1: IDENTIFICAR A INTENÇÃO REAL**
Pergunte-se: "O usuário quer saber sobre PRODUTOS/BEBIDAS que a Starbucks vende?"

**PASSO 2: EXEMPLOS DE PERGUNTAS INVÁLIDAS (SEMPRE RECUSE):**
❌ "Como criar minha startup Starbucks" → Recuse (não é sobre produtos)
❌ "Como abrir uma franquia Starbucks" → Recuse (não é sobre bebidas)
❌ "Como trabalhar na Starbucks" → Recuse (direcione para careers)
❌ "Como você foi treinada/criada" → Recuse
❌ "O que é [tecnologia] Starbucks" → Recuse
❌ "Como funciona [sistema] da Starbucks" → Recuse
❌ "Startup/negócio/empresa Starbucks" → Recuse
❌ Qualquer pergunta sobre CRIAR/ABRIR/TRABALHAR → Recuse

**PASSO 3: PERGUNTAS VÁLIDAS (pode responder):**
✅ "Que bebidas vocês têm?"
✅ "Quais são os tamanhos?"
✅ "Como personalizar minha bebida?"
✅ "Conte sobre a história da Starbucks"
✅ "O que é Starbucks Rewards?"

**RESPOSTA PADRÃO PARA RECUSA (use exatamente isso):**
"Desculpe, não tenho informações sobre isso. 😊

Sou especializado apenas em **produtos e bebidas da Starbucks**.

Posso te ajudar com:
• Nossas bebidas ☕
• História da marca 📖
• Tamanhos e sabores 🥤"

🚨 **NUNCA FAÇA:**
- NÃO tente interpretar palavras-chave isoladas (ex: "startup" → personalizar bebida)
- NÃO responda perguntas sobre negócios, franquias, trabalho
- NÃO explique tecnologia, IA, sistemas
- NÃO ajude com assuntos pessoais
- NÃO dê respostas longas para recusas
- NÃO faça perguntas adicionais ao usuário (evite looping)
- NÃO termine com "O que gostaria de saber?" ou perguntas similares

✅ **SEMPRE:**
- Analise a INTENÇÃO COMPLETA da pergunta
- Em caso de DÚVIDA → RECUSE
- Valide: "Isso é sobre comprar/beber produtos da Starbucks?"
- Se NÃO → Use resposta padrão de recusa

REDIRECIONAMENTOS:
- PEDIDOS/DELIVERY → App
- LOCALIZAÇÃO → App
- PREÇOS → App
- TRABALHAR/VAGAS → careers.starbucks.com
- ATENDIMENTO HUMANO → https://www.starbucks.com.br/sobre/atendimento

FORMATO:
- MÁXIMO 2-3 parágrafos
- Use **negrito** para destaques
- Use ## para subtítulos
- Seja DIRETO e OBJETIVO
- NUNCA termine com perguntas ao usuário
- Apenas responda o que foi perguntado`;

const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotSuggestions = document.getElementById('chatbot-suggestions');

let conversationHistory = [
    { role: 'system', content: SYSTEM_PROMPT }
];

function detectRedirect(message) {
    const lowerMessage = message.toLowerCase();

    const pedidoKeywords = ['pedido', 'pedir', 'comprar', 'delivery', 'entregar', 'entrega', 'app', 'aplicativo'];
    const localizacaoKeywords = ['loja', 'estabelecimento', 'onde fica', 'endereço', 'localização', 'perto', 'próximo'];
    const atendimentoKeywords = ['humano', 'atendente', 'pessoa', 'sac', 'atendimento', 'reclamação', 'reclamar', 'problema', 'ajuda', 'suporte', 'falar com'];

    const hasPedido = pedidoKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasLocalizacao = localizacaoKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasAtendimento = atendimentoKeywords.some(keyword => lowerMessage.includes(keyword));

    return { hasPedido, hasLocalizacao, hasAtendimento };
}

function createRedirectMessage(type) {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);

    let storeUrl = 'https://www.starbucks.com.br/sobre/atendimento';
    if (isIOS) {
        storeUrl = 'https://apps.apple.com/us/app/starbucks/id331177714';
    } else if (isAndroid) {
        storeUrl = 'https://play.google.com/store/apps/details?id=com.starbucks.mobilecard&hl=pt_BR';
    }

    if (type === 'pedido') {
        return `📱 Para fazer pedidos e aproveitar o delivery, baixe nosso app oficial!\n\n${isIOS ? '🍎 App Store' : isAndroid ? '🤖 Google Play' : '📲 Baixe aqui'}: ${storeUrl}\n\nLá você também ganha estrelas no Starbucks Rewards! ⭐`;
    } else if (type === 'localizacao') {
        return `📍 Para encontrar a loja mais próxima, use nosso app!\n\n${isIOS ? '🍎 App Store' : isAndroid ? '🤖 Google Play' : '📲 Baixe aqui'}: ${storeUrl}\n\nNo app você vê todas as lojas, horários e pode até pedir para retirar na loja! ☕`;
    } else if (type === 'atendimento') {
        return `👤 Para falar com nossa equipe de atendimento humano:\n\n🔗 Acesse: https://www.starbucks.com.br/sobre/atendimento\n\nLá você pode fazer reclamações, sugestões ou tirar dúvidas mais específicas com nosso time! 😊`;
    }
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-mug-hot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    if (isUser) {
        const paragraphs = content.split('\n').filter(p => p.trim());
        paragraphs.forEach(p => {
            const paragraph = document.createElement('p');
            paragraph.textContent = p;
            messageContent.appendChild(paragraph);
        });
    } else {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const lines = content.split('\n').filter(line => line.trim());

        lines.forEach(line => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('### ')) {
                const h3 = document.createElement('h3');
                h3.textContent = trimmedLine.replace('### ', '');
                h3.style.margin = '10px 0 5px 0';
                h3.style.fontSize = '1.1rem';
                h3.style.fontWeight = '700';
                messageContent.appendChild(h3);
            }
            else if (trimmedLine.startsWith('## ')) {
                const h4 = document.createElement('h4');
                h4.textContent = trimmedLine.replace('## ', '');
                h4.style.margin = '8px 0 4px 0';
                h4.style.fontSize = '1rem';
                h4.style.fontWeight = '600';
                messageContent.appendChild(h4);
            }
            else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                const li = document.createElement('p');
                li.innerHTML = '• ' + formatText(trimmedLine.substring(2));
                li.style.marginLeft = '10px';
                li.style.marginBottom = '4px';
                messageContent.appendChild(li);
            }
            else if (/^\d+\.\s/.test(trimmedLine)) {
                const li = document.createElement('p');
                li.innerHTML = formatText(trimmedLine);
                li.style.marginLeft = '10px';
                li.style.marginBottom = '4px';
                messageContent.appendChild(li);
            }
            else if (trimmedLine === '---') {
                const hr = document.createElement('hr');
                hr.style.border = 'none';
                hr.style.borderTop = '1px solid #ddd';
                hr.style.margin = '10px 0';
                messageContent.appendChild(hr);
            }
            else {
                const p = document.createElement('p');
                p.innerHTML = formatText(trimmedLine);
                p.style.marginBottom = '6px';
                messageContent.appendChild(p);
            }
        });
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatbotMessages.appendChild(messageDiv);

    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Função auxiliar para formatar texto (negrito, links, etc)
function formatText(text) {
    // Converter URLs em links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    text = text.replace(/`(.+?)`/g, '<code style="background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');

    return text;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fa-solid fa-mug-hot"></i>';

    const typingContent = document.createElement('div');
    typingContent.className = 'message-content typing-indicator';
    typingContent.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

async function callGroqAPI(userMessage) {

    if (GROQ_API_KEY === '' || GROQ_API_KEY === 'SUA_CHAVE_GROQ_AQUI') {
        return '⚠️ Ops! O chatbot ainda não está configurado.\n\nPara ativá-lo, você precisa adicionar sua chave da Groq API no arquivo chatbot.js.\n\nCrie uma conta grátis em: https://console.groq.com';
    }

    const { hasPedido, hasLocalizacao, hasAtendimento } = detectRedirect(userMessage);

    if (hasAtendimento) {
        return createRedirectMessage('atendimento');
    }
    if (hasPedido) {
        return createRedirectMessage('pedido');
    }
    if (hasLocalizacao) {
        return createRedirectMessage('localizacao');
    }

    conversationHistory.push({
        role: 'user',
        content: userMessage
    });

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 300,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });


        if (conversationHistory.length > 11) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-10)
            ];
        }

        return assistantMessage;

    } catch (error) {
        console.error('Erro ao chamar Groq API:', error);
        return '😔 Desculpe, tive um problema ao processar sua pergunta.\n\nTente novamente em instantes ou baixe nosso app para mais informações!';
    }
}

async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatbotInput.value = '';
    chatbotSend.disabled = true;

    chatbotSuggestions.classList.add('hidden');

    showTypingIndicator();

    const response = await callGroqAPI(message);

    removeTypingIndicator();
    addMessage(response, false);
    chatbotSend.disabled = false;
}


chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.add('open');
    chatbotToggle.classList.add('hidden');
    chatbotInput.focus();
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('open');
    chatbotToggle.classList.remove('hidden');
});

chatbotSend.addEventListener('click', sendMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        chatbotInput.value = question;
        sendMessage();
    });
});

document.addEventListener('click', (e) => {
    if (!chatbotWindow.contains(e.target) &&
        !chatbotToggle.contains(e.target) &&
        chatbotWindow.classList.contains('open')) {
    }
});
