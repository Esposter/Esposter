# The Point of Need

Read when adding a feature users create things with, deciding where its create action goes, or whether another entry point is owed. The one-line rule is in `SKILL.md`; this page is the whole argument and its two collapses.

## A second entry point a click away is not a missing one

The point-of-need rule asks whether the want can be met from where it is felt, not whether every surface carries
the action. Where creating is already one click from wherever the reader is standing — a card on the area's home,
an entry in its own menu — a third copy on the list beside them is not reachability, it is a control to keep in
sync with the other two. The reference product having one there is not enough on its own: what matters is the
distance from the want to the act, and a click is not a distance.

The finding is a **trip**: settings, another product area, a navigation the reader did not ask for. Count the
clicks before adding the button.

**A scene's prop is an entry point too.** A thing in a game world, a map pin or a diagram node that opens a panel
the page's own chrome already opens is the same second copy, only better disguised: it reads as depth and plays as
a detour, since the person has to walk to it for what one button gives them anywhere. A scene carries only the
actions it is the one place for — acting on the scene itself — and leaves the rest to the chrome. The agent
console's world keeps a prompt on its door and none on the things that opened console tabs
(`apps/web/content/docs/infra/claude-interface/agent-console/voxel-world.md`, Settled).

## Every feature has two surfaces

A feature that users create things with has a **management** surface and a **point-of-need** surface, and they are
never the same place:

| Surface       | Answers                                     | Lives in                     |
| ------------- | ------------------------------------------- | ---------------------------- |
| Management    | show me all of them, rename one, delete one | room or user settings        |
| Point of need | I want one _right now_                      | wherever the absence is felt |

The point of need is found by asking **when does someone first want this?** — not _where would an administrator go
to configure it_. The two answers are almost never the same, and only the second one is easy to find, which is why
features ship with management alone and then read as missing.

**Prime example — custom emoji.** Someone wants an emoji the room does not have at the exact moment they have the
picker open and cannot find it. So `Add Emoji` sits in the picker's own footer, gated on `ManageEmojis`. This is
Slack's arrangement; a settings-only version puts four navigations between the want and the act, and every one of
them is a chance to give up. Settings keeps the set and the deletes, and its empty state names the picker.

Ask it for every new feature: **a saved view, a webhook, a tag, a template** — each has a moment of first want, and
that moment is where its create action goes.

**Two surfaces is what the answer usually is, not what the rule demands.** The rule is that the want is met from
where it is felt; two surfaces is the shape that takes whenever the want is felt somewhere settings is not. Two
cases collapse it back to one, and both are settled below rather than argued per feature: a want that only ever
happens while configuring the room has no second place to put anything (`references/settings-panels.md`), and a want already met one click from where it is felt is met (below). Neither is a licence to ship management alone:
each one has to be argued for the feature in hand, in the terms those sections set.
