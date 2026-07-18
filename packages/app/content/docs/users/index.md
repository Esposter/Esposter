---
title: Users
description: The account surface — login, the user settings page, and profile identity (name, biography, image).
---

# Users

The account surface: signing in at `/login` (Google, GitHub, or Facebook — see the [auth architecture](/docs/architecture/auth)) and managing your identity at `/user/settings` — display name, biography, and profile image, the identity every product (posts, messages, achievements) renders.

## How it works

- **Login** — a provider-button card (`Login/Button.vue` per provider) driving better-auth's social sign-in; the `guest` middleware keeps signed-in users out.
- **Settings** — an introduction card plus a sidebar-sectioned profile card (General is the only section today). Name and biography save through `user.updateUser` (biography length enforced by the users schema).
- **Profile image** — the standard [two-step SAS upload](/docs/architecture/file-uploads): `user.generateProfileImageUploadUrl` returns a one-hour write SAS for the fixed blob `${userId}/ProfileImage` in the public user-assets container, the client PUTs the image, and the stable public URL is saved on the user.
- **Public profile** — every user has a public page at `/user/[id]` showing their identity, achievement showcase, and posts. See [public profile](/docs/users/public-profile).
- Message-scoped user state (presence/status, voice settings, per-room personas) is esbabbler's, not this page's — see [profiles and presence](/docs/esbabbler/profiles-and-presence) and [settings](/docs/esbabbler/settings).

## Procedures

| Procedure                            | Auth                  | Input                | Purpose                       |
| ------------------------------------ | --------------------- | -------------------- | ----------------------------- |
| `user.readUser`                      | public (rate-limited) | user id              | public identity for a profile |
| `user.updateUser`                    | authed                | name/biography/image | update own profile            |
| `user.generateProfileImageUploadUrl` | authed                | —                    | SAS URL for the profile image |

## Key files

Paths relative to `packages/app/app`.

| File                           | Role                         |
| ------------------------------ | ---------------------------- |
| `pages/login.vue`              | provider sign-in card        |
| `pages/user/settings.vue`      | settings layout              |
| `pages/user/[id].vue`          | public profile page          |
| `components/User/ProfileCard/` | name/biography/image editing |
| `components/User/Profile/`     | public profile sections      |
| `components/Login/`            | provider buttons             |

Open work: [roadmap](/docs/users/roadmap). Decided ideas: [deferred](/docs/users/deferred), [rejected](/docs/users/rejected).
