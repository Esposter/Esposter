---
title: Console task suggestions
description: A session suggesting new sessions for work outside its scope, shown as chips to start them, as the Code tab does — deferred with cross-session messages, since both are sessions acting on other sessions.
---

# Console Task Suggestions

**What it was.** In the Code tab, "Claude suggests new sessions as task chips for out-of-scope work", and a click starts one ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why deferred.** A suggestion is one session reaching into the list of sessions — the same seam [cross-session messages](/docs/infra/deferred/console-cross-session-messages) waits on, where a session reads and messages another. Until a session can see the others, a chip has nowhere to come from but a tool of the console's own, which parity does not ask for. A person already starts a session for the aside from the sessions tab, and asks one beside the session in [side chat](/docs/proposals/infra/agent-console/side-chat).

**Revisit when:** cross-session messages ship, so a session can hand work to a new one.

**Cheaper interim:** the sessions tab's New, in the same repository.
