## Purpose

The interaction pill's right end and the selection's move, read off a clean pickup.

## Requirements

### Requirement: The interaction pill's right end

The interaction pill's right end SHALL differ from its reference by no more than 2 percent on average over the region.

#### Scenario: A pill that misses the 2 percent bar is not passed

- **GIVEN** the pill is compared against its clean reference frame
- **WHEN** the region's mean difference is above 2 percent
- **THEN** the pill does not pass

### Requirement: The pill's reference

The pill's reference SHALL be a clean frame over plain ground, with its list scrolled to its last row.

#### Scenario: The reference leaves the pill's right end clear of the scene

- **GIVEN** the reference is cut from a clean frame of the pill over plain ground
- **WHEN** the pill is compared against it
- **THEN** the pill's right end is clear of the scene behind it
