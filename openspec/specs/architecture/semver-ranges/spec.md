## Purpose

Which of node-semver's issues the outdated-dependency report's own range matching answers, and how each was settled, before scripts absorbed the two functions it calls.

## Requirements

### Requirement: The outdated-dependency report tells ranges from version tags

The outdated-dependency report SHALL treat a specifier as a range only when it is a valid range under the standard range grammar, and SHALL report anything else as not a range.

#### Scenario: A version tag is not a range

- **GIVEN** the version tag latest used as a dependency specifier
- **WHEN** the report checks the specifier
- **THEN** the specifier is reported as not a range

#### Scenario: A caret range is a range

- **GIVEN** the specifier ^1.2.3
- **WHEN** the report checks the specifier
- **THEN** the specifier is reported as a range

#### Scenario: Invalid range syntax is rejected

- **GIVEN** the specifier ^0.4.24 && 0.4.24, which joins two ranges with a double ampersand
- **WHEN** the report checks the specifier
- **THEN** the specifier is reported as invalid

### Requirement: A range matches a prerelease only when it names one or opts in

A range SHALL match a prerelease version only when the range names a prerelease or the check opts in to prereleases.

#### Scenario: A star range against a prerelease

- **GIVEN** the star range and the version 1.2.3-alpha
- **WHEN** the range is checked without opting in to prereleases
- **THEN** the version does not match

#### Scenario: A star range opting in to prereleases

- **GIVEN** the star range and the version 1.2.3-alpha
- **WHEN** the range is checked with prereleases included
- **THEN** the version matches

### Requirement: Versions compare by SemVer precedence with build metadata ignored

Versions SHALL compare by SemVer precedence, and build metadata SHALL NOT change how two versions compare.

#### Scenario: Two builds of the same version

- **GIVEN** the versions 1.2.3+a and 1.2.3+b
- **WHEN** they are compared
- **THEN** they compare equal

#### Scenario: Prerelease names sort by their text

- **GIVEN** the prerelease names canary and beta on the same version
- **WHEN** they are compared
- **THEN** canary sorts above beta

### Requirement: Version parts compare exactly at any size

Version numbers SHALL compare exactly however large each part is, not only up to the largest safe integer.

#### Scenario: A version part above the safe integer limit

- **GIVEN** two versions whose major part is larger than the largest safe integer and differs only in its last digit
- **WHEN** they are compared
- **THEN** the comparison is exact

### Requirement: A bad range or version holds nothing and never stops the report

When an allowed range or a version is invalid, the check SHALL return no match so that the report keeps running.

#### Scenario: An invalid allowed range

- **GIVEN** a package whose allowed range is invalid
- **WHEN** the report checks its latest version against that range
- **THEN** the check reports no match
- **AND** the report continues to the next package

#### Scenario: A version that does not parse

- **GIVEN** a version string that is not a valid version
- **WHEN** the report checks it against an allowed range
- **THEN** the check reports no match rather than failing
