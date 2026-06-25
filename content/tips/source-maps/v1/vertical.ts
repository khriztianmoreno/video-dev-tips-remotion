import type { TopicMetadata } from "../../../../src/types/content";

// Narrative arc: minificado ≠ privado → qué es un .map → el peligro (sourcesContent) →
// incidentes reales (Apple / Anthropic) → el fix → takeaway.
// Audience: intermediate web devs who ship to production.
export const data: TopicMetadata = {
  id: "source-maps",
  version: "v1",
  category: "tips",
  format: "vertical",
  displayTitle: "Source Maps: el riesgo oculto",
  background: "grid",
  ctaQuestion: "¿Has revisado si tus .map están expuestos en producción?",
  hook: {
    durationInSeconds: 1.5,
    text: "Tu build minificado NO es privado",
    audioUrl: "source-maps/hook.m4a",
    subtext: "y nadie te avisó",
    variant: "shock",
  },
  timeline: [
    {
      id: "step-1",
      durationInSeconds: 5, // overridden by audioUrl duration when file is present
      title: "El problema",
      layout: "code-diff",
      language: "typescript",
      audioUrl: "source-maps/step-2.m4a",
      codeBefore: `// Tu código original
function calculateShippingCost(
  country: string,
  weight: number
): number {
  const baseRate = 5.0;
  return baseRate + weight * 0.5;
}`,
      codeAfter: `// Después de minificar
function c(o,e){return 5+.5*e}

// bundle.min.js:1:48211
// ← imposible depurar`,
      narrationText:
        "El bundler aplana tu código a una línea ilegible. Los sourcemaps resuelven eso... y crean otro problema.",
    },
    {
      id: "step-2",
      durationInSeconds: 5,
      title: "El riesgo",
      layout: "code-callout",
      language: "javascript",
      transition: "slide-left",
      audioUrl: "source-maps/step-3.m4a",
      codeSnippet: `// bundle.min.js.map (público)
{
  "sources": ["src/checkout.ts"],
  "sourcesContent": [
    "function calculateShippingCost..."
  ],
  "mappings": "AAAA,SAAS,wBAAwB..."
}`,
      calloutToken: "sourcesContent",
      narrationText:
        "El campo sourcesContent incrusta tu código fuente completo en el .map. Si ese archivo es público, tú también lo eres.",
    },
    {
      id: "step-3",
      durationInSeconds: 4,
      layout: "quote-hero",
      transition: "stinger",
      audioUrl: "source-maps/step-4.m4a",
      quote: "Apple expuso su App Store completa así",
      quoteAttribution: "noviembre 2025 — y Anthropic en marzo 2026",
      narrationText:
        "En 2025, Apple shippeó sus .map a producción. Un Chrome Extension descargó su código fuente completo automáticamente.",
    },
    {
      id: "step-4",
      durationInSeconds: 6,
      title: "El fix",
      transition: "flip",
      language: "typescript",
      audioUrl: "source-maps/step-5.m4a",
      codeSnippet: `// vite.config.ts
sourcemap: 'hidden'  // Sentry sí, browser no

// nginx — bloquea el .map en producción
location ~* \\.map$ { return 404; }

// package.json — check automático
"postbuild": "node check-sourcemaps.mjs"`,
      narrationText:
        "Usa 'hidden' para que Sentry lo reciba pero el browser no. Bloquea los .map en el servidor y añade un check en CI.",
    },
    {
      id: "step-5",
      durationInSeconds: 4,
      audioUrl: "source-maps/step-6.m4a",
      layout: "quote-hero",
      transition: "fade",
      quote: "Minificado ≠ privado",
      quoteAttribution: "automatiza el check en CI",
      narrationText:
        "Minificar no es cifrar. Revisa tu build, bloquea el .map en producción y automatiza el check antes del deploy.",
    },
  ],
};
