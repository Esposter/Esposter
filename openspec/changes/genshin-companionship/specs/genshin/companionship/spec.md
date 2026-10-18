## ADDED Requirements

### Requirement: Serenitea Pot Companion Dialogue

A companion in the Serenitea Pot SHALL open its dialogue when its Friendship Level reaches 4 or 7.

#### Scenario: a pot companion's dialogue opens at Friendship Level 4

- **GIVEN** a character who is a companion in the Serenitea Pot and reaches Friendship Level 4
- **WHEN** the level is reached
- **THEN** that companion's level-4 dialogue opens

#### Scenario: a character who is not a pot companion opens no pot dialogue

- **GIVEN** a character who is not a companion in the Serenitea Pot and reaches Friendship Level 4
- **WHEN** the level is reached
- **THEN** no Serenitea Pot dialogue opens

#### Scenario: a dialogue that also waits on a quest stays closed until the quest is done

- **GIVEN** a companion whose level-4 dialogue also waits on a quest not yet done
- **WHEN** the companion reaches Friendship Level 4
- **THEN** the dialogue stays closed until that quest is done

### Requirement: Commission Companionship EXP Grant

A commission claim SHALL grant its Companionship EXP to the friendship grant, and a character already at Friendship Level 10 SHALL gain no further Companionship EXP.

#### Scenario: a commission claim grants its Companionship EXP to the friendship grant

- **GIVEN** a commission whose claim gives Companionship EXP
- **WHEN** the player claims the commission
- **THEN** the Companionship EXP is granted to the deployed characters through the friendship grant

#### Scenario: a character at Friendship Level 10 gains no Companionship EXP

- **GIVEN** a deployed character at Friendship Level 10
- **WHEN** a commission claim grants Companionship EXP
- **THEN** the character gains no Companionship EXP and no level
