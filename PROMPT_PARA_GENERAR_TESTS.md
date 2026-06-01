# Prompt para generar tests HTML desde un PDF de batería de preguntas

Usa este prompt exacto cuando le pases un PDF a Claude.

---

## PROMPT A USAR:

```
He adjuntado un PDF con una batería de preguntas de inglés.
Extrae TODAS las preguntas y genera el bloque TEST_CONFIG en JavaScript
para reemplazar el bloque equivalente en test_template.html.

Reglas de extracción:
- Mantén el texto de cada pregunta exactamente como está en el PDF.
- Si hay texto introductorio o contexto (frase, párrafo de lectura), ponlo en el campo "context".
- Si la pregunta es directa sin contexto extra, deja "context" como cadena vacía "".
- El campo "correct" es el índice (0-based) de la opción correcta: A=0, B=1, C=2, D=3.
- Para el campo "explanation": escribe una explicación en inglés de 2-3 oraciones que explique
  POR QUÉ la opción correcta es correcta y por qué las demás están mal. Si el PDF ya incluye
  la explicación, úsala; si no, genera una tú mismo basada en gramática o vocabulario inglés.
- Para el campo "skill": clasifica la pregunta en una de estas categorías:
  Grammar | Vocabulary | Reading | Listening / Context | Use of English | Writing

Formato de salida — devuelve SOLO el bloque JS, sin nada más:

const TEST_CONFIG = {
  title: "[nombre del examen o tema del PDF]",
  subtitle: "[nivel objetivo, ej: B1-B2 Cambridge style]",
  targetLevel: "[rango de nivel]",
  questions: [
    {
      id: 1,
      skill: "Grammar",
      text: "texto de la pregunta",
      context: "texto de contexto o frase a analizar, o vacío",
      options: ["opción A", "opción B", "opción C", "opción D"],
      correct: 0,
      explanation: "Explicación en inglés del por qué."
    },
    ...
  ]
};

No incluyas markdown, no incluyas explicaciones adicionales fuera del bloque.
Solo el bloque const TEST_CONFIG = { ... };
```

---

## Cómo usar el output:

1. Abre `test_template.html` en un editor de texto.
2. Localiza el bloque que empieza con `const TEST_CONFIG = {` y termina con `};`
   (está entre los comentarios `// === TEST DATA ===`).
3. Reemplaza TODO ese bloque con el que generó Claude.
4. Guarda el archivo y ábrelo en el navegador.

---

## Tips:

- Si el PDF tiene más de 40 preguntas, pídele a Claude que procese en lotes:
  "Procesa las preguntas 1-20 primero, luego las 21-40."
- Si el PDF incluye texto de lectura largo, recórtalo en el campo "context"
  a la parte relevante para la pregunta específica.
- Puedes cambiar el nivel del test ajustando la función `getLevel(pct)` en el HTML
  para calibrar los umbrales A1/A2/B1/B2/C1/C2 según el nivel real del examen.
