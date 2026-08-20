<!-- The controls every call surface carries, in one order. The call view's bar and the room panel's bar differ
     only in what they add after these — a picture-in-picture button, a fullscreen button — so a control added
     here reaches both rather than landing in one and drifting -->
<template>
  <MessageContentCallAudioControlGroup />
  <MessageContentCallVideoControlGroup />
  <MessageContentCallAudioDeafenButton />
  <MessageContentCallScreenShareButton />
  <MessageContentCallControlHandButton />
  <MessageContentCallControlHealthButton />
</template>
