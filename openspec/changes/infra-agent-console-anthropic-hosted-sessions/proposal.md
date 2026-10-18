# Anthropic-Hosted Sessions

## Why

A reader with no machine left running cannot use the agent console today: every session runs on a computer the reader owns. Anthropic's Managed Agents runs the agent loop and a sandbox per session itself, billed to the reader's own Anthropic API key, so a reader who has only that key can still work a public repository from the sessions tab. A subscription signs in through Claude Code and stays on a machine the reader owns, so the hosted option is the one that takes an API key.

## What Changes

The console gains one more connection for sessions Anthropic hosts, added from the sessions tab like any other connection.

- The reader pastes an Anthropic API key once. The page shows only its last four characters, with Replace and Remove, and never shows the key again.
- Each hosted session runs in a container of its own and clones a public repository the reader names as its first step.
- Hosted sessions appear in the sessions list as one more connection, drawn the same way as a local session.
- A claude.ai subscription does not sign in to the hosted option.
- Private repositories and team-wide keys are not part of this change.

## Capabilities

- **infra/agent-console/anthropic-hosted-sessions** (new)

## Waiting on

None.

## Impact

- The sessions tab gains a hosted connection with an API key form.
- The account settings store one encrypted API key per reader, shown only as its last four characters.
- Usage of hosted sessions is billed to the reader's own key, never to Esposter.
- The console's connection list and session events are reused as they are for the hosted connection.
