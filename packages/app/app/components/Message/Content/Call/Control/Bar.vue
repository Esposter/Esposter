<template>
  <div pb-4 flex justify-center>
    <StyledCard px-4 py-2 rd-full flex gap-x-2 items-center>
      <MessageContentCallAudioControlGroup />
      <MessageContentCallVideoControlGroup />
      <MessageContentCallAudioDeafenButton />
      <MessageContentCallScreenShareButton />
      <MessageContentCallControlHandButton />
      <MessageContentCallControlHealthButton />
      <MessageContentCallControlLeaveButton />
    </StyledCard>
  </div>
</template>
