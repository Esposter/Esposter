## Purpose

An explicit per-survey response identity mode — Anonymous or Identified — enforced server-side, as the extensible foundation for tracked and open collection.

## Requirements

### Requirement: The owner chooses a response mode for each survey

The owner SHALL choose each survey's response mode as Anonymous or Identified, and a new survey SHALL default to Anonymous.

#### Scenario: New survey

- **GIVEN** the owner creates a survey
- **WHEN** the owner views its collection settings
- **THEN** the response mode is Anonymous

### Requirement: An Anonymous survey accepts responses from anyone with the link

An Anonymous survey SHALL accept responses from anyone with its link, carrying no identity.

#### Scenario: Anyone answers an Anonymous survey

- **GIVEN** a survey is Anonymous
- **WHEN** a visitor with the link submits an answer
- **THEN** the response is accepted with no identity recorded

#### Scenario: Link carries a participant token

- **GIVEN** a survey is Anonymous
- **WHEN** a respondent opens the survey through a link carrying a participant token
- **THEN** the survey still accepts the response
- **AND** the token is not kept with the response

### Requirement: An Identified survey requires a valid participant token

An Identified survey SHALL accept a response only when it carries a valid participant token issued for that survey.

#### Scenario: Identified survey opened without a token

- **GIVEN** a survey is Identified
- **WHEN** a respondent opens it without a token
- **THEN** the page shows that a token is required

#### Scenario: Missing, forged or foreign token

- **GIVEN** a survey is Identified
- **WHEN** a response arrives with a token that is missing, forged, or issued for another survey
- **THEN** the response is refused
- **AND** the refusal is the same in each case

### Requirement: Only an opaque token appears in the page address

No identifying value SHALL appear in the page address or on the page, other than an opaque token.

#### Scenario: Identified survey link

- **GIVEN** a respondent receives an invitation link to an Identified survey
- **WHEN** the link is read
- **THEN** the only value in it is an opaque token

### Requirement: The owner of an Identified survey sees who answered

An Identified survey's responses SHALL show the participant's public identifier to its owner.

#### Scenario: Owner reads an Identified response

- **GIVEN** a survey is Identified and has a response
- **WHEN** the owner views the response
- **THEN** the participant's public identifier is shown

### Requirement: A resumed Identified response keeps its original token

An Identified response SHALL be updated only with the token it started with.

#### Scenario: Respondent swaps tokens mid-response

- **GIVEN** a respondent started an Identified response with one token
- **WHEN** an update arrives carrying a different token
- **THEN** the update is refused

### Requirement: Changing the mode does not alter stored responses

Changing a survey's mode SHALL NOT alter responses already stored, and SHALL take effect for new responses at once without publishing again.

#### Scenario: Owner switches an Anonymous survey to Identified

- **GIVEN** a survey has responses recorded as Anonymous
- **WHEN** the owner switches the survey to Identified
- **THEN** the existing responses are unchanged
- **AND** new responses must carry a valid participant token

### Requirement: A token is accepted only from a program linked to the survey

A participant token SHALL be accepted only when it belongs to a participant of a program linked to this survey.

#### Scenario: Token from a program linked to another survey

- **GIVEN** a participant token was issued by a program linked to a different survey
- **WHEN** that token is used on this Identified survey
- **THEN** the response is refused
