# Channel chat header nameplate

**What it was.** The header of the [chat into the session](../../../changes/infra-channel-chat/design.md) page carrying the session's character's name and readable colour, the way the status line carries them ([accent and status line](../../../specs/infra/claude-interface/persona-plugin/accent-and-status-line/design.md)).

**Why deferred.** The channel server starts with the session but is not given the session's id, so there is no session record it can read the character from. The character is picked by the `SessionStart` hook in its own process, and nothing hands the server that result yet. Until something does, the header carries no nameplate and the page stays usable without it.

**Revisit when:** the start hook, or the session record the status line reads, can hand the channel server its character before the page is first served.

**Cheaper interim:** the header without a nameplate. The character's name and colour are on the viewer and in the terminal's status line, which the reader already sees.
