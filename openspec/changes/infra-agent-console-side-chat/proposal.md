# Side Chat

## Why

A question about the work in progress, such as what a function the agent just wrote does or whether a name is used elsewhere, asked in the session becomes part of it. It spends the session's context and can steer the next turn. The Code tab's side chat answers such a question without adding anything back to the main conversation, and the console has no equivalent.

## What Changes

A side chat opens beside the conversation for a question that uses the session's context and leaves the session untouched.

- Ctrl+; opens a side chat drawer beside the conversation, with its own composer and its own answers.
- The first question forks the session at its latest message, so the side chat starts with the whole conversation as context while the session itself is untouched.
- The side chat asks and does not act: it opens in plan mode, so a question cannot become edits.
- The side chat is never saved and is not listed among the sessions while it is open.
- Closing the drawer discards the side chat, and nothing it said reaches the main conversation.
- An answer that should steer the work is copied into the main composer by the reader.

## Capabilities

- **infra/agent-console/side-chat** (new)

## Waiting on

None.

## Impact

- The Code tab gains a drawer beside the conversation, opened by Ctrl+;.
- The fork that starts a session gains a way to leave no saved session behind.
- The sessions list leaves an open side chat out.

Size kept as the source page's own: splitting it is a later decision.
