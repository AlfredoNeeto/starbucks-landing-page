# ☕ Starbucks Landing Page

Uma landing page responsiva inspirada na Starbucks, com chatbot inteligente (Barista Virtual) integrado.

## 🎯 O que é?

Projeto que combina design moderno com IA. O Barista Virtual responde perguntas sobre produtos, bebidas e história da Starbucks usando a Groq API.

## ⚡ Rápido começar

```powershell
# 1. Abra o projeto
cd Starbucks

# 2. Abra index.html no navegador
Start-Process "index.html"
```

## 🤖 Configurar o Chatbot

1. Crie uma conta em: https://console.groq.com
2. Copie sua chave API
3. Crie arquivo `src/js/config.js`:

```js
const CONFIG = {
  GROQ_API_KEY: 'sua_chave_aqui'
};
```

4. Pronto! O chatbot está ativo

## 🎨 Funcionalidades

- ✅ Landing page responsiva (mobile, tablet, desktop)
- ✅ Chatbot com IA (Llama 3.1 8B)
- ✅ Respostas formatadas (negrito, listas, links)
- ✅ Indicador de status online
- ✅ Animações suaves
- ✅ Redirecionamentos inteligentes

## 📁 Estrutura

```
├── index.html
├── src/
│   ├── css/
│   │   ├── components/
│   │   │   └── chatbot.css
│   │   ├── pages/
│   │   └── ...
│   ├── js/
│   │   ├── chatbot.js
│   │   ├── config.example.js
│   │   └── script.js
│   └── images/
└── README.MD
```

## 🔒 Segurança

- `src/js/config.js` está no `.gitignore` (nunca será commitado)
- Sua chave API fica protegida localmente

## ❓ Teste o chatbot

Pergunte algo como:
- "Quais bebidas vocês têm?"
- "Conte sobre a história da Starbucks"
- "O que é Starbucks Rewards?"

## 📱 Responsivo?

Sim! Funciona perfeitamente em:
- Desktop
- Tablet
- Mobile

## 🔗 Acesse o site

Publicado em: https://cafely.netlify.app/

## 🤝 Precisa de ajuda?

Verifique a chave API em `src/js/config.js` ou acesse https://console.groq.com

---

**Desenvolvido com ❤️ e ☕**
