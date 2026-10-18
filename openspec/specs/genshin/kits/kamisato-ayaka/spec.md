## Purpose

Kamisato Ayaka's kit as built: her strikes, charged attack and plunges, Kamisato Art: Hyouka, Soumetsu's storms and Senho's Cryo infusion, with Senho's Cryo application, her first and fourth ascension effects and her other constellations left unbuilt.

## Requirements

### Requirement: Five strikes and charged attack within five metres

Kamisato Ayaka's five strikes and three-hit charged attack SHALL be her normal attacks, and the charged attack SHALL strike every enemy within 5 metres of her.

#### Scenario: Strike chain plays five strikes with a three-hit fourth

- **GIVEN** Ayaka is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order
- **AND** the fourth strike deals three hits

#### Scenario: The charged attack reaches only enemies within 5 metres

- **GIVEN** Ayaka is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack strikes every enemy within 5 metres of her
- **AND** an enemy beyond 5 metres is not struck

### Requirement: Collision and plunges deal their own hits

Ayaka's collision and two plunges SHALL each deal their own hit.

#### Scenario: Plunge deals its own hit

- **GIVEN** Ayaka is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit

### Requirement: Kamisato Art: Hyouka deals its own hit

Kamisato Art: Hyouka SHALL deal its own hit when Ayaka casts it.

#### Scenario: Casting Hyouka lands its hit

- **GIVEN** Ayaka is the character on the field
- **WHEN** the player casts Kamisato Art: Hyouka
- **THEN** its hit lands

### Requirement: Soumetsu's storm stands where Ayaka cast it

Kamisato Art: Soumetsu SHALL raise a storm that stands where Ayaka cast it and strikes with nineteen cuts and a bloom.

#### Scenario: The storm strikes from where it stands

- **GIVEN** Ayaka is the character on the field
- **WHEN** the player casts Kamisato Art: Soumetsu
- **THEN** the storm stands where Ayaka cast it
- **AND** its cuts strike within 3.3 metres and its bloom within 5 metres
- **AND** the storm's path stays provisional until a recording measures it

### Requirement: Senho's infusion runs from the sprint

Kamisato Art: Senho SHALL infuse Ayaka's attacks with Cryo for five seconds after her sprint ends.

#### Scenario: Sprinting infuses her attacks with Cryo

- **GIVEN** Ayaka is the character on the field
- **WHEN** she sprints
- **THEN** her attacks are infused with Cryo
- **AND** the infusion runs out five seconds after the sprint ends

### Requirement: Second constellation adds two smaller storms

From her second constellation, Soumetsu's storm SHALL also raise two smaller storms, each at a fifth of its multipliers and standing with it.

#### Scenario: The two smaller storms stand with Soumetsu's storm

- **GIVEN** Ayaka is at constellation 2
- **WHEN** the player casts Kamisato Art: Soumetsu
- **THEN** two smaller storms stand where the storm stands
- **AND** they reach 1.8 metres and 3 metres
