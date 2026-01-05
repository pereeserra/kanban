// ==========================
// CONFIG
// ==========================
const STORAGE_KEY = "tasquesKanban";

// ==========================
// ESTAT APP
// ==========================
let tasques = [];

// ==========================
// DOM
// ==========================
const taskForm = document.getElementById("taskForm");
const inputTitol = document.getElementById("titol");
const inputDescripcio = document.getElementById("descripcio");
const inputPrioritat = document.getElementById("prioritat");
const inputData = document.getElementById("dataVenciment");
const inputTaskId = document.getElementById("taskId");
const submitBtn = document.getElementById("submitBtn");
const formError = document.getElementById("formError");

const colPerFer = document.getElementById("colPerFer");
const colEnCurs = document.getElementById("colEnCurs");
const colFet = document.getElementById("colFet");

const badgePerFer = document.getElementById("badgePerFer");
const badgeEnCurs = document.getElementById("badgeEnCurs");
const badgeFet = document.getElementById("badgeFet");

const statTotal = document.getElementById("statTotal");
const statPerFer = document.getElementById("statPerFer");
const statEnCurs = document.getElementById("statEnCurs");
const statFet = document.getElementById("statFet");
const statPercent = document.getElementById("statPercent");

// ==========================
// STORAGE
// ==========================
function carregarTasques() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error llegint localStorage:", e);
    return [];
  }
}

function guardarTasques(tasquesActuals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasquesActuals));
}

// ==========================
// HELPERS
// ==========================
function generarId() {
  return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

function netejarForm() {
  inputTitol.value = "";
  inputDescripcio.value = "";
  inputPrioritat.value = "mitjana";
  inputData.value = "";
  inputTaskId.value = "";
  submitBtn.textContent = "Afegir tasca";
  formError.textContent = "";
}

function validarForm() {
  const titol = inputTitol.value.trim();
  if (!titol) {
    formError.textContent = "El títol és obligatori.";
    return false;
  }
  formError.textContent = "";
  return true;
}

function getColorPrioritat(prioritat) {
  if (prioritat === "alta") return "priority-alta";
  if (prioritat === "mitjana") return "priority-mitjana";
  return "priority-baixa";
}

function textEstat(estat) {
  if (estat === "perFer") return "Per fer";
  if (estat === "enCurs") return "En curs";
  return "Fet";
}

// ==========================
// UI - RENDER
// ==========================
function renderTauler() {
  // buidar columnes
  colPerFer.innerHTML = "";
  colEnCurs.innerHTML = "";
  colFet.innerHTML = "";

  // pintar tasques
  for (const t of tasques) {
    const card = crearTargetaTasca(t);

    if (t.estat === "perFer") colPerFer.appendChild(card);
    else if (t.estat === "enCurs") colEnCurs.appendChild(card);
    else colFet.appendChild(card);
  }

  // badges + stats
  actualitzarComptadors();
  actualitzarEstadistiques();
}

function crearTargetaTasca(t) {
  const card = document.createElement("article");
  card.className = `task ${getColorPrioritat(t.prioritat)}`;

  const top = document.createElement("div");
  top.className = "task-top";

  const title = document.createElement("h3");
  title.textContent = t.titol;

  const pill = document.createElement("span");
  pill.className = "pill";
  pill.textContent = t.prioritat;

  top.appendChild(title);
  top.appendChild(pill);

  const desc = document.createElement("p");
  desc.className = "task-desc";
  desc.textContent = t.descripcio ? t.descripcio : "";

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const due = document.createElement("span");
  due.className = "due";
  due.textContent = t.dataVenciment ? `📅 ${t.dataVenciment}` : "";

  const status = document.createElement("span");
  status.className = "status";
  status.textContent = `⏱ ${textEstat(t.estat)}`;

  meta.appendChild(due);
  meta.appendChild(status);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  // Canviar estat (select)
  const select = document.createElement("select");
  select.className = "task-select";
  select.innerHTML = `
    <option value="perFer">Per fer</option>
    <option value="enCurs">En curs</option>
    <option value="fet">Fet</option>
  `;
  select.value = t.estat;
  select.addEventListener("change", (e) => {
    canviarEstat(t.id, e.target.value);
  });

  // Editar
  const btnEdit = document.createElement("button");
  btnEdit.type = "button";
  btnEdit.className = "btn small";
  btnEdit.textContent = "Editar";
  btnEdit.addEventListener("click", () => {
    carregarFormEdicio(t.id);
  });

  // Eliminar
  const btnDel = document.createElement("button");
  btnDel.type = "button";
  btnDel.className = "btn small danger";
  btnDel.textContent = "Eliminar";
  btnDel.addEventListener("click", () => {
    eliminarTasca(t.id);
  });

  actions.appendChild(select);
  actions.appendChild(btnEdit);
  actions.appendChild(btnDel);

  card.appendChild(top);
  if (t.descripcio) card.appendChild(desc);
  card.appendChild(meta);
  card.appendChild(actions);

  return card;
}

function actualitzarComptadors() {
  const perFer = tasques.filter(t => t.estat === "perFer").length;
  const enCurs = tasques.filter(t => t.estat === "enCurs").length;
  const fet = tasques.filter(t => t.estat === "fet").length;

  badgePerFer.textContent = perFer;
  badgeEnCurs.textContent = enCurs;
  badgeFet.textContent = fet;
}

function actualitzarEstadistiques() {
  const total = tasques.length;
  const perFer = tasques.filter(t => t.estat === "perFer").length;
  const enCurs = tasques.filter(t => t.estat === "enCurs").length;
  const fet = tasques.filter(t => t.estat === "fet").length;

  statTotal.textContent = total;
  statPerFer.textContent = perFer;
  statEnCurs.textContent = enCurs;
  statFet.textContent = fet;

  const percent = total === 0 ? 0 : Math.round((fet / total) * 100);
  statPercent.textContent = `${percent}%`;
}

// ==========================
// CRUD
// ==========================
function afegirTasca(dades) {
  const nova = {
    id: generarId(),
    titol: dades.titol,
    descripcio: dades.descripcio,
    prioritat: dades.prioritat,
    dataVenciment: dades.dataVenciment,
    estat: "perFer",
    creatEl: new Date().toISOString()
  };

  tasques.unshift(nova); // la posam a dalt
  guardarTasques(tasques);
  renderTauler();
}

function carregarFormEdicio(id) {
  const t = tasques.find(x => x.id === id);
  if (!t) return;

  inputTitol.value = t.titol;
  inputDescripcio.value = t.descripcio;
  inputPrioritat.value = t.prioritat;
  inputData.value = t.dataVenciment || "";
  inputTaskId.value = t.id;

  submitBtn.textContent = "Guardar canvis";
  formError.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function guardarEdicio(id, dades) {
  const idx = tasques.findIndex(x => x.id === id);
  if (idx === -1) return;

  tasques[idx] = {
    ...tasques[idx],
    titol: dades.titol,
    descripcio: dades.descripcio,
    prioritat: dades.prioritat,
    dataVenciment: dades.dataVenciment
  };

  guardarTasques(tasques);
  renderTauler();
  netejarForm();
}

function eliminarTasca(id) {
  const t = tasques.find(x => x.id === id);
  if (!t) return;

  const ok = confirm(`Vols eliminar la tasca "${t.titol}"?`);
  if (!ok) return;

  tasques = tasques.filter(x => x.id !== id);
  guardarTasques(tasques);
  renderTauler();

  // si estaves editant aquesta tasca, reset form
  if (inputTaskId.value === id) netejarForm();
}

function canviarEstat(id, nouEstat) {
  const t = tasques.find(x => x.id === id);
  if (!t) return;

  t.estat = nouEstat;
  guardarTasques(tasques);
  renderTauler();
}

// ==========================
// EVENTS
// ==========================
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validarForm()) return;

  const dades = {
    titol: inputTitol.value.trim(),
    descripcio: inputDescripcio.value.trim(),
    prioritat: inputPrioritat.value,
    dataVenciment: inputData.value
  };

  const idEditant = inputTaskId.value;

  if (idEditant) {
    guardarEdicio(idEditant, dades);
  } else {
    afegirTasca(dades);
    netejarForm();
  }
});

// ==========================
// INIT
// ==========================
function init() {
  tasques = carregarTasques();

  // si vols, pots deixar dades de prova la 1a vegada
  if (tasques.length === 0) {
    tasques = [
      {
        id: generarId(),
        titol: "Tasques de prova",
        descripcio: "Aquesta tasca existeix per comprovar que el tauler pinta bé.",
        prioritat: "baixa",
        dataVenciment: "",
        estat: "perFer",
        creatEl: new Date().toISOString()
      }
    ];
    guardarTasques(tasques);
  }

  renderTauler();
}

init();