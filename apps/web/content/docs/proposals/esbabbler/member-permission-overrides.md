---
title: Member permission overrides
description: Proposal — the Roles panel becomes a list of entries, roles and members, with a three-state control per member row.
model: claude-haiku-5-5
---

# Member Permission Overrides

The model and write path are built, as [member permission overrides](/docs/esbabbler/member-permission-overrides). What is left is the panel that lets a person use them. Today the Roles settings panel is a list of roles only, so a member's override has no place to be made or seen.

This is the half of Discord's channel permissions we did not build. Theirs is not a list of roles: it is a list of **entries**, each a role _or_ a member, and its add control says so — `Add members or roles`. Ours says `Create role...`, which is both a different control and a smaller idea.

## What is left

The Roles settings panel keeps its shape and changes what fills it:

- The list holds **roles and members**, with a member's avatar where a role has its colour dot. A member appears only when they have an override, so an override outliving its reason is visible in the list.
- `Create role...` becomes **`Add role or member`** — a picker that creates a role from a typed name, or adds an entry for a member already in the room.
- Selecting a role opens today's editor unchanged. Selecting a member opens the same permission list with a **three-state control** per row — deny, inherit, allow — where a role's is a switch. That is the one place the existing two-state switch cannot carry the model, and it is the reason to build the control rather than reuse it.
- A member entry shows what they inherit, so `inherit` reads as the concrete answer it resolves to rather than as a blank.
- Removing a member entry calls `deleteMemberPermissionOverride`, and the member falls back to their roles.
- The role events for an override are not emitted yet. A member's open client keeps the bitfield it read until the next read; a subscription for it is part of this panel's work.

## Key files

| File                                                                           | Change                                    |
| :----------------------------------------------------------------------------- | :---------------------------------------- |
| `apps/web/app/components/Message/Model/Room/Settings/Type/Role/List/`          | entries rather than roles                 |
| `apps/web/app/components/Message/Model/Room/Settings/Type/Role/CreateForm.vue` | `Add role or member`                      |
| `apps/web/app/components/Message/Model/Room/Settings/Type/Role/Permission/`    | the three-state control beside the switch |

## Notes

The three-state control is the piece with no precedent in the app, and it is worth resisting the temptation to fake it with two switches. Discord's own affordance is one segmented control per row with the inherited value shown behind the neutral position, which reads as one decision rather than two that can contradict each other.

## Sources

- [Discord — setting up permissions FAQ](https://support.discord.com/hc/en-us/articles/206029707-Setting-Up-Permissions-FAQ) — a channel's permission entries, added with **Add members or roles**, each allowing or denying a permission against what the roles give.
- [Discord — roles and permissions](https://support.discord.com/hc/en-us/articles/214836687-Discord-Roles-and-Permissions) — Administrator granting every permission and bypassing every channel restriction, the rule that no override reaches it.
