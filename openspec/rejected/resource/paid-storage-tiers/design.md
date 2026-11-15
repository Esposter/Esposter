# Paid Storage Tiers

Let a user buy a larger storage allowance through a merchant-of-record subscription, with the user's tier kept in step with the provider's events. Every user is on a Free tier with a fixed allowance, and the quota mechanism derives each allowance from the tier, so a paid tier is one more value in a map rather than a schema change ([storage quotas](../../../specs/resource/storage-quotas/design.md)). Everything hard about it is the money.

## Why not

Taking money needs a payment layer the repo does not have: no provider, no customer id, no webhook and no price exist anywhere in it. It also ends the project's standing as an open-source, non-profit project, which is the owner's decision to make, not a default a feature takes. The owner has chosen not to take money.

The owner reversing that reopens this, as one decision that names the provider, who sells and the project's licence position. If it is reversed, the provider is a merchant of record (Paddle, Lemon Squeezy) rather than a payment processor. The difference is liability, not fees: a processor leaves the project as the seller, registering for and remitting consumption tax wherever a buyer lives, while a merchant of record is the seller and collects, remits and invoices in its own name. Card data stays with the provider behind a hosted checkout.

A tier may never gate behaviour, moderation or safety. It may raise a numeric allowance or unlock a cosmetic, and nothing else. The moment a permission, a moderation outcome or a safety control depends on who paid, every moderation guarantee acquires an asterisk.

Until the owner decides, the Free allowance is the lever that needs no billing.

## Sources

- [Paddle, what is a merchant of record](https://www.paddle.com/blog/what-is-merchant-of-record) — the merchant of record taking on calculating, filing and remitting sales tax where the customers are, the liability this decision does not carry.
