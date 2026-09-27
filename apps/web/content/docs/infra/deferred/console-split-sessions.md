---
title: Console split sessions
description: Two agent console sessions side by side in one page, as the Code tab's split pane shows them — deferred until the workflow comparison shows parallel sessions read at once rather than switched between.
---

# Console Split Sessions

**What it was.** The Code tab's split: "hold Cmd/Ctrl and click a session to open it in a split pane" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)), so two sessions' conversations are read at once.

**Why deferred.** The console already runs sessions in parallel, each with its state in the sessions tab and one click apart, with a notification when a hidden one needs attention ([workflow comparison](/docs/infra/claude-interface/agent-console/workflow-comparison)). A split is a second conversation panel and a second composer on a page whose world already takes the screen, and nothing yet shows two sessions being read together rather than switched between.

**Revisit when:** the workflow comparison's day in the console records switching back and forth between two sessions as a recurring cost.

**Cheaper interim:** the sessions tab, and a second browser tab on the same host.
