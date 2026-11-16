# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.12.0](https://github.com/Esposter/Esposter/compare/v4.11.0...v4.12.0) (2026-11-16)

### Bug Fixes

* **auth:** every session removal ends the session's sockets ([c1a5f7e](https://github.com/Esposter/Esposter/commit/c1a5f7e7c6ea52a4df4329ac0903f08801b4cc21))
* **calls:** a kicked connection's late leave webhook no longer drops its rejoined participant ([f802470](https://github.com/Esposter/Esposter/commit/f80247054199591499aff1e3be61f561b2234b0e))
* **calls:** a revoked session closes on the standalone calls it was admitted to ([8e06c5f](https://github.com/Esposter/Esposter/commit/8e06c5f4fc4810d01865d1954c838508ffabd643))
* **calls:** a revoked session that ends a room call writes its summary ([0623aa9](https://github.com/Esposter/Esposter/commit/0623aa9e91dc1468cfdd05cbc8c42c88b903d5f3))
* **cutover:** the routes compare against the validated secret, and a re-armed reminder converges ([8c665e0](https://github.com/Esposter/Esposter/commit/8c665e01726f1b2a81ff6f89d8a36c22633fbdb6))
* **realtime:** a deleted room takes its pending scheduled messages out of their senders' indexes ([20fa4d9](https://github.com/Esposter/Esposter/commit/20fa4d92532249a78c630c5bcc4cbd2f65f927f2))
* **realtime:** sockets upgrade in production, and a dropped connection takes the person offline ([397764b](https://github.com/Esposter/Esposter/commit/397764b11b64045920998f442a1b0aa4aa1b3bb2))
* **realtime:** the room-activity wave is taken before its write, and a scheduled send claims its slot as a live one ([e514c46](https://github.com/Esposter/Esposter/commit/e514c46c2f12b247fd37339ed43d8f6d7260a5de))
* **reminders:** the TodoList alarm keeps a reminder a save re-dated while it was sending ([eb7f9b5](https://github.com/Esposter/Esposter/commit/eb7f9b5a27d49a7f16ee5fad8a8edcfac3597d12))

### Features

* **realtime:** live queries — topic objects, watch frames, publish on mutation and refetch on invalidation ([6dcbf6a](https://github.com/Esposter/Esposter/commit/6dcbf6a5cb6930c4657d64df2d100e55b906b5f1))
* **scripts:** async-recursion/no-async-self-call, and the twenty loops written as recursion become loops ([0ff0c58](https://github.com/Esposter/Esposter/commit/0ff0c58e052b38271f772eff7cfb6ca7dd37f0e1))
* the cutover tool is deleted with its routes and the room object's import ([17c54c4](https://github.com/Esposter/Esposter/commit/17c54c455cd3b00d7538f2d47fa9d159647fe116))
