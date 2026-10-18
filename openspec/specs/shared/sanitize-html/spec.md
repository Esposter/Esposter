## Purpose

The HTML sanitiser that replaced apostrophecms/sanitize-html, with its upstream audit, its advisory watch and the security review of its own code.

## Requirements

### Requirement: Markup outside the policy is removed

The sanitiser SHALL remove every element and attribute that its policy does not name, and SHALL keep the text of an element it unwraps.

#### Scenario: An unnamed element is unwrapped to its text

- **GIVEN** input holding an element that the policy does not name
- **WHEN** a caller sanitises the input
- **THEN** the element's tags are removed
- **AND** its text remains in the output

#### Scenario: An image is removed when the caller does not name it

- **GIVEN** input holding an image and a caller whose policy does not name images
- **WHEN** a caller sanitises the input
- **THEN** the image is removed from the output

### Requirement: Scripts and raw-text elements are never rendered

The sanitiser SHALL drop script, style, textarea, option, noscript, title, xmp, noembed, noframes, iframe and plaintext elements with their content, whatever the caller allows.

#### Scenario: A script is dropped even when a caller allows it

- **GIVEN** a caller whose policy names the script element
- **WHEN** a caller sanitises input holding a script
- **THEN** the script and its content are absent from the output

### Requirement: URL attributes keep only safe schemes

The sanitiser SHALL keep a URL attribute only when its scheme is http, https, ftp, mailto or tel, or when the value has no scheme.

#### Scenario: A script scheme is removed

- **GIVEN** a link whose address begins with javascript
- **WHEN** a caller sanitises the link
- **THEN** the address is removed from the output

#### Scenario: A script scheme hidden by invisible characters is removed

- **GIVEN** a link whose address hides the javascript scheme behind a tab, a space, a control character, an entity or a grave accent
- **WHEN** a caller sanitises the link
- **THEN** the address is removed from the output

#### Scenario: A relative address is kept

- **GIVEN** a link whose address has no scheme
- **WHEN** a caller sanitises the link
- **THEN** the address is kept in the output

### Requirement: Every link opens safely in a new window

The sanitiser SHALL write every link with the rel attribute set to noopener noreferrer nofollow and the target set to _blank.

#### Scenario: A kept link carries the safe attributes

- **GIVEN** a link that the policy keeps
- **WHEN** a caller sanitises the link
- **THEN** the output link carries rel noopener noreferrer nofollow
- **AND** the output link carries target _blank

### Requirement: A class survives only where the policy names it

The sanitiser SHALL keep a class attribute value only where a class rule for its element matches it.

#### Scenario: A matching class is kept

- **GIVEN** an element whose class matches a rule of the policy
- **WHEN** a caller sanitises the element
- **THEN** the class remains in the output

#### Scenario: A class no rule matches is removed

- **GIVEN** an element whose class matches no rule of the policy
- **WHEN** a caller sanitises the element
- **THEN** the class is removed from the output

### Requirement: A style property survives only where a rule names it with an allowed value

The sanitiser SHALL keep a style property only where a rule names that property for the element, and only when its value matches the rule's expression in full.

#### Scenario: A property the policy does not name is removed

- **GIVEN** an element whose style sets a property that no rule names
- **WHEN** a caller sanitises the element
- **THEN** the property is removed from the output

#### Scenario: A value that only partly matches is removed

- **GIVEN** an element whose style sets a named property to a value that does not match the rule in full
- **WHEN** a caller sanitises the element
- **THEN** the property is removed from the output

### Requirement: Text is written with its markup characters escaped

The sanitiser SHALL write the ampersand, the less-than sign, the greater-than sign and the no-break space in text as entities, and SHALL leave quote marks unescaped.

#### Scenario: A less-than sign in text is written as an entity

- **GIVEN** input whose text contains a less-than sign
- **WHEN** a caller sanitises the input
- **THEN** the output writes it as an entity

### Requirement: Output that a second parse would read differently falls back to escaped text

The sanitiser SHALL return escaped text instead of markup whenever parsing its output again would produce a different result.

#### Scenario: Unstable markup is returned as escaped text

- **GIVEN** input whose allowed markup changes shape when the output is parsed again
- **WHEN** a caller sanitises the input
- **THEN** the output is the escaped text and no markup

### Requirement: Content nested past the render depth is dropped without an error

The sanitiser SHALL drop content nested deeper than 256 elements and SHALL NOT throw on such input.

#### Scenario: A document nested past the render depth is sanitised

- **GIVEN** input nested more than 256 elements deep
- **WHEN** a caller sanitises the input
- **THEN** the content past the depth is absent from the output
- **AND** no error is thrown

### Requirement: The rich-text variant allows the editor's markup

The rich-text sanitiser SHALL allow the editor's mention and emoji attributes, code block language and highlighter classes, span colour and radius, and task list inputs, and SHALL rewrite a task checkbox as a disabled checkbox that keeps only its ticked state.

#### Scenario: A ticked task checkbox is kept as a disabled checkbox

- **GIVEN** a task item whose checkbox is ticked
- **WHEN** a caller sanitises the item with the rich-text sanitiser
- **THEN** the output holds a disabled checkbox that is ticked
- **AND** no other attribute of the checkbox remains

### Requirement: A long style value is sanitised without hanging

The sanitiser SHALL return the result of a style value holding a long run of spaces before its important flag without a visible delay.

#### Scenario: A style value of a long run of spaces returns

- **GIVEN** a style value holding twenty thousand spaces before its important flag
- **WHEN** a caller sanitises the value
- **THEN** the call returns a result

### Requirement: The suite fails when a sanitiser advisory is published after the recorded day

The test run SHALL fail when a security advisory for the upstream sanitiser or for the sibling sanitiser the audit also reads is published after the day the sanitiser recorded, and SHALL fail when the advisory feed cannot be read.

#### Scenario: A new advisory fails the next run

- **GIVEN** an advisory published after the recorded day
- **WHEN** the test run reads the advisory feed
- **THEN** the run fails until the fix is pinned by a regression case that names the advisory

#### Scenario: An unreadable feed fails the run

- **GIVEN** an advisory feed that cannot be read
- **WHEN** the test run reads the advisory feed
- **THEN** the run fails rather than passing

### Requirement: Every upstream issue and advisory carries exactly one verdict

The audit of the upstream sanitiser SHALL record exactly one verdict for every issue, pull request and advisory it reads, and every in-scope defect SHALL have a regression case that names it.

#### Scenario: A reviewer finds the outcome of an upstream advisory

- **GIVEN** an advisory on the upstream package
- **WHEN** a reviewer looks it up on the audit page
- **THEN** exactly one verdict is recorded for it
- **AND** an in-scope defect names the regression case that proves it
