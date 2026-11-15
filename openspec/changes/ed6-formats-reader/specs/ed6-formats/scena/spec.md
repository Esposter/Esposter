## ADDED Requirements

### Requirement: A scenario script reads as functions and instructions

The reader SHALL read a scena file into its functions, each a list of instructions with an opcode name and its operands, and stop with an error naming the offset at any opcode it does not know.

#### Scenario: A script reads as its functions

- **GIVEN** a scena file of one function holding a dialogue instruction and a return
- **WHEN** it is read
- **THEN** the result holds one function of those two instructions in order

#### Scenario: An unknown opcode stops the read

- **GIVEN** a scena file whose first function holds an opcode the table does not know
- **WHEN** it is read
- **THEN** the read fails with an error naming the opcode and its offset

### Requirement: Dialogue decodes as text

The reader SHALL decode a script's text operands from code page 932 to strings, with Falcom's reused code points read as the characters the games draw.

#### Scenario: A Japanese line decodes as its text

- **GIVEN** a dialogue instruction whose text is a Japanese sentence in code page 932
- **WHEN** the script is read
- **THEN** the instruction's text operand is that sentence

#### Scenario: Falcom's heart reads as a heart

- **GIVEN** a dialogue instruction whose text holds the code point for `㈱`
- **WHEN** the script is read
- **THEN** that character reads as a heart
