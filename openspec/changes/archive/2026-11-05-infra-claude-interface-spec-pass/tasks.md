## 1. The surviving pages

- [x] 1.1 Read the persona plugin, spoken replies, genshin mods, per-character voices and reference selection pages against their code, and correct or delete each statement that leaned on the console, among them the mod page's line about the console not showing mods and the commission page's view of other sessions. Verify: the commit body lists each corrected or deleted statement with the page, and a grep of `openspec/specs/infra/claude-interface` for "console" returns nothing that is not about a terminal's own console.
- [x] 1.2 Re-read the Claude interface README, its survey and its stage diagram, and restate the stages as they now are. Verify: the page's lead and its consequences read against the body, and the workspace's diagram and link tests pass.

## 2. Triage

- [x] 2.1 Re-triage the infra roadmap and every open infra change after the console: read `deferred/` and `rejected/` first, then keep, defer or reject each, re-linking any that waited on the console or its driver. Verify: each remaining roadmap item links a design that exists, and the openspec validator passes for every open infra change.

## 3. The pages around Ask Claude

- [x] 3.1 Re-read the pages for agent access, agent content tools, the resource follow-ups and the resource assistant for any step that assumed a paired host, and restate them for a prompt carried to any agent. Verify: a grep for "paired host" and "pairing" across those pages returns nothing, and their Key files tables name files that exist.

## 4. Close

- [x] 4.1 Run the workspace's spec checks over the result. Verify: `pnpm -C scripts exec vitest run src/workspace src/services/openspec` passes, and `pnpm exec openspec validate infra-claude-interface-spec-pass --strict --no-interactive` passes.
