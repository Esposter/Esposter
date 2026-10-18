# Remaining Game-Object Components

Phaser still has game-object types without a vue-phaserjs component: `<NineSlice>`, `<Rope>`, `<Zone>`, `<Layer>`, `<Shader>`, `<DOMElement>`, `<Plane>`, `<Mesh>`. Unlike the [rejected](../../../rejected/vue-phaserjs/) ideas, these are game objects with render properties, so they fit the SetterMap/component pattern and each is a mechanical addition via `useInitializeGameObject`. The exception is `<Zone>`, which Phaser documents as non-visual (an area for drop targets), so it has no render properties to map and needs its own shape.

**Why deferred:** no consuming scene in Esposter uses these types. The library adds components when a real call site needs one, not speculatively (the same rule that rejected camera helpers).

**Revisit when:** a game scene needs one of these types — add just that component then.
