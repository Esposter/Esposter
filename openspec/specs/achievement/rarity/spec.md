## Purpose

Every achievement card shows the share of Esposter users who have unlocked it, marks the rare ones, and the gallery can sort rarest first. Rarity is a per-achievement fact and does not appear in unlock toasts.

## Requirements

### Requirement: Each card shows its unlock percentage

The gallery SHALL show on each achievement card the percentage of registered users who have unlocked that achievement.

#### Scenario: Card shows the share of users who unlocked it

- **GIVEN** 50 of 200 registered users have unlocked an achievement
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's card shows 25%

#### Scenario: Achievement nobody has unlocked

- **GIVEN** no registered user has unlocked an achievement
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's card shows 0%

### Requirement: The percentage is taken over every registered user

The unlock percentage SHALL use all registered users as its denominator, not only the users of the product an achievement belongs to.

#### Scenario: Share counted across all registered users

- **GIVEN** 10 of 100 registered users have unlocked an achievement that belongs to one product
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's card shows 10%

### Requirement: Hidden achievements show their percentage

The gallery SHALL show the unlock percentage of a hidden achievement the same way as for a visible one.

#### Scenario: Hidden achievement shows its percentage

- **GIVEN** a hidden achievement has been unlocked by 5% of registered users
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's card shows 5%

### Requirement: Rare achievements carry a Rare mark

The gallery SHALL mark an achievement as Rare when its unlock percentage falls below the rare threshold.

#### Scenario: Percentage below the threshold

- **GIVEN** an achievement's unlock percentage is below the rare threshold
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's card carries a Rare mark

#### Scenario: Percentage at or above the threshold

- **GIVEN** an achievement's unlock percentage is at or above the rare threshold
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's card carries no Rare mark

### Requirement: The sort control offers Rarest first

The gallery SHALL offer a sort control whose default is Category order and whose alternative is Rarest first.

#### Scenario: Category order is the default

- **GIVEN** a visitor opens the achievements gallery
- **WHEN** the gallery first renders
- **THEN** achievements are listed in category order

#### Scenario: Rarest first lists the lowest percentages first

- **GIVEN** the rarity percentages have loaded
- **WHEN** a visitor chooses Rarest first
- **THEN** achievements are listed from the lowest unlock percentage to the highest

#### Scenario: Category order held until the percentages load

- **GIVEN** the rarity percentages have not loaded yet
- **WHEN** a visitor chooses Rarest first
- **THEN** achievements stay in category order until the percentages arrive

### Requirement: The rarity read is rate limited

The rarity read SHALL be rate limited, so requests beyond the allowance are refused.

#### Scenario: Requests beyond the allowance are refused

- **GIVEN** a caller has used up the rarity read's allowance
- **WHEN** the caller requests the rarity percentages again
- **THEN** the request is refused

### Requirement: Percentages reflect current unlocks

The gallery SHALL compute each percentage from the current unlock counts each time it loads, with no stored total that can fall out of date.

#### Scenario: A new unlock shows on the next view

- **GIVEN** a user unlocks an achievement
- **WHEN** a visitor next views the achievements gallery
- **THEN** that achievement's percentage includes the new unlock

### Requirement: Unlock toasts omit rarity

The unlock toast SHALL NOT show an achievement's unlock percentage or its Rare mark.

#### Scenario: Toast for a rare unlock

- **GIVEN** a user unlocks an achievement that is marked Rare
- **WHEN** the unlock toast appears
- **THEN** the toast shows no unlock percentage and no Rare mark
