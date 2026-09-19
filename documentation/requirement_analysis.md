# 2. Requirement Analysis

## 2.1 Core Objective

The system is a **cross-generational student knowledge and Corres platform** that preserves useful experience, resources, advice, and guidance from one batch for future batches.

Instead of relying on students to find seniors themselves, the system **automatically assigns a Corres based on roll number**, creating a continuous relationship between generations.

The platform combines:

**Automatic Corres Assignment + Knowledge Sharing + Communication + Generational History**

---

# 2.2 User Roles

## Student / Junior

A student should be able to:

* View their assigned Corres
* Access resources and knowledge from previous batches
* Ask questions
* Chat with their Corres
* Download resources
* View their generational history
* Receive relevant notifications

## Senior / Alumni

A senior or alumnus should be able to:

* View assigned juniors
* Share resources
* Upload handwritten notes
* Share advice and experiences
* Share study plans and timetables
* Answer questions
* Communicate with assigned juniors
* Maintain a contribution streak

## Administrator

An administrator should be able to:

* Manage users and batches
* Verify users
* Manage roll-number and batch information
* Monitor Corres assignments
* Moderate resources, questions, answers, and chats

---

# 2.3 Corres Assignment Model

The platform uses a **rule-based automatic assignment system**.

## Rule 1 — Same Roll Number

A student in the current batch is assigned the student with the **same roll number from the immediately previous batch**.

Example:

```text
Batch 2026 / Roll 09
          ↓
Batch 2025 / Roll 09
```

## Rule 2 — Top Performer Fallback

If the corresponding roll number is not present in the previous batch, the system assigns the student to a **top-performing senior**.

Example:

```text
Junior Batch 2026 = 115 students
Senior Batch 2025 = 114 students

Roll 1   → Roll 1
Roll 2   → Roll 2
...
Roll 114 → Roll 114
Roll 115 → Top Performer
```

This ensures that every junior can receive a Corres even when batch sizes differ.

## Assignment Types

The system should record the reason for each assignment:

```text
SAME_ROLL
FALLBACK_TOP_PERFORMER
```

---

# 2.4 Functional Requirements

## A. User & Academic Profile

### FR1 — Registration & Authentication

The system shall allow users to register and securely log in.

### FR2 — Academic Profile

The system shall maintain:

* Name
* College / Institution
* Program
* Branch / Specialization
* Batch
* Roll Number
* Role
* Academic / contribution information where required

### FR3 — Role Management

The system shall identify users as:

```text
STUDENT
SENIOR
ALUMNI
ADMIN
```

---

# B. Automatic Corres Assignment

### FR4 — Previous Batch Identification

The system shall identify the immediately previous batch associated with the student's program/academic grouping.

### FR5 — Same-Roll Assignment

The system shall search the previous batch for the same roll number and assign that student as Corres.

### FR6 — Top Performer Fallback

If no matching roll number exists, the system shall automatically assign an eligible top-performing senior.

### FR7 — Assignment Record

The system shall store:

```text
Junior
Senior / Corres
Junior Batch
Senior Batch
Assignment Type
Assignment Date
```

---

# C. Resource & Knowledge Management

### FR8 — Resource Directory

The system shall provide a structured directory for shared knowledge.

Possible categories include:

```text
Study Material
Notes
Books
Previous-Year Material
Placement Resources
Project Resources
Interview Experiences
Useful Links
```

### FR9 — Resource Contribution

Seniors and alumni should be able to contribute:

* Resources
* Handwritten notes
* Advice
* Timetables
* Study plans
* Experiences
* Useful links

### FR10 — Resource Discovery

Students should be able to search and browse resources using relevant categories, subjects, tags, or keywords.

### FR11 — Resource Preservation

Contributed knowledge shall remain available after the contributor graduates so that future generations can access it.

---

# D. Communication & Q&A

### FR12 — Chat

Students and their assigned Corres should be able to communicate through chat.

```text
Student ↔️ Assigned Corres
```

### FR13 — Questions & Answers

Students should be able to ask questions and receive answers from seniors.

Useful answers should remain available as knowledge for future students.

### FR14 — Knowledge from Interaction

Where appropriate, useful guidance generated through interactions should become part of the platform's persistent knowledge base rather than remaining available only in a private conversation.

---

# E. Contribution & Engagement

### FR15 — Contribution Tracking

The system should record senior contributions such as:

```text
Resource
Handwritten Note
Advice
Timetable
Study Plan
Answer
```

### FR16 — Contribution Streak

The system should maintain a streak based on meaningful contributions.

Example:

```text
🔥 7 Day Contribution Streak
```

The purpose is to encourage consistent knowledge sharing rather than meaningless activity.

### FR17 — Contribution History

The system should maintain a history of contributions made by each senior/alumnus.

---

# F. Notifications & Nudges

### FR18 — Notifications

The system should notify users about relevant events such as:

* New messages
* New answers
* New resources
* Corres-related activity

### FR19 — Contribution Nudges

The system should gently remind seniors to contribute when appropriate.

Example:

> “Have a useful resource or tip to pass to the next batch?”

Notifications should avoid becoming excessive or intrusive.

---

# G. Resource Download

### FR20 — Resource Downloads

Students should be able to download available files such as:

* PDFs
* Handwritten notes
* Study material
* Timetables
* Project documents

---

# H. Generational History

### FR21 — Cross-Generational Lineage

The system shall preserve Corres relationships across multiple generations.

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

### FR22 — Historical Knowledge Access

Students should be able to discover resources, contributions, and relevant knowledge associated with previous generations.

The purpose is to prevent valuable institutional knowledge from being lost when students graduate.

---

# 2.5 Priority Classification

## Must Have — MVP

These features are essential to demonstrate the core concept.

```text
Authentication
Role management
Academic profile
Batch & roll-number data
Automatic Corres assignment
Same-roll matching
Top-performer fallback
Corres visibility
Resource directory
Resource contribution
Resource search
Question & Answer
Generational history
```

## Should Have

These features strengthen the platform and improve engagement.

```text
Real-time chat
Handwritten note uploads
Advice sharing
Timetable / study-plan sharing
Contribution tracking
Contribution streak
Notifications
Contribution nudges
Resource downloads
Contribution history
Basic moderation
```

## Could Have

These are future enhancements and should only be considered after the core system is stable.

```text
AI-based resource recommendations
AI-based knowledge summarization
Personalized study plans
Advanced knowledge ranking
Badges / gamification
Advanced analytics
Intelligent recommendations
```

---

# 2.6 Core System Flow

```text
Student Registration
        ↓
Academic Details
        ↓
Batch + Roll Number
        ↓
Previous Batch
        ↓
Same Roll Number Exists?
      /        \
    YES         NO
     ↓           ↓
Assign Same   Assign Top
Roll Senior   Performer
      \         /
       \       /
        Corres Assigned
              ↓
     Generational History
              ↓
   Resources / Q&A / Chat
              ↓
       Student Guidance
```

---

# 2.7 Core Knowledge Flow

```text
Senior Experience
        ↓
Resources / Notes / Advice /
Timetables / Answers
        ↓
Knowledge Repository
        ↓
Current Students
        ↓
Future Batches
```

The platform turns temporary senior-junior interaction into **persistent institutional knowledge**.

---

# 2.8 Central Value Proposition

> **“What one generation learns should not be lost when that generation graduates.”**

The system creates a continuous chain of knowledge and guidance across batches by combining **automatic Corres assignment, persistent resource sharing, direct interaction, and generational history**.