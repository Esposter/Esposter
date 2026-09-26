# CSS Layers

Read when changing how UnoCSS output is layered, or when a utility loses to another rule it should beat.

```ts
outputToCssLayers: {
  cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`),
}
```

- `properties` → `null` — CSS custom property declarations must not be wrapped in a `@layer` or they lose cascade specificity
- All other layers → `uno-${layer}` (e.g. `default` → `uno-default`, `shortcuts` → `uno-shortcuts`)

Layer declaration order is in `app/assets/css/layers.css`: the document chrome first, then preset-wind4's base and theme, the icons, and the utility layers (`uno-shortcuts`, `uno-default`) last. `uno-icons` sits ahead of the utilities: an icon rule sets `color: inherit`, and a utility colouring an icon has to win over it.
