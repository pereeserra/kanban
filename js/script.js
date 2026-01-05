// ==========================
// CONFIG
// ==========================
const STORAGE_KEY = "tasquesKanban";

// ==========================
// ESTAT APP
// ==========================
let tasques = [];

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
// INIT
// ==========================
function init() {
  tasques = carregarTasques();

  // Dades de prova només si no hi ha res guardat (opcional però útil)
  if (tasques.length === 0) {
    tasques = [
      {
        id: String(Date.now()),
        titol: "Tasques de prova",
        descripcio: "Aquesta tasca existeix per comprovar que localStorage funciona.",
        prioritat: "baixa",
        dataVenciment: "",
        estat: "perFer",
        creatEl: new Date().toISOString()
      }
    ];
    guardarTasques(tasques);
  }

  console.log("Tasques carregades:", tasques);
  console.log("Clau localStorage:", STORAGE_KEY);
}

init();