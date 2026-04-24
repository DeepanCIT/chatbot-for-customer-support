import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const QUICK_ACTIONS = {
  en: ["Track my order", "Return & refund policy", "Product not working", "Billing question", "Talk to a human"],
  es: ["Rastrear mi pedido", "Política de devolución", "Producto no funciona", "Consulta de facturación", "Hablar con humano"],
  fr: ["Suivre ma commande", "Politique de retour", "Produit défaillant", "Question facturation", "Parler à un agent"],
  de: ["Bestellung verfolgen", "Rückgaberichtlinie", "Produkt funktioniert nicht", "Rechnungsfrage", "Mit Agent sprechen"],
  ja: ["注文を追跡", "返品・返金ポリシー", "製品が動かない", "請求について", "人間と話す"],
  ar: ["تتبع طلبي", "سياسة الإرجاع", "المنتج لا يعمل", "استفسار الفواتير", "التحدث مع إنسان"],
  hi: ["मेरा ऑर्डर ट्रैक करें", "वापसी नीति", "उत्पाद काम नहीं कर रहा", "बिलिंग प्रश्न", "मानव से बात करें"],
  zh: ["追踪订单", "退货政策", "产品无法正常工作", "账单问题", "联系人工客服"],
};

const SYSTEM_PROMPT = (lang) => `You are Aria, an elite AI customer support agent for NovaTech Solutions — a premium consumer electronics and software company. You are warm, knowledgeable, efficient, and empathetic.

CURRENT LANGUAGE: ${lang}. Respond ONLY in this language. Detect and honor language from the user if different.

YOUR CAPABILITIES:
- Order tracking & shipment status
- Product information (NovaTech laptops, smartphones, tablets, accessories, software subscriptions)
- Technical troubleshooting (step-by-step guides)
- Returns, refunds, and warranty claims (30-day return, 1-year warranty)
- Account & billing support
- General FAQs

PRODUCT CATALOG (key products):
- NovaPad Pro 15 ($1,299) — flagship laptop, 15" OLED, M3 chip, 18hr battery
- NovaPad Air 13 ($899) — ultrabook, 13", lightweight 1.1kg
- NovaPhone X ($799) — flagship phone, 6.7" AMOLED, 200MP camera
- NovaTab 11 ($499) — productivity tablet
- NovaWatch Series 5 ($349) — health & fitness smartwatch
- NovaBuds Pro ($199) — ANC earbuds, 36hr battery
- NovaCare Plan ($9.99/mo) — extended warranty & priority support

ESCALATION PROTOCOL:
When user says they want to speak to a human, are extremely frustrated, or the issue is complex legal/payment fraud/data breach related — respond ONLY with this exact JSON snippet at the very end of your response (after your message):
{"escalate": true, "reason": "brief reason here"}

TONE GUIDELINES:
- Be concise but thorough. Max 3-4 sentences per response unless troubleshooting.
- Use numbered steps for troubleshooting.
- Acknowledge frustration empathetically before diving into solutions.
- Never make up order numbers, tracking IDs, or specific account data — ask the user to provide these.
- Always end non-escalation responses with a follow-up question or offer to help further.`;

const ESCALATION_TRIGGERS = ["talk to a human", "human agent", "real person", "speak to someone", "hablar con humano", "parler à un agent", "mit agent sprechen", "人間と話す", "联系人工客服", "मानव से बात करें"];

const UI_TEXT = {
  en: { placeholder: "Type your message...", typing: "Aria is typing", escalated: "Connecting you to a human agent...", agentName: "Support Agent", agentMsg: "Hi! I'm Maya from NovaTech support. I've reviewed your conversation with Aria. How can I help you today?", close: "End Chat", langLabel: "Language", status: "Online", poweredBy: "Powered by NovaTech AI" },
  es: { placeholder: "Escribe tu mensaje...", typing: "Aria está escribiendo", escalated: "Conectándote con un agente...", agentName: "Agente de soporte", agentMsg: "¡Hola! Soy Maya de soporte NovaTech. He revisado tu conversación con Aria. ¿En qué puedo ayudarte?", close: "Terminar chat", langLabel: "Idioma", status: "En línea", poweredBy: "Impulsado por NovaTech AI" },
  fr: { placeholder: "Tapez votre message...", typing: "Aria est en train d'écrire", escalated: "Connexion avec un agent...", agentName: "Agent support", agentMsg: "Bonjour ! Je suis Maya du support NovaTech. J'ai lu votre conversation avec Aria. Comment puis-je vous aider ?", close: "Terminer", langLabel: "Langue", status: "En ligne", poweredBy: "Propulsé par NovaTech AI" },
  de: { placeholder: "Nachricht eingeben...", typing: "Aria schreibt", escalated: "Verbindung mit Agent...", agentName: "Support-Agent", agentMsg: "Hallo! Ich bin Maya vom NovaTech-Support. Ich habe Ihr Gespräch mit Aria gesehen. Wie kann ich helfen?", close: "Chat beenden", langLabel: "Sprache", status: "Online", poweredBy: "Powered by NovaTech AI" },
  ja: { placeholder: "メッセージを入力...", typing: "Ariaが入力中", escalated: "担当者に接続中...", agentName: "サポート担当", agentMsg: "こんにちは！NovaTechサポートのMayaです。Ariaとの会話を確認しました。どのようなご用件でしょうか？", close: "チャットを終了", langLabel: "言語", status: "オンライン", poweredBy: "NovaTech AI搭載" },
  ar: { placeholder: "اكتب رسالتك...", typing: "أريا تكتب", escalated: "جارٍ الاتصال بوكيل بشري...", agentName: "وكيل الدعم", agentMsg: "مرحباً! أنا مايا من دعم نوفاتيك. اطلعت على محادثتك مع أريا. كيف يمكنني مساعدتك؟", close: "إنهاء الدردشة", langLabel: "اللغة", status: "متصل", poweredBy: "مدعوم بتقنية NovaTech AI" },
  hi: { placeholder: "अपना संदेश लिखें...", typing: "Aria टाइप कर रही है", escalated: "मानव एजेंट से जोड़ रहे हैं...", agentName: "सहायता एजेंट", agentMsg: "नमस्ते! मैं NovaTech सपोर्ट से Maya हूं। मैंने Aria के साथ आपकी बातचीत देखी। मैं आपकी कैसे सहायता कर सकती हूं?", close: "चैट समाप्त करें", langLabel: "भाषा", status: "ऑनलाइन", poweredBy: "NovaTech AI द्वारा संचालित" },
  zh: { placeholder: "输入您的消息...", typing: "Aria 正在输入", escalated: "正在连接人工客服...", agentName: "客服人员", agentMsg: "您好！我是NovaTech客服Maya。我已查看您与Aria的对话。请问有什么可以帮助您的？", close: "结束对话", langLabel: "语言", status: "在线", poweredBy: "由NovaTech AI提供支持" },
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "6px 2px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#5DCAA5",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}

function Avatar({ agent, size = 32 }) {
  const colors = agent ? ["#1D9E75", "#0F6E56"] : ["#5DCAA5", "#1D9E75"];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, color: "#fff",
      flexShrink: 0, fontFamily: "Georgia, serif",
      boxShadow: "0 2px 8px rgba(29,158,117,0.3)",
    }}>
      {agent ? "M" : "A"}
    </div>
  );
}

function Message({ msg, isRTL }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div style={{ textAlign: "center", margin: "12px 0" }}>
        <span style={{
          fontSize: 11, color: "#888", background: "rgba(255,255,255,0.06)",
          padding: "4px 12px", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.1)",
        }}>{msg.content}</span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", gap: 10, marginBottom: 16,
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "slideIn 0.25s ease-out",
    }}>
      {!isUser && <Avatar agent={msg.agent} />}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {!isUser && (
          <span style={{ fontSize: 11, color: "#5DCAA5", fontWeight: 600, marginBottom: 4, letterSpacing: 0.3 }}>
            {msg.agent ? "Maya · Agent" : "Aria · AI"}
          </span>
        )}
        <div style={{
          padding: "11px 15px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          background: isUser
            ? "linear-gradient(135deg, #1D9E75, #0F6E56)"
            : msg.agent
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.05)",
          border: isUser ? "none" : msg.agent ? "0.5px solid rgba(255,255,255,0.2)" : "0.5px solid rgba(93,202,165,0.2)",
          color: "#f0f0f0",
          fontSize: 13.5,
          lineHeight: 1.65,
          direction: isRTL ? "rtl" : "ltr",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        <span style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{msg.time}</span>
      </div>
      <style>{`@keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

export default function SupportChatbot() {
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionActive, setSessionActive] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const ui = UI_TEXT[lang] || UI_TEXT.en;
  const actions = QUICK_ACTIONS[lang] || QUICK_ACTIONS.en;
  const isRTL = lang === "ar";

  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const greeting = {
      en: "Hello! 👋 I'm **Aria**, your NovaTech AI assistant. I'm here to help with orders, products, troubleshooting, and more. How can I assist you today?",
      es: "¡Hola! 👋 Soy **Aria**, tu asistente de IA de NovaTech. Estoy aquí para ayudarte con pedidos, productos, solución de problemas y más. ¿En qué puedo ayudarte hoy?",
      fr: "Bonjour ! 👋 Je suis **Aria**, votre assistante IA NovaTech. Je suis là pour vous aider avec les commandes, les produits, le dépannage et plus encore. Comment puis-je vous aider ?",
      de: "Hallo! 👋 Ich bin **Aria**, Ihr KI-Assistent von NovaTech. Ich helfe Ihnen bei Bestellungen, Produkten, Fehlerbehebung und mehr. Wie kann ich Ihnen heute helfen?",
      ja: "こんにちは！👋 私は**Aria**、NovaTechのAIアシスタントです。注文、製品、トラブルシューティングなど、何でもお手伝いします。本日はどのようなご用件でしょうか？",
      ar: "مرحباً! 👋 أنا **أريا**، مساعدة الذكاء الاصطناعي لـ NovaTech. أنا هنا للمساعدة في الطلبات والمنتجات واستكشاف الأخطاء والمزيد. كيف يمكنني مساعدتك اليوم؟",
      hi: "नमस्ते! 👋 मैं **Aria** हूं, NovaTech की AI सहायक। मैं ऑर्डर, उत्पाद, समस्या निवारण और अन्य मामलों में आपकी सहायता करने के लिए यहां हूं। आज मैं आपकी कैसे मदद कर सकती हूं?",
      zh: "您好！👋 我是**Aria**，NovaTech的AI助手。我可以帮助您处理订单、产品信息、故障排除等问题。今天我能为您做什么？",
    };
    setMessages([{ role: "assistant", content: greeting[lang] || greeting.en, time: getTime() }]);
    setConversationHistory([]);
    setEscalated(false);
    setSessionActive(true);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const checkEscalation = (text) => {
    const lower = text.toLowerCase();
    return ESCALATION_TRIGGERS.some(t => lower.includes(t));
  };

  const handleEscalate = () => {
    setEscalated(true);
    const connectMsg = { role: "system", content: ui.escalated, time: getTime() };
    setTimeout(() => {
      const agentMsg = { role: "assistant", content: ui.agentMsg, time: getTime(), agent: true };
      setMessages(prev => [...prev, connectMsg, agentMsg]);
    }, 1800);
    setMessages(prev => [...prev, connectMsg]);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !sessionActive) return;
    const userMsg = { role: "user", content: text, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (checkEscalation(text) && !escalated) {
      setTimeout(() => { setIsTyping(false); handleEscalate(); }, 1000);
      return;
    }

    const newHistory = [...conversationHistory, { role: "user", content: text }];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(LANGUAGES.find(l => l.code === lang)?.label || "English"),
          messages: newHistory,
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "";

      let display = raw;
      let shouldEscalate = false;
      const jsonMatch = raw.match(/\{"escalate":\s*true[^}]*\}/);
      if (jsonMatch) {
        display = raw.replace(jsonMatch[0], "").trim();
        shouldEscalate = true;
      }

      const aiMsg = { role: "assistant", content: display, time: getTime() };
      setConversationHistory([...newHistory, { role: "assistant", content: raw }]);
      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);

      if (shouldEscalate && !escalated) {
        setTimeout(() => handleEscalate(), 800);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        time: getTime(),
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <div style={{
      width: "100%", maxWidth: 560, margin: "0 auto",
      fontFamily: "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      height: 680, borderRadius: 20,
      background: "linear-gradient(160deg, #0e1a18 0%, #0b1512 100%)",
      border: "0.5px solid rgba(93,202,165,0.2)",
      boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(93,202,165,0.1)",
      overflow: "hidden", position: "relative",
    }}>

      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(29,158,117,0.08)", borderBottom: "0.5px solid rgba(93,202,165,0.15)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Avatar size={40} />
            <div style={{
              position: "absolute", bottom: 1, right: 1,
              width: 10, height: 10, borderRadius: "50%",
              background: "#1D9E75", border: "2px solid #0b1512",
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#e8f5f0", fontSize: 15, letterSpacing: 0.2 }}>
              {escalated ? ui.agentName : "Aria"}
            </div>
            <div style={{ fontSize: 11, color: "#5DCAA5", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
              {ui.status} · NovaTech Support
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 8, padding: "5px 10px", color: "#ccc", cursor: "pointer",
                fontSize: 12, display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span style={{ fontSize: 14 }}>{currentLang?.flag}</span>
              <span>{currentLang?.label}</span>
              <span style={{ fontSize: 9, opacity: 0.5 }}>▼</span>
            </button>
            {showLangMenu && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 100,
                background: "#1a2e28", border: "0.5px solid rgba(93,202,165,0.25)",
                borderRadius: 10, overflow: "hidden", minWidth: 160,
                boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                    style={{
                      display: "flex", width: "100%", gap: 10, alignItems: "center",
                      padding: "9px 14px", background: l.code === lang ? "rgba(29,158,117,0.2)" : "transparent",
                      border: "none", color: l.code === lang ? "#5DCAA5" : "#aaa",
                      cursor: "pointer", fontSize: 13, transition: "background 0.15s",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseOut={e => e.currentTarget.style.background = l.code === lang ? "rgba(29,158,117,0.2)" : "transparent"}
                  >
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 18px 8px",
        direction: isRTL ? "rtl" : "ltr",
        scrollbarWidth: "thin", scrollbarColor: "rgba(93,202,165,0.15) transparent",
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} isRTL={isRTL} />)}
        {isTyping && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
            <Avatar />
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(93,202,165,0.2)",
              borderRadius: "4px 18px 18px 18px", padding: "8px 14px",
            }}>
              <TypingDots />
            </div>
            <span style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>{ui.typing}...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && !escalated && (
        <div style={{
          padding: "8px 18px", display: "flex", gap: 7, flexWrap: "wrap",
          borderTop: "0.5px solid rgba(255,255,255,0.05)",
          direction: isRTL ? "rtl" : "ltr",
        }}>
          {actions.map((a, i) => (
            <button key={i} onClick={() => sendMessage(a)}
              style={{
                padding: "6px 13px", borderRadius: 20,
                background: "rgba(29,158,117,0.1)", border: "0.5px solid rgba(93,202,165,0.3)",
                color: "#5DCAA5", fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "inherit",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(29,158,117,0.25)"; e.currentTarget.style.borderColor = "#5DCAA5"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(29,158,117,0.1)"; e.currentTarget.style.borderColor = "rgba(93,202,165,0.3)"; }}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <div style={{
        padding: "12px 16px 16px", borderTop: "0.5px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.2)", direction: isRTL ? "rtl" : "ltr",
      }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: "8px 8px 8px 14px", transition: "border-color 0.2s",
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(93,202,165,0.4)"}
          onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sessionActive ? ui.placeholder : "—"}
            disabled={!sessionActive}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#e8f5f0", fontSize: 13.5, lineHeight: 1.5, resize: "none",
              fontFamily: "inherit", minHeight: 22, maxHeight: 88,
              direction: isRTL ? "rtl" : "ltr",
              scrollbarWidth: "none",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || !sessionActive}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : "rgba(255,255,255,0.06)",
              border: "none", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", transform: input.trim() ? "scale(1)" : "scale(0.95)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() ? "#fff" : "#444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#3a5248" }}>
          {ui.poweredBy}
        </div>
      </div>
    </div>
  );
}
