<template>
  <div pb-5 flex shrink-0 justify-center>
    <StyledCard px-4 py-2 rd-full flex flex-wrap gap-2 items-center justify-center>
      <MessageContentCallAudioControlGroup />
      <MessageContentCallVideoControlGroup />
      <MessageContentCallAudioDeafenButton />
      <MessageContentCallScreenShareButton />
      <MessageContentCallControlHandButton />
      <MessageContentCallControlHealthButton />
      <MessageContentCallPipButton />
      <MessageContentCallControlLeaveButton />
    </StyledCard>
  </div>
</template>
