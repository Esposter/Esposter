## Purpose

The game's Original Resin as pure state. It regenerates a point each eight minutes to 200, counted from the moment it last changed so it fills while the page is closed, refills from Primogems at six daily prices up to 2,000, and pays a claim five Adventure EXP a point. Its count is on the map's top bar. The blossoms that spend it wait on the challenges that leave them.

## Requirements

### Requirement: Original Resin regenerates to 200 from the time it last changed

The wallet SHALL regenerate one Original Resin every eight minutes, counted from the moment the count last changed, up to 200.

#### Scenario: Count fills while the page is closed

- **GIVEN** the count was 150 when it last changed
- **WHEN** the player opens the page 16 minutes later
- **THEN** the count reads 152

#### Scenario: Regeneration stops at 200

- **GIVEN** the count is 200
- **WHEN** time passes
- **THEN** the count stays at 200

#### Scenario: Count above 200 does not regenerate

- **GIVEN** a refill has taken the count above 200
- **WHEN** time passes
- **THEN** the count does not change

#### Scenario: A spend below 200 starts the next point

- **GIVEN** the count is 200
- **WHEN** a claim takes the count to 195
- **THEN** the next point arrives eight minutes after the spend

### Requirement: Primogems refill Original Resin up to 2000

The player SHALL be able to refill Original Resin with Primogems, restoring 60 at the day's next price, with the count filling to a cap of 2000.

#### Scenario: Refill with Primogems

- **GIVEN** the player holds enough Primogems for the day's next price
- **WHEN** the player refills Original Resin
- **THEN** 60 Original Resin is restored
- **AND** the day's next price is paid in Primogems

#### Scenario: Refill short of the price

- **GIVEN** the player holds fewer Primogems than the day's next price
- **WHEN** the player refills Original Resin
- **THEN** the refill is refused
- **AND** the count and the Primogems are unchanged

#### Scenario: Refill at the cap

- **GIVEN** the count is 2000
- **WHEN** the player refills Original Resin
- **THEN** the refill is refused

#### Scenario: Refills used up for the day

- **GIVEN** the player has made six Primogem refills this game day
- **WHEN** the player refills Original Resin
- **THEN** the refill is refused

### Requirement: The Primogem refill day starts at 04:00 UTC+8

The day's Primogem refills SHALL restart at 04:00 in UTC+8, the game's server time, and not at midnight.

#### Scenario: Refills restart at 04:00

- **GIVEN** the player has used all six refills this game day
- **WHEN** the clock reaches 04:00 in UTC+8
- **THEN** the refills are available again

#### Scenario: Midnight does not restart refills

- **GIVEN** the player has used all six refills this game day
- **WHEN** the clock reaches 00:00 in UTC+8
- **THEN** the refills remain used up

### Requirement: A claim's price follows its blossom kind

A claim SHALL cost Original Resin by its blossom's kind, and a weekly boss SHALL price its claim by how many claims it has had that week.

#### Scenario: Weekly boss priced by its week

- **GIVEN** a weekly boss has had claims already this week
- **WHEN** its next claim is priced
- **THEN** the price reflects how many claims it has had that week

### Requirement: A blossom offers its claim in the ways its kind allows

A blossom's claim SHALL be offered as one claim at its price, and a ley line or a domain SHALL also offer two claims at twice the price or a Condensed Resin for three claims, while a boss offers one claim only.

#### Scenario: Ley line offers three ways to pay

- **GIVEN** a ley line blossom
- **WHEN** its claim is offered
- **THEN** one claim at its price is offered
- **AND** two claims at twice the price are offered
- **AND** a Condensed Resin for three claims is offered

#### Scenario: Boss offers one claim

- **GIVEN** a weekly boss
- **WHEN** its claim is offered
- **THEN** only one claim is offered

### Requirement: No claim is offered before a challenge leaves a blossom

The world SHALL show no claim offer at a blossom while no challenge leaves one to claim.

#### Scenario: No challenge has left a blossom

- **GIVEN** no challenge leaves a blossom to claim
- **WHEN** the player is in the world
- **THEN** no claim prompt is shown

### Requirement: A Condensed Resin pays three claims at a ley line or domain

A Condensed Resin SHALL be spent for three claims at a ley line or a domain, and SHALL be refused at a boss.

#### Scenario: Condensed Resin spent at a ley line

- **GIVEN** the player holds a Condensed Resin and stands at a ley line blossom
- **WHEN** the player spends the Condensed Resin on the claim
- **THEN** three claims are paid
- **AND** no Original Resin is spent

#### Scenario: Condensed Resin refused at a boss

- **GIVEN** the player holds a Condensed Resin and stands at a boss
- **WHEN** the player tries to spend the Condensed Resin on the claim
- **THEN** the spend is refused and nothing is spent

### Requirement: A claim spends resin and pays Adventure EXP

A claim SHALL spend its Original Resin and give five Adventure EXP for each point spent, with any Adventure EXP past rank 60 paid as Mora.

#### Scenario: Claim the resin covers

- **GIVEN** the count holds enough Original Resin for a claim
- **WHEN** the player claims the blossom
- **THEN** the claim's Original Resin is spent
- **AND** five Adventure EXP is gained for each point spent

#### Scenario: Claim the resin does not cover

- **GIVEN** the count holds less Original Resin than the claim's price
- **WHEN** the player tries to claim the blossom
- **THEN** the claim is refused
- **AND** no Original Resin is spent and no Adventure EXP is gained

### Requirement: The map's top bar shows the count out of 200

The map's top bar SHALL show the count of Original Resin out of 200, read when the map opens and held still while the map is open.

#### Scenario: Map opened

- **GIVEN** the count is 180
- **WHEN** the player opens the map
- **THEN** the top bar shows 180 out of 200
- **AND** the figure holds still while the map stays open

### Requirement: A new player starts with a full count

A new player's wallet SHALL hold 200 Original Resin.

#### Scenario: New player's wallet created

- **GIVEN** a new player's wallet is created
- **WHEN** the player first opens the world
- **THEN** the wallet holds 200 Original Resin
