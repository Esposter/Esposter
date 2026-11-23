# Infra tokens as code

## Why

The estate runs on one hand-made Cloudflare account token. The Pulumi provider, the Deploy workflow and the RealtimeKit provisioning all hold its value, so a permission any one of them needs widens all of them, and no token can be read, renewed or deleted without touching every consumer. The R2 S3 key pair the publishers sign with is a second hand-made credential. Nothing in the repository declares either, so a preview cannot show what they may do.

## What changes

- Only the account token `bootstrap` is made by hand. It is held in ESC as `bootstrapToken`, creates the other tokens, and expires on its own.
- Each consumer gets one `AccountToken` resource with the least permission groups its calls need: the infra provider, the Deploy workflow, RealtimeKit, and each environment's R2 publisher. The permission groups are read by name from the provider's data source.
- The provider, the GitHub `CLOUDFLARE_API_TOKEN` secret and the R2 S3 key pairs take their values from those resources' outputs. Nothing is copied by hand.
- The hand-made tokens and ESC keys they replace are deleted once their consumers have moved.

## Impact

- `apps/infra` gains the token resources, a bootstrap provider and an explicit provider for the program's Cloudflare resources. Every Cloudflare resource is given that provider.
- The naming convention for tokens is written in `apps/infra/docs/cloudflare/naming-conventions.md`, and the rules in `.agents/skills/security/references/credentials.md`.
- The RealtimeKit provisioning stops creating tokens: its token is the Pulumi one, so the provisioning token needs no account token permission.
- The first apply, the cleanup and the archive are the lead's, with the commands in `tasks.md`, because they need the bootstrap token and touch production.
