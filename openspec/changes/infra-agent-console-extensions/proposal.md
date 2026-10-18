# Extensions

## Why

Tooling outside the app should be able to show its own interface inside the agent console without the console knowing that tool exists, and first-party panels that need the scene should join through one registry entry. The rule is the least code on either side: a tool should not have to know the console exists, and the console should not have to know any tool. Two tiers meet that. The first, opening an app page in the side pane, is already built, so this change covers the other two.

## What Changes

Tools and first-party panels can appear in the console through two tiers, and a tool uses the cheaper one that fits.

- A tool's own interface, declared by its MCP server, renders inline under the tool call that produced it, and can be popped into the side pane.
- Each such app runs in a sandboxed frame, can act only through the session, and takes no more authority than the session has.
- An app that cannot be read or throws shows a card naming its server and the reason, and the session carries on unchanged.
- A first-party view is one registry entry and one component, and a theme shows whichever views the reader has open.
- The host side of the external tier is blocked until the session's SDK can carry an app's tool calls.

## Capabilities

- **infra/agent-console/extensions** (new)

## Waiting on

- The Agent SDK's control protocol can run an MCP tool through the session's connection, but its public query interface exposes no method for it, in the installed release or the latest published one. Resume when a public method arrives, or when the host's transport boundary changes.

## Impact

- The console's tool-call view gains an inline app frame and a pop-out into the side pane.
- The permission card that answers the agent's own calls also answers an app's calls.
- The console's views gain a registry, with the first first-party view added with its own change.
- Tools outside Esposter gain the console with no console-specific code.
