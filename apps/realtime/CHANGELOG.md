# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.13.0](https://github.com/Esposter/Esposter/compare/v4.12.0...v4.13.0) (2026-11-19)

### Bug Fixes

* **esbabbler:** push reaches every device once notifications are on, and followed threads read as rows that open them ([e6e548d](https://github.com/Esposter/Esposter/commit/e6e548daa207b13d13bcf8c816b8801df28d91f6))
* **jobs:** a room's teardown tells the senders of the scheduled messages it removes ([09fbc02](https://github.com/Esposter/Esposter/commit/09fbc02e11aa28b18f43de8df8a723fedbfdb16e))
* **realtime:** a read's watch is told of a publish made since the read began ([06c5aa9](https://github.com/Esposter/Esposter/commit/06c5aa95a99b70e550a059427e998ad1b90d7bca))
* **realtime:** readThreads leaves a reply named as a thread root out of the list ([55fa1cf](https://github.com/Esposter/Esposter/commit/55fa1cf8979ad41325fb8a8f284043ba046467cd))
* **web:** the friend requests and friend deletion send no user event, since their lists are kept by the topic ([2b20b09](https://github.com/Esposter/Esposter/commit/2b20b093ea9fdd6f0cfee3828a7da536a99d65e0))

### Performance Improvements

* **jobs:** the mock buckets a suite opens share one Miniflare instance ([14948a7](https://github.com/Esposter/Esposter/commit/14948a7d19cbd8ffaac530958cf290ff66a3407e))
* **test:** cloudflare:workers resolves to a stand-in that imports nothing, so a test file no longer loads Miniflare ([ba6f0c7](https://github.com/Esposter/Esposter/commit/ba6f0c745c3f47e155f47b74349945a63e2aa45b))

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
