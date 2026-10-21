# Lighting and the sky

Read when a material reads light, the sky or the weather writes its colours, or a sun shadow or the god rays are drawn.

- **Light is shared uniforms, and the sky writes them.** Every material reads one `LightUniforms` from `createLightUniforms`, so the hour moves by writing a few values, not by walking materials. A region's light is its `SkyKeyframe`s, written each frame by `applySkyState`, never a colour set on a light by hand.

- **Environment surfaces use `createToonMaterial` over the world's one ramp texture**; shade is the ambient (hemisphere) light's colour, never a darker multiply, and the rim is the material's emissive node on `ToonNodeMaterial`. Stone the game lights in its deferred pass (the login's towers, walkway and door) is `createStoneMaterial` instead, lit by `StoneLightingModel` from one shared `StoneLightUniforms` an hour writes with `applyStoneLight`.

- **The sun casts through cascades; the god rays read their own sun.** `createSunLight` attaches `AnchoredCascadeShadowNode`, whose cascades centre on the camera's pivot (the sun node's `anchor`), never on the view, so a turn draws no cascade; they are drawn only when `shadow.needsUpdate` is set, by the sun, the character or an enemy turning, or by the anchor moving a snap step. `GodraysNode` marches through `createGodraysLight`'s one map, drawn only when `shadow.needsUpdate` is set: `applySkyState` sets it as the light turns, and whatever replaces the ground under the view sets it too.

- **Weather is written after the sky and before the water.** The sky rewrites the fog colour, the sky's colours and the ambient light every frame, so whatever lays a weather's tint or a flash over them is registered after `useSky` and ahead of the water, whose haze wins under its surface (`openspec/specs/genshin/weather/design.md`).
