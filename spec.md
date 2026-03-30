# Our Private Space

## Current State
New project with empty Motoko backend and default React frontend.

## Requested Changes (Diff)

### Add
- Invite-link based access: only users with the link can enter the space
- Real-time chat between two users with persistent message history
- Photo and video sharing via blob storage
- Delete messages and media
- Love theme UI: colorful floating hearts background, romantic pink/purple palette

### Modify
- Replace default frontend with the full private space app

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: chat messages stored persistently (text, timestamp, sender, optional media ref), message deletion, user identity via invite-links/authorization
2. Backend: blob-storage integration for photo/video uploads
3. Frontend: invite-link gated entry flow
4. Frontend: chat UI with floating colorful hearts background, love theme
5. Frontend: photo/video upload and display inline in chat
6. Frontend: delete message/media functionality
