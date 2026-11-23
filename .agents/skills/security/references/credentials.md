# Credentials

Read when a change adds, widens, renames, rotates or deletes a credential: a Cloudflare token, an ESC key, a GitHub Actions secret or a Worker secret. It also owns how a session handles a value it is given to use. The Cloudflare token list, its consumers and the bootstrap order are not on this page: they are the spec's, in the change that owns them (`openspec/changes/infra-tokens-as-code/`, archived into "openspec/specs/infra/cloudflare-tokens/").

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

## Cloudflare tokens as code

- **The one hand-made token is `bootstrap`.** It is an account token that may write account API tokens, and it is held in ESC as "bootstrapToken". It expires on its own. It is never rotated or deleted, and when it expires the owner makes a new one, which is the one renewal a person does. Nothing else is made by hand.
- **Every other Cloudflare credential is an `AccountToken` resource with one responsibility.** It holds the least permission groups its consumer calls, and it takes each group's id from the provider's data source by the group's name, never a hard-coded id.
- **One token per consumer.** A consumer is the infra provider, the Deploy workflow, RealtimeKit, or an environment's R2 publisher. A consumer's token is merged with another's only where the calls match and neither consumer gains a permission.
- **Widen a token in code, never in the dashboard.** A consumer that needs one more permission gets it from a change to its token resource, and the preview shows it before the apply.
- **Names follow `apps/infra/docs/cloudflare/naming-conventions.md`**: `<env>-tok-esposter-<responsibility>` for an environment's token and `tok-esposter-<responsibility>` for an account's. The `bootstrap` token keeps its name.
- **The R2 S3 key pair is derived from the token.** The access key id is the token's id, and the secret access key is the SHA-256 of its value (Cloudflare's R2 token documentation). The docs do not name the digest's encoding, so the change's first signed request confirms it rather than assuming it.

## Probing a credential's reach

- **Verify** with `GET /accounts/{account_id}/tokens/verify`, the token as a bearer, loaded into the one command's environment. The answer's `id`, `status`, `not_before` and `expires_on` say what the token is and whether it is live.
- **Read permissions** with `GET /accounts/{account_id}/tokens/permission_groups?name=<name>`, which lists a permission group by its name. A read says what a token could do without changing anything.
- **Never probe with a write.** A create, a roll or a delete is a change, not a check, even when it could be undone. A question about reach is answered by the two reads above.

## Notes

- The bearer tokens an app issues to its own clients (a webhook's url token, a program's link token) are a different rule: they are stored as a hash, and the security skill's Rules state it.
