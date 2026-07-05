<template>
  <StyledTooltipMenuIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-dots-vertical"
    :menu-props="{ location: 'bottom end' }"
    text="More"
    :tooltip-props="{ location: 'bottom' }"
  >
    <StyledCard>
      <div pa-1 flex>
        <MessageContentHeaderActionButtons />
      </div>
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
