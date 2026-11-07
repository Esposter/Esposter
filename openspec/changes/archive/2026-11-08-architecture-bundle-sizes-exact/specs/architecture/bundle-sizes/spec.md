## REMOVED Requirements

### Requirement: A file whose bytes follow the checkout folder keeps its recorded size within a tolerance

**Reason**: No built file follows the folder the repository is checked out in any more. The SFC compiler seeds a style block's `v-bind` variable names with the component's scope id rather than its absolute path (ubugeeei-prod/vize#12056), so every file is held to its exact size by the first requirement.
