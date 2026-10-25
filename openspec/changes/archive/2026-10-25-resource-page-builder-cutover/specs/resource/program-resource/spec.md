## ADDED Requirements

### Requirement: A program keeps the reference to a deleted email

A program whose invite email is removed by the cutover SHALL keep its reference to that email and SHALL read the reference as missing.

#### Scenario: A program keeps its reference to a deleted email

- **GIVEN** a program whose invite is bound to an email removed by the cutover
- **WHEN** the owner opens the program
- **THEN** the invite shows that its email is missing
