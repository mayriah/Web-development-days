# SnapShare System Scaling Plan

A comprehensive system architecture and capacity planning document for scaling **SnapShare**, a photo-sharing application where users upload photos and scroll a feed of posts from people they follow.

---

## 1. Assumptions & Baseline Numbers

Based on the initial system specifications:
- **Total Registered Users**: 10,000,000 (10 million users).
- **Daily Active Rate**: 10% of registered users are active on any given day.
- **Upload Activity**: Each active user uploads an average of 1 photo per day.
- **Viewing Activity**: Each active user views an average of 50 feed pages per day.
- **Media File Sizes**:
  - Full-resolution photo: **2 MB** average.
  - Compressed thumbnail: **50 KB** (0.05 MB) average.
  - Total media storage per uploaded photo: $2\text{ MB} + 0.05\text{ MB} = \mathbf{2.05\text{ MB}}$.
- **Traffic Distribution**: Traffic is not uniformly distributed across the day; peak traffic is estimated at **$5\times$** the daily average.
- **Time Conversions**: 1 day = 24 hours = 1,440 minutes = 86,400 seconds. 1 year = 365 days.

---

## 2. Daily Active Users & Traffic Estimates

### A. Daily Active Users (DAU)
$$\text{DAU} = 10,000,000 \times 10\% = \mathbf{1,000,000\text{ active users per day (1 million DAU)}}$$

---

### B. Uploads (Writes) per Second
- **Total Uploads per Day**:
  $$1,000,000\text{ active users} \times 1\text{ photo/day} = 1,000,000\text{ photos/day}$$

- **Average Uploads per Second**:
  $$\text{Average Uploads/sec} = \frac{1,000,000\text{ uploads}}{86,400\text{ seconds}} \approx \mathbf{11.57\text{ uploads/sec}}\ (\approx 12\text{ uploads/sec})$$

- **Peak Uploads per Second ($5\times$ average)**:
  $$\text{Peak Uploads/sec} = 11.57 \times 5 = \mathbf{57.87\text{ uploads/sec}}\ (\approx 58\text{ uploads/sec})$$

---

### C. Feed Views (Reads) per Second
- **Total Feed Views per Day**:
  $$1,000,000\text{ active users} \times 50\text{ feed views/day} = 50,000,000\text{ feed views/day}$$

- **Average Feed Views per Second**:
  $$\text{Average Feed Views/sec} = \frac{50,000,000\text{ views}}{86,400\text{ seconds}} \approx \mathbf{578.70\text{ views/sec}}\ (\approx 579\text{ views/sec})$$

- **Peak Feed Views per Second ($5\times$ average)**:
  $$\text{Peak Feed Views/sec} = 578.70 \times 5 = \mathbf{2,893.52\text{ views/sec}}\ (\approx 2,894\text{ views/sec})$$

---

### D. Annual Storage Estimates
- **Storage Generated per Day**:
  - Full photos: $1,000,000 \times 2\text{ MB} = 2,000,000\text{ MB} = 2,000\text{ GB} = 2.0\text{ TB/day}$
  - Thumbnails: $1,000,000 \times 0.05\text{ MB} = 50,000\text{ MB} = 50\text{ GB} = 0.05\text{ TB/day}$
  - Combined daily media: $2,000\text{ GB} + 50\text{ GB} = \mathbf{2,050\text{ GB/day}}\ (2.05\text{ TB/day})$

- **Storage Required per Year (365 days)**:
  $$\text{Annual Media Storage} = 2.05\text{ TB/day} \times 365\text{ days} = \mathbf{748.25\text{ TB/year}}\ (\approx 0.75\text{ Petabytes/year})$$

- **Metadata Storage (Relational Database)**:
  - Estimated metadata size per post (IDs, user reference, caption, timestamp, URLs): $\approx 500\text{ bytes}$.
  - Daily metadata: $1,000,000 \times 0.5\text{ KB} = 500\text{ MB/day}$.
  - Annual metadata: $500\text{ MB} \times 365 \approx \mathbf{182.5\text{ GB/year}}$ (easily handled by indexed relational tables).

---

## 3. System Characteristics: Read-Heavy vs. Write-Heavy

SnapShare is overwhelmingly **read-heavy**:
$$\text{Read-to-Write Ratio} = \frac{50,000,000\text{ feed views}}{1,000,000\text{ uploads}} = \mathbf{50 : 1}$$

For every single photo uploaded to the platform, users view feeds 50 times. At peak, the system must support nearly **2,900 feed requests per second**, compared to only **58 uploads per second**.

### What This Means for System Design
1. **Aggressive Multi-Tier Caching**: Read traffic must be intercepted before it ever reaches the database. We deploy Content Delivery Networks (CDNs) for media files and an in-memory cache (Redis) for home feed timelines and user profiles.
2. **Database Read Replicas**: The primary database only handles transactional writes and authoritative updates, while read-only replicas scale horizontal query bandwidth to power search, profiles, and follower queries.
3. **Optimized Feed Delivery**: Because users scroll feeds continuously, feeds should be rendered using precomputed timeline caches and lightweight 50 KB thumbnails rather than downloading heavy 2 MB original photos.

---

## 4. Why Photos Must NOT Be Stored in the Database

Photos should **never** be stored as raw binary data (such as `BLOB` types) inside the relational database.

### Problems with Storing Binary Files in a Database:
1. **Buffer Pool Pollution**: Relational databases load data into RAM pages (the buffer pool) to make lookups fast. Storing multi-megabyte photo blobs pushes out indexes and critical row data, severely degrading query performance across the entire application.
2. **Exponential Storage Costs**: High-performance database storage (provisioned IOPS SSDs) is significantly more expensive per gigabyte than dedicated object storage. At 748 TB/year, storing photos in a database would be financially prohibitive.
3. **Crippling Backups & Maintenance**: A database growing by 2 TB daily would take days to snapshot, replicate, or restore during disaster recovery.
4. **Connection Starvation**: Serving 2 MB images over slow client mobile networks keeps scarce database connections open for seconds at a time, quickly exhausting the connection pool and causing HTTP 500 outages.

### Where Photos Should Go Instead:
- **Object Storage (e.g., AWS S3, Cloudflare R2, Google Cloud Storage)**: Media files are stored in cloud object storage built explicitly to scale infinitely, handle massive sequential reads and writes, and provide 99.999999999% (11 9s) durability at a fraction of the cost.
- **Relational Database**: Only stores **metadata** and references (e.g., `id`, `user_id`, `created_at`, `photo_url`, `thumbnail_url`).
- **CDN Edge Nodes**: Cached copies of media files are delivered directly to clients from geographic edge locations without touching the origin servers.

---

## 5. System Architecture Diagram

```
                              [ Users / Mobile & Web Clients ]
                                     |                |
                          Static / Media Requests    API Requests (JSON / Uploads)
                                     |                |
                                     v                v
                             +---------------+  +---------------------+
                             |  CDN Edge     |  | DNS & Global        |
                             |  (Cloudflare/ |  | Load Balancer       |
                             |  CloudFront)  |  +---------------------+
                             +---------------+            |
                                     |                    v
                                     |          +---------------------+
                                     |          | App Servers Pool    |
                                     |          | (Stateless API Node)|
                                     |          +---------------------+
                                     |             /        |       \
                                     |     (Metadata)  (Cache Reads) (Async Job)
                                     |           /          |         \
                                     |          v           v          v
                                     |    +----------+ +---------+ +-----------+
                                     |    | Primary  | | Redis   | | Message   |
                                     |    | Database | | Cache   | | Queue     |
                                     |    | (Write)  | | (Feeds) | | (RabbitMQ/|
                                     |    +----------+ +---------+ |  AWS SQS) |
                                     |          |                      +-------+
                                     |     Replication                     |
                                     |          |                          v
                                     |          v                  +-----------+
                                     |    +----------+             | Thumbnail |
                                     |    | Read     |             | Worker    |
                                     |    | Replica  |             | (Resizer) |
                                     |    +----------+             +-----------+
                                     |                                   |
                                     +-----------------+-----------------+
                                                       |
                                                       v
                                            +---------------------+
                                            | Object Storage      |
                                            | (Originals & Thumbs)|
                                            +---------------------+
```

---

## 6. Component Explanations (One Sentence per Component)

1. **Client (Mobile / Web)**: Provides the intuitive user interface where users photograph, upload, browse, and interact with photo feeds.
2. **CDN (Content Delivery Network)**: Caches static photo files and thumbnails at geographically distributed edge servers near users, drastically reducing latency and shielding backend storage from millions of daily requests.
3. **Load Balancer**: Evenly distributes incoming HTTP/HTTPS traffic across healthy application servers to prevent bottlenecks and ensure zero-downtime high availability.
4. **App Servers (Stateless Pool)**: Execute core business logic, handle authentication, validate uploads, update databases, and coordinate between storage and cache layers.
5. **Cache (Redis / Memcached)**: Stores precomputed user feeds, session tokens, and frequently accessed profiles in fast in-memory storage to satisfy high-frequency read requests in sub-milliseconds.
6. **Primary Database (Relational)**: Manages transactional persistence for user accounts, social graphs, and photo metadata with full ACID consistency.
7. **Read Replica**: Asynchronously synchronizes with the primary database to offload read-intensive queries (like user profile views and follower lookups) from the primary writer node.
8. **Object Storage (e.g., S3)**: Serves as the durable, cost-effective, petabyte-scale repository for raw full-resolution photos and generated thumbnails.
9. **Message Queue (e.g., RabbitMQ / AWS SQS)**: Buffers thumbnail generation tasks asynchronously, allowing photo upload API requests to return immediately without waiting for image manipulation.
10. **Thumbnail Worker**: Consumes image processing jobs from the queue in the background, resizing raw photos into 50 KB thumbnails and storing them back into object storage.

---

## 7. Step-by-Step Flow of Uploading a Photo

```
Client             App Server         Object Storage         Primary DB          Message Queue       Thumbnail Worker
  |                     |                   |                    |                     |                    |
  |-- 1. POST /photos ->|                   |                    |                     |                    |
  |   (Image & metadata)|                   |                    |                     |                    |
  |                     |-- 2. Store photo->|                    |                     |                    |
  |                     |   (2 MB original) |                    |                     |                    |
  |                     |<-- 200 OK --------|                    |                     |                    |
  |                     |                   |                    |                     |                    |
  |                     |-- 3. Insert metadata ----------------->|                     |                    |
  |                     |   (photo_id, user_id, s3_url)          |                     |                    |
  |                     |<-- Confirm ----------------------------|                     |                    |
  |                     |                                                              |                    |
  |                     |-- 4. Publish thumbnail job --------------------------------->|                    |
  |                     |   {photo_id, original_key}                                   |                    |
  |                     |<-- Ack ------------------------------------------------------|                    |
  |                     |                                                                                   |
  |<-- 5. 201 Created --|                                                                                   |
  |    (photo_id, status)                                                              |                    |
  |                     |                                                              |-- 6. Pull job ---->|
  |                     |                                                              |                    |
  |                     |                   |<-- 7. Download original --------------------------------------|
  |                     |                   |    Resize to 50 KB thumbnail                                  |
  |                     |                   |<-- 8. Upload thumbnail ---------------------------------------|
  |                     |                   |                                          |                    |
  |                     |                   |                    |<-- 9. Update thumb_url ------------------|
  |                     |                   |                    |    & Invalidate Redis feed cache         |
```

### Detailed Steps:
1. **Client Request**: The user captures a photo on the mobile app. The client issues a `POST /api/v1/photos` request containing the photo binary and metadata (caption, location, user token).
2. **Origin Object Upload**: The App Server authenticates the session, assigns a unique UUID (`photo_id`), and streams the 2 MB raw file into Object Storage (or provides a presigned S3 upload URL for direct client-to-storage upload).
3. **Metadata Persistence**: The App Server inserts a row into the Primary Database `photos` table recording `id`, `user_id`, `caption`, `original_photo_url`, and sets `thumbnail_status = 'processing'`.
4. **Queue Thumbnail Task**: The App Server publishes an asynchronous message payload `{ "photo_id": "...", "original_key": "photos/uuid.jpg" }` into the Message Queue.
5. **Immediate Client Response**: The App Server returns `HTTP 201 Created` with the new post metadata to the user. The user's UI immediately reflects the new post with an optimistic loading state, resulting in a responsive, instant user experience.
6. **Worker Processing**: An available Thumbnail Worker consumes the task from the Message Queue.
7. **Image Resizing**: The worker downloads the 2 MB original from Object Storage into memory, crops and compresses it into a high-density 50 KB thumbnail.
8. **Thumbnail Upload**: The worker saves the 50 KB thumbnail into Object Storage at `thumbnails/uuid_thumb.jpg`.
9. **Finalize & Cache Update**: The worker updates the `photos` table in the database with the `thumbnail_url` and marks `thumbnail_status = 'ready'`, then pushes the update to the user's followers' cached timelines in Redis. Future feed requests fetch the lightweight 50 KB thumbnail instantly via the CDN.

---

## 8. Architectural Trade-offs

### Trade-off 1: Asynchronous Processing (Message Queue) vs. Synchronous Thumbnail Generation
- **Chosen Approach**: Asynchronous generation via message queue and background workers.
- **Advantages**: Upload requests complete in milliseconds instead of seconds because the client does not wait for image resizing and re-encoding. Furthermore, if thousands of users upload photos simultaneously, the message queue buffers the burst, preventing application server CPU exhaustion and crash loops.
- **Disadvantages / Cost**: Introduces **eventual consistency**. There is a brief latency window (1–3 seconds) between the initial upload and the thumbnail becoming available. The client frontend must gracefully accommodate this by temporarily displaying a blurhash, skeleton placeholder, or locally cached preview until the worker finishes.

---

### Trade-off 2: Primary-Replica Database Replication vs. Strict Read Consistency
- **Chosen Approach**: Single primary writer database with asynchronous read replicas.
- **Advantages**: Drastically increases read scalability. Over 570 average feed views and profile reads per second can be spread horizontally across multiple read replicas without consuming write locks or CPU cycles on the primary database.
- **Disadvantages / Cost**: Asynchronous replication causes **replication lag** (typically 10–200 milliseconds). If a user uploads a photo and immediately refreshes their profile, the query might hit a read replica that has not yet received the latest write, making it appear as though the post vanished.
- **Mitigation**: Implement "read-your-own-writes" consistency by routing profile requests for the active user to the primary database for the first 5 seconds following an upload, or by optimistically rendering the post from local mobile device state.

---

### Trade-off 3: Fan-out on Write (Push Model) vs. Fan-out on Read (Pull Model) for Feeds
- **Chosen Approach**: Hybrid feed generation strategy.
  - For standard users (under 25,000 followers), use **Fan-out on Write**: When a user posts, a worker pushes the new `photo_id` into the Redis timeline cache of all their active followers. When followers open the app, reading their feed takes $O(1)$ time.
  - For high-profile accounts / celebrities (e.g., millions of followers), use **Fan-out on Read**: Pushing one photo to 5 million followers on write would overwhelm Redis and workers. Instead, celebrity posts are merged into follower timelines dynamically at read time.
- **Advantages**: Eliminates the "celebrity write amplification" problem while maintaining near-instant feed load times for the vast majority of users.
- **Disadvantages / Cost**: Increases codebase complexity, requiring separate feed assembly pipelines depending on follower counts.
