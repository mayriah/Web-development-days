# Day 8 Course Reflection

### What was the most difficult concept in the course, and how did you overcome it?
The most challenging concept was understanding system scaling and concurrency—specifically how to prevent race conditions like double-booking when thousands of users hit an application simultaneously. Early in the course, designing for a single user interacting with a local DOM or a single database felt straightforward. However, reasoning about distributed locks, ACID isolation levels, and cache invalidation required a shift toward thinking defensively. I overcame this by methodically tracing requests step-by-step through each component: letting the traffic estimates reveal the exact bottleneck, separating read-heavy caching from transactional writes, and testing how atomic updates with version numbers protect data integrity.

### Which part of your capstone would you improve, based on the feedback you received?
Based on feedback, the primary area I would improve in QuickNotes is upgrading from client-side `localStorage` drafts to a fully persisted backend architecture. While client-side caching and dark-mode toggling create a responsive user interface, real-world notes require server-side synchronization across devices. I would introduce debounced auto-saving to prevent excessive network calls, implement paginated full-text search across note bodies, and add optimistic UI updates with error rollback so notes feel instantaneous even on slow mobile connections.

### What will you learn next?
Next, I plan to build complete backend services using Node.js and Express to bring REST API designs into production code. Alongside this, I want to master relational database design and complex queries in PostgreSQL, moving beyond basic CRUD into indexed joins and transaction management. Finally, I will learn React to construct dynamic, component-driven user interfaces that cleanly separate state management from presentation.
