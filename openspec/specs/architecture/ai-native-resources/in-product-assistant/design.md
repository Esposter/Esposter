# In-product assistant

Built on the [agent content tools](../../agent-content-tools/design.md) and [live edits](../live-edits/design.md). A person working in an editor should not have to leave it to ask an agent for an edit, and asking from inside it must not open a second way in. So the assistant is a shortcut into the person's own Claude Code session, which then works through the tools any agent uses. It also needs a host the page can pair with, which the [agent console](../../../infra/claude-interface/agent-console/README.md) already offers.

## One path

The page never calls `/api/mcp` — the endpoint refuses any request carrying an `Origin` header, which every browser request does — and no model runs inside Esposter. The editor hands the request to a session on the person's own host, and that session reaches the resource through the same tools, under the same key scopes and rate limits, as a session started in a terminal. An in-product edit and an outside agent's edit are then one path: the same tools, the same door, the same activity entry naming the key.

```mermaid
sequenceDiagram
  participant E as editor, Ask Claude
  participant C as connection store
  participant H as agent-console-server
  participant S as Claude Code session
  participant M as /api/mcp
  participant D as content door
  E->>C: the line, with the resource's id and type
  C->>H: PromptCommand, after a CreateSessionCommand if none is open
  H->>S: the prompt
  S->>M: read the content, then update it, with the person's own key
  M->>D: the patch, saved as the owner from the key's device
  D-->>E: onSaveResourceContent, and the editor adopts the edit
```

## The command

**Ask Claude** is registered through `useCommands` from the blade header, so it sits in the toolbar and in the command palette for every type, needing nothing from any. It takes a line of text and sends it through the agent console's connection store as a `PromptCommand` to the session the person picks: one already open on the host, or a new one from a `CreateSessionCommand` in a folder they type, which the command takes as its own field rather than sharing the new-session panel's picker. The prompt names the resource by id and type, so the session's first call is the describe or read tool rather than a search.

The session reaches Esposter through the MCP server entry the follow-ups plugin already ships, with the person's own key, which needs the `Resources` scope ([agent access](../../agent-access/design.md)); the settings card's steps set that up, as the TodoList's Connect an agent dialog does for follow-ups. The edit lands in the open editor through live edits, so the person watches it arrive, and an edit of their own still unsaved meets it as a choice rather than being overwritten.

## Free

A Claude feature in Esposter costs the person nothing beyond the subscription their Claude Code already runs on, the rule the [Claude interface](../../../infra/claude-interface/README.md) is built under. The turn runs in the person's own session, on their own machine and plan, exactly as a line typed into the console does; Esposter calls no model, holds no model key and meters nothing. The [SDK-driven companion](../../../../rejected/infra/sdk-driven-companion/design.md) was rejected partly for being a chat beside the work that holds none of it, and this session is the reverse: the resource is the work, and the session holds and edits it.

With no host paired, the command shows how to pair one rather than falling back to anything hosted, since there is nothing hosted to fall back to.

## Key files

| File                                                                       | Role                                                                  |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/app/components/Resource/Blade/Header.vue`                        | registers Ask Claude for every type                                   |
| `apps/web/app/store/agentConsole/connection.ts`                            | sends the prompt to the paired host                                   |
| `apps/web/app/components/AgentConsole/Panel/NewSession.vue`                | the new-session panel, whose folder picker the command does not share |
| `packages/agent-console-server/src/models/command/PromptCommand.ts`        | the wire a prompt crosses                                             |
| `packages/agent-console-server/src/models/command/CreateSessionCommand.ts` | the wire a new session crosses                                        |
| `packages/follow-ups/.mcp.json`                                            | the MCP server entry a session reaches Esposter through               |
