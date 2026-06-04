// Banco de preguntas compartido (index.html + generator.html).
// Capas: base (questionbank.json) + importadas (localStorage) + ediciones/borrados (overlays).
// Cada pregunta efectiva tiene: {id, section, level, text, options, correct, explanation, term, _src}
const BankStore = (() => {
  const K_IMPORTED = 'importedBank';   // [{id, section, level, text, options, correct, explanation, term}]
  const K_EDITS    = 'bankEdits';      // { id: {campos a sobreescribir} }
  const K_DELETED  = 'bankDeleted';    // [id, ...]
  const LEVELS = ['B1', 'B2', 'C1'];
  const NO_LEVEL = 'Sin nivel';
  const NO_CAT = 'Sin clasificar';
  const CATEGORIES = ['Grammar & Vocabulary', 'Phrasal Verbs', 'Idioms'];
  let _base = null;

  function _get(k, def) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch { return def; } }
  function _set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function _uid() { return 'i' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3); }

  function getImported() {
    const a = _get(K_IMPORTED, []);
    let changed = false;
    a.forEach(q => { if (!q.id) { q.id = _uid(); changed = true; } });          // migra entradas antiguas
    if (changed) _set(K_IMPORTED, a);
    return a;
  }
  function getEdits() { return _get(K_EDITS, {}); }
  function getDeleted() { return _get(K_DELETED, []); }

  async function fetchBase() {
    if (_base) return _base;
    try { const r = await fetch('questionbank.json', { cache: 'no-store' }); const d = await r.json(); _base = d.questions || []; }
    catch { _base = []; }
    return _base;
  }

  // Lista efectiva: base + importadas, con overlays de edición aplicados y borrados ocultos.
  async function getEffective() {
    const base = await fetchBase();
    const edits = getEdits();
    const deleted = new Set(getDeleted());
    const out = [];
    base.forEach((q, i) => {
      const id = 'b' + i;
      if (deleted.has(id)) return;
      out.push(Object.assign({ id, _src: 'base', level: q.level || NO_LEVEL, term: '', explanation: '' }, q, edits[id] || {}, { id, _src: 'base' }));
    });
    getImported().forEach(q => {
      if (deleted.has(q.id)) return;
      out.push(Object.assign({ _src: 'imported', level: NO_LEVEL, term: '', explanation: '' }, q, edits[q.id] || {}, { _src: 'imported' }));
    });
    return out;
  }

  function editQuestion(id, changes) {
    const e = getEdits(); e[id] = Object.assign({}, e[id] || {}, changes); _set(K_EDITS, e);
  }
  function deleteQuestion(id) {
    const d = getDeleted(); if (!d.includes(id)) { d.push(id); _set(K_DELETED, d); }
    const e = getEdits(); if (e[id]) { delete e[id]; _set(K_EDITS, e); }
  }

  // Añade preguntas importadas (dedup por sección+enunciado). Devuelve {seccion: nAñadidas}.
  function addImported(questions) {
    const imp = getImported();
    const seen = new Set(imp.map(q => (q.section || '') + '||' + String(q.text).toLowerCase()));
    const added = {};
    for (const q of questions) {
      const sec = q.section || NO_CAT;
      const key = sec + '||' + String(q.text).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      imp.push({
        id: _uid(), section: sec, level: q.level || NO_LEVEL,
        text: q.text, options: q.options, correct: q.correct,
        explanation: q.explanation || '', term: q.term || ''
      });
      added[sec] = (added[sec] || 0) + 1;
    }
    _set(K_IMPORTED, imp);
    return added;
  }

  return { LEVELS, NO_LEVEL, NO_CAT, CATEGORIES, fetchBase, getEffective, editQuestion, deleteQuestion, addImported, getImported, getDeleted };
})();
