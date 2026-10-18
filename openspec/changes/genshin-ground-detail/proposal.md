# Ground detail

## Why

The ground paints each layer in a pair of colours with no texture, so it draws no detail of its own. The detail the scene does draw is each surface's octave noise, fitted from its texture's statistics but measured at one shared constant of 4 centimetres per texel. The base maps are 2 metres per texel, so their detail lands 50 times too fine where the plant domes draw it, and the ground has no detail from its own layers.

## What Changes

Each surface's detail is drawn at its own texture's scale, and the ground draws detail from its layers' own textures rather than from its base map.

- Each surface's detail is drawn at the metres its own texture spans per texel, measured from the faces that read it, in place of one shared constant.
- The ground's detail comes from each splat layer's own texture, tiled at the layer's repeat, and not from the base map.
- Windrise's ground draws each layer's detail weighted by the layers' weights on the terrain. How the weights reach the terrain is left open for a decision.
- Each other region's ground is built in its own layers once its base maps are exported.

## Capabilities

- **genshin/ground-detail** (new)

## Waiting on

- Each other region's base maps are exported, since only Windrise's component exports its tiles' base maps.
- A decision on how the layers' weights reach the terrain material.

## Impact

The surfaces' detail in the engine and their fit against the game's exports. The splat layers' textures and their repeats in the world data. The terrain material and how a ground point is coloured from its layers. The ground reference the surface pass scores against.

Size kept as the source page's own: splitting it is a later decision.
