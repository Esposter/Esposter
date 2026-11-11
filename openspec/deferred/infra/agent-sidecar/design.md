# Agent Sidecar

**What it was.** A terminal per agent with panels fed by hooks and the transcript beside it, taken as the shape a surface of ours would have after the [agent console](../../../rejected/infra/agent-console/design.md) was rejected.

**Why deferred.** Alone it is an agent IDE, and those exist and are mature. A sidecar earns its build only for a panel such a tool cannot have, which means something about a session's work that Esposter alone holds. Nothing of that kind is asked for yet: what a session did to a resource is already in the resource's activity log, under the key that edited it ([agent access](../../../specs/architecture/agent-access/design.md)).

**Revisit when:** a question about what a session did to Esposter's content has been asked twice that the activity log and the MCP tools could not answer, and no first-party surface or agent IDE can be extended to show it.

**Cheaper interim:** the activity log, and the prompt Ask Claude composes for any agent. A sidecar built later observes Claude Code's own session through its hooks and transcript and never drives one through the Agent SDK, for the billing reason the rejected console records.
