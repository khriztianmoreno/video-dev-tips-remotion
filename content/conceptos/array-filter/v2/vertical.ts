import type { TopicMetadata } from "../../../../src/types/content";

// Storytelling arc (audience: intermediate web devs) — see ./STORYBOARD.md.
// Scene count and per-scene durations are derived from the narrative, not a fixed quota.
export const data: TopicMetadata = {
  id: "array-filter",
  version: "v2",
  category: "conceptos",
  format: "vertical",
  displayTitle: "Array.filter()",
  bgMusicMood: "lo-fi-hip-hop",
  timeline: [
    {
      id: "step-1",
      durationInSeconds: 7,
      title: "El problema",
      codeSnippet: `const activos = [];
for (const u of users) {
  if (u.active) activos.push(u);
}`,
      language: "javascript",
      narrationText:
        "Para sacar un subconjunto de tus datos terminas con un bucle, un if y un push: funciona, pero esconde la intención.",
    },
    {
      id: "step-2",
      durationInSeconds: 6,
      title: "filter al rescate",
      codeSnippet: "const activos = users.filter(u => u.active);",
      language: "javascript",
      narrationText:
        "filter expresa lo mismo en una línea: recibe un predicado y conserva solo los elementos que devuelven true.",
    },
    {
      id: "step-3",
      durationInSeconds: 5,
      title: "No muta, devuelve",
      codeSnippet: "// 'users' queda intacto · 'activos' es un array nuevo",
      language: "javascript",
      narrationText:
        "Y no toca el array original: devuelve uno nuevo, así te ahorras efectos secundarios difíciles de rastrear.",
    },
    {
      id: "step-4",
      durationInSeconds: 5,
      title: "Se encadena",
      codeSnippet: "users.filter(u => u.active).map(u => u.name);",
      language: "javascript",
      narrationText:
        "Como retorna un array, lo encadenas con map o reduce para armar pipelines que se leen de corrido.",
    },
    {
      id: "step-5",
      durationInSeconds: 5,
      title: "filter vs find",
      codeSnippet: "// ¿uno solo? find · ¿el subconjunto? filter",
      language: "javascript",
      narrationText:
        "Un matiz que importa: si buscas un único elemento usa find; filter es para quedarte con todo el subconjunto.",
    },
    {
      id: "step-6",
      durationInSeconds: 5,
      title: "La idea clave",
      codeSnippet: "// describe el QUÉ, no el CÓMO",
      language: "javascript",
      narrationText:
        "La idea de fondo: con filter describes qué quieres, no cómo recorrer el array. Eso es código declarativo.",
    },
  ],
};
