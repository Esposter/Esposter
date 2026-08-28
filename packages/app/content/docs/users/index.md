---
title: Users
description: The account surface — login, the user settings page, and profile identity (name, biography, image).
---

# Users

The account surface: signing in at `/login` (Google, GitHub, or Facebook — see the [auth architecture](/docs/architecture/auth)) and managing your identity at `/user/settings` — display name, biography, and profile image, the identity every product (posts, messages, achievements) renders.

## How it works

- **Login** — a provider-button card (`LoginButton` per provider) driving better-auth's social sign-in; the `guest` middleware keeps signed-in users out.
- **Settings** — an introduction card plus a sidebar of sections: Profile, Linked Accounts, and Sessions, each highlighted as it scrolls into view ([section navigation](/docs/architecture/section-navigation)). Name and biography save through `user.updateUser` (biography length enforced by the users schema).
- **Profile image** — the standard [two-step SAS upload](/docs/architecture/file-uploads): `user.generateProfileImageUploadUrl` returns a one-hour write SAS for the fixed blob `${userId}/ProfileImage` in the public user-assets container, the client PUTs the image, and the stable public URL is saved on the user.
- **Account linking** — one account can hold several social providers, listed and managed at `/user/settings`. See [account linking](/docs/users/account-linking).
- **Public profile** — every user has a public page at `/user/[id]` showing their identity, achievement showcase, and posts. See [public profile](/docs/users/public-profile).
- **Sessions** — every active session listed at `/user/settings`, revocable one at a time or all but the current one, with push subscriptions and live connections going with the session. See [session and device management](/docs/users/session-device-management).
- Message-scoped user state (presence/status, voice settings, per-room personas) is esbabbler's, not this page's — see [profiles and presence](/docs/esbabbler/profiles-and-presence) and [settings](/docs/esbabbler/settings).

## Procedures

| Procedure                            | Auth                  | Input                | Purpose                       |
| ------------------------------------ | --------------------- | -------------------- | ----------------------------- |
| `user.readUser`                      | public (rate-limited) | user id              | public identity for a profile |
| `user.updateUser`                    | authed                | name/biography/image | update own profile            |
| `user.generateProfileImageUploadUrl` | authed                | —                    | SAS URL for the profile image |
| `session.readSessions`               | authed                | —                    | own sessions, current marked  |
| `session.deleteSession`              | authed                | session id           | revoke one session            |
| `session.deleteOtherSessions`        | authed                | —                    | revoke all but the current    |

## Key files

Paths relative to `packages/app/app`.

| File                            | Role                              |
| ------------------------------- | --------------------------------- |
| `pages/login.vue`               | provider sign-in card             |
| `pages/user/settings.vue`       | settings layout                   |
| `pages/user/[id].vue`           | public profile page               |
| `components/User/ProfileCard/`  | name/biography/image editing      |
| `components/User/SessionsCard/` | the sessions list and its dialogs |
| `components/User/Profile/`      | public profile sections           |
| `components/Login/`             | provider buttons                  |

Open work: [roadmap](/docs/users/roadmap). Decided ideas: [deferred](/docs/users/deferred), [rejected](/docs/users/rejected).
