---
name: security
description: Apply when a change crosses a trust boundary — a procedure or server route, rendered HTML, an upload, a url or id taken from input, a secret, a new dependency or workflow — when reviewing one for security, or when running the security sweep. Esposter's security review — the OWASP Top 10 read against the repo, each risk pointing at the skill or page that already owns its defence, an accepted risk left to its owning page, and the sources to read where no owner exists yet.
---

# Security

The lens a change or a tree is read through for what an attacker could do with it. It decides nothing itself. Every defence the repo has lives with the subsystem that needs it: the sanitizer with string handling, authorization with tRPC, the CSP with the security posture page. This skill is the checklist that makes sure each of them was asked, and the reading list for a risk none of them covers yet.

## Settled — do not re-propose

- **Restating a defence another skill or page owns.** The sanitizer, the room RBAC builders, the upload SAS, the CSP and the workflow `env:` rule each have one owner. A copy here would drift from the code the owner describes. The checklist points at owners (`references/owasp-top-10.md`).
- **Re-flagging an accepted risk.** A risk its owning page records as accepted is a decision, not a finding. Examples: message images leaking a viewer's IP address, `xssValidator` off, and the Azure hardenings gated on a migration. Only that page's revisit trigger reopens it.
- **Copying a cheat sheet into the skill.** OWASP revises its pages. A link stays right, and a paraphrase goes stale on the next release (`references/sources.md`).
- **A paid scanner or a second security tool as a gate.** The Claude interface is free, and a gate that can hold a push forever is not one. A finding becomes a fix with a regression test, and a finding written twice becomes an enforcer (the `sweeps` skill, `references/handing-to-an-enforcer.md`).

## Rules

- **A verified boundary is cited, not re-derived.** Before reading a flow, find its row in the register of verified boundaries (`apps/web/content/docs/architecture/security/index.md`); a row whose primitive and owner page are unchanged is cited as the answer. A flow verified for the first time gains a row, and a row whose code moved is read again and updated.
- **The server decides anything a client could lie about.** A targeted client obeying an event, a client-chosen type, a caller-sent header — each is a courtesy at most, and the enforcement is server state (`apps/web/content/docs/architecture/security/server-authority.md`).
- **Every trust boundary a change touches is read against the checklist**: each Top 10 category it could hit, answered by the owner the checklist names, "nothing" included (`references/owasp-top-10.md`).
- **Deny by default.** A procedure, route or asset url is reachable only by the builder, guard or grant that states who may reach it. Public is a decision the code states, never the default an omission leaves (the `trpc` skill, `references/room-procedures.md` and `references/ownership-guards.md`).
- **Untrusted input is validated where it enters, and its HTML is sanitized there too.** A render-time allowlist may narrow what the boundary kept, never widen it (the `zod` skill, and the `string-utils` skill, `references/html-sanitization.md`).
- **The server never fetches a url a user supplied** until a design with an allowlist and a resolved-address check exists for it. Every idea that needs one is deferred on that ground today.
- **A secret lives in the secret store and nowhere in the tree**: no config value, no committed env file, no Pulumi secret (the `pulumi-infra` skill).
- **A finding is fixed in the change that finds it**, with its regression test, in its own commit, through the primitive its class needs rather than a check for the one caller. A class of finding the checklist had no row for becomes a row, its defence goes to the skill that owns the subsystem, and the boundary gains a register row.

## Reference pages

- `apps/web/content/docs/architecture/security/index.md` — before reading any flow: the review process and the register of boundaries already verified.
- `references/owasp-top-10.md` — when reading a change or a unit for security: each OWASP Top 10:2025 category, the questions it asks of this repo, and the skill or page that owns the answer.
- `references/sources.md` — when a risk has no owner in the checklist, or a defence is being designed: the OWASP projects, cheat sheets and vendor guides to read first.
- `.agents/ledgers/security/README.md` — when running the security sweep: its areas and its find recipe.
