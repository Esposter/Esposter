# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
