import type { TopicMetadata } from "../../../src/types/content";

export const data: TopicMetadata = {
  id: "array-filter",
  version: "v1",
  category: "conceptos",
  displayTitle: "Array.filter()",
  bgMusicMood: "lo-fi-hip-hop",
  timeline: [
    {
      id: "step-1",
      durationInSeconds: 4,
      title: "El array inicial",
      codeSnippet: "const ages = [14, 22, 18, 30];",
      language: "javascript",
      narrationText: "Imagina que tienes una lista de edades de usuarios.",
    },
    {
      id: "step-2",
      durationInSeconds: 6,
      title: "Aplicando el filtro",
      codeSnippet: "const adults = ages.filter(age => age >= 18);",
      language: "javascript",
      narrationText:
        "Usamos filter con una función declarativa para extraer solo los mayores de 18.",
    },
    {
      id: "step-3",
      durationInSeconds: 5,
      title: "Resultado final",
      codeSnippet: "// adults: [22, 18, 30]",
      language: "javascript",
      narrationText:
        "¡Y listo! Obtenemos un array completamente nuevo sin mutar el original.",
    },
  ],
};
