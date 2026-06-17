# Array.filter() — Storyboard (v1)

Narrative: bare-bones introduction — show an array, apply filter, show the result. No hook, no layout variety; canonical v1 baseline. Format-specific `.ts` files in this folder derive from this table.

| Tiempo        | Plan Visual (Remotion Setup)                                           | Código / Asset a Renderizar                       | Audio (Locución)                                                                |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| 00:00 - 00:04 | `step-1` · `code-typewriter` with `title: "El array inicial"`           | `const ages = [14, 22, 18, 30];`                  | "Imagina que tienes una lista de edades de usuarios."                           |
| 00:04 - 00:10 | `step-2` · `code-typewriter` with `title: "Aplicando el filtro"`        | `const adults = ages.filter(age => age >= 18);`   | "Usamos filter con una función declarativa para extraer solo los mayores de 18." |
| 00:10 - 00:15 | `step-3` · `code-typewriter` with `title: "Resultado final"`            | `// adults: [22, 18, 30]`                         | "¡Y listo! Obtenemos un array completamente nuevo sin mutar el original."        |
| 00:15 - 00:21 | Outro (handled by render pipeline; not a `VideoStep`)                  | Brand insignia + `ctaQuestion` (default) + follow | — (silence; ambient bg music continues)                                          |
