// Личный плагин: мьют сессий, как каналы в Telegram. У заглушённой нет синей точки «новое» (hub.addUnread), нет догадки
// «ответ?» и места в «Новом»; вопросы и запросы разрешения (status waiting) не глушатся — они не отсюда.
// Колокольчик — у строки в списке (при наведении; заглушённой — всегда) и в шапке открытой сессии. Список — в браузере.
const KEY = "hub.mutedSessions";
const NS = "http://www.w3.org/2000/svg";
const BELL = "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z";
const BELL_OFF = "M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z";

const load = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); } };
let muted = load();
const save = () => localStorage.setItem(KEY, JSON.stringify([...muted]));

export default function register(hub) {
  const ru = hub.lang === "ru" || hub.lang === "uk";
  const T = ru
    ? { on: "Заглушить: без «нового» и «ответ?». Вопросы остаются", off: "Заглушена. Вернуть звук" }
    : { on: "Mute: no “new” or “reply?”. Questions still show", off: "Muted. Unmute" };

  const st = document.createElement("style");
  st.textContent = `
.mute-btn { display: inline-grid; place-items: center; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px;
  background: transparent; color: var(--muted-foreground); cursor: pointer; flex: none; justify-self: end; }
.mute-btn svg { width: 14px; height: 14px; fill: currentColor; }
.mute-btn:hover { background: color-mix(in oklch, var(--foreground) 10%, transparent); color: var(--foreground); }
.srow .mute-btn { align-self: start; margin-top: calc((1lh - 22px) / 2); opacity: 0; }
.srow:hover .mute-btn, .srow:focus-within .mute-btn, .srow .mute-btn.on { opacity: .75; }
@media (hover: none) { .srow .mute-btn:not(.on) { display: none; } }
.srow:has(.mute-btn.on):not([aria-current="true"]) .nm { color: var(--muted-foreground); }`;
  document.head.append(st);

  const draw = (root, name) => {
    const on = muted.has(name);
    let b = root.firstChild;
    if (!b) {
      b = document.createElement("span");
      b.setAttribute("role", "button");
      b.tabIndex = 0;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.append(document.createElementNS(NS, "path"));
      b.append(svg);
      const flip = (e) => {
        e.stopPropagation();   // не открывать сессию
        e.preventDefault();
        muted.has(b.dataset.s) ? muted.delete(b.dataset.s) : muted.add(b.dataset.s);
        save();
        hub.redraw();
      };
      b.addEventListener("click", flip);
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") flip(e); });
      root.append(b);
    }
    b.className = "mute-btn" + (on ? " on" : "");
    b.dataset.s = name;
    b.title = on ? T.off : T.on;
    b.setAttribute("aria-label", b.title);
    b.setAttribute("aria-pressed", String(on));
    b.firstChild.firstChild.setAttribute("d", on ? BELL_OFF : BELL);
  };

  hub.addSlot("sidebar.session", { id: "mute", render: (root, snap, ctx) => draw(root, ctx.session.name) });
  hub.addSlot("session.header", { id: "mute", render: (root, snap, ctx) => draw(root, ctx.session.name) });
  // «новое» и «ответ?» заглушённой — нет; остальным — как у ядра (null)
  hub.addUnread((s) => {
    if (!muted.has(s.name)) return null;
    s.attention = null;
    return false;
  });
  addEventListener("storage", (e) => { if (e.key === KEY) { muted = load(); hub.redraw(); } });   // другая вкладка
}
