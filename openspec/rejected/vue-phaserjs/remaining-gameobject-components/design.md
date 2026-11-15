# Remaining Game-Object Components

Phaser game-object types without a vue-phaserjs component: `<NineSlice>`, `<Rope>`, `<Zone>`, `<Layer>`, `<Shader>`, `<DOMElement>`, `<Plane>`, `<Mesh>`. Each is a game object with render properties, so each fits the SetterMap and component pattern and is a mechanical addition via `useInitializeGameObject`. The exception is `<Zone>`, which Phaser documents as non-visual, so it has no render properties to map and needs its own shape.

## Why not

No consuming scene in Esposter uses these types. The library adds a component when a real call site needs one, not speculatively, the rule that also rejected the camera helpers. Reopened when a game scene needs one of these types, and then just that component is added.
