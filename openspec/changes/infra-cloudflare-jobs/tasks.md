# Tasks

## 1.

- [ ] 1.1 Rename `AzureFunction` to `QueueJob`, send each job to its queue, and consume them in the functions Worker. Verified by each handler's tests through the queue dispatcher.
- [x] 1.2 Feed the reconcile and orphaned-image jobs from R2 notifications, and run the purge on a Cron Trigger. Verified by their handlers' tests.

## 2.

- [x] 2.1 Replace Service Bus with the Scheduler object. Verified by a scheduled job sent when its alarm fires.
- [x] 2.2 Replace Web PubSub with the room objects' own broadcast: a webhook's message is written through `RoomObject.createMessage`, which sends it to the room's sockets. Verified by `processWebhookHandler`'s test.
