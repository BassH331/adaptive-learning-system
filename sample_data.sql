
USE adaptive_learning_db;

-- Sample Students
INSERT INTO students (name, email, password, learning_style) VALUES
("Alice Smith", "alice@example.com", "$2b$12$2UrwkK8HSRnIIvDnQIKQUO/e2isLwLEIDVRBkh9Y8e/teJU/kguS.", "visual"),
("Bob Johnson", "bob@example.com", "$2b$12$l4AVIzgRp29iMmIrmhDdV.vbUXgf8.PMH/MMvoxvLDgQv4uHrrWwG", "auditory"),
("Charlie Brown", "charlie@example.com", "$2b$12$i8gh0J2kMyf9Sqih0B.X0uazl5/AYn9/fPYhqkGOwsyJALWaSHOx2", "kinesthetic");

-- Sample Courses
INSERT INTO courses (name, description) VALUES
("Mathematics", "Fundamental concepts of mathematics."),
("Science", "Exploring the natural world."),
("History", "Study of past events.");

-- Sample Topics for Mathematics
INSERT INTO topics (course_id, name, description) VALUES
(1, "Algebra Basics", "Introduction to algebraic expressions and equations."),
(1, "Geometry Fundamentals", "Basic concepts of shapes, sizes, and properties of space."),
(1, "Calculus Introduction", "Limits, derivatives, and integrals.");

-- Sample Topics for Science
INSERT INTO topics (course_id, name, description) VALUES
(2, "Physics Principles", "Laws governing motion, energy, and matter."),
(2, "Chemistry Basics", "Elements, compounds, and chemical reactions."),
(2, "Biology Fundamentals", "Study of living organisms.");

-- Sample Study Materials
-- For Algebra Basics (topic_id: 1)
INSERT INTO study_materials (topic_id, type, title, content_url, quiz_data) VALUES
(1, "video", "Algebra for Beginners", "https://www.youtube.com/watch?v=NybHc_XJ2oQ", NULL),
(1, "pdf", "Algebra Basics Notes", "https://example.com/algebra_notes.pdf", NULL),
(1, "quiz", "Algebra Quiz 1", NULL, 
    JSON_OBJECT(
        "questions", JSON_ARRAY(
            JSON_OBJECT("question", "What is 2x + 5 = 11?", "options", JSON_ARRAY("x=2", "x=3", "x=4"), "answer", "x=3"),
            JSON_OBJECT("question", "Simplify: 3(a + 2b) - 2a", "options", JSON_ARRAY("a+6b", "a+2b", "5a+6b"), "answer", "a+6b")
        )
    )
);

-- For Geometry Fundamentals (topic_id: 2)
INSERT INTO study_materials (topic_id, type, title, content_url, quiz_data) VALUES
(2, "pdf", "Geometry Definitions", "https://example.com/geometry_defs.pdf", NULL),
(2, "video", "Introduction to Geometry", "https://www.youtube.com/watch?v=WMt21e_Qh7g", NULL);

-- For Physics Principles (topic_id: 4)
INSERT INTO study_materials (topic_id, type, title, content_url, quiz_data) VALUES
(4, "video", "Newton\'s Laws Explained", "https://www.youtube.com/watch?v=kY6g_Y-gK2Q", NULL),
(4, "pdf", "Physics Formulas Sheet", "https://example.com/physics_formulas.pdf", NULL);

-- Sample Student Progress
-- Alice (student_id: 1) - Visual learner
INSERT INTO student_progress (student_id, topic_id, score, grade, status) VALUES
(1, 1, 65.00, "C", "in_progress"), -- Algebra Basics (needs improvement)
(1, 2, 88.00, "B+", "completed"); -- Geometry Fundamentals

-- Bob (student_id: 2) - Auditory learner
INSERT INTO student_progress (student_id, topic_id, score, grade, status) VALUES
(2, 1, 72.50, "B-", "completed"), -- Algebra Basics
(2, 4, 55.00, "D", "in_progress"); -- Physics Principles (needs improvement)

-- Charlie (student_id: 3) - Kinesthetic learner
INSERT INTO student_progress (student_id, topic_id, score, grade, status) VALUES
(3, 2, 78.00, "B", "in_progress"); -- Geometry Fundamentals

