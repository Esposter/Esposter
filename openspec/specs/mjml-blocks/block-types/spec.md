# mjml-blocks/block-types Specification

## Purpose

The `mjml-blocks` package's block types: MJML's component set on the headless block editor, held to MJML's nesting, attribute grammar and cascade, with an email rendered to MJML's JSON form and source, and read back from MJML source, refusing whatever the package does not take. The mechanism and its decisions are the package area's [README](../README.md).

## Requirements

### Requirement: A block document nests as MJML nests

The MJML blocks SHALL accept a child in a slot only when MJML allows that tag inside its parent, and SHALL accept in the document's content only what MJML allows in the body.

#### Scenario: A section accepts only columns and groups

- **GIVEN** an email document holding a section
- **WHEN** a text is placed directly in the section
- **THEN** the document is refused
- **AND** the refusal names the section's slot

#### Scenario: A text at the root is refused

- **GIVEN** an empty email document
- **WHEN** a text is placed directly in its content
- **THEN** the document is refused

### Requirement: Attributes take only what MJML accepts

Every block type SHALL take exactly the attributes its MJML component allows, and SHALL refuse a value MJML's type for that attribute refuses.

#### Scenario: An attribute value MJML's type refuses

- **GIVEN** a button
- **WHEN** its padding is set to a value with five lengths
- **THEN** the button is refused
- **AND** the refusal names the padding

### Requirement: An unset attribute resolves through MJML's cascade

An attribute the author did not set SHALL stay absent from the node, and SHALL resolve to the root's default for its type, else the root's default for all components, else MJML's own default.

#### Scenario: An unset attribute resolves through the cascade

- **GIVEN** a root whose default for all components sets a font family
- **WHEN** the font family of a text that sets none is resolved
- **THEN** it resolves to the root's font family

#### Scenario: A set attribute wins over the cascade

- **GIVEN** a root whose default for texts sets a font size
- **WHEN** the font size of a text that sets its own is resolved
- **THEN** it resolves to the text's own font size

### Requirement: A label or raw block is read by its kind's one schema

A label-kind or raw-kind block SHALL hold its content as the one kind-to-schema map gives it, and the render SHALL refuse content that schema refuses. A definition whose kind is a label or a raw SHALL NOT carry a content schema that is not a string, and the type of the definition SHALL refuse one.

#### Scenario: A raw block holding a script is refused at render

- **GIVEN** a raw block whose content holds a script element
- **WHEN** the document is rendered
- **THEN** the render is refused

### Requirement: Content is safe before it reaches MJML

An image SHALL carry its alternative text or be marked decorative, raw HTML SHALL be stored only as the sanitiser returns it, and every attribute value SHALL reach MJML escaped exactly once.

#### Scenario: An image without alternative text is refused

- **GIVEN** an image with a source
- **WHEN** it has no alternative text and is not marked decorative
- **THEN** the image is refused

#### Scenario: A decorative image renders an empty alternative text

- **GIVEN** an image marked decorative
- **WHEN** the document is rendered
- **THEN** the image's alternative text is empty

#### Scenario: Raw HTML is cleaned before it is stored

- **GIVEN** a raw block holding a script element beside a paragraph
- **WHEN** the block is parsed
- **THEN** it holds the paragraph alone

#### Scenario: An attribute holding a quote is escaped once

- **GIVEN** a button whose link carries a double quote and an ampersand
- **WHEN** the document is rendered and compiled
- **THEN** the compiled email's link carries each as one escaped entity

### Requirement: A rendered email compiles and reads back

A document the registry accepts SHALL render to MJML that compiles under MJML's strict validation, and MJML source SHALL read back into the document it came from, refusing a tag, attribute or value the package does not take.

#### Scenario: A valid email compiles under strict validation

- **GIVEN** a document of a section holding a column with a text, a button and an image
- **WHEN** it is rendered and compiled with strict validation
- **THEN** the compile returns email HTML with no validation error

#### Scenario: Rendering a parsed email returns its source

- **GIVEN** MJML source holding every block type with its attributes
- **WHEN** it is read into a document and rendered again
- **THEN** the rendered JSON equals the source's parsed JSON

#### Scenario: An import holding a tag the package leaves out is refused

- **GIVEN** MJML source whose head holds an included file
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the included tag

#### Scenario: A second document or text outside the mjml is refused, not dropped

- **GIVEN** MJML source holding a second `mjml` element, or text, beside its one `mjml`
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the second element or the text

#### Scenario: A second body is refused by name, not merged

- **GIVEN** MJML source holding a second `mj-body`, or a second `mj-head`
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the second tag

#### Scenario: An attribute on the title is refused by name

- **GIVEN** MJML source whose `mj-title` carries an attribute
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the title

#### Scenario: A tag named like a read prop is refused, not read into it

- **GIVEN** MJML source holding a `body` tag beside its `mj-body`, or a `body` tag holding a section
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the `body` tag, and no attribute of the `mj-body` is overwritten

#### Scenario: An attribute the mjml element does not take is refused by name

- **GIVEN** MJML source whose `mjml` element carries an attribute other than `lang` or `dir`, such as a `title`
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the `mjml` element

#### Scenario: A second title is refused by name, not kept over the first

- **GIVEN** MJML source whose head holds two `mj-title` elements
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the second `mj-title`, and the first title is kept

#### Scenario: A second default for one tag is refused by name, not kept over the first

- **GIVEN** MJML source whose `mj-attributes` holds two defaults for one tag
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the second default's tag, and the first default is kept

#### Scenario: A tag named all among the defaults is refused, not read as every component's

- **GIVEN** MJML source whose `mj-attributes` holds a tag named `all` rather than `mj-all`
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names `all` as a type the registry does not hold

### Requirement: The head and its defaults take no attribute of their own

The MJML blocks SHALL refuse an attribute on the `mjml` element beyond `lang` and `dir`, on the head, or on the defaults element, and SHALL refuse a style that carries an attribute other than `inline` set to `inline`, each refusal naming the element.

#### Scenario: An attribute on the head is refused by name

- **GIVEN** MJML source whose `mj-head` carries an attribute
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the `mj-head`

#### Scenario: An attribute on the defaults element is refused by name

- **GIVEN** MJML source whose `mj-attributes` carries an attribute
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the `mj-attributes`

#### Scenario: A style with an attribute other than inline is refused by name

- **GIVEN** MJML source whose `mj-style` carries a `media` attribute
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the `mj-style`

### Requirement: A source attribute cannot overwrite a prop the node writes

The MJML blocks SHALL refuse a source attribute named after a prop the node writes itself, such as one of its slots, under the attribute's name, and SHALL NOT read it into that prop.

#### Scenario: A source attribute named after a slot is refused by name

- **GIVEN** MJML source whose `mj-section` carries a `children` attribute
- **WHEN** it is read into a document
- **THEN** the read is refused
- **AND** the refusal names the `children` attribute, and the section's children are kept

### Requirement: A navbar's default icons are the characters they name

A navbar that sets no open or close icon SHALL resolve its icons to the characters they name, with the open icon `☰` and the close icon `⊗`, and not to MJML's entities for them.

#### Scenario: A navbar with no icon set resolves the characters

- **GIVEN** a navbar that sets neither its open icon nor its close icon
- **WHEN** its icons are resolved through the cascade
- **THEN** the open icon is `☰`
- **AND** the close icon is `⊗`

### Requirement: The blocks run where there is no document object model

The MJML blocks SHALL check, render, serialise and read back an email with no document object model and no UI framework present.

#### Scenario: Rendering where there is no document object model

- **GIVEN** a runtime with no document object model
- **WHEN** an email document is checked and rendered
- **THEN** it renders to MJML's JSON form
