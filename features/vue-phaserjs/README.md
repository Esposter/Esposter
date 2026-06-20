# vue-phaserjs

Vue 3 integration for the Phaser game engine — declarative components for game objects driven by a SetterMap/configuration system, with composables for lifecycle hooks and tweens.

This README is the index.

## Now

- Mature library — no active work, no roadmap. New component/composable ideas: check [out-of-scope/](out-of-scope) first — most Phaser primitives that don't map to a Vue component hierarchy are intentionally left as imperative `onComplete` calls.

## Shipped

- **Game object components** — on top of the existing Sprite/Container/Text/Tilemap/PathFollower/Scene set: `<Arc>`, `<Graphics>`, `<BitmapText>`, `<RenderTexture>`, `<Particles>`, `<Video>`, `<Polygon>`, `<Star>`, `<Ellipse>`, `<Line>`, `<Triangle>`, `<Curve>`, `<IsoBox>`, `<IsoTriangle>`.
- **Testing infrastructure** — real headless Phaser (`Phaser.HEADLESS`) under happy-dom with a canvas stub; `stepScene` advances lifecycle hooks; lifecycle/component/store-integration coverage. → [reference/testing.md](reference/testing.md)

## Decisions

Do not re-propose without a new reason — [out-of-scope/](out-of-scope): `<Group>`, camera tween helpers, multiple cameras, tilemap layer components, `useSound`, input-polling composables, `useDrag`, `useTimeline`, `<Tween>`, `useSceneData`, scene transition effects, `useArcadePhysics`.

## Reference

- [reference/testing.md](reference/testing.md) — headless testing approach + canvas-stub notes.
- `vue-phaserjs` skill — component inventory, `markRaw` for Phaser objects in Pinia, configuration Pick pattern.
