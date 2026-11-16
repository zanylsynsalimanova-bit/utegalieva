/* Content data + scroll choreography for HTML layer (works with or without WebGL) */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const D = "assets/docs/", S = "assets/students/";

  /* ---------- ALL results from the teacher's Drive folder, ordered by level:
     халықаралық → республикалық → облыстық → қалалық (school-level letters and duplicates left out) ---------- */
  // [level, year, name (empty = name not verified), text, badge, file]
  const STUDENTS = [
    ["Республикалық", "2025 · 11-сынып", "Батырғалиева Айсұлу", "«SAPSAN» жалпы пәндік олимпиадасының ІІІ республикалық кезеңі, химия", "І дәреже", "2025-batyrgalieva-sapsan-resp-1"],
    ["Республикалық", "2024", "Шалабай Әдемі", "«Ақбота-2024» зияткерлік олимпиадасы, химия", "І орын", "2024-shalabai-aqbota-1"],
    ["Республикалық", "2025 · 8-сынып", "Жүзжасар Назым", "«Ақбота» зияткерлік олимпиадасы («Дарын» РҒПО)", "ІІІ дәреже", "2025-zhuzzhasar-aqbota-3"],
    ["Республикалық", "2025 · 9-сынып", "Ізбағанбет Ералы", "«Ақбота» зияткерлік олимпиадасы («Дарын» РҒПО)", "ІІІ дәреже", "2025-izbaganbet-aqbota-3"],
    ["Облыстық", "2026", "Аюп Айару", "«Абай» пәндік олимпиадасының облыстық кезеңі, химия", "І дәреже", "2026-ayup-abai-oblys-1"],
    ["Облыстық", "2025", "Алиев Жасұлан", "«Зерде» ғылыми жобалар байқауының облыстық кезеңі, химия-биология", "ІІІ дәреже", "2025-aliev-zerde-oblys-3"],
    ["Қалалық", "2025–2026", "Аюп Айару", "«Абай» пәндік олимпиадасының қалалық кезеңі, химия", "І дәреже", "2026-ayup-abai-qala-1"],
    ["Қалалық", "2025 · 6-сынып", "Алиев Жасұлан", "«Зерде» байқауының қалалық кезеңі, химия-биология", "І дәреже", "2025-aliev-zerde-qala-1"],
    ["Қалалық", "2024–2025", "Батырғалиева Айсұлу", "Республикалық олимпиаданың қалалық кезеңі, химия", "І дәреже", "2025-batyrgalieva-olimp-qala-1"],
    ["Қалалық", "2023", "Батырғалиева Айсұлу", "«Абай» пәндік олимпиадасының қалалық кезеңі, химия", "І дәреже", "2023-batyrgalieva-abai-qala-1"],
    ["Қалалық", "2021–2022 · 9-сынып", "Бесқалиева Жұлдыз", "Республикалық олимпиаданың ІІ (қалалық) кезеңі, химия", "І дәреже", "2022-beskalieva-resp-olimp-qala-1"],
    ["Қалалық", "2023–2024 · 10-сынып", "Батырғалиева Айсұлу", "Республикалық олимпиаданың қалалық кезеңі, химия", "ІІ дәреже", "2024-batyrgalieva-olimp-qala-2"],
    ["Қалалық", "2022–2023 · 9-сынып", "Батырғалиева Айсұлу", "Республикалық олимпиаданың қалалық кезеңі, химия", "ІІ дәреже", "2023-batyrgalieva-olimp-qala-2"],
    ["Қалалық", "2023", "Ұлықпан Ардақ", "«Абай» пәндік олимпиадасының қалалық кезеңі, химия", "ІІ дәреже", "2023-ulyqpan-abai-qala-2"],
    ["Қалалық", "2024–2025", "Ұлықпан Ардақ", "Республикалық олимпиаданың қалалық кезеңі, химия", "ІІІ дәреже", "2025-ulyqpan-olimp-qala-3"],
    ["Қалалық", "2022 · 7–8-сынып", "Батырғалиева Айсұлу", "Республикалық жасөспірімдер олимпиадасының І (қалалық) кезеңі, химия", "ІІІ дәреже", "2022-batyrgalieva-zhasospirim-qala-3"],
    ["Қалалық", "2023–2024 · 9-сынып", "Ұлықпан Ардақ", "Республикалық олимпиаданың қалалық кезеңі, химия", "Грамота", "2024-ulyqpan-olimp-qala-gramota"],
    ["Қалалық", "2022–2023 · 11-сынып", "", "Республикалық олимпиаданың қалалық кезеңі, химия", "Грамота", "2023-olimp-qala-11-synyp-gramota"],
    ["Қалалық", "2025 · 9-сынып", "", "«Bilim Qazyna» қалалық олимпиадасы, химия", "Алғыс хат", "2025-bilim-qazyna-qala-9-synyp"],
    ["Қалалық", "2023", "Есенғали Мөлдір", "«Абай» пәндік олимпиадасының қалалық кезеңі, химия", "Сертификат", "2023-esengali-abai-qala-sert"]
  ];
  const DOCS = {};
  STUDENTS.forEach((s, i) => { DOCS["st" + (i + 1)] = { t: `${s[1]} · ${s[2] ? s[2] + " — " : ""}${s[3]}, ${s[4]}`, p: [S + s[5] + ".jpg"] }; });
  $("#gallery").innerHTML = STUDENTS.map((s, i) => `<li><button class="doc" data-doc="st${i + 1}"><span class="glass"><img src="${S + s[5]}.jpg" alt="" loading="lazy"></span>
    <span class="meta"><em>${s[0]} · ${s[1]}</em>${s[2] ? `<strong>${s[2]}</strong>` : ""}${s[3]}<b class="badge">${s[4]}</b></span></button></li>`).join("");

  // teacher: [year, level · proof, title, text, files, page names]
  const TL = [
    ["2025", "Халықаралық · сертификат", "Халықаралық конференциядағы мақала", "«ОЗАТ БІЛІМ» журналының халықаралық тамыз конференциясы: «Химия пәнін оқытуда АКТ пайдаланудың тиімділігі» мақаласы жарияланды.", ["2025-ozat-bilim-maqala-sert"]],
    ["2023", "Республикалық · диплом", "«PedOlimp» республикалық педагогикалық олимпиадасы", "ІІІ Республикалық пәндік педагогикалық олимпиаданың жеңімпазы, химия — І дәреже.", ["2023-pedolimp-1-dareje"]],
    ["2025", "Республикалық семинар · диплом", "«Өрлеу» педагогикалық олимпиадасы", "«Жаратылыстану бағыты олимпиадаларына дайындық кезінде математикалық аппаратты қолдану» республикалық семинары аясындағы олимпиадада І орын.", ["2025-orleu-ped-olimp-1-oryn"]],
    ["2023", "Республикалық · сертификат", "«PedOlimp» ІІ республикалық олимпиадасы", "ІІ Республикалық пәндік педагогикалық олимпиадаға қатысып, кәсіби белсенділік танытқаны үшін сертификат.", ["2023-pedolimp-2-sertifikat"]],
    ["2026", "Облыстық · диплом", "Облыстық онлайн олимпиада: химия және ЖИ", "Химия пәнінен жасанды интеллект құралдарын тиімді, қауіпсіз және кәсіби қолдану құзыреттілігін бағалауға арналған олимпиадада І дәреже.", ["2026-ZhI-olimp-1-dareje"]],
    ["2025", "Облыстық · диплом", "Облыстық пәндік олимпиада", "Химия пәні мұғалімдері арасында өткен облыстық пәндік олимпиадада ІІ орын.", ["2025-oblys-olimp-2-oryn"]],
    ["2024", "Облыстық · алғыс хат", "Облыстық пәндік олимпиада", "Химия пәні мұғалімдері арасында өткен облыстық пәндік олимпиадада белсенділік танытқаны үшін.", ["2024-oblys-olimp-algys"]],
    ["2025", "Облыстық · хаттама", "«Физика және химия әлемі» авторлық бағдарламасы", "7-сыныпқа арналған факультативтік курс. «Өрлеу» Ақтөбе облысы бойынша КДИ оқу-әдістемелік кеңесі баспаға ұсынды; екі оң пікір бар.", ["2025-avtorlyq-bagdarlama-hattama", "2025-avtorlyq-bagdarlama-muqaba", "2025-avtorlyq-bagdarlama-pikir"], ["Кеңес хаттамасы", "Мұқаба", "Пікір"]],
    ["2026", "Облыстық · алғыс хат", "Облыстық семинар-практикум", "«Химиялық және биологиялық процестерді модельдеу негізіндегі функционалдық сауаттылық» облыстық семинарында іс-тәжірибемен бөлісті.", ["2026-oblys-seminar-algys", "2026-oblys-seminar-bagdarlama"], ["Алғыс хат", "Бағдарлама"]],
    ["2022", "Қалалық · диплом", "«Үздік сабақ-2022» қалалық байқауы", "Қалалық сырттай шығармашылық байқауда ІІІ орын.", ["2022-uzdik-sabaq-3-oryn"]],
    ["2024", "Қалалық · алғыс хат", "Ақтөбе қаласының білім бөлімі", "Оқушының шығармашылық әлеуетін дамытудағы үлесі және 2023–2024 оқу жылының қорытындысы бойынша алғыс хат.", ["2024-qala-bilim-algys-oqu-zhyly"]],
    ["2024", "Қалалық · алғыс хат", "Ақтөбе қаласының білім бөлімі", "Мұғалімдер күніне орай, жас ұрпақты оқыту мен тәрбиелеу ісіндегі еңбегі үшін алғыс хат.", ["2024-qala-bilim-algys-mugalim-kuni"]],
    ["2026", "Қалалық · сертификат", "Қалалық шебер-класс", "«Жаратылыстану пәндерінде цифрлық технологияларды біріктіріп оқыту» қалалық шебер-класына қатысты.", ["2026-qala-sheber-klass-sertifikat"]]
  ];
  TL.forEach((x, i) => { DOCS["g" + (i + 1)] = { t: `${x[0]} · ${x[2]}`, p: x[4].map(f => D + f + ".jpg"), n: x[5] }; });
  $("#timeline").innerHTML = TL.map((x, i) => `<li id="tl-${i}" role="tabpanel" aria-labelledby="yr-${i}">
    <div class="tl-year" aria-hidden="true">${x[0]}</div><span class="tl-kind">${x[1]}</span><h3>${x[0]} · ${x[2]}</h3><p>${x[3]}</p>
    <button class="btn ghost" type="button" data-doc="g${i + 1}">Құжатты ашу <b aria-hidden="true">↗</b></button></li>`).join("");
  $("#years").innerHTML = TL.map((x, i) => `<button type="button" role="tab" id="yr-${i}" aria-controls="tl-${i}" aria-selected="false" aria-label="${x[0]} · ${x[2]}">${x[0]}</button>`).join("");
  window.TL_YEARS = TL.map(x => x[0]);    // read by scene3d.js for the light-line nodes

  /* ---------- document viewer (native <dialog>: Esc closes, focus returns) ---------- */
  const dlg = $("#viewer"), img = $("#viewer-img");
  let opener = null;
  function openDoc(id, from) {
    const d = DOCS[id]; if (!d) return; opener = from || document.activeElement;
    $("#viewer-title").textContent = d.t; img.alt = d.t;
    const show = k => { img.src = d.p[k]; $$("#viewer-pages button").forEach((b, j) => b.setAttribute("aria-pressed", j === k)); };
    $("#viewer-pages").innerHTML = d.p.length > 1 ? d.p.map((_, k) => `<button type="button">${(d.n && d.n[k]) || "Бет " + (k + 1)}</button>`).join("") : "";
    $$("#viewer-pages button").forEach((b, k) => b.onclick = () => show(k));
    $("#viewer-note").textContent = "Түпнұсқа құжаттың көшірмесі";
    show(0);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    $(".v-close", dlg).focus();
  }
  dlg.addEventListener("close", () => { if (opener && opener.focus) opener.focus({ preventScroll: true }); });
  $(".v-close", dlg).onclick = () => dlg.close();
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  document.addEventListener("click", e => { const b = e.target.closest("[data-doc]"); if (b) openDoc(b.dataset.doc, b); });

  /* ---------- scroll model ---------- */
  const scenes = $$(".scene"), isStatic = () => root.classList.contains("static");
  let tops = [], spans = [], vh = innerHeight, lastW = innerWidth;
  function layout() {
    vh = innerHeight;
    scenes.forEach(s => s.style.height = isStatic() ? "" : Math.round(vh * (+s.dataset.h) / 100) + "px");
    tops = scenes.map(s => s.offsetTop); spans = scenes.map(s => Math.max(1, s.offsetHeight - vh));
  }
  function getG() {
    if (window.__forceG != null) return window.__forceG;   // test hook
    const y = scrollY; let i = 0;
    for (let k = 0; k < scenes.length; k++) if (y >= tops[k] - 1) i = k;
    return i + Math.min(1, Math.max(0, (y - tops[i]) / spans[i]));
  }
  window.portfolio = { getG, isStatic, layout: () => layout() };
  addEventListener("resize", () => { if (Math.abs(innerWidth - lastW) > 40 || Math.abs(innerHeight - vh) > 140) { lastW = innerWidth; layout(); } });
  layout();

  /* nav: jump to the reading point of each chapter */
  const READ = [0, .3, .3, .45, .1, .55];
  $$("[data-go]").forEach(a => a.addEventListener("click", e => {
    if (isStatic()) return; e.preventDefault();
    const i = +a.dataset.go; scrollTo({ top: tops[i] + spans[i] * READ[i], behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (i > 0) setTimeout(() => { const h = scenes[i].querySelector("h2"); h && h.setAttribute("tabindex", "-1"); h && h.focus({ preventScroll: true }); }, 900);
  }));
  /* years → timeline position */
  $$("#years button").forEach((b, i) => b.onclick = () => scrollTo({ top: tops[4] + spans[4] * (.1 + .8 * (i + .5) / TL.length), behavior: "smooth" }));
  /* keyboard focus on hidden timeline item → bring it into view */
  $("#timeline").addEventListener("focusin", e => { const li = e.target.closest("li"); if (!li || isStatic()) return; const i = +li.id.split("-")[1];
    scrollTo({ top: tops[4] + spans[4] * (.1 + .8 * (i + .5) / TL.length) }); });

  /* ---------- hero lab layer: zoom into the painted flask, teacher slides aside in depth ---------- */
  const lab = $("#lab"), bg = $("#lab .lab-bg"), teacher = $("#lab .lab-teacher"), glowL = $("#lab .lab-glow");
  const FLASK = [.543, .79];          // neck of the flask in the background image (normalised)
  let flaskPx = [0, 0];
  function layoutLab() {
    const W = innerWidth, H = innerHeight, iw = 1672, ih = 941, fx = W < 820 ? .6 : .5;
    const s = Math.max(W / iw, H / ih), w = iw * s, h = ih * s, left = Math.min(0, Math.max(W - w, W / 2 - fx * w)), top = (H - h) / 2;
    Object.assign(bg.style, { width: w + "px", height: h + "px", left: left + "px", top: top + "px", objectFit: "fill" });
    bg.style.transformOrigin = `${FLASK[0] * w}px ${FLASK[1] * h}px`;
  }
  addEventListener("resize", layoutLab); layoutLab();
  function labFrame(G) {
    const show = G < .93 || G > 5.0; lab.style.visibility = show ? "visible" : "hidden"; if (!show) return;
    const W = innerWidth, H = innerHeight;
    let z, tx, tp, to;                                   // zoom, pull-to-centre, teacher progress, teacher opacity
    if (G < 1) { z = sm(.04, .9, G); tp = sm(0, .62, G); to = 1 - sm(.3, .62, G); }
    else { const f = sm(5.02, 5.55, G); z = (1 - f) * .45; tp = (1 - f) * .6; to = f; }
    const s = 1 + Math.pow(z, 1.6) * 7, k = Math.min(1, z * 1.15);
    tx = (W / 2 - flaskPx[0]) * k; const ty = (H * .5 - flaskPx[1]) * k;
    bg.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    teacher.style.transform = `translate3d(${(tp * W * .38).toFixed(1)}px,${(tp * H * .06).toFixed(1)}px,0) scale(${(1 + tp * .35).toFixed(3)})`;
    teacher.style.opacity = to.toFixed(3); glowL.style.opacity = (1 - z).toFixed(3);
  }

  const sm = (a, b, v) => { const x = Math.min(1, Math.max(0, (v - a) / (b - a))); return x * x * (3 - 2 * x); };
  const panels = scenes.map(s => s.querySelector(".panel"));
  const links = $$(".nav ul a"), steps = $$("[data-steps] li"), late = $("[data-late]"), cards = $$("#gallery .doc"), tls = $$("#timeline li"), yrs = $$("#years button");
  let lastK = -1, lastT = -1;

  function frame() {
    if (!isStatic()) {
      const G = (window.__G3 != null ? window.__G3 : getG()), k = Math.min(scenes.length - 1, Math.floor(G)), u = G - k;
      panels.forEach((p, i) => {
        let op = 0, y = 0;
        if (i === k) {
          if (i === 0) { op = 1 - sm(.05, .32, u); y = -u * 160; }
          else { const a = sm(.03, .13, u), b = i === scenes.length - 1 ? 1 : 1 - sm(.86, .97, u); op = a * b; y = (1 - a) * 34 - (1 - b) * 34; }
        }
        p.style.opacity = op.toFixed(3); p.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
        p.style.visibility = op < .01 ? "hidden" : "visible";
      });
      labFrame(G);
      const hint = $(".scroll-hint"); if (hint) hint.style.opacity = k === 0 ? (1 - sm(.0, .08, u)).toFixed(2) : 0;
      if (k === 2) { steps.forEach((s, j) => s.classList.toggle("on", u > .2 + j * .12)); late.style.opacity = sm(.62, .72, u); }
      if (k === 3 && innerWidth > 820) {
        const gal = $("#gallery");
        if (cards.length > 3) {          // long gallery: scroll drives a horizontal pass, the card nearest the centre straightens
          const max = Math.max(0, gal.scrollWidth - gal.clientWidth);
          gal.style.transform = `translate3d(${(-max * sm(.12, .86, u)).toFixed(1)}px,0,0)`;
          const mid = innerWidth / 2;
          cards.forEach(c => { const r = c.getBoundingClientRect(), d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / (innerWidth * .5)));
            c.style.transform = `rotateY(${(-d * 26).toFixed(1)}deg) rotateX(${(Math.abs(d) * 8).toFixed(1)}deg) translateZ(${((1 - Math.abs(d)) * 40 - 30).toFixed(0)}px)`; });
        } else cards.forEach((c, j) => {
          const f = 1 - Math.min(1, Math.abs(u - (.3 + j * .2)) / .26), side = j - 1;
          c.style.transform = `rotateY(${((1 - f) * (side ? -side * 24 : 0)).toFixed(1)}deg) rotateX(${((1 - f) * 10).toFixed(1)}deg) translateZ(${(f * 40 - 30).toFixed(0)}px)`;
        });
      }
      if (k === 4) { const t = Math.min(TL.length - 1, Math.max(0, Math.floor(sm(.08, .92, u) * TL.length - 1e-6)));
        if (t !== lastT) { tls.forEach((l, j) => { l.classList.toggle("on", j === t); l.setAttribute("aria-hidden", j !== t); }); yrs.forEach((b, j) => b.setAttribute("aria-selected", j === t)); lastT = t; } }
      if (k !== lastK) { links.forEach(a => a.setAttribute("aria-current", +a.dataset.go === k ? "true" : "false")); lastK = k; }
      $("#bar").style.width = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100).toFixed(2) + "%";
    }
    requestAnimationFrame(frame);
  }
  if (isStatic()) { tls.forEach(l => l.classList.add("on")); }
  requestAnimationFrame(frame);
  window.portfolio.toStatic = () => { root.classList.add("static"); layout(); tls.forEach(l => { l.classList.add("on"); l.removeAttribute("aria-hidden"); }); $$(".panel").forEach(p => { p.style.cssText = ""; }); };
})();
