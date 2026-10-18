# Paid Storage Tiers

## Why

Every user is on a Free tier with a fixed storage allowance, and there is no way to buy more. The quota mechanism already derives each allowance from the user's tier, so a paid tier is one more value in a map rather than a schema change. The hard part is the money: taking payment, keeping the user's tier correct against the provider's events, and never stranding a downgraded user. Taking money also turns the deferred account deletion and data export obligations into the price of shipping.

## What Changes

Let a user buy a larger storage allowance through a merchant-of-record subscription, with the user's tier kept in step with the provider's events.

- Paid storage tiers are added to the tier values and the quota map together; every allowance stays a pure function of the tier.
- A user upgrades from the storage meter through a hosted checkout, and changes the card, sees invoices and cancels in the provider's hosted customer portal.
- The provider's signed subscription events are the only thing that sets a paid tier; returning from checkout only navigates.
- Events are deduplicated, applied only when newer than the subscription's latest state, and attributed through the customer bound at checkout.
- A failed payment keeps the paid tier until the provider cancels; a cancellation takes effect at the end of the paid period.
- A user above the Free allowance after a downgrade keeps reading their files and cannot upload until usage fits.
- A paid tier raises numeric allowances and unlocks cosmetics only; it never gates a permission, a moderation outcome or a safety control.

## Capabilities

- **resource/paid-storage-tiers** (new)

## Waiting on

- Account deletion and data export: the design says paid tiers ship alongside them, or not at all. Both are deferred pages, not yet OpenSpec changes, so there is no change id to name.

## Impact

- The storage tier values and the allowance map in the shared model and services.
- A new subscription table in the storage schema, keyed by user, holding the provider's customer and subscription ids, the status and the period end. The tier stays the only input the upload gate reads.
- A signed, idempotent provider event route on the server, which writes the subscription and the tier in one transaction.
- The storage meter in the explorer header: the upgrade affordance and the over-quota error state.
- The provider's signing secret in infrastructure, held with the other keys rather than as an ordinary environment variable.

Size kept as the source page's own: splitting it is a later decision.
