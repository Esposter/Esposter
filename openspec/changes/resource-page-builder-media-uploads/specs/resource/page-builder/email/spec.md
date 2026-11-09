## ADDED Requirements

### Requirement: The email's image field lists the images the email already holds

The email's image field SHALL list the images the email already holds beside its upload, and choosing one SHALL set the picked node's image source to that image's address.

#### Scenario: The email picker lists the images the email already holds

- **GIVEN** an email holding two uploaded images
- **WHEN** the owner opens the image field's picker
- **THEN** the picker lists both images

#### Scenario: Choosing a listed email image sets the picked node source

- **GIVEN** an email with an image node selected and an uploaded image the email holds
- **WHEN** the owner chooses that image from the picker
- **THEN** the selected image node's source is that image's address
