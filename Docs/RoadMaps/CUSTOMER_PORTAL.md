# ROADMAP: Enhanced Customer Portal

**Current Issue:** Customers currently submit designs and data once, but have no way to track progress, revisit saved designs, or interact with the business post-submission without direct manual contact.

## Phase 1: Authentication Migration
- [ ] Implement robust login/signup page using Firebase Auth.
- [ ] Migrate anonymous designs to permanent user accounts on sign-up.
**Validation:** Users can sign out and sign back in to see their specific design history.

## Phase 2: Design History & Tracking
- [ ] Create `/dashboard` for logged-in users.
- [ ] Display list of previously submitted shed/dome designs.
- [ ] Implement live status updates (e.g., "In Review", "Quoted", "Scheduled").
**Validation:** Firestore security rules allow users to ONLY read their own designs.

## Phase 3: Interactive Consultation
- [ ] Add messaging/commenting on specific design requests.
- [ ] Allow users to upload site photos directly to their request.
**Validation:** Admin can see and respond to customer site photos in the Admin Dashboard.

## Phase 4: Polish & Notifications
- [ ] Implement email notifications via Firebase Functions (or server tasks) for status changes.
- [ ] Add a "Quick Quote" saved design widget on the home page for returning users.
**Validation:** User receives an automated confirmation when their design status changes to "Quoted".

**Expected Total:** ~1200 lines across 8-10 prompts

**Documentation Impact:** README, CHANGELOG, STRUCTURE updates needed.
