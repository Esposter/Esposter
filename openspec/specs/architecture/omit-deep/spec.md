## Purpose

The recursive key omission in @esposter/shared, which replaced lodash-omitdeep, and the upstream issues it was audited against.

## Requirements

### Requirement: Omission removes named keys at every depth without changing the input

The recursive key omission SHALL return a copy with the named keys removed at every depth, and SHALL leave the value it was given unchanged.

#### Scenario: A nested value holds a named key at several depths

- **GIVEN** a nested value holds a named key at more than one depth
- **WHEN** the named key is omitted
- **THEN** the returned copy has no such key at any depth
- **AND** the original value still has every key

#### Scenario: An array holds objects with named keys

- **GIVEN** an array holds objects that carry a named key
- **WHEN** the named key is omitted
- **THEN** each object in the returned array lacks the key
- **AND** the array keeps its length and order

### Requirement: Built-in values pass through whole

A built-in value such as a date, a map, a set or a promise SHALL be returned as the same value rather than walked.

#### Scenario: A value holds a date and a map

- **GIVEN** a value holds a date and a map beside a named key
- **WHEN** the named key is omitted
- **THEN** the date and the map are returned unchanged
- **AND** only the named key is removed

### Requirement: Class instances lose their named keys, and methods are not copied

Omission SHALL remove the named keys from a class instance, including a reactive proxy of one, and SHALL NOT copy methods that live on the class.

#### Scenario: A reactive class instance is omitted

- **GIVEN** a reactive proxy of a class instance holds a named key
- **WHEN** the named key is omitted
- **THEN** the copy has no value for the named key
- **AND** no method from the class appears in the copy

### Requirement: Keys are matched as literal names

Each key given to omission SHALL be matched as a literal property name, not as a path into nested values.

#### Scenario: A caller names a key that contains a dot

- **GIVEN** an object has a property whose name contains a dot
- **WHEN** a caller omits that name
- **THEN** the property is removed by its literal name

### Requirement: The copy is stable across calls with the same saved state

The copy produced for the same saved state SHALL compare equal across calls even when the omitted counters differ, so that a save is triggered only by a real change.

#### Scenario: Only the omitted counters changed between two snapshots

- **GIVEN** two snapshots differ only in the counters that are omitted
- **WHEN** both are omitted and compared
- **THEN** the two copies are equal
