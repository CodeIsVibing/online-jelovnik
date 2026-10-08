/* Imunomania · onlajn jelovnik */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const STORE_KEY = "imunomania.ostava.v1";
  const FAV_KEY   = "imunomania.omiljena.v1";
  const MADE_KEY  = "imunomania.pravio.v1";
  const PLAN_KEY  = "imunomania.plan.v1";
  const AVOID_KEY = "imunomania.nejedem.v1";
  const SHOP_KEY  = "imunomania.kupljeno.v1";

  // isti dani i obroci kao u planovima ishrane iz knjige 2
  const DAYS = [["pon", "Ponedeljak"], ["uto", "Utorak"], ["sre", "Sreda"], ["cet", "Četvrtak"],
                ["pet", "Petak"], ["sub", "Subota"], ["ned", "Nedelja"]];
  const MEALS = [["dorucak", "Doručak"], ["uzina", "Užina"], ["rucak", "Ručak"], ["vecera", "Večera"]];
  const dayLabel  = k => DAYS.find(d => d[0] === k)?.[1] || k;
  const mealLabel = k => MEALS.find(m => m[0] === k)?.[1] || k;

  // jedinice u spisku za kupovinu: jednina, 2 do 4, pet i više
  const UNIT_FORMS = {
    "komad": ["kom", "kom", "kom"],
    "supena kašika": ["supena kašika", "supene kašike", "supenih kašika"],
    "kašičica": ["kašičica", "kašičice", "kašičica"],
    "šaka": ["šaka", "šake", "šaka"],
    "čen": ["čen", "čena", "čenova"],
    "glavica": ["glavica", "glavice", "glavica"],
    "kockica": ["kockica", "kockice", "kockica"],
    "list": ["list", "lista", "listova"],
    "konzerva": ["konzerva", "konzerve", "konzervi"],
    "cvet": ["cvet", "cveta", "cvetova"],
    "vezica": ["vezica", "vezice", "vezica"],
    "tegla": ["tegla", "tegle", "tegli"],
    "svežanj": ["svežanj", "svežnja", "svežnjeva"],
    "kolut": ["kolut", "koluta", "kolutova"],
    "koren": ["koren", "korena", "korenova"],
    "štap": ["štap", "štapa", "štapova"],
  };

  const GROUP_LABELS = {
    povrce:    "Povrće",
    voce:      "Voće",
    zitarice:  "Žitarice, brašna i testenine",
    mahunarke: "Mahunarke i tofu",
    orasasti:  "Orašasti plodovi",
    semenke:   "Semenke",
    mlecno:    "Mlečno",
    "biljna-mleka": "Biljna mleka",
    jaja:      "Jaja",
    "meso-riba": "Meso i riba",
    masti:     "Masti i ulja",
    namazi:    "Puteri i namazi",
    zasladjivaci: "Zaslađivači",
    dodaci:    "Proteini u prahu i dodaci",
    pecenje:   "Za pečenje i zgušnjavanje",
    sosevi:    "Sirće, sosevi i bujon",
    zacini:    "Začini, bilje i čajevi",
    ostalo:    "Ostalo",
  };
  const GROUP_ORDER = Object.keys(GROUP_LABELS);

  const TAGS = [
    { id: "bez-glutena",          label: "Bez glutena",        icon: "ic-gluten" },
    { id: "vegetarijansko",       label: "Vegetarijansko",     icon: "ic-veg" },
    { id: "vegan",                label: "Vegan",              icon: "ic-vegan" },
    { id: "priprema-vece-ranije", label: "Priprema veče pre",  icon: "ic-moon" },
    { id: "ljuto",                label: "Ljuto",              icon: "ic-chili" },
    { id: "bez-secera",           label: "Bez šećera",         icon: "ic-nosugar" },
    { id: "bez-belog-brasna",     label: "Bez belog brašna",   icon: "ic-noflour" },
    { id: "bez-kvasca",           label: "Bez kvasca",         icon: "ic-noyeast" },
    { id: "sirovo",               label: "Sirovo",             icon: "ic-raw" },
  ];

  const state = {
    view: "jela",
    q: "",
    titleOnly: false,        // pretraga samo po nazivu jela
    book: null,
    cat: null,
    tags: new Set(),
    ing: null,
    pantry: new Set(loadPantry()),
    favs: new Set(loadSet(FAV_KEY)),
    made: new Set(loadSet(MADE_KEY)),
    plan: loadSet(PLAN_KEY),          // [{ id, day, meal }]
    avoid: new Set(loadSet(AVOID_KEY)),
    bought: new Set(loadSet(SHOP_KEY)),
    avoidQuery: "",
    favOnly: false,          // prikaži samo omiljena
    madeMode: null,          // null, "samo" ili "sakrij"
    showAllIngredients: false,
    ingQuery: "",
    page: 1,
  };

  const PAGE_SIZE = 15;   // koliko kartica staje na jednu stranu
  const PAGE_MIN  = 27;   // do ovog broja se sve prikazuje odjednom

  let RECIPES = [], INGREDIENTS = [], CATEGORIES = [], BOOKS = [];
  let currentId = null;
  let recById = new Map();
  let servings = null;          // porcije u otvorenom popupu
  let lastDay = "pon";
  let ingById = new Map(), catById = new Map(), bookById = new Map(), basicIds = new Set();

  /* ---------------- pomoćne ---------------- */

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // "Šampinjoni" i "sampinjoni" moraju da se nađu istom pretragom
  const norm = s => String(s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/ć/g, "c").replace(/č/g, "c")
    .replace(/š/g, "s").replace(/ž/g, "z");

  // omiljena jela i ona koja je korisnik već pravio žive u njegovom browseru
  function loadSet(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }
  function saveSet(key, set) {
    try { localStorage.setItem(key, JSON.stringify([...set])); }
    catch { /* privatni prozor */ }
  }

  function loadPantry() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch { return []; }
  }
  function savePantry() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...state.pantry])); }
    catch { /* privatni prozor, ostava živi samo do osvežavanja */ }
  }

  // svetle boje poglavlja traže tamno slovo kad je čip aktivan
  const isLight = hex => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 150;
  };

  const timeLabel = r => r.timeNote || (r.timeMinutes ? `${r.timeMinutes} min` : "");

  // sastojci koje korisnik mora da ima: bez opcionih i bez podrazumevanih
  function requiredRefs(r) {
    const out = new Set();
    for (const it of r.ingredients) {
      if (it.optional || basicIds.has(it.ref)) continue;
      out.add(it.ref);
    }
    return [...out];
  }

  function buildIndex(r) {
    const parts = [r.title, r.subtitle, catById.get(r.category)?.title,
                   bookById.get(r.book)?.title, r.method];
    for (const it of r.ingredients) {
      parts.push(it.raw, ingById.get(it.ref)?.title);
      const al = ingById.get(it.ref)?.aliases;
      if (al) parts.push(al.join(" "));
    }
    parts.push(...(r.notes || []), ...(r.tips || []));
    return norm(parts.filter(Boolean).join(" "));
  }

  // jela iz izabrane knjige; i čipovi poglavlja broje samo njih
  const inBook = r => !state.book || r.book === state.book;

  /* ---------------- filtriranje ---------------- */

  function filtered() {
    const q = norm(state.q).trim();
    const words = q ? q.split(/\s+/) : [];
    return RECIPES.filter(r => {
      if (!inBook(r)) return false;
      if (state.cat && r.category !== state.cat) return false;
      for (const t of state.tags) if (!r.tags.includes(t)) return false;
      if (state.ing && !r.ingredients.some(i => i.ref === state.ing)) return false;
      if (state.avoid.size && r.ingredients.some(i => !i.optional && state.avoid.has(i.ref))) return false;
      if (state.favOnly && !state.favs.has(r.id)) return false;
      if (state.madeMode === "samo"   && !state.made.has(r.id)) return false;
      if (state.madeMode === "sakrij" &&  state.made.has(r.id)) return false;
      const hay = state.titleOnly ? r._title : r._idx;
      for (const w of words) if (!hay.includes(w)) return false;
      return true;
    });
  }

  function bucketize(list) {
    const pantry = state.pantry;
    const cooking = [[], [], [], []];  // fali 0, 1, 2, više
    const tips = [];                   // saveti nemaju sastojke, ne ulaze u rangiranje
    for (const r of list) {
      if (r.type === "savet") { tips.push({ r, miss: [] }); continue; }
      const req = requiredRefs(r);
      const miss = req.filter(x => !pantry.has(x));
      cooking[Math.min(miss.length, 3)].push({ r, miss, total: req.length });
    }
    for (const b of cooking) {
      b.sort((a, c) => (a.miss.length - c.miss.length) || (a.total - c.total) ||
        a.r.title.localeCompare(c.r.title, "sr"));
    }
    return { ok: cooking[0], m1: cooking[1], m2: cooking[2], more: cooking[3], tips };
  }

  /* ---------------- prikaz ---------------- */

  function badges(r) {
    return TAGS.filter(t => r.tags.includes(t.id))
      .map(t => `<span title="${esc(t.label)}"><svg aria-hidden="true"><use href="#${t.icon}"/></svg></span>`)
      .join("");
  }

  // i dolazi iz Array.map i pravi stepenasti ulaz kartica; kapiran da duga lista ne čeka
  function card(entry, i = 0) {
    const r = entry.r ?? entry;
    const cat = catById.get(r.category);
    const t = timeLabel(r);
    const miss = entry.miss || [];
    const fav = state.favs.has(r.id), made = state.made.has(r.id);
    return `
      <div class="card-wrap" style="--c:${esc(cat.color)};--i:${Math.min(i, 14)}">
      <button class="card${fav ? " is-fav" : ""}${made ? " is-made" : ""}" data-id="${esc(r.id)}" type="button">
        <span class="book">${esc(bookById.get(r.book)?.short || "")}</span>
        <span class="cat">${esc(cat.title)}</span>
        <h3>${esc(r.title)}</h3>
        <span class="meta">
          ${t ? `<span class="t"><svg aria-hidden="true"><use href="#ic-clock"/></svg>${esc(t)}</span>` : ""}
          ${r.tags.length ? `<span class="badges">${badges(r)}</span>` : ""}
          ${r.warning ? `<span class="warn" title="${esc(r.warning)}"><svg aria-hidden="true"><use href="#ic-warn"/></svg></span>` : ""}
        </span>
        ${miss.length ? `<span class="missing">Fali: <b>${miss.map(x => esc(ingById.get(x)?.title || x)).join(", ")}</b></span>` : ""}
      </button>
      <span class="marks">${markButtons(r.id, fav, made)}</span>
      </div>`;
  }

  // dugmad stoje pored kartice, ne u njoj, jer dugme ne sme da sadrži dugme
  function markButtons(id, fav, made) {
    return `
      <button class="mark${fav ? " is-on" : ""}" type="button" data-fav="${esc(id)}"
              aria-pressed="${fav}" title="${fav ? "Ukloni iz omiljenih" : "Dodaj u omiljena"}"
              aria-label="${fav ? "Ukloni iz omiljenih" : "Dodaj u omiljena"}">
        <svg aria-hidden="true"><use href="#${fav ? "ic-heart-full" : "ic-heart"}"/></svg>
      </button>
      <button class="mark${made ? " is-on" : ""}" type="button" data-made="${esc(id)}"
              aria-pressed="${made}" title="${made ? "Nisam pravio" : "Označi da sam pravio"}"
              aria-label="${made ? "Nisam pravio" : "Označi da sam pravio"}">
        <svg aria-hidden="true"><use href="#${made ? "ic-check" : "ic-pot"}"/></svg>
      </button>`;
  }

  function toggleMark(kind, id) {
    const set = kind === "fav" ? state.favs : state.made;
    set.has(id) ? set.delete(id) : set.add(id);
    saveSet(kind === "fav" ? FAV_KEY : MADE_KEY, set);
    renderChips();
    renderResults();
    if (!$("#sheet").hidden && currentId === id) renderSheetMarks(id);
  }

  function renderSheetMarks(id) {
    const box = $("#sheet-marks");
    if (box) box.innerHTML = markButtons(id, state.favs.has(id), state.made.has(id));
  }

  // strane se broje kroz ceo rezultat, i onda kad je podeljen u grupe po ostavi
  function pager(total) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages < 2) return "";
    const cur = state.page;
    const shown = [...new Set([1, pages, cur - 1, cur, cur + 1])]
      .filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);

    let nums = "", prev = 0;
    for (const n of shown) {
      if (n - prev > 1) nums += `<span class="pager-gap" aria-hidden="true">…</span>`;
      nums += `<button class="pager-n${n === cur ? " is-on" : ""}" type="button" data-page="${n}"` +
              `${n === cur ? ' aria-current="page"' : ""}>${n}</button>`;
      prev = n;
    }

    const arrow = (to, cls, label, off) =>
      `<button class="pager-arrow ${cls}" type="button" data-page="${to}"${off ? " disabled" : ""} aria-label="${label}">
        <svg aria-hidden="true"><use href="#ic-chev"/></svg>
      </button>`;

    return `
      <nav class="pager" aria-label="Strane rezultata">
        ${arrow(cur - 1, "pager-prev", "Prethodna strana", cur === 1)}
        <div class="pager-nums">${nums}</div>
        ${arrow(cur + 1, "pager-next", "Sledeća strana", cur === pages)}
        <span class="pager-info">Strana ${cur} od ${pages}</span>
      </nav>`;
  }

  function renderResults() {
    const list = filtered();
    const box = $("#results");
    const countEl = $("#count");

    if (!list.length) {
      countEl.textContent = "";
      box.innerHTML = `<div class="empty"><p>Nema pogotka</p><p>Probaj drugu reč ili skloni neki filter.</p></div>`;
      return;
    }

    const paged = list.length > PAGE_MIN;
    const pages = paged ? Math.ceil(list.length / PAGE_SIZE) : 1;
    state.page = Math.min(Math.max(state.page, 1), pages);
    const from = paged ? (state.page - 1) * PAGE_SIZE : 0;
    const to   = paged ? from + PAGE_SIZE : list.length;
    const foot = paged ? pager(list.length) : "";

    if (!state.pantry.size) {
      countEl.textContent = countLabel(list);
      box.innerHTML = `<div class="grid">${list.slice(from, to).map(card).join("")}</div>` + foot;
      return;
    }

    const { ok, m1, m2, more, tips } = bucketize(list);
    countEl.textContent = ok.length
      ? `${ok.length} ${plural(ok.length, "jelo", "jela", "jela")} možeš da napraviš odmah`
      : "Nijedno jelo se ne može napraviti samo od čekiranih sastojaka";

    // grupe se nižu redom, pa se isečak strane seče preko njihovih granica
    let passed = 0;
    const section = (items, cls, title) => {
      const start = passed;
      passed += items.length;
      if (!items.length) return "";
      const a = Math.max(from, start), b = Math.min(to, passed);
      if (a >= b) return "";
      return `
      <section class="bucket">
        <div class="bucket-head ${cls}">
          <h2>${title}</h2><span class="n">${items.length}</span>
        </div>
        <div class="grid">${items.slice(a - start, b - start).map(card).join("")}</div>
      </section>`;
    };

    box.innerHTML =
      section(ok,   "ok",    "Možeš odmah") +
      section(m1,   "miss1", "Fali ti jedan sastojak") +
      section(m2,   "miss2", "Fali ti dva sastojka") +
      section(more, "",      "Fali ti više sastojaka") +
      section(tips, "",      "Saveti iz knjige") +
      foot;
  }

  // svaka promena filtera vraća na prvu stranu
  function refresh() { state.page = 1; renderResults(); }

  function goToPage(n) {
    if (!n || n === state.page) return;
    state.page = n;
    renderResults();
    const y = $("#count").getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  }

  // 29 zapisa u knjizi su tekstualni saveti, ne jela, pa se broje odvojeno
  function countLabel(list) {
    const jela = list.filter(r => r.type !== "savet").length;
    const saveti = list.length - jela;
    const a = jela ? `${jela} ${plural(jela, "jelo", "jela", "jela")}` : "";
    const b = saveti ? `${saveti} ${plural(saveti, "savet", "saveta", "saveta")}` : "";
    return [a, b].filter(Boolean).join(" i ");
  }

  function plural(n, one, few, many) {
    const d = n % 10, dd = n % 100;
    if (d === 1 && dd !== 11) return one;
    if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
    return many;
  }

  function renderChips() {
    const bookCounts = new Map();
    for (const r of RECIPES) bookCounts.set(r.book, (bookCounts.get(r.book) || 0) + 1);
    $("#books").innerHTML = [
      `<button class="chip ${!state.book ? "is-on" : ""}" data-book="" type="button">Sve knjige<span class="n">${RECIPES.length}</span></button>`,
      ...BOOKS.filter(b => bookCounts.get(b.id)).map(b => `
        <button class="chip ${state.book === b.id ? "is-on" : ""}" data-book="${esc(b.id)}" type="button"
                title="${esc(b.subtitle || "")}">${esc(b.short)}<span class="n">${bookCounts.get(b.id)}</span></button>`),
    ].join("");

    const pool = RECIPES.filter(inBook);
    const counts = new Map();
    for (const r of pool) counts.set(r.category, (counts.get(r.category) || 0) + 1);

    $("#cats").innerHTML = [
      `<button class="chip ${!state.cat ? "is-on" : ""}" data-cat="" type="button">Sve<span class="n">${pool.length}</span></button>`,
      // poglavlja bez ijednog jela se ne prikazuju, knjige se unose postepeno
      ...CATEGORIES.filter(c => counts.get(c.id)).map(c => `
        <button class="chip ${state.cat === c.id ? "is-on" : ""} ${isLight(c.color) ? "light-bg" : ""}"
                data-cat="${esc(c.id)}" style="--c:${esc(c.color)}" type="button">
          <span class="dot"></span>${esc(c.title)}<span class="n">${counts.get(c.id) || 0}</span>
        </button>`),
    ].join("");

    const tagCounts = new Map();
    for (const r of pool) for (const t of r.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);

    renderMyChips();

    $("#tags").innerHTML = [
      ...TAGS.filter(t => tagCounts.get(t.id)).map(t => `
        <button class="chip ${state.tags.has(t.id) ? "is-on" : ""}" data-tag="${esc(t.id)}"
                style="--c:#4c9a2a" type="button">
          <svg aria-hidden="true"><use href="#${t.icon}"/></svg>${esc(t.label)}
        </button>`),
      state.ing ? `<button class="chip is-on" data-clear-ing="1" style="--c:#1d1b17" type="button">
          Sadrži: ${esc(ingById.get(state.ing)?.title || state.ing)}
          <svg aria-hidden="true"><use href="#ic-close"/></svg></button>` : "",
    ].join("");
  }

  // dva čipa za lična jela: omiljena i ona koja je korisnik već pravio
  function renderMyChips() {
    const box = $("#moji");
    if (!box) return;

    const madeLabel = state.madeMode === "samo" ? "Samo ono što sam pravio"
                    : state.madeMode === "sakrij" ? "Sakriveno ono što sam pravio"
                    : "Pravio sam";

    box.innerHTML = `
      <button class="chip chip-mine${state.favOnly ? " is-on" : ""}" data-mine="fav"
              style="--c:#c2185b" type="button" aria-pressed="${state.favOnly}">
        <svg aria-hidden="true"><use href="#${state.favOnly ? "ic-heart-full" : "ic-heart"}"/></svg>Omiljena<span class="n">${state.favs.size}</span>
      </button>
      <button class="chip chip-mine${state.madeMode ? " is-on" : ""}" data-mine="made"
              style="--c:#4c9a2a" type="button" aria-pressed="${!!state.madeMode}">
        <svg aria-hidden="true"><use href="#${state.madeMode === "sakrij" ? "ic-close" : "ic-pot"}"/></svg>${esc(madeLabel)}<span class="n">${state.made.size}</span>
      </button>
      ${(state.favs.size || state.made.size) ? `<button class="chip chip-clear" data-mine="ocisti" type="button">Očisti moje oznake</button>` : ""}`;
  }

  function renderPantry() {
    const q = norm(state.ingQuery).trim();
    const usable = INGREDIENTS.filter(i => !i.basic);
    const common = usable.filter(i => i.count >= 4);

    let pool;
    if (q) {
      pool = usable.filter(i =>
        norm(i.title).includes(q) || (i.aliases || []).some(a => norm(a).includes(q)));
    } else {
      pool = state.showAllIngredients ? usable : common;
    }
    // već čekirano ostaje vidljivo bez obzira na filter
    for (const i of usable) if (state.pantry.has(i.id) && !pool.includes(i)) pool.push(i);

    const byGroup = new Map();
    for (const i of pool) {
      if (!byGroup.has(i.group)) byGroup.set(i.group, []);
      byGroup.get(i.group).push(i);
    }

    $("#pantry-list").innerHTML = GROUP_ORDER
      .filter(g => byGroup.has(g))
      .map(g => `
        <div class="pantry-group">
          <h3>${esc(GROUP_LABELS[g])}</h3>
          <div class="pantry-items">
            ${byGroup.get(g)
              .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "sr"))
              .map(i => `
                <label class="ing">
                  <input type="checkbox" value="${esc(i.id)}" ${state.pantry.has(i.id) ? "checked" : ""}>
                  ${esc(i.title)}<span class="n">${i.count}</span>
                </label>`).join("")}
          </div>
        </div>`).join("") ||
      `<p class="pantry-note">Nema sastojka sa tim imenom.</p>`;

    const more = $("#pantry-more");
    more.hidden = !!q;
    more.textContent = state.showAllIngredients
      ? `Prikaži samo najčešće (${common.length})`
      : `Prikaži sve sastojke (${usable.length})`;

    const n = state.pantry.size;
    const badge = $("#pantry-count");
    badge.hidden = !n;
    badge.textContent = n;
  }

  function renderIngredientsView() {
    const list = INGREDIENTS.filter(i => !i.basic && i.count > 0);
    const max = list[0]?.count || 1;
    $("#ing-chart").innerHTML = list.map(i => `
      <button class="ing-row" data-ing="${esc(i.id)}" style="--w:${Math.round(i.count / max * 100)}%" type="button">
        <span class="name">${esc(i.title)}<span class="grp">${esc(GROUP_LABELS[i.group] || i.group)}</span></span>
        <span class="c">${i.count}</span>
      </button>`).join("");
  }

  /* ---------------- brojevi i količine ---------------- */

  const fmtNum = v => {
    const n = v >= 10 ? Math.round(v) : Math.round(v * 100) / 100;
    return String(n).replace(".", ",");
  };
  const unitLabel = (u, q) => {
    const f = UNIT_FORMS[u];
    if (!f) return u;
    if (!Number.isInteger(q)) return f[1];
    return plural(q, ...f);
  };

  // prvi broj u tekstu sastojka je ista količina kao qty, pa se zamenjuje na mestu
  const NUM = /(\d+(?:[.,]\d+)?(?:\/\d+)?|½|¼|¾)/;
  const numVal = t => ({ "½": .5, "¼": .25, "¾": .75 })[t] ??
    (t.includes("/") ? t.split("/").reduce((a, b) => a / b) : parseFloat(t.replace(",", ".")));

  function scaledRaw(it, f) {
    if (f === 1 || it.qty == null) return esc(it.raw);
    const m = it.raw.match(NUM);
    if (m && Math.abs(numVal(m[1]) - it.qty) < 1e-9) {
      return esc(it.raw.slice(0, m.index)) + `<b class="sc">${fmtNum(it.qty * f)}</b>` +
             esc(it.raw.slice(m.index + m[1].length));
    }
    // „pola paprike", „šaka spanaća": količina je reč, pa se dopisuje množilac
    return `<b class="sc">${fmtNum(f)} ×</b> ${esc(it.raw)}`;
  }

  function servingsControl() {
    return `<span class="t serv"><svg aria-hidden="true"><use href="#ic-fork"/></svg>
      <button type="button" data-serv="-1" aria-label="Manje porcija"${servings <= 1 ? " disabled" : ""}>−</button>
      <span aria-live="polite"><b>${servingsText()}</b> ${plural(servings, "porcija", "porcije", "porcija")}</span>
      <button type="button" data-serv="1" aria-label="Više porcija">+</button></span>`;
  }

  // knjiga ponekad štampa raspon („6-8"); dok se broj ne promeni, prikazuje se raspon
  function servingsText() {
    const r = recById.get(currentId);
    return r?.servingsMax && servings === r.servings ? `${r.servings}-${r.servingsMax}` : servings;
  }

  // količine se preračunavaju iz odštampanog broja porcija
  function changeServings(d) {
    const r = recById.get(currentId);
    if (!r?.servings) return;
    servings = Math.max(1, servings + d);
    $(".serv").outerHTML = servingsControl();
    $("#sheet-ings").innerHTML = ingredientLines(r, servings / r.servings);
  }

  /* ---------------- ne jedem ---------------- */

  function renderAvoid() {
    const q = norm(state.avoidQuery).trim();
    $("#avoid-on").innerHTML = [...state.avoid].map(id => `
      <button class="chip is-on" data-avoid-del="${esc(id)}" style="--c:#b23c17" type="button"
              aria-label="Ukloni ${esc(ingById.get(id)?.title || id)}">
        ${esc(ingById.get(id)?.title || id)}<svg aria-hidden="true"><use href="#ic-close"/></svg>
      </button>`).join("");

    const usable = INGREDIENTS.filter(i => !i.basic && i.count > 0 && !state.avoid.has(i.id));
    const hits = q
      ? usable.filter(i => norm(i.title).includes(q) || (i.aliases || []).some(a => norm(a).includes(q)))
      : usable.slice(0, 18);
    $("#avoid-lead").textContent = q ? (hits.length ? "Pronađeno:" : "Nema sastojka sa tim imenom.") : "Najčešći sastojci:";
    $("#avoid-list").innerHTML = hits.slice(0, 30).map(i => `
      <button class="chip" data-avoid-add="${esc(i.id)}" type="button">${esc(i.title)}</button>`).join("");

    const badge = $("#avoid-count");
    badge.hidden = !state.avoid.size;
    badge.textContent = state.avoid.size;
  }

  function toggleAvoid(id, on) {
    on ? state.avoid.add(id) : state.avoid.delete(id);
    saveSet(AVOID_KEY, state.avoid);
    renderAvoid(); refresh();
  }

  /* ---------------- moj plan i spisak za kupovinu ---------------- */

  function savePlan() {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(state.plan)); }
    catch { /* privatni prozor */ }
    const n = $("#plan-n");
    n.hidden = !state.plan.length;
    n.textContent = state.plan.length;
  }

  // obrok se pogađa iz poglavlja, korisnik ga menja jednim klikom
  function guessMeal(r) {
    if (r.category === "dorucak-vecera") return "dorucak";
    if (["rucak", "supe-corbe"].includes(r.category)) return "rucak";
    return "uzina";
  }

  function planBox(r) {
    if (r.type === "savet") return "";
    const where = state.plan.filter(p => p.id === r.id);
    const meal = guessMeal(r);
    return `
      <div class="r-plan" id="sheet-plan">
        <svg aria-hidden="true"><use href="#ic-plan"/></svg>
        <select id="plan-day" aria-label="Dan">${DAYS.map(([k, l]) =>
          `<option value="${k}"${k === lastDay ? " selected" : ""}>${l}</option>`).join("")}</select>
        <select id="plan-meal" aria-label="Obrok">${MEALS.map(([k, l]) =>
          `<option value="${k}"${k === meal ? " selected" : ""}>${l}</option>`).join("")}</select>
        <button class="btn-plan" type="button" data-plan-add="${esc(r.id)}">Dodaj u plan</button>
        ${where.length ? `<p class="r-plan-in">U planu: ${where.map(p =>
          `${dayLabel(p.day)}, ${mealLabel(p.meal).toLowerCase()}`).join("; ")}</p>` : ""}
      </div>`;
  }

  function addToPlan(id) {
    const day = $("#plan-day").value, meal = $("#plan-meal").value;
    lastDay = day;
    if (!state.plan.some(p => p.id === id && p.day === day && p.meal === meal)) {
      state.plan.push({ id, day, meal });
      savePlan();
    }
    $("#sheet-plan").outerHTML = planBox(recById.get(id));
  }

  // zbir samo za jela koja imaju odštampane vrednosti, ostala se navode posebno
  function daySum(entries) {
    const sum = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    let known = 0;
    for (const e of entries) {
      const n = recById.get(e.id)?.nutrition;
      if (!n) continue;
      known++;
      for (const k in sum) sum[k] += n[k] || 0;
    }
    if (!known) return "";
    const missing = entries.length - known;
    return `<p class="plan-sum"><b>${fmtNum(sum.kcal)}</b> kcal · <b>${fmtNum(sum.protein)}</b> g proteina ·
      <b>${fmtNum(sum.carbs)}</b> g ugljenih hidrata · <b>${fmtNum(sum.fat)}</b> g masti${
      missing ? `<span>bez ${missing} ${plural(missing, "jela", "jela", "jela")} koja nemaju podatke</span>` : ""}</p>`;
  }

  function renderPlan() {
    const plan = state.plan;
    $("#plan-days").innerHTML = plan.length ? DAYS.map(([d, dl]) => {
      const dayEntries = plan.map((p, i) => ({ ...p, i })).filter(p => p.day === d);
      const meals = MEALS.map(([m, ml]) => {
        const list = dayEntries.filter(p => p.meal === m);
        if (!list.length) return "";
        return `<div class="plan-meal"><span class="plan-meal-n">${ml}</span><ul>${list.map(p => {
          const r = recById.get(p.id);
          return `<li><a href="#${encodeURIComponent(p.id)}" data-id="${esc(p.id)}">${esc(r.title)}</a>
            <button class="plan-del" type="button" data-plan-del="${p.i}" aria-label="Ukloni ${esc(r.title)} iz plana">
              <svg aria-hidden="true"><use href="#ic-close"/></svg></button></li>`;
        }).join("")}</ul></div>`;
      }).join("");
      return `<section class="plan-day${dayEntries.length ? "" : " is-empty"}">
        <h3>${dl}</h3>${meals || `<p class="plan-empty">Nema jela.</p>`}${daySum(dayEntries)}</section>`;
    }).join("") : `<div class="empty"><p>Plan je prazan</p><p>Otvori neko jelo i klikni „Dodaj u plan".</p></div>`;

    renderShop();
  }

  // količine se sabiraju po sastojku i jedinici; „po receptu" je sve što nema broj
  function shoppingList() {
    const need = new Map();
    for (const p of state.plan) {
      const r = recById.get(p.id);
      if (!r) continue;
      for (const it of r.ingredients) {
        if (it.optional || basicIds.has(it.ref)) continue;
        if (!need.has(it.ref)) need.set(it.ref, { units: new Map(), loose: 0, dishes: new Set() });
        const n = need.get(it.ref);
        if (it.qty != null) n.units.set(it.unit || "", (n.units.get(it.unit || "") || 0) + it.qty);
        else n.loose++;
        n.dishes.add(r.title);
      }
    }
    return need;
  }

  const amountText = n => {
    const parts = [...n.units].map(([u, q]) => `${fmtNum(q)}${u ? " " + unitLabel(u, q) : ""}`);
    if (n.loose) parts.push("po receptu");
    return parts.join(" + ");
  };

  function renderShop() {
    const box = $("#shop");
    if (!state.plan.length) { box.innerHTML = ""; return; }
    const need = shoppingList();
    const buy = [...need].filter(([id]) => !state.pantry.has(id));
    const have = [...need].filter(([id]) => state.pantry.has(id));

    const byGroup = new Map();
    for (const e of buy) {
      const g = ingById.get(e[0])?.group || "ostalo";
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(e);
    }

    box.innerHTML = `
      <div class="shop-head">
        <h2 id="shop-title">Spisak za kupovinu</h2>
        <button class="btn-ghost" type="button" data-shop-copy>Kopiraj spisak</button>
        <button class="btn-ghost" type="button" data-plan-clear>Isprazni plan</button>
      </div>
      <p class="pantry-note">Količine su za ceo recept, onako kako je odštampan. Sastojci koje si čekirao u „Šta imam kod kuće" su izdvojeni na kraju.</p>
      ${GROUP_ORDER.filter(g => byGroup.has(g)).map(g => `
        <div class="shop-group">
          <h3>${esc(GROUP_LABELS[g] || g)}</h3>
          ${byGroup.get(g).sort((a, b) => ingById.get(a[0]).title.localeCompare(ingById.get(b[0]).title, "sr"))
            .map(([id, n]) => `
            <label class="shop-item${state.bought.has(id) ? " is-done" : ""}">
              <input type="checkbox" value="${esc(id)}" ${state.bought.has(id) ? "checked" : ""}>
              <span class="shop-name">${esc(ingById.get(id).title)}</span>
              <span class="shop-amt">${esc(amountText(n))}</span>
              <span class="shop-for">${esc([...n.dishes].join(", "))}</span>
            </label>`).join("")}
        </div>`).join("") || `<p class="pantry-note">Sve što plan traži već imaš kod kuće.</p>`}
      ${have.length ? `<p class="shop-have"><b>Već imaš:</b> ${have.map(([id]) => esc(ingById.get(id).title)).join(", ")}</p>` : ""}`;
  }

  function copyShop() {
    const need = shoppingList();
    const text = [...need].filter(([id]) => !state.pantry.has(id) && !state.bought.has(id))
      .map(([id, n]) => `- ${ingById.get(id).title}: ${amountText(n)}`).join("\n");
    const btn = $("[data-shop-copy]");
    navigator.clipboard?.writeText(text).then(
      () => { btn.textContent = "Kopirano"; },
      () => { btn.textContent = "Kopiranje nije uspelo"; });
  }

  /* ---------------- ekran ostaje upaljen dok je recept otvoren ---------------- */

  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && !wakeLock && "wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
      } else if (!on && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch { /* pregledač ne dozvoljava, recept radi i bez toga */ }
  }

  /* ---------------- detalj recepta ---------------- */

  // vrednosti su odštampane u knjizi, ovde se samo formatiraju
  function nutritionStrip(n) {
    const f = v => String(v).replace(".", ",");
    const parts = [
      n.kcal    != null && `<span><b>${f(n.kcal)}</b> kcal</span>`,
      n.carbs   != null && `<span><b>${f(n.carbs)}</b> g ugljenih hidrata</span>`,
      n.fat     != null && `<span><b>${f(n.fat)}</b> g masti</span>`,
      n.protein != null && `<span><b>${f(n.protein)}</b> g proteina</span>`,
      n.fiber   != null && `<span><b>${f(n.fiber)}</b> g vlakana</span>`,
    ].filter(Boolean);
    return parts.length ? `<p class="r-nutri" aria-label="Nutritivne vrednosti">${parts.join("")}</p>` : "";
  }

  function ingredientLines(r, f = 1) {
    let html = "", group = null;
    for (const it of r.ingredients) {
      if (it.group && it.group !== group) {
        if (group !== null) html += "</ul>";
        html += `<p class="r-ing-group">${esc(it.group)}</p><ul class="r-ing">`;
        group = it.group;
      } else if (group === null) {
        html += `<ul class="r-ing">`;
        group = it.group || "";
      }
      html += `<li${it.optional ? ' class="opt"' : ""}>${scaledRaw(it, f)}</li>`;
    }
    return html ? html + "</ul>" : "";
  }

  // isti redosled koji se vidi u listi, pa listanje kroz popup prati ekran
  function sequence() {
    const list = filtered();
    if (!state.pantry.size) return list.map(r => r.id);
    const { ok, m1, m2, more, tips } = bucketize(list);
    return [...ok, ...m1, ...m2, ...more, ...tips].map(e => e.r.id);
  }

  function renderSheetNav(id) {
    const nav = $("#sheet-nav");
    const seq = sequence();
    const i = seq.indexOf(id);

    const sides = [$(".sheet-side-prev"), $(".sheet-side-next")];

    // jelo otvoreno kroz „Vidi i" može da bude van trenutnog filtera
    if (i < 0 || seq.length < 2) {
      nav.hidden = true;
      sides.forEach(el => { el.hidden = true; });
      return;
    }

    const prev = i > 0 ? seq[i - 1] : null;
    const next = i < seq.length - 1 ? seq[i + 1] : null;

    nav.hidden = false;
    $("#nav-pos").textContent = `${i + 1} od ${seq.length}`;

    // ista dva suseda pune i traku na dnu i kartice sa strane
    [["prev", prev], ["next", next]].forEach(([key, sid]) => {
      const r = sid ? RECIPES.find(x => x.id === sid) : null;
      const cat = r ? catById.get(r.category) : null;
      const side = $(`.sheet-side-${key}`);

      $(`#nav-${key}`).textContent = r ? r.title : "";
      nav.querySelector(`[data-step="${key === "prev" ? -1 : 1}"]`).disabled = !r;

      side.hidden = !r;
      if (!r) return;
      $(`#side-${key}`).textContent = r.title;
      $(`#side-${key}-cat`).textContent = cat.title;
      side.style.setProperty("--c", cat.color);
    });
  }

  function stepRecipe(dir) {
    if ($("#sheet").hidden) return;
    const seq = sequence();
    const i = seq.indexOf(currentId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= seq.length) return;

    // lista iza popup-a prelazi na stranu na kojoj novo jelo stoji
    if (seq.length > PAGE_MIN) {
      const page = Math.floor(j / PAGE_SIZE) + 1;
      if (page !== state.page) { state.page = page; renderResults(); }
    }
    openRecipe(seq[j], false, true);
  }

  function openRecipe(id, push = true, replace = false) {
    const r = recById.get(id);
    if (!r) return;
    const cat = catById.get(r.category);
    const t = timeLabel(r);
    servings = r.servings || null;
    currentId = id;

    const see = (r.seeAlso || [])
      .map(sid => RECIPES.find(x => x.id === sid))
      .filter(Boolean);

    $("#sheet-body").innerHTML = `
      <p class="r-head">
        <span class="r-cat" style="--c:${esc(cat.color)}"><span class="dot"></span>${esc(cat.title)}</span>
        <span class="book">${esc(bookById.get(r.book)?.short || "")}</span>
        <span class="marks marks-sheet" id="sheet-marks">${
          markButtons(r.id, state.favs.has(r.id), state.made.has(r.id))}</span>
      </p>
      <h2 id="sheet-title">${esc(r.title)}</h2>
      ${r.subtitle ? `<p class="r-sub">${esc(r.subtitle)}</p>` : ""}
      ${(t || r.servings || r.tags.length) ? `<div class="r-meta">
        ${t ? `<span class="t"><svg aria-hidden="true"><use href="#ic-clock"/></svg>${esc(t)}</span>` : ""}
        ${r.servings ? servingsControl() : ""}
        ${r.tags.length ? `<span class="r-badges">${badges(r)}</span>` : ""}
      </div>` : ""}
      ${r.warning ? `<p class="r-warn"><svg aria-hidden="true"><use href="#ic-warn"/></svg>${esc(r.warning)}</p>` : ""}
      ${r.nutrition ? nutritionStrip(r.nutrition) : ""}
      ${(r.notes || []).length ? `<div class="r-notes">${r.notes.map(n => `<p>${esc(n)}</p>`).join("")}</div>` : ""}
      ${(r.equipment || []).length ? `<h3 class="r-h">Potrebno</h3><ul class="r-ing">${r.equipment.map(e => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
      ${planBox(r)}
      ${r.ingredients.length ? `<h3 class="r-h">Sastojci</h3><div id="sheet-ings">${ingredientLines(r)}</div>` : ""}
      ${r.method ? `<h3 class="r-h">${r.type === "savet" ? "Savet" : "Postupak"}</h3>
        <div class="r-method">${r.method.split(/\n\n+/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>` : ""}
      ${(r.tips || []).length ? `<div class="r-tips"><h3>Savet</h3>${r.tips.map(x => `<p>${esc(x)}</p>`).join("")}</div>` : ""}
      ${see.length ? `<div class="r-see"><span>Vidi i:</span>${see.map(s =>
          `<button data-id="${esc(s.id)}" type="button">${esc(s.title)}</button>`).join("")}</div>` : ""}
      <p class="r-src">Knjiga „${esc(bookById.get(r.book)?.title || "Imunomania")}"${
        r.source.printed ? `, strana ${r.source.printed}` :
        `, sken ${r.source.scan}${r.source.page === "L" ? ", leva strana" : ", desna strana"}`}.</p>
    `;

    const sheet = $("#sheet");
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    $(".sheet-scroll").scrollTop = 0;
    $(".sheet-panel").focus();

    currentId = id;
    renderSheetNav(id);
    keepAwake(true);

    if (replace) {
      // listanje menja adresu na mestu, da zatvaranje ostane jedan korak unazad
      const st = history.state?.recipe ? { recipe: id } : history.state;
      history.replaceState(st, "", "#" + encodeURIComponent(id));
    } else if (push) {
      history.pushState({ recipe: id }, "", "#" + encodeURIComponent(id));
    }
  }

  function closeSheet(pop = true) {
    const sheet = $("#sheet");
    if (sheet.hidden) return;
    sheet.hidden = true;
    currentId = null;
    keepAwake(false);
    document.body.style.overflow = "";
    if (pop && history.state?.recipe) history.back();
  }

  // izbor dizajna živi u browseru korisnika, kao i ostava
  const SKIN_KEY = "imunomania.dizajn.v1";

  function setSkin(skin) {
    if (skin === "clay") document.documentElement.dataset.skin = "clay";
    else delete document.documentElement.dataset.skin;

    const fonts = $("#clay-fonts");
    if (fonts) fonts.disabled = skin !== "clay";

    $$(".skin").forEach(b => b.classList.toggle("is-active", b.dataset.skin === skin));
    try { localStorage.setItem(SKIN_KEY, skin); } catch { /* privatni prozor */ }
  }

  function setView(view) {
    state.view = view;
    $$(".tab").forEach(b => b.classList.toggle("is-active", b.dataset.view === view));
    for (const v of ["jela", "sastojci", "plan"]) $(`#view-${v}`).hidden = view !== v;
    if (view === "plan") renderPlan();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  /* ---------------- događaji ---------------- */

  function wire() {
    $$(".tab").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
    $$(".skin").forEach(b => b.addEventListener("click", () => setSkin(b.dataset.skin)));

    const q = $("#q");
    q.addEventListener("input", () => {
      state.q = q.value;
      $("#q-clear").hidden = !q.value;
      refresh();
    });
    $("#q-clear").addEventListener("click", () => {
      q.value = ""; state.q = ""; $("#q-clear").hidden = true;
      q.focus(); refresh();
    });

    $("#q-title").addEventListener("click", e => {
      state.titleOnly = !state.titleOnly;
      e.currentTarget.setAttribute("aria-pressed", state.titleOnly);
      q.placeholder = state.titleOnly ? "Naziv jela…" : "Pretraži jela, sastojke, postupak…";
      q.focus(); refresh();
    });

    $("#books").addEventListener("click", e => {
      const b = e.target.closest("[data-book]");
      if (!b) return;
      state.book = b.dataset.book || null;
      // poglavlje kog nema u izabranoj knjizi ostavilo bi prazan rezultat
      if (state.cat && !RECIPES.some(r => inBook(r) && r.category === state.cat)) state.cat = null;
      renderChips(); refresh();
    });

    $("#cats").addEventListener("click", e => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.cat = b.dataset.cat || null;
      renderChips(); refresh();
    });

    $("#moji").addEventListener("click", e => {
      const b = e.target.closest("[data-mine]");
      if (!b) return;
      if (b.dataset.mine === "fav") state.favOnly = !state.favOnly;
      if (b.dataset.mine === "made")
        state.madeMode = state.madeMode === null ? "samo"
                       : state.madeMode === "samo" ? "sakrij" : null;
      if (b.dataset.mine === "ocisti") {
        if (!confirm("Obrisati sve oznake za omiljena jela i ona koja si pravio?")) return;
        state.favs.clear(); state.made.clear();
        saveSet(FAV_KEY, state.favs); saveSet(MADE_KEY, state.made);
        state.favOnly = false; state.madeMode = null;
      }
      renderChips(); refresh();
    });

    $("#tags").addEventListener("click", e => {
      const clear = e.target.closest("[data-clear-ing]");
      if (clear) { state.ing = null; renderChips(); refresh(); return; }
      const b = e.target.closest("[data-tag]");
      if (!b) return;
      const id = b.dataset.tag;
      state.tags.has(id) ? state.tags.delete(id) : state.tags.add(id);
      renderChips(); refresh();
    });

    $("#pantry-list").addEventListener("change", e => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (!cb) return;
      cb.checked ? state.pantry.add(cb.value) : state.pantry.delete(cb.value);
      savePantry();
      $("#pantry-count").hidden = !state.pantry.size;
      $("#pantry-count").textContent = state.pantry.size;
      refresh();
    });

    $("#pantry-reset").addEventListener("click", () => {
      state.pantry.clear(); savePantry(); renderPantry(); refresh();
    });

    $("#pantry-more").addEventListener("click", () => {
      state.showAllIngredients = !state.showAllIngredients;
      renderPantry();
    });

    const iq = $("#ing-q");
    iq.addEventListener("input", () => { state.ingQuery = iq.value; renderPantry(); });

    $("#results").addEventListener("click", e => {
      const f = e.target.closest("[data-fav]");
      if (f) { toggleMark("fav", f.dataset.fav); return; }
      const m = e.target.closest("[data-made]");
      if (m) { toggleMark("made", m.dataset.made); return; }
      const p = e.target.closest("[data-page]");
      if (p) { goToPage(Number(p.dataset.page)); return; }
      const b = e.target.closest(".card");
      if (b) openRecipe(b.dataset.id);
    });

    $("#avoid").addEventListener("click", e => {
      const add = e.target.closest("[data-avoid-add]");
      if (add) { toggleAvoid(add.dataset.avoidAdd, true); return; }
      const del = e.target.closest("[data-avoid-del]");
      if (del) toggleAvoid(del.dataset.avoidDel, false);
    });
    const aq = $("#avoid-q");
    aq.addEventListener("input", () => { state.avoidQuery = aq.value; renderAvoid(); });

    $("#view-plan").addEventListener("click", e => {
      const del = e.target.closest("[data-plan-del]");
      if (del) {
        state.plan.splice(Number(del.dataset.planDel), 1);
        savePlan(); renderPlan(); return;
      }
      if (e.target.closest("[data-shop-copy]")) { copyShop(); return; }
      if (e.target.closest("[data-plan-clear]")) {
        if (!confirm("Isprazniti ceo plan ishrane?")) return;
        state.plan = []; state.bought.clear();
        savePlan(); saveSet(SHOP_KEY, state.bought); renderPlan(); return;
      }
      const a = e.target.closest("a[data-id]");
      if (a) { e.preventDefault(); openRecipe(a.dataset.id); }
    });
    $("#view-plan").addEventListener("change", e => {
      const cb = e.target.closest('.shop-item input');
      if (!cb) return;
      cb.checked ? state.bought.add(cb.value) : state.bought.delete(cb.value);
      cb.closest(".shop-item").classList.toggle("is-done", cb.checked);
      saveSet(SHOP_KEY, state.bought);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !$("#sheet").hidden) keepAwake(true);
    });

    $("#ing-chart").addEventListener("click", e => {
      const b = e.target.closest("[data-ing]");
      if (!b) return;
      state.ing = b.dataset.ing;
      state.cat = null;
      setView("jela");
      renderChips(); refresh();
    });

    $("#sheet").addEventListener("click", e => {
      if (e.target.closest("[data-close]")) { closeSheet(); return; }
      const f = e.target.closest("[data-fav]");
      if (f) { toggleMark("fav", f.dataset.fav); return; }
      const mk = e.target.closest("[data-made]");
      if (mk) { toggleMark("made", mk.dataset.made); return; }
      const add = e.target.closest("[data-plan-add]");
      if (add) { addToPlan(add.dataset.planAdd); return; }
      const sv = e.target.closest("[data-serv]");
      if (sv) { changeServings(Number(sv.dataset.serv)); return; }
      const step = e.target.closest("[data-step]");
      if (step) { stepRecipe(Number(step.dataset.step)); return; }
      const b = e.target.closest("[data-id]");
      if (b) openRecipe(b.dataset.id);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { closeSheet(); return; }
      if ($("#sheet").hidden) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); stepRecipe(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); stepRecipe(1); }
    });

    window.addEventListener("popstate", () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && RECIPES.some(r => r.id === id)) openRecipe(id, false);
      else closeSheet(false);
    });
  }

  /* ---------------- start ---------------- */

  async function init() {
    const [recipes, ingredients, categories, books] = await Promise.all(
      ["data/recipes.json", "data/ingredients.json", "data/categories.json", "data/books.json"]
        .map(u => fetch(u).then(r => {
          if (!r.ok) throw new Error(`${u}: ${r.status}`);
          return r.json();
        }))
    );

    RECIPES = recipes;
    INGREDIENTS = ingredients;
    CATEGORIES = categories.sort((a, b) => a.order - b.order);
    BOOKS = books.sort((a, b) => a.order - b.order);

    ingById = new Map(INGREDIENTS.map(i => [i.id, i]));
    recById = new Map(RECIPES.map(r => [r.id, r]));
    catById = new Map(CATEGORIES.map(c => [c.id, c]));
    bookById = new Map(BOOKS.map(b => [b.id, b]));
    basicIds = new Set(INGREDIENTS.filter(i => i.basic).map(i => i.id));

    const order = new Map(CATEGORIES.map(c => [c.id, c.order]));
    RECIPES.sort((a, b) =>
      (order.get(a.category) - order.get(b.category)) || a.title.localeCompare(b.title, "sr"));
    for (const r of RECIPES) {
      r._idx = buildIndex(r);
      r._title = norm(`${r.title} ${r.subtitle || ""}`);
    }

    // sastojak koji više ne postoji u rečniku ne sme da zaključa ostavu
    for (const id of [...state.pantry]) if (!ingById.has(id)) state.pantry.delete(id);
    for (const id of [...state.avoid]) if (!ingById.has(id)) state.avoid.delete(id);
    state.plan = state.plan.filter(p => recById.has(p.id));

    setSkin(document.documentElement.dataset.skin === "clay" ? "clay" : "knjiga");
    renderChips();
    renderPantry();
    renderAvoid();
    savePlan();
    renderIngredientsView();
    renderResults();
    wire();

    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && RECIPES.some(r => r.id === hash)) openRecipe(hash, false);
  }

  init().catch(err => {
    console.error(err);
    $("#results").innerHTML =
      `<div class="empty"><p>Podaci se ne učitavaju</p><p>Otvori sajt preko servera, ne kao lokalni fajl.</p></div>`;
  });
})();
