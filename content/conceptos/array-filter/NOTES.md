# Array.filter() — research notes

> Notas de investigación que alimentan las versiones del video. Acumulativo: no borrar
> hallazgos previos, marcar correcciones. Idioma: español.

## Definición precisa

`Array.prototype.filter(callbackFn, thisArg?)` crea un **array nuevo** con los elementos
del original que pasan la prueba implementada por `callbackFn` (el "predicado"). No muta el
array original. Si ningún elemento pasa, devuelve `[]`.

## Mecánica / firma

```js
const result = arr.filter((element, index, array) => boolean, thisArg);
```

- `callbackFn` recibe **tres** argumentos: `element`, `index` y el `array` completo.
- Debe retornar un valor *truthy* para conservar el elemento, *falsy* para descartarlo.
- `thisArg` (opcional) fija el `this` dentro del callback — **irrelevante con arrow
  functions**, que no tienen `this` propio.
- Es un método **genérico**: solo necesita que `this` tenga `length` y propiedades
  indexadas por entero (sirve en array-likes).

## Casos de uso reales

- Filtrar **objetos** por una propiedad: `users.filter(u => u.active)`.
- Quitar valores vacíos: `list.filter(Boolean)` (descarta `0, '', null, undefined, NaN`).
- Filtrar por **posición** usando el índice: `items.filter((_, i) => i % 2 === 0)`.
- Buscar coincidencias de texto: `products.filter(p => p.name.includes(query))`.

## Edge cases y gotchas

- **No muta el original** — devuelve un array nuevo. Reasignar/usar el retorno es obligatorio.
- **`filter` ≠ `find`**: si buscas *un* elemento, usa `find` (devuelve el elemento o
  `undefined`), no `filter(...)[0]` (crea un array innecesario y recorre todo).
- **`filter` ≠ `some`/`every`**: para saber si "existe alguno" o "todos cumplen", usa
  `some`/`every` (cortocircuitan), no `filter(...).length`.
- **Arrays dispersos (sparse)**: el callback **no** se invoca en huecos vacíos.
  `[1, , undefined].filter(x => x !== 2)` → `[1, undefined]` (el hueco se salta).
- **Mutar durante la iteración**: `length` se captura antes de empezar; los elementos
  añadidos después no se visitan; un elemento aún no visitado usa su valor al momento de
  visitarlo. Evitar mutar el array dentro del callback.
- **El array en construcción no es accesible** desde el callback (3er arg = array original).

## Comparativas (vs. alternativas)

| Quiero… | Usa | Por qué |
|---|---|---|
| Subconjunto que cumple | `filter` | Devuelve todos los matches |
| Un único elemento | `find` | Cortocircuita; devuelve el elemento, no un array |
| ¿Existe al menos uno? | `some` | Cortocircuita; devuelve boolean |
| ¿Todos cumplen? | `every` | Cortocircuita; devuelve boolean |
| Filtrar **y** transformar en una pasada | `reduce` | Una sola iteración (ver Performance) |

## Performance

- En la práctica, los métodos modernos rinden bien y la legibilidad gana sobre la
  micro-optimización; rara vez la elección importa.
- `filter().map()` recorre el array **dos veces**. Si el dataset es grande y el rendimiento
  importa, una sola pasada con `reduce` (o un `for`) lo hace en una iteración.
- `forEach`/`reduce` suelen medir algo más rápido que `map`/`filter` porque estos últimos
  construyen un array nuevo. Diferencia despreciable salvo en hot paths con muchos elementos.

## Narrativa del video (arco usado en v2)

Audiencia: **web developers intermedios** → no explicar sintaxis básica; vender el *porqué*.
Arco (tensión → resolución), escenas y tiempos derivados de él, no de una cuota:

1. **El dolor (hook):** sacar un subconjunto a mano = bucle + if + push. Funciona pero
   esconde la intención.
2. **La función:** `filter` lo expresa en una línea con un predicado.
3. **El beneficio (inmutabilidad):** no muta; devuelve un array nuevo → menos efectos
   secundarios.
4. **Encadenable:** al devolver un array se compone con `map`/`reduce` (pipelines legibles).
5. **Caso de uso / matiz:** `filter` para el subconjunto, `find` para uno solo.
6. **Takeaway:** describes el QUÉ, no el CÓMO → código declarativo.

## Ideas de escenas (para futuras versiones)

- `list.filter(Boolean)` como truco para limpiar valores vacíos (escena de "tip").
- Firma completa `(element, index, array)` con un ejemplo de filtrado por índice.
- `thisArg` y por qué las arrow functions lo ignoran (avanzado, quizá demasiado nicho).
- Sparse arrays y por qué `filter` salta los huecos (curiosidad/edge case).
- `filter` vs `reduce` en una sola pasada para datasets grandes (escena de performance).

## Referencias

- [MDN — Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) — definición canónica, firma, sparse arrays, mutación durante iteración, `thisArg`.
- [MDN — Array.prototype.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) — cuándo usar find en vez de filter.
- [MDN — Array.prototype.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) — alternativa para chequeos de existencia.
- [Performance-Analysis-JS (dg92)](https://github.com/dg92/Performance-Analysis-JS) — benchmarks map/filter/reduce vs for/forEach.
- [Optimising array map and filter with reduce — Perry Mitchell](https://perrymitchell.net/article/optimising-javascript-array-map-and-filter-with-reduce/) — single-pass con reduce vs filter().map().
