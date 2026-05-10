# Esbabbler - User Profile Editing Spec

v2 added the profile card (view). This adds editing.

---

## DB Change

`biography` column on `users` table - text, nullable, max 160 chars (`USER_BIOGRAPHY_MAX_LENGTH`); additive migration; shown in profile card beneath display name.

---

## API

`server/trpc/routers/user.ts` - `updateUser` procedure:

- Restricted to `session.userId = targetId`
- Validates: `name` (max 100 chars, `USER_NAME_MAX_LENGTH`), `biography` (max 160 chars, `USER_BIOGRAPHY_MAX_LENGTH`), `image`

---

## Avatar Upload

Reuse existing Azure Blob SAS upload flow (same as file attachments). Client uploads to `/avatars/{userId}` blob path. `image` stored on `users` table.

---

## Edit Profile Dialog

- Accessible from bottom-left user panel (click own username/avatar)
- Fields: `name`, `bio`, avatar upload
- Preview shows profile card as it will appear to others

---

## Implementation Tasks

- [x] **`biography` column** - migration; show in profile card
- [x] **`updateUser` procedure** - `server/trpc/routers/user.ts`; validate `name`, `biography`, `image`
- [x] **Avatar upload** - `uploadProfileImage` via `AzureContainer.PublicUserAssets`
- [x] **Edit profile dialog** - bottom-left user panel; fields + preview
- [x] **Tests** - `server/trpc/routers/user.test.ts`; cover `updateUser` (validation, field limits, clear biography)
