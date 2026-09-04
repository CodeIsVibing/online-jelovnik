/* Imunomania · onlajn jelovnik */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const STORE_KEY = "imunomania.ostava.v1";

  const GROUP_LABELS = {
    povrce:    "Povrće",
    voce:      "Voće",
    zitarice:  "Žitarice, brašna i testenine",
    mahunarke: "Mahunarke",
    orasasti:  "Orašasti plodovi",
    semenke:   "Semenke",
    mlecno:    "Mlečno",
    jaja:      "Jaja",
    "meso-riba": "Meso i riba",
    masti:     "Masti i ulja",
    zacini:    "Začini i bilje",
    ostalo:    "Ostalo",
  };
  const GROUP_ORDER = Object.keys(GROUP_LABELS);

  const TAGS = [
    { id: "bez-glutena",          label: "Bez glutena",        icon: "ic-gluten" },
    { id: "vegetarijansko",       label: "Vegetarijansko",     icon: "ic-veg" },
    { id: "priprema-vece-ranije", label: "Priprema veče pre",  icon: "ic-moon" },
    { id: "ljuto",                label: "Ljuto",              icon: "ic-chili" },
  ];

  const state = {
    view: "jela",
    q: "",
    cat: null,
    tags: new Set(),
    ing: null,
    pantry: new Set(loadPantry()),
    showAllIngredients: false,
    ingQuery: "",
  };

  let RECIPES = [], INGREDIENTS = [], CATEGORIES = [];
  let ingById = new Map(), catById = new Map(), basicIds = new Set();

  /* ---------------- pomoćne ---------------- */

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // "Šampinjoni" i "sampinjoni" moraju da se nađu istom pretragom
  const norm = s => String(s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/ć/g, "c").replace(/č/g, "c")
    .replace(/š/g, "s").replace(/ž/g, "z");

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
    const parts = [r.title, r.subtitle, catById.get(r.category)?.title, r.method];
    for (const it of r.ingredients) {
      parts.push(it.raw, ingById.get(it.ref)?.title);
      const al = ingById.get(it.ref)?.aliases;
      if (al) parts.push(al.join(" "));
    }
    parts.push(...(r.notes || []), ...(r.tips || []));
    return norm(parts.filter(Boolean).join(" "));
  }

  /* ---------------- filtriranje ---------------- */

  function filtered() {
    const q = norm(state.q).trim();
    const words = q ? q.split(/\s+/) : [];
    return RECIPES.filter(r => {
      if (state.cat && r.category !== state.cat) return false;
      for (const t of state.tags) if (!r.tags.includes(t)) return false;
      if (state.ing && !r.ingredients.some(i => i.ref === state.ing)) return false;
      for (const w of words) if (!r._idx.includes(w)) return false;
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
    return `
      <button class="card" data-id="${esc(r.id)}" style="--c:${esc(cat.color)};--i:${Math.min(i, 14)}" type="button">
        <span class="cat">${esc(cat.title)}</span>
        <h3>${esc(r.title)}</h3>
        <span class="meta">
          ${t ? `<span class="t"><svg aria-hidden="true"><use href="#ic-clock"/></svg>${esc(t)}</span>` : ""}
          ${r.tags.length ? `<span class="badges">${badges(r)}</span>` : ""}
        </span>
        ${miss.length ? `<span class="missing">Fali: <b>${miss.map(x => esc(ingById.get(x)?.title || x)).join(", ")}</b></span>` : ""}
      </button>`;
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

    if (!state.pantry.size) {
      countEl.textContent = countLabel(list);
      box.innerHTML = `<div class="grid">${list.map(card).join("")}</div>`;
      return;
    }

    const { ok, m1, m2, more, tips } = bucketize(list);
    countEl.textContent = ok.length
      ? `${ok.length} ${plural(ok.length, "jelo", "jela", "jela")} možeš da napraviš odmah`
      : "Nijedno jelo se ne može napraviti samo od čekiranih sastojaka";

    const section = (items, cls, title) => items.length ? `
      <section class="bucket">
        <div class="bucket-head ${cls}">
          <h2>${title}</h2><span class="n">${items.length}</span>
        </div>
        <div class="grid">${items.map(card).join("")}</div>
      </section>` : "";

    box.innerHTML =
      section(ok,   "ok",    "Možeš odmah") +
      section(m1,   "miss1", "Fali ti jedan sastojak") +
      section(m2,   "miss2", "Fali ti dva sastojka") +
      section(more, "",      "Fali ti više sastojaka") +
      section(tips, "",      "Saveti iz knjige");
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
    const counts = new Map();
    for (const r of RECIPES) counts.set(r.category, (counts.get(r.category) || 0) + 1);

    $("#cats").innerHTML = [
      `<button class="chip ${!state.cat ? "is-on" : ""}" data-cat="" type="button">Sve<span class="n">${RECIPES.length}</span></button>`,
      ...CATEGORIES.map(c => `
        <button class="chip ${state.cat === c.id ? "is-on" : ""} ${isLight(c.color) ? "light-bg" : ""}"
                data-cat="${esc(c.id)}" style="--c:${esc(c.color)}" type="button">
          <span class="dot"></span>${esc(c.title)}<span class="n">${counts.get(c.id) || 0}</span>
        </button>`),
    ].join("");

    $("#tags").innerHTML = [
      ...TAGS.map(t => `
        <button class="chip ${state.tags.has(t.id) ? "is-on" : ""}" data-tag="${esc(t.id)}"
                style="--c:#4c9a2a" type="button">
          <svg aria-hidden="true"><use href="#${t.icon}"/></svg>${esc(t.label)}
        </button>`),
      state.ing ? `<button class="chip is-on" data-clear-ing="1" style="--c:#1d1b17" type="button">
          Sadrži: ${esc(ingById.get(state.ing)?.title || state.ing)}
          <svg aria-hidden="true"><use href="#ic-close"/></svg></button>` : "",
    ].join("");
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

  /* ---------------- detalj recepta ---------------- */

  function ingredientLines(r) {
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
      html += `<li${it.optional ? ' class="opt"' : ""}>${esc(it.raw)}</li>`;
    }
    return html ? html + "</ul>" : "";
  }

  function openRecipe(id, push = true) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return;
    const cat = catById.get(r.category);
    const t = timeLabel(r);

    const see = (r.seeAlso || [])
      .map(sid => RECIPES.find(x => x.id === sid))
      .filter(Boolean);

    $("#sheet-body").innerHTML = `
      <p class="r-cat" style="--c:${esc(cat.color)}"><span class="dot"></span>${esc(cat.title)}</p>
      <h2 id="sheet-title">${esc(r.title)}</h2>
      ${r.subtitle ? `<p class="r-sub">${esc(r.subtitle)}</p>` : ""}
      ${(t || r.tags.length) ? `<div class="r-meta">
        ${t ? `<span class="t"><svg aria-hidden="true"><use href="#ic-clock"/></svg>${esc(t)}</span>` : ""}
        ${r.tags.length ? `<span class="r-badges">${badges(r)}</span>` : ""}
      </div>` : ""}
      ${(r.notes || []).length ? `<div class="r-notes">${r.notes.map(n => `<p>${esc(n)}</p>`).join("")}</div>` : ""}
      ${(r.equipment || []).length ? `<h3 class="r-h">Potrebno</h3><ul class="r-ing">${r.equipment.map(e => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
      ${r.ingredients.length ? `<h3 class="r-h">Sastojci</h3>${ingredientLines(r)}` : ""}
      ${r.method ? `<h3 class="r-h">${r.type === "savet" ? "Savet" : "Postupak"}</h3>
        <div class="r-method">${r.method.split(/\n\n+/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>` : ""}
      ${(r.tips || []).length ? `<div class="r-tips"><h3>Savet</h3>${r.tips.map(x => `<p>${esc(x)}</p>`).join("")}</div>` : ""}
      ${see.length ? `<div class="r-see"><span>Vidi i:</span>${see.map(s =>
          `<button data-id="${esc(s.id)}" type="button">${esc(s.title)}</button>`).join("")}</div>` : ""}
      <p class="r-src">Knjiga „Imunomania", sken ${r.source.scan}${r.source.page === "L" ? ", leva strana" : ", desna strana"}.</p>
    `;

    const sheet = $("#sheet");
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    $(".sheet-scroll").scrollTop = 0;
    $(".sheet-panel").focus();
    if (push) history.pushState({ recipe: id }, "", "#" + encodeURIComponent(id));
  }

  function closeSheet(pop = true) {
    const sheet = $("#sheet");
    if (sheet.hidden) return;
    sheet.hidden = true;
    document.body.style.overflow = "";
    if (pop && history.state?.recipe) history.back();
  }

  function setView(view) {
    state.view = view;
    $$(".tab").forEach(b => b.classList.toggle("is-active", b.dataset.view === view));
    $("#view-jela").hidden = view !== "jela";
    $("#view-sastojci").hidden = view !== "sastojci";
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  /* ---------------- događaji ---------------- */

  function wire() {
    $$(".tab").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));

    const q = $("#q");
    q.addEventListener("input", () => {
      state.q = q.value;
      $("#q-clear").hidden = !q.value;
      renderResults();
    });
    $("#q-clear").addEventListener("click", () => {
      q.value = ""; state.q = ""; $("#q-clear").hidden = true;
      q.focus(); renderResults();
    });

    $("#cats").addEventListener("click", e => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.cat = b.dataset.cat || null;
      renderChips(); renderResults();
    });

    $("#tags").addEventListener("click", e => {
      const clear = e.target.closest("[data-clear-ing]");
      if (clear) { state.ing = null; renderChips(); renderResults(); return; }
      const b = e.target.closest("[data-tag]");
      if (!b) return;
      const id = b.dataset.tag;
      state.tags.has(id) ? state.tags.delete(id) : state.tags.add(id);
      renderChips(); renderResults();
    });

    $("#pantry-list").addEventListener("change", e => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (!cb) return;
      cb.checked ? state.pantry.add(cb.value) : state.pantry.delete(cb.value);
      savePantry();
      $("#pantry-count").hidden = !state.pantry.size;
      $("#pantry-count").textContent = state.pantry.size;
      renderResults();
    });

    $("#pantry-reset").addEventListener("click", () => {
      state.pantry.clear(); savePantry(); renderPantry(); renderResults();
    });

    $("#pantry-more").addEventListener("click", () => {
      state.showAllIngredients = !state.showAllIngredients;
      renderPantry();
    });

    const iq = $("#ing-q");
    iq.addEventListener("input", () => { state.ingQuery = iq.value; renderPantry(); });

    $("#results").addEventListener("click", e => {
      const b = e.target.closest(".card");
      if (b) openRecipe(b.dataset.id);
    });

    $("#ing-chart").addEventListener("click", e => {
      const b = e.target.closest("[data-ing]");
      if (!b) return;
      state.ing = b.dataset.ing;
      state.cat = null;
      setView("jela");
      renderChips(); renderResults();
    });

    $("#sheet").addEventListener("click", e => {
      if (e.target.closest("[data-close]")) { closeSheet(); return; }
      const b = e.target.closest("[data-id]");
      if (b) openRecipe(b.dataset.id);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeSheet();
    });

    window.addEventListener("popstate", () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && RECIPES.some(r => r.id === id)) openRecipe(id, false);
      else closeSheet(false);
    });
  }

  /* ---------------- start ---------------- */

  async function init() {
    const [recipes, ingredients, categories] = await Promise.all(
      ["data/recipes.json", "data/ingredients.json", "data/categories.json"]
        .map(u => fetch(u).then(r => {
          if (!r.ok) throw new Error(`${u}: ${r.status}`);
          return r.json();
        }))
    );

    RECIPES = recipes;
    INGREDIENTS = ingredients;
    CATEGORIES = categories.sort((a, b) => a.order - b.order);

    ingById = new Map(INGREDIENTS.map(i => [i.id, i]));
    catById = new Map(CATEGORIES.map(c => [c.id, c]));
    basicIds = new Set(INGREDIENTS.filter(i => i.basic).map(i => i.id));

    const order = new Map(CATEGORIES.map(c => [c.id, c.order]));
    RECIPES.sort((a, b) =>
      (order.get(a.category) - order.get(b.category)) || a.title.localeCompare(b.title, "sr"));
    for (const r of RECIPES) r._idx = buildIndex(r);

    // sastojak koji više ne postoji u rečniku ne sme da zaključa ostavu
    for (const id of [...state.pantry]) if (!ingById.has(id)) state.pantry.delete(id);

    renderChips();
    renderPantry();
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
