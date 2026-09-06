<template>
  <!-- Naming a format here would tie the empty state to the type set in Settings, which is exactly the hidden
    dependency Import lost — and what a reader with nothing in the sheet needs is where importing happens -->
  <StyledEmptyState
    icon="mdi-file-table-outline"
    title="No data yet"
    description="Import a file from the toolbar above to get started"
  />
</template>
