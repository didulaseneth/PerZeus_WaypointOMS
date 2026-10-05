import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const AI_SUGGESTIONS = ["Where's my latest order?", "Order cutoff time", "Report a delivery issue", "How do I place an order?"];

function buildReply(text, { orders, store, user }) {
  const q = text.toLowerCase();
  const latest = orders[0];
  const deferred = orders.filter((o) => o.status === "Deferred");
  const issues = orders.filter((o) => o.status === "Issue reported");

  if (/^(hi|hello|hey)\b/.test(q))
    return { text: `Hi ${user?.name?.split(" ").pop() || "there"}! I'm Waypoint Assist. I can help with orders, deliveries, and reports for ${store.name}.` };

  if (/(latest|last|recent|track|where).*(order|delivery)|order status|ord\d+/.test(q)) {
    const match = q.match(/ord\d+/i);
    const o = match ? orders.find((x) => x.id.toLowerCase() === match[0]) : latest;
    if (!o) return { text: "I couldn't find that order. Check the ID on the My Orders page." };
    return {
      text: `${o.id} is "${o.status}". It has ${o.items} items (${o.chilled} chilled), for delivery ${o.forDelivery}${o.expectedArrival !== "—" ? `, expected around ${o.expectedArrival}` : ""}.`,
      action: { label: "View My Orders", to: "/sm/orders" },
    };
  }

  if (/defer/.test(q))
    return deferred.length
      ? { text: `You have ${deferred.length} deferred order: ${deferred.map((o) => o.id).join(", ")}. Deferred orders have no arrival time until rescheduled.`, action: { label: "View My Orders", to: "/sm/orders" } }
      : { text: "You have no deferred orders right now." };

  if (/cutoff|cut-off|deadline|last time/.test(q))
    return { text: "Orders for next-day delivery must be placed before the daily cutoff, shown in the header countdown. Orders after that move to the following delivery." };

  if (/(place|make|create|new).*(order)|how.*order/.test(q))
    return { text: "Open Place Order, pick items from the catalogue (chilled and ambient are flagged), set quantities, and submit before the cutoff.", action: { label: "Go to Place Order", to: "/sm/place-order" } };

  if (/issue|damage|missing|wrong|problem|report/.test(q))
    return {
      text: issues.length
        ? `To report a problem, open the delivery on the Receiving page during check-in. You currently have ${issues.length} order with an issue reported (${issues[0].id}).`
        : "To report a problem, open the delivery on the Receiving page during check-in and flag the affected items.",
      action: { label: "Go to Receiving", to: "/sm/receiving" },
    };

  if (/incoming|arriv|eta|truck/.test(q))
    return { text: "Check Incoming Delivery for live ETAs and what's on each truck.", action: { label: "Incoming Delivery", to: "/sm/incoming" } };

  if (/report|analytics|summary/.test(q))
    return { text: "The Reports page summarises your order history and delivery performance.", action: { label: "Open Reports", to: "/sm/reports" } };

  if (/thank/.test(q)) return { text: "You're welcome! Anything else I can help with?" };

  return { text: "I'm a demo assistant, so I only know a few topics: order status, cutoff times, placing orders, incoming deliveries, and reporting issues. Try one of those!" };
}

const LIVE_SUGGESTIONS = ["Talk to dispatch", "Question about an invoice", "Change a delivery slot"];

const Icon = {
  ai: (c = "w-5 h-5") => (
    <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="11" rx="3" /><path strokeLinecap="round" d="M12 4v4M9 13h.01M15 13h.01M9.5 16.2c1.4.8 3.6.8 5 0" /></svg>
  ),
  chat: (c = "w-5 h-5") => (
    <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12a9 9 0 01-13.3 7.9L3 21l1.2-4.5A9 9 0 1121 12z" /></svg>
  ),
  close: (c = "w-5 h-5") => (
    <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  back: (c = "w-5 h-5") => (
    <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" /></svg>
  ),
  send: (c = "w-5 h-5") => (
    <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M3 20l18-8L3 4v6l12 2-12 2v6z" /></svg>
  ),
};

function ChatPanel({ title, subtitle, avatar, messages, typing, suggestions, onSend, onBack, onClose, navigate }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const submit = (t) => {
    if (!t.trim() || typing) return;
    onSend(t.trim());
    setInput("");
  };

  return (
    <div className="w-[360px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[calc(100vh-8rem)] bg-whiteCustom rounded-2xl shadow-xl border border-gray2 flex flex-col overflow-hidden">
      <div className="bg-purplePrimary text-whiteCustom px-3 py-3 flex items-center gap-2">
        <button onClick={onBack} aria-label="Back" className="p-1 rounded hover:bg-whiteCustom/20">{Icon.back()}</button>
        <div className="w-9 h-9 rounded-full bg-whiteCustom/20 flex items-center justify-center">{avatar}</div>
        <div className="flex-1 leading-tight">
          <p className="text-secondaryText font-medium">{title}</p>
          <p className="text-smallText opacity-80">{subtitle}</p>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="p-1 rounded hover:bg-whiteCustom/20">{Icon.close()}</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              <div className={`px-3.5 py-2 rounded-2xl text-secondaryText ${m.from === "user" ? "bg-purplePrimary text-whiteCustom rounded-br-sm" : "bg-whiteCustom text-blackCustom rounded-bl-sm shadow-sm"}`}>
                {m.text}
              </div>
              {m.action && (
                <button onClick={() => { navigate(m.action.to); onClose(); }} className="mt-1.5 text-smallText font-medium text-purplePrimary bg-neutral1 hover:bg-neutral2 px-3 py-1 rounded-full transition-colors">
                  {m.action.label} →
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-whiteCustom shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 bg-gray5 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        {messages.length === 1 && !typing && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button key={s} onClick={() => submit(s)} className="text-smallText text-purplePrimary bg-whiteCustom border border-neutral3 hover:bg-neutral1 px-3 py-1.5 rounded-full transition-colors">{s}</button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-whiteCustom border-t border-gray2 flex items-center gap-2">
        <input className="input-field !py-2 !text-secondaryText" placeholder="Type a message..." value={input}
          onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit(input)} />
        <button onClick={() => submit(input)} disabled={!input.trim() || typing} aria-label="Send"
          className="w-10 h-10 shrink-0 rounded-lg bg-purplePrimary text-whiteCustom hover:bg-neutral5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
          {Icon.send()}
        </button>
      </div>
    </div>
  );
}

function MenuButton({ label, onClick, className, children }) {
  return (
    <div className="relative group">
      <button onClick={onClick} aria-label={label}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${className}`}>
        {children}
      </button>
      <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-blackCustom text-whiteCustom text-smallText px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </div>
  );
}

const LIVE_REPLIES = [
  "Thanks for reaching out! I'm Nimali from the Waypoint support team. Let me take a look.",
  "Got it. I've noted that down and will check with dispatch. Anything else I can help with?",
  "This is a demo chat, so a real agent isn't connected. In production, your message would reach our support team here.",
];

export default function ChatBot() {
  const app = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState("closed"); // closed | menu | ai | live
  const [typing, setTyping] = useState(false);
  const [aiMsgs, setAiMsgs] = useState([{ from: "bot", text: "Hi! I'm Waypoint Assist (demo). Ask me about your orders or deliveries." }]);
  const [liveMsgs, setLiveMsgs] = useState([{ from: "bot", text: `Hi! You're chatting with Waypoint Support for ${app.store.name}. How can we help?` }]);
  const timer = useRef(null);
  const liveIdx = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const reply = (setter, makeReply) => (text) => {
    setter((m) => [...m, { from: "user", text }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setter((m) => [...m, { from: "bot", ...makeReply(text) }]);
      setTyping(false);
    }, 800);
  };

  const sendAi = reply(setAiMsgs, (t) => buildReply(t, app));
  const sendLive = reply(setLiveMsgs, () => ({ text: LIVE_REPLIES[Math.min(liveIdx.current++, LIVE_REPLIES.length - 1)] }));

  const close = () => setView("closed");
  const goMenu = () => { setView("menu"); };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {view === "ai" && (
        <ChatPanel title="Waypoint Assist" subtitle="AI assistant · demo" avatar={Icon.ai()} messages={aiMsgs} typing={typing}
          suggestions={AI_SUGGESTIONS} onSend={sendAi} onBack={goMenu} onClose={close} navigate={navigate} />
      )}
      {view === "live" && (
        <ChatPanel title="Waypoint Support" subtitle="Typically replies in a few minutes" avatar={Icon.chat()} messages={liveMsgs} typing={typing}
          suggestions={LIVE_SUGGESTIONS} onSend={sendLive} onBack={goMenu} onClose={close} navigate={navigate} />
      )}

      {view === "menu" ? (
        <div className="bg-whiteCustom rounded-full shadow-xl border border-gray2 p-1.5 flex flex-col gap-2 animate-[popIn_.15s_ease-out]">
          <MenuButton label="AI chat assistant" onClick={() => setView("ai")} className="bg-neutral1 text-purplePrimary">{Icon.ai("w-6 h-6")}</MenuButton>
          <MenuButton label="Chat with support" onClick={() => setView("live")} className="bg-secondaryGreen text-blackCustom">{Icon.chat("w-6 h-6")}</MenuButton>
          <MenuButton label="Close" onClick={close} className="bg-neutral2 text-purplePrimary">{Icon.close("w-5 h-5")}</MenuButton>
        </div>
      ) : (
        <button
          onClick={() => setView(view === "closed" ? "menu" : "closed")}
          aria-label={view === "closed" ? "Open chat menu" : "Close chat"}
          className="w-12 h-12 rounded-full bg-whiteCustom text-purplePrimary shadow-lg border border-gray2 hover:bg-neutral1 transition-colors flex items-center justify-center"
        >
          {view === "closed" ? Icon.chat("w-6 h-6") : Icon.close("w-5 h-5")}
        </button>
      )}
    </div>
  );
}
