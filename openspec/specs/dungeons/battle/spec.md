## Purpose

The battle state machine and the damage, experience, level-up, capture, and flee math. A battle is a turn-based one-on-one fight that ends in victory, a capture, an escape, or a party wipe.

## Requirements

### Requirement: Battle turn structure

The battle SHALL run in turns, each opening with the player choosing an action and resolving the attacks of both sides in a fixed priority order.

#### Scenario: Attack order follows the priority rule

- **GIVEN** the player has chosen Fight
- **WHEN** the turn's attacks are about to resolve
- **THEN** the battle orders the two attacks by its priority rule so that one side attacks first

#### Scenario: Turn ends once both sides have acted

- **GIVEN** the player has chosen Fight and neither monster has fainted
- **WHEN** both attacks of the turn have resolved
- **THEN** the battle returns to the player's choice of action

### Requirement: Player action choices

The battle SHALL offer the player Fight, Switch, Item, and Flee as the actions available each turn.

#### Scenario: Fight plays out the turn's attacks

- **WHEN** the player chooses Fight
- **THEN** the attacks of the turn are played out

#### Scenario: Switch brings out another party monster

- **WHEN** the player chooses Switch
- **THEN** the player picks a party monster to bring out
- **AND** the enemy then acts

#### Scenario: A capture ball attempts a capture

- **WHEN** the player uses a capture ball during battle
- **THEN** a capture attempt is made against the enemy

#### Scenario: A healing item lets the enemy act

- **WHEN** the player uses a healing item during battle
- **THEN** the enemy then acts

### Requirement: Damage scales with attack, power, and defense

The damage an attack deals SHALL rise with the attacker's attack and the attack's power, fall with the defender's defense, and vary randomly from one hit to the next.

#### Scenario: A stronger attack hits harder

- **GIVEN** two attacks used by the same attacker against the same defender
- **WHEN** one attack has a higher power than the other
- **THEN** the stronger attack deals more damage on average

#### Scenario: Higher defense takes more damage away

- **GIVEN** the same attacker and attack
- **WHEN** the defender has more defense
- **THEN** the attack deals less damage on average

#### Scenario: Defense never makes a monster immune

- **GIVEN** a defender with very high defense
- **WHEN** an attack hits it
- **THEN** the attack still deals at least one point of damage

#### Scenario: Repeated hits vary

- **WHEN** the same attack hits the same defender twice
- **THEN** the damage of the two hits can differ

### Requirement: Enemy attack choice

The enemy SHALL choose each of its attacks uniformly at random from the attacks its species knows.

#### Scenario: Each known attack is equally likely

- **WHEN** the enemy's turn to attack comes
- **THEN** each attack in its kit is equally likely to be used

### Requirement: Experience and level-up

A monster that defeats an enemy SHALL gain experience scaled by the defeated enemy's base experience and level, and SHALL level up each time its experience passes the next level threshold.

#### Scenario: Defeating an enemy grants experience

- **WHEN** the player's monster defeats an enemy
- **THEN** the monster gains experience scaled by the enemy's base experience and level

#### Scenario: Passing thresholds levels the monster up

- **WHEN** a monster's experience passes one or more level thresholds
- **THEN** the monster levels up once for each threshold passed

#### Scenario: Each level-up grows the monster's stats

- **WHEN** a monster levels up
- **THEN** its maximum health grows by 5 to 8 points, its attack by 1 to 2 points, and its defense by 1 to 2 points, each by a random amount within that band

### Requirement: Capture odds rise as the enemy weakens

A capture ball SHALL succeed with a chance that rises as the enemy's health falls, so weakening the enemy before throwing a ball improves the odds.

#### Scenario: A successful capture joins the party

- **WHEN** a capture ball is used and the capture succeeds
- **THEN** the enemy monster joins the player's party
- **AND** the battle ends

#### Scenario: A near miss tells the player it almost worked

- **WHEN** a capture ball is used and the capture misses by a small margin
- **THEN** the player is told the capture almost worked
- **AND** the capture fails and the enemy acts

#### Scenario: A failed capture lets the enemy act

- **WHEN** a capture ball is used and the capture misses
- **THEN** the capture fails
- **AND** the enemy acts

### Requirement: Fleeing is a random attempt

Fleeing SHALL succeed on a random attempt, and a failed attempt SHALL forfeit the player's turn.

#### Scenario: A successful flee ends the battle

- **WHEN** the player flees and the attempt succeeds
- **THEN** the battle ends

#### Scenario: A failed flee forfeits the turn

- **WHEN** the player flees and the attempt fails
- **THEN** the player's turn is forfeited
- **AND** the enemy acts

### Requirement: Battle outcomes

A battle SHALL end in victory, a capture, an escape, or a party wipe.

#### Scenario: Defeating the enemy wins the battle

- **WHEN** the enemy faints
- **THEN** experience is awarded to the player's monster
- **AND** the battle ends in victory

#### Scenario: Losing the last party monster ends the battle

- **WHEN** the player's last party monster faints
- **THEN** the battle ends in a party wipe
