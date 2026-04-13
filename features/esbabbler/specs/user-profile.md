# Esbabbler - User Profile Editing Spec

v2 added the profile card (view). This adds editing.

---

## DB Change

`bio` column on `users` table - text, nullable, max 160 chars; additive migration; shown in profile card beneath display name.

---

## API

`server/trpc/routers/user.ts` - `updateUser` procedure:

- Restricted to `session.userId = targetId`
- Validates: `name` (max 100 chars, existing `USER_NAME_MAX_LENGTH`), `bio` (max 160 chars), `image`

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

- [ ] **`bio` column** - migration; show in profile card
- [ ] **`updateUser` procedure** - `server/trpc/routers/user.ts`; validate `name`, `bio`, `image`
- [ ] **Avatar upload** - `/avatars/{userId}` blob path; store `image` on `users`
- [ ] **Edit profile dialog** - bottom-left user panel; fields + preview
- [ ] **Tests** - `server/trpc/routers/user.test.ts`; cover `updateUser` (validation, auth guard, field limits)
