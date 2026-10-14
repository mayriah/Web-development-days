# School Database System Design

A technical design specification and architectural rationale for the School Course and Enrolment relational database.

---

## 1. Table Explanations

### `students`
- **Purpose**: Represents individual learners registered within the institution.
- **Columns**:
  - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`): Unique identifier for each student record.
  - `name` (`TEXT NOT NULL`): The full name of the student.
  - `email` (`TEXT NOT NULL UNIQUE`): The student's institutional or personal email address. Marked `UNIQUE` to prevent duplicate accounts and facilitate login or external lookups.
  - `created_at` (`TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`): Audit timestamp recording when the student was added to the system.

### `courses`
- **Purpose**: Represents the academic curriculum and courses offered by the institution.
- **Columns**:
  - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`): Unique numeric identifier for each course.
  - `code` (`TEXT NOT NULL UNIQUE`): Human-readable catalog code (e.g., `CS101`, `CS102`), strictly unique.
  - `title` (`TEXT NOT NULL`): Descriptive title of the course.
  - `credits` (`INTEGER NOT NULL DEFAULT 3`): Academic credits awarded upon completion.
  - `description` (`TEXT`): Overview of syllabus content and learning objectives.

### `enrolments`
- **Purpose**: The bridge/join table connecting students to the courses they take.
- **Columns**:
  - `student_id` (`INTEGER NOT NULL`): Foreign key referencing `students(id)` with `ON DELETE CASCADE`.
  - `course_id` (`INTEGER NOT NULL`): Foreign key referencing `courses(id)` with `ON DELETE CASCADE`.
  - `grade` (`TEXT`): The academic grade achieved by the student in this specific course (e.g., `'A'`, `'B+'`). Can be `NULL` while a course is currently in progress.
  - `enrolled_at` (`TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`): Timestamp indicating when the student registered for the course.
- **Primary Key & Duplicate Prevention Rule**:
  - `PRIMARY KEY (student_id, course_id)`: A composite primary key combining both foreign keys. This guarantees entity identity and enforces a strict database-level rule preventing the same student from enrolling in the same course more than once.

---

## 2. Entity Relationships & Why a Join Table is Needed

### The Relationships
- **Many-to-Many ($M:N$)**: Between `students` and `courses`. One student can enroll in multiple courses, and one course can accommodate multiple students.
- **One-to-Many ($1:N$)**:
  - One student has many enrolment records (`students.id` $\rightarrow$ `enrolments.student_id`).
  - One course has many enrolment records (`courses.id` $\rightarrow$ `enrolments.course_id`).

```
+------------+          1 : N          +---------------+          N : 1          +------------+
|  students  | ----------------------> |  enrolments   | <---------------------- |  courses   |
+------------+                         +---------------+                         +------------+
| id (PK)    |                         | student_id(PK)|                         | id (PK)    |
| name       |                         | course_id (PK)|                         | code       |
| email (UQ) |                         | grade         |                         | title      |
+------------+                         | enrolled_at   |                         | credits    |
                                       +---------------+                         +------------+
```

### Why a Join Table is Needed
In relational databases, columns must contain atomic (indivisible) values to satisfy First Normal Form (1NF). Storing a comma-separated list of course IDs inside a single `enrolled_courses` column on the `students` table would create severe problems:
1. **Inefficient & Fragile Queries**: Searching for students enrolled in a course would require expensive string matching (`LIKE '%CS101%'`), which cannot use B-tree indexes and breaks if course codes change.
2. **Loss of Integrity**: The database cannot enforce foreign key constraints on values buried within a delimited text string, making orphaned references inevitable.
3. **Relationship-Specific Attributes**: A student's grade or enrolment date does not belong solely to the student (a student has different grades for different courses) nor solely to the course (a course has different grades for different students). The attribute belongs exclusively to the **relationship** between them.

The `enrolments` join table decomposes the $M:N$ relationship into two clean $1:N$ relationships, provides foreign key referential integrity with cascading deletes, enforces uniqueness through a composite primary key, and gives relationship-specific data (such as `grade`) a clean, normalized home.

---

## 3. Database Indexing & Justification

### Selected Index
```sql
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
```

### Technical Reason
The `enrolments` table uses a composite primary key: `PRIMARY KEY (student_id, course_id)`. SQLite automatically creates an underlying B-tree index for this primary key, with `student_id` as the **leading (leftmost) column**.

Because B-tree indexes follow the leftmost prefix rule:
- Queries filtering by `student_id` (such as *"find all courses for Alice"*) utilize the existing composite primary key index for fast logarithmic $O(\log N)$ binary searches.
- However, queries filtering or joining on `course_id` alone (such as *"list all students enrolled in CS101"* or `GROUP BY course_id` to count enrolments) cannot use the composite index because `course_id` is the secondary column. Without an index on `course_id`, SQLite would be forced to execute an $O(N)$ full table scan across the entire `enrolments` table.

Adding `idx_enrolments_course_id` eliminates full table scans on reverse lookups and JOIN operations, speeding up course rosters and aggregate reports from $O(N)$ to $O(\log N)$ as the dataset scales to thousands or millions of records.

---

## 4. Architectural Choice: SQL vs. NoSQL

For a school enrolment and grading system, **SQL (Relational Database)** is unequivocally the correct architectural choice over NoSQL. Academic records demand strict schema consistency, referential integrity, and ACID transaction guarantees. In this domain, critical business operations—such as registering a student for a course, checking prerequisite completions, updating grades, or calculating GPA—involve multiple interconnected entities that must be updated atomically to prevent race conditions or data corruption. In a NoSQL document database (such as MongoDB), modeling this many-to-many relationship would require either embedding courses inside student documents (causing massive data redundancy, synchronization overhead, and inconsistencies whenever course details change) or manually managing document references in application code without database-enforced foreign keys. SQL handles complex relational joins (`students` $\bowtie$ `enrolments` $\bowtie$ `courses`), aggregate reporting (`COUNT`, `GROUP BY`, `LEFT JOIN`), unique constraints, and cascade deletions natively at the database engine level with zero risk of orphaned or duplicate records.
