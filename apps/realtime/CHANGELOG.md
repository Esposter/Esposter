# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.15.0](https://github.com/Esposter/Esposter/compare/v4.14.0...v4.15.0) (2026-11-22)

**Note:** Version bump only for package @esposter/realtime

# [4.14.0](https://github.com/Esposter/Esposter/compare/v4.13.0...v4.14.0) (2026-11-21)

### Bug Fixes

* **calls:** a call names each connection by a fresh participant id, never the caller's auth session ([c567700](https://github.com/Esposter/Esposter/commit/c56770004c0b93d1ac05648ec78a3a821c437868))
* **db:** a read across many objects of one kind collapses to the kind's table topic, which every object's write publishes ([f2acdfc](https://github.com/Esposter/Esposter/commit/f2acdfc622c02fc7bbe67a6e878d64f116d36203))
* **db:** a statement run on the handle a transaction callback is given is recorded, so the scheduled messages a send removes wake their reads ([5307d0d](https://github.com/Esposter/Esposter/commit/5307d0d02a104c630a7105e6bee611a502e90eb4))
* **esbabbler:** a reaction's add and removal are awaited answers under the version gate ([6a370f8](https://github.com/Esposter/Esposter/commit/6a370f8b349dac09a248e1ab3fff3370b5c38f35))
* **jobs,realtime:** a reminder is sent only while its owner is still a member of its room ([328a5c4](https://github.com/Esposter/Esposter/commit/328a5c47b31d0a02a2dd99a8cfb8c71ded763700))
* **lint:** the call's member and union sorts, the schema's keys, the test's expect forms, the comment capitals, the orphaned dungeon type file and the held-resource predicate's check name pass as CI runs them ([a62c157](https://github.com/Esposter/Esposter/commit/a62c157076295a1a8c99f536d424e827a73cb90b))
* **lint:** the room's delete result names null first, as sort-union-types asks ([ec79a69](https://github.com/Esposter/Esposter/commit/ec79a6900211ec0001104b77e3552318040e0973))
* **messages:** an edit takes back the mention counts of the message it replaced, as the room held it at the write ([ed5c43e](https://github.com/Esposter/Esposter/commit/ed5c43ed62a48b6fc656a3a7a77e8d86f104a509))
* **realtime,web:** the lint reds compare the whole value, not a matcher around it ([feb2672](https://github.com/Esposter/Esposter/commit/feb26722875578795c8809856e81b27a369e8a1f))
* **realtime:** a scheduled message's tombstone re-arms the alarm for its purge ([1f5a498](https://github.com/Esposter/Esposter/commit/1f5a49824c7a4a47901876eb6fa3394ea1405dfd))
* **realtime:** a vote writes the poll back as stored, its untrimmed question included ([58b7137](https://github.com/Esposter/Esposter/commit/58b7137020b70bada2ee890a63b1b2073a4f6fc2))
* **realtime:** a watch is taken only when the server signed the read it names, so a signed-in person watches only the topics their reads were given ([2db1cd1](https://github.com/Esposter/Esposter/commit/2db1cd1586fb1aec27d3e2ed35b9b4f25f9a6ad5))
* **realtime:** an unset or empty secret is the empty string, the one absent form the web Worker already reads ([8fa1e3b](https://github.com/Esposter/Esposter/commit/8fa1e3bd3dcbfed04e0f91d0437e904a5a3ffe91))
* **realtime:** TOPIC_WATCH_SECRET is required, and a watch with no signature is refused rather than taken unverified ([8015a18](https://github.com/Esposter/Esposter/commit/8015a18263848b841464c34c5af0c6e71e9c1d48))
* **room:** a removed membership is a tombstone that a rejoin revives at a higher version, and a join counts its use in the statement that writes the membership ([e166375](https://github.com/Esposter/Esposter/commit/e1663757c0a7d91a2a9906e02d191be4f2d836a2))
* **web:** leaving a room takes the person's reminders and scheduled messages for it ([78d1ac3](https://github.com/Esposter/Esposter/commit/78d1ac318e4ac1c182cac345d0f45a439b932ae4))

### Features

* **db-schema:** every row carries a version the database raises on each change ([f550858](https://github.com/Esposter/Esposter/commit/f550858a48ff7af1f6fb6007d0f6bfd74bbc0e47))
* **db:** a column is metadata of a watch and a publish, not part of a topic's name, so an update wakes only the readers of its columns ([24f9df0](https://github.com/Esposter/Esposter/commit/24f9df0fa34ebfb8e7a0770f64615505f0ca674a))
* **realtime:** a cancelled, sent or removed scheduled message leaves a tombstone the alarm purges at the retention ([c753074](https://github.com/Esposter/Esposter/commit/c75307436ad312cb5bdad2d9b6d3ac324243a78d))
* **web,jobs,realtime:** a membership event and the room's member read carry the membership row at its version ([169873b](https://github.com/Esposter/Esposter/commit/169873bb06bae7eebcdadd408cf82ad985539805))

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
