---
title: Invite friends picker
description: Proposal — the invite dialog's friends list shipped; the group direct message rows and the friend menu's Invite are what is left.
model: claude-haiku-5-5
---

# Invite Friends Picker

The invite dialog's friends list with an **Invite** beside each has shipped, as [invites](/docs/esbabbler/invites) describes. What remains is the two parts Discord has beside it and ours does not yet.

## What is left

- **Group direct message rows.** Discord's dialog lists recent group DMs beside friends. A group row sits in the same recency order as a friend row and sends the same link into the group with `createMessage`, with no direct message to create. It needs a row kind the list does not yet have, so it is a change of its own.
- **Invite to room on a friend's context menu.** Discord also invites from a friend's right-click menu. It is a second entry point to the same delivery, and it needs a choice of which room to invite into, since the friend's menu has no room in context.

## Sources

- [Discord — how do I invite friends to my server?](https://support.discord.com/hc/en-us/articles/204155938-How-do-I-invite-friends-to-my-server) — "A box will appear with an invite link and direct invite buttons for the friends or group DMs that you've communicated with most recently", and "Invite to Server" from a friend's right-click menu.
