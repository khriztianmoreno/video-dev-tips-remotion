import type { TopicMetadata } from "../../../src/types/content";

// Storytelling arc (audience: intermediate web devs).
// Pain (slow app, can't tell why) -> open Network -> read the waterfall/timing ->
// reproduce the real user (throttle + no cache) -> isolate the cause (block) -> takeaway.
// Scene count and durations derived from the narrative, not a fixed quota.
export const data: TopicMetadata = {
  id: "devtools-network",
  version: "v1",
  category: "tips",
  displayTitle: "DevTools: Network",
  bgMusicMood: "lo-fi-hip-hop",
  background: "diagonal-lines",
  ctaQuestion:
    "¿Cuál fue el cuello de botella más absurdo que cazaste con el Network Tab?",
  timeline: [
    {
      id: "step-1",
      durationInSeconds: 7,
      title: "Va lento, ¿por qué?",
      codeSnippet: `// "En mi máquina vuela"
// en producción tarda 4 segundos`,
      language: "javascript",
      narrationText:
        "Tu app va lenta para los usuarios pero en tu equipo vuela: ¿la culpa es del servidor, de la red o de un asset pesado?",
    },
    {
      id: "step-2",
      durationInSeconds: 6,
      transition: "stinger",
      title: "Abre Network",
      imageUrl: "devtools-network/command-menu.png",
      codeSnippet: "// Cmd+Opt+J -> pestaña Network: graba cada request",
      language: "javascript",
      narrationText:
        "El tab Network registra cada petición: nombre, estado, tamaño y tiempo. Todo lo que tu página descarga, en una tabla.",
    },
    {
      id: "step-3",
      durationInSeconds: 7,
      transition: "stinger",
      title: "Lee el waterfall",
      imageUrl: "devtools-network/timing-waterfall.png",
      imageFocus: { scale: 1.7, x: 0.55, y: 0.45 },
      codeSnippet: `// Timing:
//   verde = TTFB (servidor pensando)
//   azul  = descarga del recurso`,
      language: "javascript",
      narrationText:
        "La columna Timing es oro: verde es el servidor pensando; azul, la descarga. Te dice dónde está el cuello de botella.",
    },
    {
      id: "step-4",
      durationInSeconds: 7,
      transition: "stinger",
      title: "Simula al usuario",
      imageUrl: "devtools-network/throttling.png",
      imageFocus: { scale: 1.8, x: 0.42, y: 0.28 },
      codeSnippet: "// Throttling: Slow 3G  +  Disable cache",
      language: "javascript",
      narrationText:
        "Tú tienes fibra y caché; tus usuarios no. Pon Slow 3G y Disable cache para ver la carga real de un primer visitante.",
    },
    {
      id: "step-5",
      durationInSeconds: 6,
      title: "Bloquea y aísla",
      imageUrl: "devtools-network/block-request.png",
      codeSnippet: "// Click derecho -> Block request",
      language: "javascript",
      narrationText:
        "¿Sospechas de un script de terceros? Click derecho, Block request, y comprueba si tu página sobrevive sin él.",
    },
    {
      id: "step-6",
      durationInSeconds: 6,
      title: "No mires: diagnostica",
      codeSnippet: "// servidor · red · peso -> Network lo revela",
      language: "javascript",
      narrationText:
        "Network no es para ver requests pasar: es tu diagnóstico de si el problema es el servidor, la red o el peso.",
    },
  ],
};
