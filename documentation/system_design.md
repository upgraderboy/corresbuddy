# System Design

## 1. Overview

The system is a **Cross-Generational Student Knowledge & Corres Platform** designed to preserve and transfer valuable knowledge between student batches.

The core design is based on an **automatic Corres assignment mechanism**:

* A junior is assigned the senior with the **same roll number from the previous batch**.
* If that roll number does not exist, the system assigns a **top-performing senior** as the fallback Corres.
* Corres relationships are preserved across generations, creating a long-term academic lineage.
* Resources, advice, notes, timetables, questions, answers, and interactions are retained as institutional knowledge.

The system follows a **modular monolithic architecture** to keep development simple and manageable during the hackathon.

---

# 2. System Architecture

```mermaid
flowchart TB

    USER[Students / Seniors / Alumni / Admin]

    subgraph FRONTEND["Frontend"]
        REACT[React.js]
        UI[Tailwind CSS]
    end

    subgraph BACKEND["AWS Backend"]
        EXPRESS[Node.js + Express.js]

        AUTH[Authentication & Profiles]
        CORRES[Corres Assignment Engine]
        RESOURCE[Resource Management]
        QA[Q&A Management]
        CHAT[Socket.IO Chat]
        LINEAGE[Generational History]
        STREAK[Contribution & Streak]
        NOTIFY[Notification Management]
        ADMIN[Admin & Moderation]
    end

    subgraph DATABASE["Database"]
        PRISMA[Prisma ORM]
        NEON[(Neon PostgreSQL)]
    end

    S3[(AWS S3<br/>Resource Storage)]

    FCM[Firebase Cloud Messaging]

    USER --> REACT
    REACT --> UI
    REACT --> EXPRESS

    EXPRESS --> AUTH
    EXPRESS --> CORRES
    EXPRESS --> RESOURCE
    EXPRESS --> QA
    EXPRESS --> CHAT
    EXPRESS --> LINEAGE
    EXPRESS --> STREAK
    EXPRESS --> NOTIFY
    EXPRESS --> ADMIN

    AUTH --> PRISMA
    CORRES --> PRISMA
    RESOURCE --> PRISMA
    QA --> PRISMA
    CHAT --> PRISMA
    LINEAGE --> PRISMA
    STREAK --> PRISMA
    NOTIFY --> PRISMA
    ADMIN --> PRISMA

    PRISMA --> NEON

    RESOURCE --> S3

    NOTIFY --> FCM
```

---

# 3. Architecture Layers

## 3.1 Presentation Layer

### React.js

Responsible for the user interface for:

* Students
* Seniors
* Alumni
* Administrators

Major screens include:

```text
Login / Registration
Dashboard
Profile
Corres
Resource Directory
Questions & Answers
Chat
Generational History
Contribution / Streak
Admin Panel
```

### Tailwind CSS

Used for responsive styling and rapid UI development.

---

# 3.2 Application Layer

## Node.js + Express.js

Express acts as the central backend responsible for:

* REST APIs
* Authentication
* User management
* Corres assignment
* Resource management
* Q&A
* Generational history
* Contribution tracking
* Notifications
* Administration

The backend is organized into independent modules while remaining part of a single application.

---

# 3.3 Real-Time Communication

## Socket.IO

Socket.IO is used for real-time communication between:

```text
Student ↔️ Assigned Corres
```

It enables:

* Real-time messages
* Message delivery events
* Online interaction
* Chat notifications

---

# 3.4 Data Layer

## Neon PostgreSQL

PostgreSQL stores structured application data such as:

* Users
* Academic profiles
* Batches
* Roll numbers
* Corres assignments
* Generational relationships
* Resources metadata
* Questions
* Answers
* Chat messages
* Contributions
* Streak information
* Notifications

## Prisma

Prisma acts as the ORM between Express.js and PostgreSQL.

```text
Express.js
     ↓
Prisma
     ↓
Neon PostgreSQL
```

---

# 3.5 File Storage

## AWS S3

AWS S3 stores actual uploaded files such as:

* PDFs
* Handwritten notes
* Timetables
* Study material
* Project documents
* Other resources

PostgreSQL stores the metadata and S3 object reference.

```text
User uploads file
       ↓
Express.js
       ↓
AWS S3
       ↓
File URL / Object Key
       ↓
PostgreSQL
```

---

# 3.6 Notification Layer

## Firebase Cloud Messaging

FCM is used for notifications such as:

* New message
* New answer
* New resource
* Contribution reminder
* Corres activity

---

# 4. Corres Assignment Design

The Corres system is the core business logic of the platform.

## Assignment Rule

For each junior:

```text
Current Batch
      ↓
Find Previous Batch
      ↓
Search Same Roll Number
      ↓
Same Roll Number Found?
      /             \
    YES              NO
     ↓                ↓
Assign Same       Find Top
Roll Senior       Performer
     \                /
      \              /
       Corres Assigned
```

### Example

```text
Batch 2026 → 115 students
Batch 2025 → 114 students

2026 / Roll 1   → 2025 / Roll 1
2026 / Roll 2   → 2025 / Roll 2
...
2026 / Roll 114 → 2025 / Roll 114
2026 / Roll 115 → Top Performer
```

## Assignment Types

The system stores the reason for the assignment:

```text
SAME_ROLL
FALLBACK_TOP_PERFORMER
```

---

# 5. Corres Assignment Flow

```mermaid
flowchart TD

    A([New Student / New Batch]) --> B[Read Batch & Roll Number]

    B --> C[Identify Previous Batch]

    C --> D[Search Previous Batch for Same Roll Number]

    D --> E{Matching Senior Exists?}

    E -->|Yes| F[Assign Same Roll Number Senior]
    E -->|No| G[Find Top Performer]

    G --> H[Assign Top Performer as Corres]

    F --> I[Store Corres Assignment]
    H --> I

    I --> J[Create Generational Link]

    J --> K([Assignment Complete])
```

---

# 6. Generational History Design

Each Corres relationship contributes to a continuing lineage.

Example:

```text
2026 / Roll 09
      ↓
2025 / Roll 09
      ↓
2024 / Roll 09
      ↓
2023 / Roll 09
      ↓
2022 / Roll 09
      ↓
...
```

This allows knowledge to survive across generations.

The system can associate each generation with:

* Resources
* Notes
* Advice
* Timetables
* Questions
* Answers
* Contributions
* Experiences

---

# 7. Data Flow Design

## Level 0 DFD

```mermaid
flowchart LR

    STUDENT[Student]
    SENIOR[Senior / Alumni]
    ADMIN[Administrator]

    SYSTEM((Cross-Generational<br/>Student Knowledge System))

    STUDENT -->|Registration, academic details,<br/>questions, requests| SYSTEM
    SYSTEM -->|Corres details, resources,<br/>answers, notifications| STUDENT

    SENIOR -->|Profile, resources, notes,<br/>advice, answers| SYSTEM
    SYSTEM -->|Assigned juniors,<br/>questions, notifications,<br/>contribution status| SENIOR

    ADMIN -->|Verification, moderation,<br/>batch and user management| SYSTEM
    SYSTEM -->|Reports, user data,<br/>assignment information| ADMIN
```

## Level 1 DFD

```mermaid
flowchart TB

    S[Student]
    SR[Senior / Alumni]
    AD[Administrator]

    P1((1. User & Profile<br/>Management))
    P2((2. Corres Assignment<br/>Engine))
    P3((3. Resource & Knowledge<br/>Management))
    P4((4. Q&A & Chat<br/>Management))
    P5((5. Contribution &<br/>Streak Management))
    P6((6. Notification<br/>Management))
    P7((7. Generational History<br/>Management))
    P8((8. Administration &<br/>Moderation))

    D1[(D1 User Database)]
    D2[(D2 Batch & Roll Number Data)]
    D3[(D3 Corres Assignment Data)]
    D4[(D4 Resource Repository)]
    D5[(D5 Questions & Answers)]
    D6[(D6 Chat Data)]
    D7[(D7 Contribution & Streak Data)]
    D8[(D8 Generational History)]

    S -->|Registration / Login / Academic Details| P1
    P1 -->|Profile / Account Information| S

    S -->|Access resources / Search knowledge| P3
    P3 -->|Resources / Notes / Advice / Timetables| S

    S -->|Questions / Messages| P4
    P4 -->|Answers / Messages| S

    S -->|View assigned Corres / History| P7
    P7 -->|Corres lineage / Previous generations| S

    SR -->|Profile information| P1
    P1 -->|Assigned junior / Profile information| SR

    SR -->|Resources / Notes / Advice / Timetable| P3
    SR -->|Answers / Messages| P4

    SR -->|Contribution activity| P5
    P5 -->|Streak / Contribution status| SR

    AD -->|User verification / Moderation| P8
    P8 -->|Reports / Management information| AD

    P1 <--> D1

    P1 -->|Batch / Roll Number| P2
    P2 <--> D2

    P2 -->|Corres assignment| D3
    D3 --> P7
    P2 -->|Assigned Corres| P1

    P3 <--> D4
    P4 <--> D5
    P4 <--> D6
    P5 <--> D7
    P7 <--> D8

    P5 -->|Contribution event / inactivity| P6
    P4 -->|New answer / message| P6
    P3 -->|New relevant resource| P6

    P6 -->|Notification / Nudge| S
    P6 -->|Notification / Nudge| SR

    P8 -->|Verify / Approve / Remove| D1
    P8 -->|Moderate resources| D4
    P8 -->|Moderate Q&A| D5
    P8 -->|Moderate chat / reports| D6
```

---

# 8. Major System Modules

| Module                    | Main Responsibility                             |
| ------------------------- | ----------------------------------------------- |
| Authentication & Profiles | Registration, login, roles, academic details    |
| Corres Assignment         | Same-roll matching and top-performer fallback   |
| Resource Management       | Upload, organize, search and download resources |
| Q&A                       | Questions and senior answers                    |
| Chat                      | Real-time Corres communication                  |
| Generational History      | Maintain cross-batch lineage                    |
| Contribution & Streak     | Track senior contributions and streaks          |
| Notifications             | Messages, reminders and contribution nudges     |
| Administration            | Verification, moderation and batch management   |

---

# 9. Core Data Entities

The initial database design will contain entities approximately corresponding to:

```text
User
Batch
CorresAssignment
GenerationalHistory
Resource
Question
Answer
Conversation
Message
Contribution
Streak
Notification
```

### High-Level Relationship

```text
User
 ├── belongs to → Batch
 ├── has → CorresAssignment
 ├── contributes → Resource
 ├── asks → Question
 ├── participates in → Conversation
 ├── makes → Contribution
 └── has → Streak

CorresAssignment
 └── creates → GenerationalHistory
```

---

# 10. Core Knowledge Flow

```mermaid
flowchart LR

    SENIOR[Senior Experience]

    CONTRIBUTION[Resource / Notes / Advice / Timetable / Answer]

    REPOSITORY[(Knowledge Repository)]

    STUDENT[Current Student]

    FUTURE[Future Batch]

    SENIOR --> CONTRIBUTION
    CONTRIBUTION --> REPOSITORY
    REPOSITORY --> STUDENT
    STUDENT --> FUTURE
    FUTURE --> REPOSITORY
```

The system converts individual senior experience into **persistent institutional knowledge**.

---

# 11. Technology Stack

```text
Frontend
→ React.js
→ Tailwind CSS

Backend
→ Node.js
→ Express.js

Database
→ Neon PostgreSQL
→ Prisma ORM

File Storage
→ AWS S3

Real-Time Communication
→ Socket.IO

Authentication
→ JWT

Notifications
→ Firebase Cloud Messaging

Scheduled Tasks
→ node-cron

Deployment
→ AWS Backend
→ Vercel / AWS Frontend

Version Control
→ Git + GitHub
```

---

# 12. Deployment Architecture

```mermaid
flowchart LR

    USER[User]

    FRONTEND[React Frontend]

    AWS[AWS Backend<br/>Node.js + Express]

    DB[(Neon PostgreSQL)]

    S3[(AWS S3)]

    FCM[Firebase Cloud Messaging]

    USER --> FRONTEND
    FRONTEND --> AWS

    AWS --> DB
    AWS --> S3
    AWS --> FCM
```

---

# 13. Design Principles

### Simplicity

A modular monolithic architecture is used to reduce development and deployment complexity during the hackathon.

### Persistence

Useful knowledge should remain available after the original contributor graduates.

### Automatic Assignment

Corres allocation is rule-based and does not depend on manually finding seniors.

### Scalability

The system is designed to support multiple batches and eventually multiple institutions.

### Separation of Data and Files

Structured information is stored in PostgreSQL while uploaded files are stored in AWS S3.

### Generational Continuity

The system preserves relationships and knowledge across multiple student generations.

---

# 14. Current Design Scope

### Included

* User and academic profiles
* Automatic Corres assignment
* Same-roll matching
* Top-performer fallback
* Resource repository
* Resource uploads
* Q&A
* Real-time chat
* Contribution tracking
* Streaks
* Notifications
* Resource downloads
* Generational history
* Administration and moderation

### Future Enhancements

* AI-based recommendations
* AI-based document summarization
* Personalized study planning
* Advanced analytics
* Advanced knowledge ranking
* Additional gamification

---

# 15. Core Design Principle

> **What one generation learns should not be lost when that generation graduates.**

The system is designed to turn temporary senior-junior interaction into a **persistent, searchable and continuously growing cross-generational knowledge network**.