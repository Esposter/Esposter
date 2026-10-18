## Purpose

The route a question about the game takes through the game's own files: the source that holds the answer, the machine that reads it, and how what is read becomes ours, with nothing of the game's in the repository.

## Requirements

### Requirement: A read of the game's blocks waits for the game to close

A step that reads the installed game's blocks SHALL refuse to start while the game is running.

#### Scenario: The game closed

- **GIVEN** the game is not running
- **WHEN** a step that reads its blocks starts
- **THEN** it reads them

#### Scenario: The game running

- **GIVEN** the game is running
- **WHEN** a step that reads its blocks starts
- **THEN** it stops before reading anything, naming the game's executable
- **AND** nothing is exported

### Requirement: Every shader program a disassembler can read is written beside it

The shaders step SHALL write the assembly of every program its machine's disassembler reads, DXBC and shader model 6 DXIL alike, headed by the names of the constants its registers hold wherever its shader's layouts cover them.

#### Scenario: A DXIL program off Windows

- **GIVEN** a shader holding a shader model 6 DXIL program
- **WHEN** the shaders step runs on a machine with `vkd3d-compiler`
- **THEN** the program's assembly is written beside it
- **AND** its constant registers are named from the shader's layout that covers them

#### Scenario: A program the disassembler cannot read

- **GIVEN** a program the machine's disassembler cannot read
- **WHEN** the shaders step runs
- **THEN** the program is left without its assembly
- **AND** the step goes on to the next program

#### Scenario: No disassembler on the machine

- **GIVEN** a machine without Windows' compiler library and with no `vkd3d-compiler`
- **WHEN** the shaders step runs
- **THEN** it stops with the missing compiler's error rather than writing programs without their assembly

### Requirement: A ported shader's terms are recorded as Exact or Provisional

Each term of a shader ported into our own nodes MUST be recorded on its feature's page as an equation tagged Exact, naming the program it was read from, or Provisional, naming its basis.

#### Scenario: A term read from a program

- **GIVEN** a term a readable program shows
- **WHEN** its port lands
- **THEN** its equation is tagged Exact and names the program

#### Scenario: A term no program shows

- **GIVEN** a term no readable program shows
- **WHEN** its port lands
- **THEN** its equation is tagged Provisional with the basis it was estimated from
- **AND** it is listed as open on the page

### Requirement: The repository records what a read found, never what it read

A change that lands a read's result SHALL hold our own code, data and prose, and SHALL NOT hold an export, a disassembly, decompiled code, decrypted metadata or a material's byte values.

#### Scenario: A shader port lands

- **GIVEN** a shader read from its programs
- **WHEN** its port is committed
- **THEN** the commit holds the node, its test and the equations
- **AND** no assembly or HLSL of the game's

#### Scenario: A register is cited

- **GIVEN** a port whose reasoning rests on a register's line
- **WHEN** it is committed
- **THEN** the line is quoted only in the commit's body
