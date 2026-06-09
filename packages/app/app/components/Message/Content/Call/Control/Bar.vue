<template>
  <div pb-5 flex justify-center shrink-0>
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
