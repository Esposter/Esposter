## Purpose

The pan and zoom module in @esposter/shared — one element moved and scaled by a CSS transform from pointer, wheel and method calls, containment of it inside or over its parent, and the upstream @panzoom/panzoom 4.6.2 issues each given a verdict.

## Requirements

### Requirement: The transform is written in the call that changes the state

The module SHALL write the element's transform in the same call that changes its pan or scale, and SHALL read the element's and its parent's boxes after that write.

#### Scenario: A pan is visible on the next line

- **GIVEN** an element with a panzoom instance
- **WHEN** a caller pans it and reads the element's transform on the next line
- **THEN** the transform holds the new pan
- **AND** a following zoom about a point measures the element at the scale the pan left it

### Requirement: Construction is synchronous and quiet

The module SHALL apply the start scale and start pan before the factory returns, and SHALL dispatch no event for them.

#### Scenario: A pan made right after construction is kept

- **GIVEN** an instance built with a start pan of zero
- **WHEN** a caller pans it on the next line
- **THEN** the pan is the caller's
- **AND** no timer exists that later overwrites it

### Requirement: A zoom about a point keeps the point still

A zoom about a pointer SHALL move the pan so the point under the pointer stays under it, computed from the scale the limits clamp to rather than the scale asked for.

#### Scenario: A zoom against the limit does not drift

- **GIVEN** an element already at its maximum scale
- **WHEN** a caller zooms about a point that would exceed it
- **THEN** the scale stays at the maximum
- **AND** the pan does not move

### Requirement: Containment is measured from the boxes

Containment SHALL keep the scaled element inside its parent's content box (`inside`), covering it (`outside`), or per axis whichever fits (`automatic`), measured from the element's and the parent's boxes so a flex-centred element and a margin need no arithmetic of their own.

#### Scenario: A flex-centred element covers its parent

- **GIVEN** an element centred in its parent by flex layout and contained `outside`
- **WHEN** a caller pans it past the parent's edge
- **THEN** the pan stops where the element still covers the parent

#### Scenario: A reset needs one press

- **GIVEN** an instance contained `inside` at a scale above its start scale
- **WHEN** a caller resets it
- **THEN** the scale and pan are the start state after that one call

### Requirement: A drag survives a zoom

A zoom during a drag SHALL re-anchor the drag to the pointer, and a pinch SHALL scale by the ratio of the fingers' distance now to the distance when it began.

#### Scenario: The wheel during a drag does not snap the element back

- **GIVEN** a drag in progress
- **WHEN** the wheel zooms the element and the pointer then moves
- **THEN** the element follows the pointer from where the zoom left it

### Requirement: A drag starts past a threshold and swallows the click after it

The module SHALL start a drag only once the pointer has travelled the pan threshold, and SHALL swallow the click that follows a drag past it.

#### Scenario: A tap is not a drag

- **GIVEN** an instance with a pan threshold
- **WHEN** the pointer goes down and up within the threshold
- **THEN** no pan occurs
- **AND** the click reaches its target

### Requirement: Destroy restores what the module wrote

Destroying an instance SHALL abort its listeners and restore every style it wrote to the element and its parent.

#### Scenario: Styles return to their previous values

- **GIVEN** an element with its own inline styles and a panzoom instance
- **WHEN** the instance is destroyed
- **THEN** the element and its parent carry the inline styles they had before
