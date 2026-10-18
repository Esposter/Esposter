# In-product assistant

## Why

A person working in an editor should not have to leave it to ask an agent for an edit, and asking from inside the editor must not open a second way into the resource. The assistant is a shortcut into the person's own Claude Code session, which then works through the same tools as any agent. Esposter runs no model and holds no model key for it, so the feature costs the person nothing beyond the subscription their Claude Code already runs on.

## What Changes

An editor gets an Ask Claude command that hands the person's line to their own session, which edits the resource through the same tools, scopes and activity as any outside agent.

- Every resource type's editor offers Ask Claude in its toolbar and in the command palette.
- The line goes to a session the person picks on their paired host, or to a new session in a folder they choose when none is open. The prompt names the resource by its id and type.
- The session reaches Esposter with the person's own key, so its edits are limited by that key's scopes and rate limits and recorded in the activity under that key.
- An edit the session saves appears in the open editor, and an unsaved edit of the person's is offered as a choice rather than overwritten.
- With no host paired, the command shows how to pair one rather than falling back to anything hosted.

## Capabilities

- **architecture/ai-native-resources/in-product-assistant** (new)

## Waiting on

- A host the page can pair with: the agent console offers one only once it is shown again, which is outside this proposal.
- `openspec/changes/architecture-ai-native-resources-live-edits/`: an assistant's edit reaches the open editor through live edits.

## Impact

- The editor header of every resource type, which registers the command.
- The agent console's connection, which carries the prompt and the new-session request unchanged.
- The new-session panel's folder choice, shared with the command.
- The follow-ups plugin's MCP server entry, which a session reaches Esposter through, unchanged.
