import type { TopicMetadata } from "../../../../src/types/content";

// Same storytelling arc as v1 (friction → open → read → simulate → block → takeaway),
// now using the post-refactor primitives:
//   • pre-roll hook (counter-intuitive shock to earn the first 2 s);
//   • mixed layouts: default code-typewriter + code-callout on step-4 (highlights the
//     "Slow 3G" string in the throttling config) + quote-hero on the takeaway;
//   • semantic transitions: slide-left when we DO something (open, throttle, block),
//     fade when we REFLECT (read the waterfall, land the takeaway).
export const data: TopicMetadata = {
  id: "devtools-network",
  version: "v2",
  category: "tips",
  format: "vertical",
  displayTitle: "DevTools: Network",
  bgMusicMood: "lo-fi-hip-hop",
  ctaQuestion:
    "¿Cuál fue el cuello de botella más absurdo que cazaste con el Network Tab?",
  hook: {
    durationInSeconds: 1.5,
    text: "El bug está en la red",
    subtext: "no en tu código",
    variant: "shock",
  },
  timeline: [
    {
      id: "step-1",
      durationInSeconds: 6,
      title: "Va lento, ¿por qué?",
      codeSnippet: `// "En mi máquina vuela"
// en producción tarda 4 segundos`,
      language: "javascript",
      narrationText:
        "Tu app va lenta para los usuarios pero en tu equipo vuela: ¿servidor, red o un asset pesado?",
    },
    {
      id: "step-2",
      durationInSeconds: 6,
      title: "Abre Network",
      imageUrl: "devtools-network/command-menu.png",
      codeSnippet: "// Cmd+Opt+J -> pestaña Network: graba cada request",
      language: "javascript",
      narrationText:
        "El tab Network registra cada petición: nombre, estado, tamaño y tiempo. Todo lo que tu página descarga, en una tabla.",
      transition: "slide-left",
    },
    {
      id: "step-3",
      durationInSeconds: 7,
      title: "Lee el waterfall",
      imageUrl: "devtools-network/timing-waterfall.png",
      imageFocus: { scale: 1.7, x: 0.55, y: 0.45 },
      codeSnippet: `// Timing:
//   verde = TTFB (servidor pensando)
//   azul  = descarga del recurso`,
      language: "javascript",
      narrationText:
        "La columna Timing distingue al servidor (verde) de la red (azul). Ese es tu diagnóstico inicial.",
      transition: "fade",
    },
    {
      id: "step-4",
      durationInSeconds: 7,
      title: "Simula al usuario",
      imageUrl: "devtools-network/throttling.png",
      imageFocus: { scale: 1.8, x: 0.42, y: 0.28 },
      codeSnippet: `const realUser = {
  network: 'Slow 3G',
  cache: 'disabled',
};`,
      language: "javascript",
      layout: "code-callout",
      calloutToken: "Slow 3G",
      narrationText:
        "Tú tienes fibra y caché; tus usuarios no. Activa Slow 3G y Disable cache para ver la carga real del primer visitante.",
      transition: "slide-left",
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
      transition: "slide-left",
    },
    {
      id: "step-6",
      durationInSeconds: 6,
      narrationText:
        "Network no es para ver requests pasar. Es tu diagnóstico de si el problema vive en el servidor, en la red, o en el peso.",
      layout: "quote-hero",
      quote: "Diagnóstico, no espectáculo.",
      transition: "fade",
    },
  ],
};
