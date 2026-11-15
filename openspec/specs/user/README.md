# Users

The account surface: signing in at `/login` (Google, GitHub, or Facebook — see the [auth architecture](../architecture/auth/design.md)) and managing your identity at `/user/settings` — display name, biography, and profile image, the identity every product (posts, messages, achievements) renders.

## How it works

- **Login** — a provider-button card (`LoginButton` per provider) driving better-auth's social sign-in; the `guest` middleware keeps signed-in users out.
- **Settings** — an introduction card plus a sidebar of sections: Profile, Linked Accounts, Sessions, API Keys, and Delete account, each highlighted as it scrolls into view ([section navigation](../architecture/section-navigation/design.md)). Name and biography save through `user.updateUser` (biography length enforced by the users schema).
- **Profile image** — the standard [two-step presigned upload](../architecture/file-uploads/design.md): `user.generateProfileImageUploadUrl` returns a presigned write url whose lifetime `WRITE_PRESIGNED_URL_DURATION_MS` sets for the fixed blob `${userId}/ProfileImage` in the public user-assets container, the client PUTs the image, and the stable public URL is saved on the user.
- **Account linking** — several social providers per account, managed at `/user/settings`: [account linking](account-linking/design.md).
- **Public profile** — a public page at `/user/[id]` for every user: [public profile](public-profile/design.md).
- **Sessions** — the active sessions at `/user/settings`, revocable one at a time or all at once: [session and device management](session-device-management/design.md).
- **Account deletion** — the Delete account card, its sweep and its order: [account deletion](account-deletion/design.md).
- **Data export** — the Download my data card and its zip: [data export](data-export/design.md).
- Message-scoped user state (presence/status, voice settings, per-room personas) is esbabbler's, not this page's — see [profiles and presence](../esbabbler/profiles-and-presence/design.md) and [settings](../esbabbler/settings/design.md).

## Procedures

| Procedure                            | Auth   | Input                | Purpose                             |
| ------------------------------------ | ------ | -------------------- | ----------------------------------- |
| `user.updateUser`                    | authed | name/biography/image | update own profile                  |
| `user.generateProfileImageUploadUrl` | authed | —                    | presigned URL for the profile image |
| `user.deleteAccount`                 | authed | —                    | delete the account                  |

## Key files

Paths relative to `apps/web/app`.

| File                            | Role                              |
| ------------------------------- | --------------------------------- |
| `pages/login.vue`               | provider sign-in card             |
| `pages/user/settings.vue`       | settings layout                   |
| `pages/user/[id].vue`           | public profile page               |
| `components/User/ProfileCard/`  | name/biography/image editing      |
| `components/User/SessionsCard/` | the sessions list and its dialogs |
| `components/User/Profile/`      | public profile sections           |
| `components/Login/`             | provider buttons                  |

Decided ideas: [rejected](../../rejected/user/).
