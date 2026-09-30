# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.8.0](https://github.com/Esposter/Esposter/compare/v3.7.0...v3.8.0) (2026-09-30)

### Features

* **oxlint:** process.argv read by citty alone ([27e836a](https://github.com/Esposter/Esposter/commit/27e836a3d5df47868eb6b0a0c47e46aa8a65081c))

# [3.7.0](https://github.com/Esposter/Esposter/compare/v3.6.0...v3.7.0) (2026-09-29)

**Note:** Version bump only for package agent-console-server

# [3.6.0](https://github.com/Esposter/Esposter/compare/v3.5.1...v3.6.0) (2026-09-29)

### Bug Fixes

* **agent-console-server:** allow bypass permissions so the mode picker can switch to it ([d6f4390](https://github.com/Esposter/Esposter/commit/d6f439069cab2d065fa9e42743d284edda0e6b80))
* **agent-console-server:** keep ephemeral events out of the log a session window hands back ([f718dc1](https://github.com/Esposter/Esposter/commit/f718dc1a480d40772dc6f50bcf70526caa9b42e1))
* **agent-console-server:** only a compaction moves a session's state, never a status that changes the mode ([69f24f3](https://github.com/Esposter/Esposter/commit/69f24f319bd388d8aeb3a2aeb96230733ff8382c))
* **agent-console-server:** open PowerShell 7 in the shell pane when it is installed, with its own module path ([839529b](https://github.com/Esposter/Esposter/commit/839529b2f95eed6c36e947acdaef54a7aeb50679))
* **ci:** repair main — the supporters snapshot and two size snapshots ([cbdcfe9](https://github.com/Esposter/Esposter/commit/cbdcfe903ec1f88d2bfe013e3e00855e880fb175))

### Features

* **agent-console-server:** add a dev script that starts the host for the local dev server ([abcf549](https://github.com/Esposter/Esposter/commit/abcf549c852eeaadbfeddda8cc58d6d0d1d6fa16))
* **agent-console-server:** keep a session's window running when its host is killed, and hand it to the next host ([d3e77aa](https://github.com/Esposter/Esposter/commit/d3e77aad6bf3eca21ead5eac15ff74f9bdb6fd17))
* **agent-console-server:** rebuild and restart the dev host on every source change ([83da547](https://github.com/Esposter/Esposter/commit/83da5475f0e1063db794d3b6aad233c5298ba67a))
* **web:** show the agent console as Genshin at /genshin, and make Teyvat its world ([8b5c1bf](https://github.com/Esposter/Esposter/commit/8b5c1bfaa7bae8171d46950dd5e4530edb2d1bda))

## [3.5.1](https://github.com/Esposter/Esposter/compare/v3.5.0...v3.5.1) (2026-09-28)

**Note:** Version bump only for package agent-console-server

# [3.5.0](https://github.com/Esposter/Esposter/compare/v3.4.0...v3.5.0) (2026-09-28)

### Bug Fixes

* **agent-console-server:** a failed state write removes its temporary file and rethrows its own error ([e46c342](https://github.com/Esposter/Esposter/commit/e46c34228f7f9463607d4b0d2344561879efe83b))
* **agent-console-server:** a second host proves the first by a signed challenge, never by sending it the token ([4eefa2a](https://github.com/Esposter/Esposter/commit/4eefa2a7702fd2c4dfcd89ec300b7e5375c83ee3))
* **agent-console:** a closed session starts no shell until it opens again ([5e86832](https://github.com/Esposter/Esposter/commit/5e8683266b1a2f8876a6b68b5b75838d49c31d81))
* **agent-console:** a host's proof signs the port it answers on, so a relay to another host fails ([2b66397](https://github.com/Esposter/Esposter/commit/2b66397f6ceea08088b701c2ebfa9bfaf2078579))
* **agent-console:** a pairing code handed again keeps until its new deadline, not the first one's ([e259b7f](https://github.com/Esposter/Esposter/commit/e259b7ff8c90d272b03c3ae10e2a95ea07d5f2a9))
* **agent-console:** a scheme launch finding the port taken checks the host holds it before saying one is running ([101c1d5](https://github.com/Esposter/Esposter/commit/101c1d5e30f046189a6b3f9d4abeaeb82518b649))
* **agent-console:** a shell still starting when its session or the host closes is ended as it arrives ([17163eb](https://github.com/Esposter/Esposter/commit/17163eb572006b509516f88438ee6fa1945ea64a))
* **agent-console:** a state file is written beside the old one and renamed over it, so a stopped write never loses the host key ([0adc852](https://github.com/Esposter/Esposter/commit/0adc85260cb395a567ac79d825e6a6a760eca451))
* **agent-console:** the host's proof signs the port it answers on, so a relay from a port beside it proves nothing ([8199960](https://github.com/Esposter/Esposter/commit/81999609e703003b64a1beb45bc021cca2a15e0f))
* **agent-console:** the running host removes a revoked device from the list itself, so a pairing's stale write cannot restore it ([fde27e7](https://github.com/Esposter/Esposter/commit/fde27e77fd6177b4cf6cfd80fe2ab3e678f0eba0))
* **agent-console:** the shell registry's pending-open cleanup and its test pass lint ([91f5a66](https://github.com/Esposter/Esposter/commit/91f5a66177355486f170107626d2f418bb874a29))
* **agent-console:** the state file's temporary name uses the global crypto.randomUUID, as the lint requires ([6b46631](https://github.com/Esposter/Esposter/commit/6b4663164852e43f74ca3e83dce0507e81a7b7d6))
* **agent-console:** uninstall waits on ping, since timeout exits at once without a console input ([2ea1fdb](https://github.com/Esposter/Esposter/commit/2ea1fdb782c253054dd147b55e6328ab32aa3c44))
* **ci:** repair main's four coverage reds ([8726946](https://github.com/Esposter/Esposter/commit/872694602c3b26dce1aefd0e93583a8beb31e5de))
* cite the host installer's copy script by its repo path and re-snapshot index.d.ts size ([16d9e28](https://github.com/Esposter/Esposter/commit/16d9e28523210af55d5222558daa849ea55c4c5a))
* repair main's red coverage — duplicate prose, two dead citations, a types size snapshot ([96a07cb](https://github.com/Esposter/Esposter/commit/96a07cb453422ac8b90c21fc823c28f9c5942047))
* repair main's red coverage — the agent-console-server types size snapshot ([a829f83](https://github.com/Esposter/Esposter/commit/a829f837a1a3def88274a4daa1dea6b439caf0f1))
* repair main's red coverage — the agent-console-server types size snapshot and a duplicated rejected-index line ([f314f0d](https://github.com/Esposter/Esposter/commit/f314f0dac1893818e2d680ecef9b646750eba3f2))

### Features

* **agent-console:** a host stopped from its window tells every page, which shows it stopped instead of retrying ([1d19e15](https://github.com/Esposter/Esposter/commit/1d19e15c0c4f301bb53153dd86337a80f48f6a93))
* **agent-console:** a machine of the reader's own is added beside this computer, each host's sessions listed under it ([07af88b](https://github.com/Esposter/Esposter/commit/07af88b016900d3cd861f21c98b4d0a9af6e307e))
* **agent-console:** a running task stops from its lane, and Ctrl+B sends running work to the background ([daeeab8](https://github.com/Esposter/Esposter/commit/daeeab81ee94939966a90493381179f1ea178480))
* **agent-console:** a Shell tab opens a terminal in the session's folder, on the host that runs it ([409c740](https://github.com/Esposter/Esposter/commit/409c740ef3f3bd8d3f786ce07d9da1a98a0ae795))
* **agent-console:** each session runs in a window of its own, stopped from there or the page ([67265de](https://github.com/Esposter/Esposter/commit/67265de327a5e7d85c6eed7c00c02625634f1700))
* **agent-console:** one Connect button pairs this computer, each browser with a credential of its own ([26a6c59](https://github.com/Esposter/Esposter/commit/26a6c598b78a3c04c0926df369e0ecf03d22f740))
* **agent-console:** one file to download, three plain steps to connect, and a link that can only start the host ([c84a80b](https://github.com/Esposter/Esposter/commit/c84a80b9f4250a5ee27416f92a35053c95f64f0d))
* **agent-console:** the host installs on Windows as one executable carrying its own runtime ([bd535ef](https://github.com/Esposter/Esposter/commit/bd535ef5b872819a9685fd140268888ba4ed3dbc))

# [3.4.0](https://github.com/Esposter/Esposter/compare/v3.3.0...v3.4.0) (2026-09-26)

### Bug Fixes

* **agent-console:** nothing asks the loopback for a host before pairing, and the host tells no site it is there ([cd64c61](https://github.com/Esposter/Esposter/commit/cd64c61cb2c12ae64ae5c3a2e0fd3aa8d4277db0))

# [3.3.0](https://github.com/Esposter/Esposter/compare/v3.2.0...v3.3.0) (2026-09-26)

### Bug Fixes

* **agent-console-server:** an empty token matches nothing, and an empty token file is made afresh ([cc1eb55](https://github.com/Esposter/Esposter/commit/cc1eb5553f6b7282f1707506e543a0635e0562c6))
* **agent-console:** a closed session leaves the host at once, and a pasted non-URL is refused ([7adae26](https://github.com/Esposter/Esposter/commit/7adae26dacf25fe6551cd62ecfcc15c7ad0f8041))
* **agent-console:** a resume point the transcript does not hold is refused, and closing the host waits for its sockets ([d148280](https://github.com/Esposter/Esposter/commit/d148280c72ab2f4146f8bf92588e3e73cdaf17a5))
* **agent-console:** a resumed session merges each file's changes from where it started ([149cdb3](https://github.com/Esposter/Esposter/commit/149cdb31c22c244dfdb3a437ff2f353ea070c0e0))
* **agent-console:** finish moving the prompt from images to attachments ([fd5dcfb](https://github.com/Esposter/Esposter/commit/fd5dcfb7dcec3080437a3210f824cca5f0df8356))
* **agent-console:** repair main's reds — the host package the queue rewrite dropped, restored with the fixes it already had ([6f6868b](https://github.com/Esposter/Esposter/commit/6f6868b98eb0192b45af12a9744f21d668f6cc22))
* **agent-console:** the history suite's SDK mock carries its type parameter ([9c42dca](https://github.com/Esposter/Esposter/commit/9c42dcac027e55f361e9ff8e40cec1ad3e711428))
* **agent-console:** the root lint passes — no loops in the input queue, one close path, the mapper's call named apart from Array.map ([55b1d78](https://github.com/Esposter/Esposter/commit/55b1d78cc1a56a1955c16ed6092e5d94edef057c))
* main goes green — a typecheck, two lint reds, four failing tests and two size snapshots ([d3ad39f](https://github.com/Esposter/Esposter/commit/d3ad39fd18fcd6b69cb10dd3733c90afaff5694a))
* **shared:** add the AgentConsole route the app's product list and the host's pairing link both read ([b809a7f](https://github.com/Esposter/Esposter/commit/b809a7fc401ed8a6b631422cc4e8438827d05b86))
* the queue's red checks — format, icon scan, sizes, graph, cited prose ([8f6b338](https://github.com/Esposter/Esposter/commit/8f6b338cd6491cf9b21b14e7919a3491133c6b2c))
* the release's open findings — unread before a first read, one-sided ranges, a sheet's page, the webhook payload, the token file, xml2js reuse ([07654ff](https://github.com/Esposter/Esposter/commit/07654fff51cef20c20bc4aa30484effe8c707c6f))

### Features

* **agent-console:** an immersive voxel world with bespoke panels in place of the Vuetify work surface (1/3) ([7e63c3b](https://github.com/Esposter/Esposter/commit/7e63c3b62673366ddb3680766a1cb3fb9b695871))
* **agent-console:** stream replies as written, count the turn's tokens, merge each file's diff, rewind files, attach any file ([de177a9](https://github.com/Esposter/Esposter/commit/de177a92e6a20e0abd4e1b0509c5729c762bb114))
* **agent-console:** the host package — wire contracts, the Claude Agent SDK driver, a token-gated loopback WebSocket (2/4) ([2d94c5e](https://github.com/Esposter/Esposter/commit/2d94c5e9a1221b972a59ce7884c94ea0aeab5989))
* **oxlint:** the testing skill's banned matchers fail lint instead of review ([008f1a5](https://github.com/Esposter/Esposter/commit/008f1a54237e2bcdc5a96d8eb824e0a13bc2c82a))

### Performance Improvements

* every awaiting loop overlaps its work or states the shape that keeps it sequential, held by no-await-in-loop ([97c5194](https://github.com/Esposter/Esposter/commit/97c519469ec01364fcd43512096892b67d305461))

### Reverts

* **agent-console:** bring the attachment rename back for the drain fixes that finish it ([528cc40](https://github.com/Esposter/Esposter/commit/528cc40fa0882a7d8645af3f9c5b4dcf5d6b29a3))
* **agent-console:** the attachment rename a window commit carried without its importers ([b231fc3](https://github.com/Esposter/Esposter/commit/b231fc32327b1cd8f8b8ab9c54931caa96efcfaa))
