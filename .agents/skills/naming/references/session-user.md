# The Session User

Read when naming the signed-in user's id, or a read scoped to the caller.

- `userId` for the session user's ID — never `me`, `myId` (both in `id-denylist`), `self`. **`my*` on a read is not that ban** — it scopes the read to the caller rather than naming their id (`readMyPermissions`, `readMyInvite`, `readMySentMessages`), which is what separates it from the member-scoped read taking a `userId` beside it
