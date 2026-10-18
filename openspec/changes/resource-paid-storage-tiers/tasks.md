## 1. Tier and allowance

- [ ] 1.1 Add the paid tier values to the tier enum and one allowance entry per tier to the quota map, so every allowance is derived from the tier. Verify: a test named after the scenario 'Upgrade raises the allowance at once' sees the paid allowance on both the upload gate and the meter, written first and seen failing.
- [ ] 1.2 Add the subscription table keyed by user, holding the provider's customer and subscription ids, the status and the period end, with the tier as the only quota input. Verify: a test named after the scenario 'Upgrade raises the allowance at once' shows the gate reads the tier and not the subscription row.

## 2. Checkout

- [ ] 2.1 Open a hosted checkout from the storage meter's upgrade affordance, binding the provider customer to the signed-in user before the redirect, with the return redirect only navigating. Verify: a test named after the scenario 'Returning from checkout does not upgrade', and one named 'Abandoned checkout leaves the tier unchanged'.
- [ ] 2.2 Open the hosted customer portal from the meter for card, invoices and cancellation. Verify: a test named after the scenario 'Cancelling keeps the paid tier until the period ends'.

## 3. Provider events

- [ ] 3.1 Verify each event's signature and record it idempotently on the event id, writing the subscription and the tier in one transaction. Verify: tests named after the scenarios 'Verified event updates the subscription', 'Event with a bad signature is refused' and 'Duplicate delivery changes nothing'.
- [ ] 3.2 Attribute each event only through the customer bound at checkout, never through the payload's email or a return url. Verify: tests named after the scenarios 'Event is attributed by the customer bound at checkout', 'Email in the event does not pick the user' and 'Event for an unbound customer is refused'.
- [ ] 3.3 Compare each event with the provider's own ordering timestamp and ignore an older one. Verify: a test named after the scenario 'Late cancellation does not undo a renewal'.
- [ ] 3.4 Hold the paid tier while a payment is past due, and drop it only when the provider cancels. Verify: tests named after the scenarios 'Failed payment keeps the paid tier during the provider's retries' and 'Provider cancellation after retries returns the user to Free'.
- [ ] 3.5 Apply a cancellation at the period end rather than on the click. Verify: a test named after the scenario 'Period end returns the user to Free'.

## 4. Reconciliation

- [ ] 4.1 Set aside an event that exhausts its attempts and reconcile the affected user's tier from the provider's current subscription state on a periodic run. Verify: a test named after the scenario 'Exhausted event is reconciled to the provider's state'.

## 5. Over-allowance state

- [ ] 5.1 Refuse new uploads while usage exceeds the allowance, keep reads working, show the meter's error state above full use, and resume uploads once usage fits. Verify: tests named after the scenarios 'Over-allowance user reads existing files', 'Upload refused while usage exceeds the allowance', 'Uploads resume once deleting brings usage within the allowance' and 'Meter shows an error state above full use'.

## 6. Secret

- [ ] 6.1 Hold the provider's signing secret in the key vault with the other keys, not as an ordinary environment variable. Verify: a preview of the infrastructure (the pulumi-infra skill's preview) creates the secret in the key vault and no application setting carries it.
