## Purpose

One member's own grant or denial of a room permission, stored beside their roles, folded into their effective bitfield, and edited from the roles panel.

## Requirements

### Requirement: A member can be granted or denied a permission without a role

A room manager SHALL be able to grant or deny a room permission to one member, separately from the roles that member holds.

#### Scenario: Granting a permission to one member

- **GIVEN** a member holds no role that gives a permission
- **WHEN** a manager allows that permission for the member
- **THEN** the member has the permission

#### Scenario: Denying a permission a role gives

- **GIVEN** a member holds a role that gives a permission
- **WHEN** a manager denies that permission for the member
- **THEN** the member does not have the permission

#### Scenario: Removing an override falls back to the roles

- **GIVEN** a member has an override for a permission
- **WHEN** a manager removes the override
- **THEN** the member's roles decide the permission again

### Requirement: Each permission for a member is allowed, denied or inherited

Each permission for a member SHALL be in exactly one of three states: allowed, denied or inherited from the roles.

#### Scenario: Allowing a permission that was denied

- **GIVEN** a member's permission is denied
- **WHEN** a manager sets it to allowed
- **THEN** it is allowed and no longer denied

#### Scenario: Denying a permission that was allowed

- **GIVEN** a member's permission is allowed
- **WHEN** a manager sets it to denied
- **THEN** it is denied and no longer allowed

#### Scenario: Inheriting a permission from the roles

- **GIVEN** a member's permission is allowed or denied
- **WHEN** a manager sets it to inherit
- **THEN** the member's roles decide it again

#### Scenario: Member with nothing overridden has no entry

- **GIVEN** a member's last override is cleared
- **WHEN** the member is listed in the roles panel
- **THEN** the member is no longer listed under overrides

### Requirement: An override never grants or removes Administrator

An override SHALL NOT grant or remove the Administrator permission.

#### Scenario: Administrator is not offered in the member editor

- **GIVEN** a manager opens a member's editor in the roles panel
- **WHEN** the permissions are listed
- **THEN** the Administrator permission is not listed

#### Scenario: Setting Administrator by override is refused

- **GIVEN** a manager
- **WHEN** they try to allow or deny Administrator for a member
- **THEN** the change is refused

#### Scenario: Owner keeps full access

- **GIVEN** a room's owner has no override
- **WHEN** an override is set on any other member
- **THEN** the owner's access is unchanged

### Requirement: A manager can only grant permissions they hold themselves

A manager SHALL only allow a permission for a member if the manager holds that permission themselves.

#### Scenario: Granting a permission the manager lacks

- **GIVEN** a manager who lacks a permission
- **WHEN** they try to allow it for another member
- **THEN** the grant is refused

### Requirement: A manager can only change overrides for members they outrank

A manager SHALL only change a member's overrides when that member's highest role is below the manager's, and only for a member of the room.

#### Scenario: Changing an override for a member who outranks the manager

- **GIVEN** a member whose highest role is above the manager's
- **WHEN** the manager tries to change that member's override
- **THEN** the change is refused

#### Scenario: Changing an override for someone outside the room

- **GIVEN** a user who is not a member of the room
- **WHEN** a manager tries to set an override for them
- **THEN** the change is refused

### Requirement: Overrides are visible to every member of the room

Every member of a room SHALL be able to see which members have overrides and what they are.

#### Scenario: Member views the roles panel

- **GIVEN** a member of the room opens the roles settings panel
- **WHEN** the panel is shown
- **THEN** members with overrides are listed with their overrides

### Requirement: Override changes show live to everyone in the room

An override change SHALL appear to every open client of the room without a reload, and the member whose override changed SHALL have their own permissions updated at once.

#### Scenario: Other members see the change

- **GIVEN** several members have the room open
- **WHEN** a manager changes an override
- **THEN** the other members' roles panels show the new state without reloading

#### Scenario: Affected member gains the permission at once

- **GIVEN** a member is viewing the room
- **WHEN** a manager allows a permission for them
- **THEN** the controls for that permission become available to them without reloading

### Requirement: An override is removed when its member leaves the room

A member's overrides SHALL be removed when that member leaves the room.

#### Scenario: Member leaves

- **GIVEN** a member has an override in a room
- **WHEN** they leave the room
- **THEN** the override is removed

### Requirement: An override does not change a member's place in the role hierarchy

An override SHALL NOT change the member's position in the role hierarchy, so it does not change which roles they may assign.

#### Scenario: Override does not raise assignment authority

- **GIVEN** a member has an override that allows them to manage roles
- **WHEN** they try to assign a role above their highest role
- **THEN** the assignment is refused

### Requirement: The roles panel lists roles and members in separate groups

The roles settings panel SHALL list roles and members in two groups, and a member SHALL appear there while an override applies to them.

#### Scenario: Adding a member override

- **GIVEN** a manager is in the roles panel
- **WHEN** they choose Add member and select a member
- **THEN** the member's editor opens so their permissions can be set

#### Scenario: Member editor shows three states per permission

- **GIVEN** a manager opens a member's editor
- **WHEN** the permissions are shown
- **THEN** each permission offers Deny, Inherit and Allow
- **AND** the Inherit choice names what the roles give

#### Scenario: Remove override asks first

- **GIVEN** a manager is viewing a member's overrides
- **WHEN** they choose Remove override
- **THEN** they are asked to confirm before the override is removed
