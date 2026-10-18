## Purpose

The dock's notifications — delivered notifications paged in from the server, this tab's own feedback shown beside them, one snackbar queue and one unread badge. Entries from the server survive a reload and reach every subscribed device, while this tab's own feedback is never kept after it is shown.

## Requirements

### Requirement: The bell lists delivered and local notifications together

The notifications bell SHALL list the owner's delivered notifications and this tab's own feedback together, newest first.

#### Scenario: Delivered and local entries appear in one list

- **GIVEN** the owner has a delivered notification and a local error from this tab
- **WHEN** they open the bell
- **THEN** both are listed in one list, newest first

#### Scenario: The bell shows an empty state

- **GIVEN** the owner has no notifications
- **WHEN** they open the bell
- **THEN** it says there are no notifications

### Requirement: The unread count shows on the bell and the installed app icon

The system SHALL show the unread count on the bell and mirror it onto the installed app's icon where the platform supports it.

#### Scenario: An unread notification raises the count

- **GIVEN** the owner has one unread notification
- **WHEN** it arrives
- **THEN** the bell shows a count of one

#### Scenario: The count is mirrored to the installed app

- **GIVEN** the owner has installed the app
- **WHEN** a notification is unread
- **THEN** the app icon shows the same count

#### Scenario: An unsupported platform shows no icon count and no error

- **GIVEN** the platform does not support an icon count
- **WHEN** the count changes
- **THEN** no error is shown

### Requirement: Closing the bell marks its notifications as read

The system SHALL mark every delivered notification read when the owner closes the bell.

#### Scenario: Closing the bell clears the unread count

- **GIVEN** the bell has unread notifications
- **WHEN** the owner closes it
- **THEN** the unread count is cleared

### Requirement: The owner can dismiss notifications one at a time or all at once

The bell SHALL let the owner dismiss one notification or dismiss all of them.

#### Scenario: Dismissing one notification removes it

- **GIVEN** the bell lists several notifications
- **WHEN** the owner dismisses one
- **THEN** only that one is removed

#### Scenario: Dismiss all clears the list

- **GIVEN** the bell lists several notifications
- **WHEN** the owner chooses Dismiss all
- **THEN** the list is empty

### Requirement: Delivered notifications page in as the owner scrolls

The bell SHALL load older delivered notifications as the owner reaches the end of the list.

#### Scenario: Scrolling to the end loads the next page

- **GIVEN** the bell holds a first page of delivered notifications and more exist
- **WHEN** the owner reaches the foot of the list
- **THEN** the next page of older notifications is added

### Requirement: A delivered notification opens its page when clicked

The bell SHALL make each delivered notification a link to the page it names.

#### Scenario: Clicking a delivered notification opens its page

- **GIVEN** a delivered notification names a resource page
- **WHEN** the owner clicks it
- **THEN** that page opens

### Requirement: Undo actions are offered once

The bell SHALL keep a single-use action such as Restore only until it has been used, and SHALL keep repeatable actions such as Copy public link.

#### Scenario: Restore disappears after it is used

- **GIVEN** a deleted resource's notification offers Restore
- **WHEN** the owner restores the resource from it
- **THEN** the Restore action is removed from the notification
- **AND** the notification stays in the list

#### Scenario: Copy public link stays available

- **GIVEN** a notification offers Copy public link
- **WHEN** the owner uses it
- **THEN** the action remains available afterwards

### Requirement: Toasts share one queue and errors stay until dismissed

The system SHALL show notification toasts one at a time from a single queue, dismissing ordinary toasts after about five seconds and keeping errors until the owner dismisses them.

#### Scenario: An ordinary toast goes away on its own

- **GIVEN** a success toast is shown
- **WHEN** about five seconds pass without the owner interacting
- **THEN** the toast is dismissed

#### Scenario: An error toast stays until dismissed

- **GIVEN** an error toast is shown
- **WHEN** time passes
- **THEN** the error toast remains until the owner dismisses it

#### Scenario: Toasts wait in one queue

- **GIVEN** two notifications arrive together
- **WHEN** they are shown
- **THEN** they appear one after another from the same queue

### Requirement: A pushed notification refreshes the list rather than being trusted as sent

The system SHALL re-read delivered notifications when a push arrives, rather than showing the pushed copy itself.

#### Scenario: A push refreshes the bell

- **GIVEN** a notification is pushed to the owner's open tab
- **WHEN** it arrives
- **THEN** the bell reads the delivered notifications again
- **AND** the list shows the stored copy

### Requirement: Local feedback is not kept after the page reloads

The system SHALL NOT keep this tab's own feedback after a reload, and SHALL keep delivered notifications across reloads.

#### Scenario: Feedback from this tab is gone after reload

- **GIVEN** the owner saw a local error in this tab
- **WHEN** they reload the page
- **THEN** that error is no longer listed

#### Scenario: A delivered notification survives reload

- **GIVEN** the owner has a delivered notification
- **WHEN** they reload the page
- **THEN** the notification is still listed

### Requirement: Opening the bell from the keyboard

The explorer SHALL open the notifications panel with the G then N chord when the owner is not typing in a field.

#### Scenario: G then N opens the panel

- **GIVEN** the owner is not typing in a field
- **WHEN** they press G then N
- **THEN** the notifications panel opens
