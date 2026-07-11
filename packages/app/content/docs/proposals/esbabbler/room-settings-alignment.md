---
title: Room settings alignment
description: Proposal — restructure room settings IA/naming to match Discord Server Settings.
---

# Room Settings Discord Alignment

Rename and regroup the existing room-settings panels to Discord Server Settings parity. **No new behaviour** — this restructures the existing `Room/Settings/Type/*` panels only.

## Scope

**Today:** room settings panels exist but their IA diverges from Discord (a combined Permissions panel, members/invites mixed in, Webhooks top-level, Word Filter standalone).

**This changes:**

- Rename **Permissions** → **Roles** (matching `roomRoles` and Discord).
- Split **Members** and **Invites** into their own tabs.
- Nest **Webhooks** under a new **Integrations** group.
- Group **Word Filter** under a **Moderation** group (alongside Bans and the Audit Log).

## How it works

Pure client refactor of the settings maps (`SettingsType` enum values, list-item map, content map, `SettingsPermissionMap`) plus the two-level nav the user-settings dialog already proved (`v-list-group` categories → section scrollspy — see [/docs/esbabbler/settings](/docs/esbabbler/settings)). Permission gating per panel stays exactly as-is; only grouping/naming moves.

## Key files

| File                                                                            | Change                                      |
| :------------------------------------------------------------------------------ | :------------------------------------------ |
| `packages/app/app/models/message/room/RoomSettingsType.ts` (or equivalent enum) | renamed/added values                        |
| `packages/app/app/services/message/room/settings/*Map.ts`                       | regrouped list-item/content/permission maps |
| `packages/app/app/components/Message/Model/Room/Settings/Type/`                 | folder moves to match new grouping          |

## Notes

Check `rejected/` first when tempted to add panels during this pass — this proposal is strictly a reorganisation; new moderation behaviour belongs to [automod actions](/docs/proposals/esbabbler/automod-actions) and friends.
