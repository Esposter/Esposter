---
title: Remaining game-object components
description: Deferred — components for the Phaser game-object types not yet wrapped (NineSlice, Rope, Zone, Layer, Shader, DOMElement…).
---

# Remaining Game-Object Components

Phaser still has visual game-object types without a vue-phaserjs component: `<NineSlice>`, `<Rope>`, `<Zone>`, `<Layer>`, `<Shader>`, `<DOMElement>`, `<Plane>`, `<Mesh>`. Unlike the [rejected](/docs/vue-phaserjs/rejected) ideas, these ARE game objects with render properties — they fit the SetterMap/component pattern exactly; each is a mechanical addition via `useInitializeGameObject`.

**Why deferred:** no consuming scene in Esposter uses these types. The library adds components when a real call site needs one, not speculatively (the same rule that rejected camera helpers).

**Revisit when:** a game scene needs one of these types — add just that component then.
