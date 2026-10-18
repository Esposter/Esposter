## ADDED Requirements

### Requirement: F offers the claims a cleared blossom affords

Pressing F at a cleared challenge's blossom SHALL offer each claim the held Original Resin affords.

#### Scenario: Pressing F at a cleared challenge's blossom offers its claims

- **GIVEN** a challenge is cleared and its blossom is not yet claimed
- **AND** the player holds enough Original Resin for a claim
- **WHEN** the player presses F at the blossom
- **THEN** the claims are offered to choose from

#### Scenario: Condensed Resin is offered at a ley line or a domain

- **GIVEN** the player holds enough Original Resin for Condensed Resin
- **WHEN** the player presses F at a ley line's blossom or a domain's
- **THEN** Condensed Resin is among the offers

#### Scenario: A blossom the held resin does not afford offers nothing

- **GIVEN** the player holds less Original Resin than the cheapest claim costs
- **WHEN** the player presses F at the blossom
- **THEN** no claim is offered
- **AND** the player's Original Resin is unchanged

#### Scenario: A cleared challenge never claimed gives nothing

- **GIVEN** a challenge is cleared and its blossom is not claimed
- **WHEN** the player leaves the blossom unclaimed
- **THEN** no reward is granted

### Requirement: A claim spends its resin and grants its rewards

Choosing a claim SHALL spend its Original Resin and grant its rewards into the bag and the wallet.

#### Scenario: Choosing an offer spends its resin and grants its rewards

- **GIVEN** the player is offered a claim at a blossom
- **WHEN** the player chooses it
- **THEN** its Original Resin is spent
- **AND** its rewards go into the bag and the wallet

### Requirement: Fragile Resin restores sixty Original Resin

Using Fragile Resin from the bag SHALL restore sixty Original Resin and remove one Fragile Resin from the bag.

#### Scenario: Using Fragile Resin restores sixty Original Resin

- **GIVEN** the bag holds Fragile Resin
- **WHEN** the player uses one
- **THEN** the player's Original Resin rises by sixty
- **AND** one Fragile Resin leaves the bag
