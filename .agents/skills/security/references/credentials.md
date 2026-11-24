# Credentials

Read when a change adds, widens, renames, rotates or deletes a credential: a Cloudflare token, an ESC key, a GitHub Actions secret or a Worker secret. It also owns how a session handles a value it is given to use. The Cloudflare token list, its consumers and the bootstrap order are not on this page: they are the spec's, in `openspec/specs/infra/cloudflare-tokens/design.md`.

## Where a secret lives

A secret is never in the tree and never in a stack file, encrypted or not. `pulumi config set --secret` writes the ciphertext into `Pulumi.prod.yaml`, a tracked file in a public repository, and rests the secret on one algorithm and one key for as long as the repository lives. Every secret this estate holds is in the `esposter-infra/prod` ESC environment, which the stack imports. The `pulumi env set` form is in `apps/infra/docs/stacks.md`, and `scripts/src/workspace/stackConfig.test.ts` fails a stack file carrying an encrypted value.

## Handling

- A secret sits in one command's environment and nowhere else. Load it with `VAR="$(…)" command`, so it exists only for that process.
- Never print it, echo it, log it or write it to a file, the scratchpad included. That holds in part as well as in whole, and for a ciphertext or a hash of the value.
- Check a value by its name and length only: `echo ${#NAME}`. A Cloudflare token is checked by the verify call in "Probing a credential's reach", never by printing it.
- List an ESC environment by its key names only. `pulumi env open`, a `pulumi env get` of a whole environment, `cat` of an env file and an `env` dump all print values.
- A value that reached a transcript is a value to rotate. Rotating is the owner's decision.

## Lifecycle

- A secret the code needs is generated in the change that needs it, with no question asked. Each environment gets its own value, distinct between dev and prod, set in ESC under `pulumiConfig.esposter-infra:<env>_<NAME>` with `pulumi env set … --secret`, where `<NAME>` is the Worker secret's name in `.github/worker-secrets.json`.
- The change checks each value by its length before it lands. The deploy gate refuses a Worker whose secret its schema rejects, so a key left unset fails the deploy rather than the site (`openspec/specs/architecture/environment/design.md`, "Secrets and vars").
- An ESC key takes its Worker secret's name, because the deploy reads `<env>_<NAME>` by that name.

## Cloudflare tokens

A consumer that needs one more permission gets it from a change to its token resource, and the preview shows it before the apply, never from the dashboard. The token list is the spec's, named in the intro above.

## Probing a credential's reach

- **Verify** with `GET /accounts/{account_id}/tokens/verify`, the token as a bearer, loaded into the one command's environment. The answer's `id`, `status`, `not_before` and `expires_on` say what the token is and whether it is live.
- **Read permissions** with `GET /accounts/{account_id}/tokens/permission_groups?name=<name>`, which lists a permission group by its name. A read says what a token could do without changing anything.
- **Never probe with a write.** A create, a roll or a delete is a change, not a check, even when it could be undone. A question about reach is answered by the two reads above.

## Notes

- The bearer tokens an app issues to its own clients (a webhook's url token, a program's link token) are a different rule: they are stored as a hash, and the security skill's Rules state it.
