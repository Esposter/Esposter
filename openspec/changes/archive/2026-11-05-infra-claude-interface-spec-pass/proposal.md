# Claude interface spec pass

## Why

When the [agent console is retired](../infra-agent-console-retirement/design.md), its references are swept mechanically: a name is removed wherever it appears. That leaves the pages that survive true on the surface and possibly wrong underneath, because a page can lose its reason without naming what it lost. A mod's design that promised a view only the console could draw, a roadmap ordered around a console that no longer exists, and a convention that was taught through the console's examples are all still readable and no longer right.

## What Changes

- Each surviving page of the Claude interface is re-read against the code it describes, and what no longer matches is corrected or deleted.
- The infra area's open changes and roadmap are re-triaged against the new direction, each kept, deferred or rejected, after reading what was already decided.
- The pages around Ask Claude, agent access and follow-ups are re-read for any step that assumed a host.
- The workspace's spec checks are run over the result.

## Capabilities

None. The pass edits and removes specs and moves ideas between folders, and designs no behaviour, so it carries no spec delta (`skip_specs`).

## Impact

- The persona, voice and mods pages are unchanged in substance and corrected where they leaned on the console.
- The infra roadmap lists only work that still has a place.
- No page is left that is true only because nobody re-read it.
