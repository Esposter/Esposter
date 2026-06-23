# `<Group>`

A Vue component wrapping `Phaser.GameObjects.Group`.

## Why not

- `Phaser.GameObjects.Group` extends `EventEmitter`, not `GameObject` — it has no visual/render properties to bind.
- `v-for` already handles the grouping use case in Vue.
