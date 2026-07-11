---
title: Group component
description: Rejected — a Vue component wrapping Phaser.GameObjects.Group.
---

# `<Group>`

A Vue component wrapping `Phaser.GameObjects.Group`.

**Why not:** a Group extends `EventEmitter`, not `GameObject`, so it has no visual/render properties to bind, and `v-for` already handles the grouping use case in Vue.
