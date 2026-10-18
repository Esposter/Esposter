## Purpose

The engine's own PMX reader turns an MMD model file into three's space as it reads, since three ships no MMD loader and the workspace has no PMX parser.

## Requirements

### Requirement: A PMX model is read into the scene's coordinates with its parts kept

A PMX model file SHALL be read into the scene's right-handed coordinates, keeping its vertices, triangles, materials, bones, morphs and physics bodies.

#### Scenario: Model read with its parts kept

- **GIVEN** a PMX 2.0 or 2.1 model file
- **WHEN** it is read
- **THEN** its vertices, triangles, materials, bones, morphs and physics bodies are all kept
- **AND** they are in the scene's right-handed coordinates

### Requirement: Positions and joints are mirrored from the file's left-handed space

The reader SHALL mirror every position, normal, bone and joint from the file's left-handed space as it reads, turning each triangle's winding and each joint's ranges to match, so that the model is not drawn inside out.

#### Scenario: Faces show outward after mirroring

- **GIVEN** a model is read
- **WHEN** it is drawn
- **THEN** its faces show outward

#### Scenario: Joint ranges match the mirrored bones

- **GIVEN** a model has joints with ranges
- **WHEN** it is read
- **THEN** each joint's ranges are turned to match the mirrored bones

### Requirement: Every vertex is bound to four bones with weights summing to one

Every vertex SHALL be bound to four bones, with weights that sum to one.

#### Scenario: Vertex bound to one bone moves with it fully

- **GIVEN** a vertex is bound to one bone
- **WHEN** the model deforms
- **THEN** that bone moves the vertex fully

#### Scenario: Weights that exceed one are scaled

- **GIVEN** a vertex's four weights do not sum to one in the file
- **WHEN** it is read
- **THEN** the weights are scaled until they sum to one

#### Scenario: Unused bone slot takes no weight

- **GIVEN** a vertex leaves a bone slot unused
- **WHEN** it is read
- **THEN** that slot takes no weight

### Requirement: Sections the drawing does not use are passed over

The reader SHALL pass over the sections a drawn model does not use, without failing the read.

#### Scenario: Soft bodies are passed over

- **GIVEN** a PMX 2.1 file holds soft bodies
- **WHEN** it is read
- **THEN** the soft bodies are passed over
- **AND** the read completes

#### Scenario: Comments and English names are passed over

- **GIVEN** a file holds comments and names in English
- **WHEN** it is read
- **THEN** the comments and English names are passed over

#### Scenario: Unknown morph kind keeps its place

- **GIVEN** a morph of a kind the reader does not read
- **WHEN** the file is read
- **THEN** the morph keeps its place in the list with nothing in it
- **AND** group morphs still index the right morphs

### Requirement: A model is parsed again each time it is drawn

The reader SHALL parse a model afresh each time it is drawn and SHALL keep no parsed copy of it.

#### Scenario: Redrawn pack is read again

- **GIVEN** a kept character pack is drawn a second time
- **WHEN** its model is drawn
- **THEN** the model is read again from its files

### Requirement: A model of tens of megabytes reads within its committed benchmark

The reader SHALL read a model of tens of megabytes within the time its committed benchmark sets.

#### Scenario: Benchmark read stays within its bound

- **GIVEN** a model of tens of megabytes
- **WHEN** the benchmark reads it
- **THEN** the read stays within the bound the benchmark commits

### Requirement: Physics and morphs are read but not applied yet

The rigid bodies, joints and morphs SHALL be read but not yet applied to the drawn model.

#### Scenario: Hair and cloth stay still

- **GIVEN** a model with hair or cloth physics is drawn
- **WHEN** the scene is drawn
- **THEN** the hair and cloth stay still

#### Scenario: Morphs set no expression

- **GIVEN** a model has morphs
- **WHEN** it is drawn
- **THEN** no morph is applied
