## ADDED Requirements

### Requirement: Each fitted place stands on the ground beneath it

Each fitted place SHALL stand at its fitted position on the ground beneath it, on the top of the landmark that holds it, or on the floor of its underground layer.

#### Scenario: A fitted place stands on the ground beneath it

- **GIVEN** a fitted place on open ground in a region
- **WHEN** the player walks to the place
- **THEN** the place stands on the ground at its fitted position

#### Scenario: A place on a landmark stands on its top

- **GIVEN** a fitted place whose position is on a landmark's collision
- **WHEN** the player walks to the place
- **THEN** the place stands on the top of the landmark

#### Scenario: An underground place stands on its layer's floor

- **GIVEN** a fitted place in an underground layer
- **WHEN** the player walks to the place
- **THEN** the place stands on that layer's floor

#### Scenario: A place whose ground cannot be found is reported

- **GIVEN** a fitted place with no ground beneath it to stand on
- **WHEN** the region's places are built
- **THEN** the build reports the place
- **AND** the place is not given a guessed height

### Requirement: Only fitted places are written into region data

The region data SHALL hold only the places that were fitted from the official map, each with its kind and its fitted position.

#### Scenario: Only fitted places are written

- **GIVEN** a region whose map points include points the fit did not match
- **WHEN** the region's places are built
- **THEN** the region data holds only the fitted places
- **AND** the unfitted points are left out

### Requirement: Enemy camps are clustered from the map's enemy marks

Enemy camps SHALL be formed by clustering a family's enemy marks by distance, each camp replacing the stand-in camp of its region.

#### Scenario: Nearby enemy marks form one camp

- **GIVEN** enemy marks of one family within the clustering distance of each other
- **WHEN** the region's camps are built
- **THEN** those marks form one camp

#### Scenario: A camp's enemies take their family's kind and an estimated level

- **GIVEN** a camp formed from a family's enemy marks in a region
- **WHEN** the player meets the camp
- **THEN** each enemy is of its family's kind
- **AND** each enemy's level is estimated from the region's world level band

#### Scenario: The stand-in camp in Mondstadt is replaced

- **GIVEN** the Mondstadt region with its stand-in camp
- **WHEN** the region's camps are built from the map's enemy marks
- **THEN** the stand-in camp is no longer in the region

### Requirement: Each kind's count in each region is checked against the wiki's count

Each kind's count of places in each region SHALL be checked against the wiki's count, with each shortfall or surplus reported per kind.

#### Scenario: A kind short of the wiki's count is reported

- **GIVEN** a region with fewer fitted places of a kind than the wiki's count
- **WHEN** the region's counts are checked
- **THEN** the shortfall is reported for that kind

#### Scenario: A kind matching the wiki's count reports nothing

- **GIVEN** a region whose fitted places of a kind match the wiki's count
- **WHEN** the region's counts are checked
- **THEN** nothing is reported for that kind
