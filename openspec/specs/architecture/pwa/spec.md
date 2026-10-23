## Purpose

The web app installs as a standalone app, takes a new version only when its reader accepts it, and answers offline navigations and push notifications from one typed service worker.

## Requirements

### Requirement: The app installs as a standalone app with its own identity

The web app's manifest SHALL name the app, open it at the root in a standalone window, give it an identity that does not change with its start address, and leave the orientation free.

#### Scenario: The app is installed

- **GIVEN** a browser that installs web apps
- **WHEN** the reader installs the app
- **THEN** it opens without browser chrome at the root
- **AND** its identity is the root path, so the app keeps its install if its start address changes
- **AND** it rotates with the device, because the manifest locks no orientation

### Requirement: Every icon is drawn for its purpose

The manifest SHALL list an icon for the `any` purpose and a separate icon for the `maskable` purpose at each size. The maskable icon SHALL keep its mark inside the central 80% safe zone, and the Apple touch icon SHALL be fully opaque.

#### Scenario: A platform masks the icon to a circle

- **GIVEN** the platform applies a circle mask to the maskable icon
- **WHEN** the icon is drawn on the home screen
- **THEN** the mark is not clipped, because it sits inside the safe zone

#### Scenario: iOS draws the Apple touch icon

- **GIVEN** the Apple touch icon has no transparent pixels
- **WHEN** iOS draws it on the home screen
- **THEN** the icon shows its artwork on its own background, not on black

### Requirement: A new version waits for the reader

A new service worker SHALL NOT take control of an open app until its reader accepts the update. Accepting SHALL activate the waiting worker and reload the page.

#### Scenario: A new version lands during a call

- **GIVEN** a reader is in a call
- **WHEN** a new version is deployed
- **THEN** the call is not interrupted by a reload
- **AND** the reader sees an update notice with a Reload action

#### Scenario: The reader accepts the update

- **GIVEN** the update notice is showing
- **WHEN** the reader chooses Reload
- **THEN** the waiting worker takes over
- **AND** the page reloads onto the new version

#### Scenario: The reader closes the notice

- **GIVEN** the update notice is showing
- **WHEN** the reader closes it
- **THEN** it is hidden for the rest of this page load
- **AND** it returns on the next page load while the update is still waiting

### Requirement: An open app checks for updates hourly

A tab that stays open SHALL check for a new service worker once an hour, so a tab left open for days is offered an update without a navigation.

#### Scenario: A tab is left open

- **GIVEN** a tab stays open with no navigation
- **WHEN** an hour passes
- **THEN** it checks for a new service worker

### Requirement: The app shell answers navigations offline

The service worker SHALL precache the build's assets and the home page at install, and SHALL answer a navigation to any route with the home page when the network is unavailable.

#### Scenario: A route is opened offline

- **GIVEN** the reader has installed the app and is offline
- **WHEN** the reader navigates to any route
- **THEN** the app shell answers, and the client router renders the route

### Requirement: Push notifications are shown by the service worker

The service worker SHALL show each push as an operating-system notification with the payload's title, body and icon, and SHALL post the payload to every open tab. Clicking a notification SHALL focus an open window already at its deep link, or open one there.

#### Scenario: A push arrives while a tab is open

- **GIVEN** a tab of the app is open
- **WHEN** a push arrives
- **THEN** the tab receives the payload
- **AND** the operating system shows the notification

#### Scenario: A push arrives with no title

- **GIVEN** a payload carries no title
- **WHEN** the service worker shows it
- **THEN** the notification shows an empty title rather than the text of a missing value

#### Scenario: A notification is clicked

- **GIVEN** a window is already open at the notification's deep link
- **WHEN** the reader clicks the notification
- **THEN** that window is focused
- **AND** otherwise a new window opens at the deep link
