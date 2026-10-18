## ADDED Requirements

### Requirement: Paid allowance follows the storage tier

The storage allowance of a user SHALL be derived from the user's storage tier on every read, so that a change of tier changes the enforced limit and the shown meter at the same moment.

#### Scenario: Upgrade raises the allowance at once

- **GIVEN** a user on the Free tier with files already stored
- **WHEN** the user's tier becomes a paid tier
- **THEN** the upload gate and the storage meter both report the paid tier's allowance
- **AND** the user's stored files are unchanged

### Requirement: A paid tier starts only when the provider reports a subscription

A user's paid tier SHALL begin only when the billing provider reports a completed subscription for that user.

#### Scenario: Returning from checkout does not upgrade

- **GIVEN** a user has just been redirected back from checkout
- **WHEN** the provider has not yet reported the subscription
- **THEN** the user's tier stays Free
- **AND** the redirect only returns the user to the storage page

#### Scenario: Abandoned checkout leaves the tier unchanged

- **GIVEN** a user opened checkout and closed it before paying
- **WHEN** the user's storage is next read
- **THEN** the user's tier stays Free

### Requirement: Provider events are applied only when their signature verifies

A subscription event from the billing provider SHALL be applied only when its signature verifies against the provider's signing key.

#### Scenario: Verified event updates the subscription

- **GIVEN** a subscription event signed by the provider
- **WHEN** the event arrives
- **THEN** the subscription's status and period end are recorded
- **AND** the user's tier follows the subscription

#### Scenario: Event with a bad signature is refused

- **GIVEN** a subscription event whose signature does not verify
- **WHEN** the event arrives
- **THEN** the event is refused
- **AND** neither the user's tier nor the subscription record changes

### Requirement: An event is attributed to the user bound at checkout

A subscription event SHALL be attributed to the user whose checkout created the provider customer the event names, and no other field of the event SHALL decide the user.

#### Scenario: Event is attributed by the customer bound at checkout

- **GIVEN** a provider customer bound to a user when that user opened checkout
- **WHEN** a subscription event names that customer
- **THEN** the event changes only that user's tier

#### Scenario: Email in the event does not pick the user

- **GIVEN** a provider customer bound to user A
- **WHEN** a subscription event names that customer and carries the email address of user B
- **THEN** user A's tier follows the event
- **AND** user B's tier is unchanged

#### Scenario: Event for an unbound customer is refused

- **GIVEN** a provider customer that no checkout has bound to a user
- **WHEN** a subscription event names that customer
- **THEN** the event is refused
- **AND** no user's tier changes

### Requirement: A redelivered event has no further effect

A provider event SHALL take effect once, however many times the provider delivers it.

#### Scenario: Duplicate delivery changes nothing

- **GIVEN** a subscription event that has already been applied
- **WHEN** the provider delivers the same event again
- **THEN** the user's tier and subscription record are unchanged
- **AND** the provider receives an acknowledgement so that it stops retrying

### Requirement: An older event never overwrites a newer subscription state

A subscription event older than the latest event applied to its subscription SHALL be acknowledged and ignored.

#### Scenario: Late cancellation does not undo a renewal

- **GIVEN** a subscription whose renewal event has already been applied
- **WHEN** an earlier cancellation event for the same subscription arrives
- **THEN** the user keeps the paid tier
- **AND** the provider receives an acknowledgement

### Requirement: A failed payment keeps the paid tier until the provider cancels

A subscription that is past due after a failed payment SHALL keep the paid tier until the provider cancels it.

#### Scenario: Failed payment keeps the paid tier during the provider's retries

- **GIVEN** a paid subscription whose payment has failed
- **WHEN** the provider is still retrying the payment
- **THEN** the user keeps the paid tier

#### Scenario: Provider cancellation after retries returns the user to Free

- **GIVEN** a past-due subscription
- **WHEN** the provider cancels it after its retries
- **THEN** the user's tier becomes Free

### Requirement: A cancellation takes effect at the end of the paid period

A cancelled subscription SHALL keep the paid tier until its current period ends, and then SHALL return the user to the Free tier.

#### Scenario: Cancelling keeps the paid tier until the period ends

- **GIVEN** a paid user with a period that has not yet ended
- **WHEN** the user cancels in the customer portal
- **THEN** the user keeps the paid tier until the period end

#### Scenario: Period end returns the user to Free

- **GIVEN** a cancelled subscription whose period has ended
- **WHEN** the period end is reached
- **THEN** the user's tier becomes Free

### Requirement: An event that exhausts its attempts is reconciled from the provider

An event that cannot be applied within its attempt limit SHALL be resolved from the provider's current subscription state for the affected user.

#### Scenario: Exhausted event is reconciled to the provider's state

- **GIVEN** an event that failed on every attempt and was set aside
- **WHEN** the periodic reconciliation runs for the affected user
- **THEN** the user's tier matches the subscription state the provider reports
- **AND** a cancelled subscription leaves the user on Free without a manual step

### Requirement: Usage above the Free allowance blocks new uploads only

A user whose usage exceeds the allowance after a downgrade SHALL keep reading existing files, and SHALL have new uploads refused until usage fits the allowance.

#### Scenario: Over-allowance user reads existing files

- **GIVEN** a user on Free whose stored files exceed the Free allowance
- **WHEN** the user opens a stored file
- **THEN** the file opens as before

#### Scenario: Upload refused while usage exceeds the allowance

- **GIVEN** a user on Free whose stored files exceed the Free allowance
- **WHEN** the user uploads a new file
- **THEN** the upload is refused
- **AND** no stored file is removed

#### Scenario: Uploads resume once deleting brings usage within the allowance

- **GIVEN** a user whose usage is above the allowance and who deletes files
- **WHEN** usage falls to or below the allowance
- **THEN** the user can upload again

#### Scenario: Meter shows an error state above full use

- **GIVEN** a user whose usage is above the allowance
- **WHEN** the storage meter is shown
- **THEN** the meter shows its error state rather than a bar clamped at full

### Requirement: A paid tier changes allowances and cosmetics only

A paid tier SHALL change only numeric allowances and cosmetic unlocks, and SHALL NOT change any permission, moderation outcome or safety control.

#### Scenario: Paid tier raises a numeric allowance

- **GIVEN** a paid user and a Free user
- **WHEN** each adds custom emoji or call backgrounds up to their own limit
- **THEN** the paid user's limit is higher than the Free user's

#### Scenario: Paid and Free users get the same moderation outcome

- **GIVEN** a paid user and a Free user with the same role in a room
- **WHEN** each performs the same moderation action
- **THEN** both receive the same result
