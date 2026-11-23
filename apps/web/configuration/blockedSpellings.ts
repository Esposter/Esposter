// The preset accepts two spellings for most of what it generates — `pa-4` beside `p-4`, `border-2` beside
// `b-2`, `overflow-hidden` beside `of-hidden`, `font-bold` beside `fw-bold` — and every extra spelling is one
// More way the same style is written across the tree. The shortest spelling of each family is canonical and
// The rest are refused here, which the generator honours by emitting nothing and vize's template lint reports at
// The attribute that wrote them. The dash between a utility and its value is structure, not spelling, so
// `p-4` stays over `p4`. One family keeps the longer form: a text colour is `text-*` rather than `c-*`, since
// `text-` already names the text's size and alignment, so everything said about the text shares one prefix
export const BLOCKED_SPELLINGS: [RegExp, string][] = [
  [/^[pm]a-/u, "`p-` / `m-`"],
  [/^(?:rounded|border)$/u, "`rd` / `b`"],
  [/^[pm][xylrtb]?-auto$/u, "`-a`"],
  [/^[pmwh][xylrtb]?\d/u, "a dash before the size (`p-4`, `w-4`)"],
  [/^border-/u, "`b-`"],
  [/^(?:rounded-|b-rd)/u, "`rd-`"],
  [/^opacity-|^op\d/u, "`op-`"],
  [/^(?:text|bg)-opacity-/u, "`text-op-` / `bg-op-`"],
  [/^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\d)/u, "`fw-`"],
  [/^flex-(?:justify|items|grow|shrink|inline)/u, "the bare `justify-`, `items-`, `grow`, `shrink`, `inline-flex`"],
  [/^(?:color|c)-/u, "`text-` for a text colour"],
  [/^leading-/u, "`lh-`"],
  [/^(?:position|pos)-/u, "the bare position keyword (`relative`)"],
  [/^grid-(?:cols|rows)-/u, "`cols-` / `rows-`"],
  [/^font-size-/u, "`text-`"],
  [/^text-align-/u, "`text-center` and its siblings"],
  [/^overflow-/u, "`of-`"],
  [/^whitespace-/u, "`ws-`"],
  [/^vertical-/u, "`align-middle` and its siblings"],
  [/^decoration-(?:underline|none|line-through)/u, "`underline`, `no-underline`, `line-through`"],
  [/^case-/u, "`uppercase` and its siblings"],
  [/^font-weight-/u, "`fw-`"],
  [/^text-decoration-/u, "`underline`, `no-underline`, `line-through`"],
  // Spelt as its number, a disabled control stops fading by the one strength every other does
  [/^op-38$/u, "`op-disabled`"],
  // A mobile browser's toolbar comes and goes over `vh`, so a region sized by it runs under the toolbar or the dock
  [/^(?:min-|max-)?h-screen$/u, "`h-dvh`, which follows a mobile browser's toolbar"],
  [/\dvh\b/u, "`dvh`, which follows a mobile browser's toolbar"],
];
