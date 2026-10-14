-- ============================================================================
-- School Course & Enrolment Database
-- Day 6 Lab Assignment
-- ============================================================================

-- Enable foreign key constraint enforcement in SQLite
PRAGMA foreign_keys = ON;

-- Clean up existing tables to allow safe re-execution
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- ============================================================================
-- 1. Table Definitions
-- ============================================================================

-- Students table
-- Represents individual learners enrolled in the school.
CREATE TABLE students (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
-- Represents academic courses offered by the institution.
CREATE TABLE courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  credits     INTEGER NOT NULL DEFAULT 3,
  description TEXT
);

-- Enrolments table (Join Table)
-- Represents the many-to-many relationship between students and courses.
-- Holds attributes specific to the relationship, such as grade and enrolment date.
-- A composite primary key (student_id, course_id) strictly prevents the same student
-- from enrolling on the same course more than once.
CREATE TABLE enrolments (
  student_id  INTEGER NOT NULL,
  course_id   INTEGER NOT NULL,
  grade       TEXT,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- Optional performance index:
-- While (student_id, course_id) composite primary key already indexes lookups by student_id,
-- an index on course_id dramatically speeds up queries filtering or joining by course.
CREATE INDEX IF NOT EXISTS idx_enrolments_course_id ON enrolments(course_id);

-- ============================================================================
-- 2. Sample Data Insertion
-- ============================================================================

-- Insert sample students (4 students; David Kimani will have no enrolments)
INSERT INTO students (name, email) VALUES
  ('Alice Johnson', 'alice.johnson@example.com'),
  ('Brian Mwangi',  'brian.mwangi@example.com'),
  ('Chloe Davis',   'chloe.davis@example.com'),
  ('David Kimani',  'david.kimani@example.com');

-- Insert sample courses (4 courses; CS104 will have no enrolments)
INSERT INTO courses (code, title, credits, description) VALUES
  ('CS101', 'Introduction to Web Development', 3, 'HTML, CSS, JavaScript and modern web standards.'),
  ('CS102', 'Database Systems & SQL',          4, 'Relational modeling, normalization, and SQL operations.'),
  ('CS103', 'Data Structures & Algorithms',    4, 'Fundamental data structures, search, and sorting algorithms.'),
  ('CS104', 'Cloud Computing Essentials',      3, 'Infrastructure, microservices, and cloud deployment.');

-- Insert sample enrolments (6 enrolments with initial grades)
INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 'A'),   -- Alice in CS101
  (1, 2, 'B+'),  -- Alice in CS102
  (2, 1, 'B'),   -- Brian in CS101
  (2, 3, 'A'),   -- Brian in CS103
  (3, 1, 'A-'),  -- Chloe in CS101
  (3, 2, 'C+');  -- Chloe in CS102

-- ============================================================================
-- 3. Required Queries
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: All courses for one student (by name)
-- Finds all courses Alice Johnson is enrolled in, along with course details and grades.
-- ----------------------------------------------------------------------------
SELECT
  students.name   AS student_name,
  courses.code    AS course_code,
  courses.title   AS course_title,
  courses.credits AS course_credits,
  enrolments.grade
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses    ON courses.id = enrolments.course_id
WHERE students.name = 'Alice Johnson'
ORDER BY courses.title ASC;

-- ----------------------------------------------------------------------------
-- Query 2: All students on one course
-- Retrieves the roster of students enrolled in 'Introduction to Web Development'.
-- ----------------------------------------------------------------------------
SELECT
  courses.title  AS course_title,
  students.name  AS student_name,
  students.email AS student_email,
  enrolments.grade
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN students   ON students.id = enrolments.student_id
WHERE courses.title = 'Introduction to Web Development'
ORDER BY students.name ASC;

-- ----------------------------------------------------------------------------
-- Query 3: The number of students per course
-- Counts enrolled students per course. Uses LEFT JOIN so courses with zero
-- enrolments (like CS104) still appear with a count of 0.
-- ----------------------------------------------------------------------------
SELECT
  courses.code  AS course_code,
  courses.title AS course_title,
  COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.code, courses.title
ORDER BY student_count DESC, courses.code ASC;

-- ----------------------------------------------------------------------------
-- Query 4: Students who have no enrolments
-- Identifies students not yet registered for any course using a LEFT JOIN
-- and filtering for NULL in the join table.
-- ----------------------------------------------------------------------------
SELECT
  students.id,
  students.name,
  students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL;

-- ----------------------------------------------------------------------------
-- Query 5: Update of one enrolment's grade
-- Updates Chloe Davis's grade in 'Database Systems & SQL' (CS102) from 'C+' to 'A'.
-- ----------------------------------------------------------------------------
UPDATE enrolments
SET grade = 'A'
WHERE student_id = (SELECT id FROM students WHERE name = 'Chloe Davis')
  AND course_id  = (SELECT id FROM courses WHERE code = 'CS102');

-- Verification query: Display the updated record to confirm change
SELECT
  students.name    AS student_name,
  courses.title    AS course_title,
  enrolments.grade AS updated_grade
FROM enrolments
JOIN students ON students.id = enrolments.student_id
JOIN courses  ON courses.id = enrolments.course_id
WHERE students.name = 'Chloe Davis'
  AND courses.code = 'CS102';
