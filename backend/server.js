
require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "adaptive_learning_db";
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}
connectToMongo();

// JWT Secret
const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey";

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// --- API Endpoints ---

// Register Student
app.post("/api/register", async (req, res) => {
  const { name, email, password, learning_style } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const db = client.db(dbName);
    const studentsCollection = db.collection("system_students");

    const existingUser = await studentsCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await studentsCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      learning_style,
    });
    res.status(201).json({ message: "Student registered successfully", studentId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Student
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const db = client.db(dbName);
    const studentsCollection = db.collection("system_students");

    const user = await studentsCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, learning_style: user.learning_style } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Student Profile (Protected)
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const db = client.db(dbName);
    const studentsCollection = db.collection("system_students");

    const student = await studentsCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ id: student._id, name: student.name, email: student.email, learning_style: student.learning_style });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Student Profile (Protected)
app.put("/api/profile", authenticateToken, async (req, res) => {
  const { name, learning_style } = req.body;
  try {
    const db = client.db(dbName);
    const studentsCollection = db.collection("system_students");

    await studentsCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name, learning_style } }
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- CRUD for Courses ---
app.get("/api/courses", authenticateToken, async (req, res) => {
  try {
    const db = client.db(dbName);
    const coursesCollection = db.collection("system_courses");
    const courses = await coursesCollection.find({}).toArray();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/courses", authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const db = client.db(dbName);
    const coursesCollection = db.collection("system_courses");
    const result = await coursesCollection.insertOne({ name, description });
    res.status(201).json({ _id: result.insertedId, name, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- CRUD for Topics ---
app.get("/api/topics/:courseId", authenticateToken, async (req, res) => {
  const { courseId } = req.params;
  try {
    const db = client.db(dbName);
    const topicsCollection = db.collection("system_topics");
    const topics = await topicsCollection.find({ course_id: new ObjectId(courseId) }).toArray();
    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/topics", authenticateToken, async (req, res) => {
  const { course_id, name, description } = req.body;
  try {
    const db = client.db(dbName);
    const topicsCollection = db.collection("system_topics");
    const result = await topicsCollection.insertOne({ course_id: new ObjectId(course_id), name, description });
    res.status(201).json({ _id: result.insertedId, course_id, name, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- CRUD for Quizzes ---
app.post("/api/quizzes", authenticateToken, async (req, res) => {
  const { topic_id, title, description, difficulty, questions } = req.body;
  try {
    const db = client.db(dbName);
    const quizzesCollection = db.collection("system_quizzes");
    const result = await quizzesCollection.insertOne({ topic_id: new ObjectId(topic_id), title, description, difficulty, questions });
    res.status(201).json({ _id: result.insertedId, topic_id, title, description, difficulty, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/quizzes/:quizId", authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  try {
    const db = client.db(dbName);
    const quizzesCollection = db.collection("system_quizzes");
    const quiz = await quizzesCollection.findOne({ _id: new ObjectId(quizId) });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/quizzes/:quizId/submit", authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const student_id = req.user.id;

  try {
    const db = client.db(dbName);
    const quizzesCollection = db.collection("system_quizzes");
    const progressCollection = db.collection("system_student_progress");
    const studentsCollection = db.collection("system_students");
    const topicsCollection = db.collection("system_topics");

    const quiz = await quizzesCollection.findOne({ _id: new ObjectId(quizId) });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] && answers[index].toLowerCase() === q.correct_answer.toLowerCase()) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

    const studentObjectId = new ObjectId(student_id);
    const topicObjectId = quiz.topic_id;

    // Update student progress
    const existingProgress = await progressCollection.findOne({ student_id: studentObjectId, topic_id: topicObjectId });

    if (existingProgress) {
      // Add quiz attempt to existing progress
      await progressCollection.updateOne(
        { _id: existingProgress._id },
        { 
          $set: { score, grade, status: score >= 70 ? "completed" : "in_progress", last_accessed: new Date() },
          $push: { quiz_attempts: { quiz_id: new ObjectId(quizId), score, attempted_at: new Date() } }
        }
      );
    } else {
      // Create new progress entry
      await progressCollection.insertOne({
        student_id: studentObjectId,
        topic_id: topicObjectId,
        score,
        grade,
        status: score >= 70 ? "completed" : "in_progress",
        last_accessed: new Date(),
        quiz_attempts: [{ quiz_id: new ObjectId(quizId), score, attempted_at: new Date() }]
      });
    }

    // Update student gamification elements (points, badges)
    let pointsEarned = Math.round(score / 10);
    let newBadges = [];

    const student = await studentsCollection.findOne({ _id: studentObjectId });
    let currentPoints = student.points || 0;
    let currentBadges = student.badges || [];

    // Award points
    currentPoints += pointsEarned;

    // Award badges based on score or other criteria
    if (score >= 90 && !currentBadges.includes("Quiz Master")) {
      newBadges.push("Quiz Master");
    }
    if (score === 100 && !currentBadges.includes("Perfect Score")) {
      newBadges.push("Perfect Score");
    }

    await studentsCollection.updateOne(
      { _id: studentObjectId },
      { 
        $set: { points: currentPoints },
        $addToSet: { badges: { $each: newBadges } } // Add new badges without duplicates
      }
    );

    res.json({ score, grade, correctAnswers, totalQuestions: quiz.questions.length, pointsEarned, newBadges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- CRUD for Study Materials ---
app.get("/api/materials/:topicId", authenticateToken, async (req, res) => {
  const { topicId } = req.params;
  try {
    const db = client.db(dbName);
    const materialsCollection = db.collection("system_study_materials");
    const materials = await materialsCollection.find({ topic_id: new ObjectId(topicId) }).toArray();
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/materials", authenticateToken, async (req, res) => {
  const { topic_id, type, title, content_url, quiz_id } = req.body; // Added quiz_id
  try {
    const db = client.db(dbName);
    const materialsCollection = db.collection("system_study_materials");
    const result = await materialsCollection.insertOne({ topic_id: new ObjectId(topic_id), type, title, content_url, quiz_id: quiz_id ? new ObjectId(quiz_id) : null });
    res.status(201).json({ _id: result.insertedId, topic_id, type, title, content_url, quiz_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Student Progress ---
app.post("/api/progress", authenticateToken, async (req, res) => {
  const { topic_id, score, grade, status } = req.body;
  const student_id = req.user.id;
  try {
    const db = client.db(dbName);
    const progressCollection = db.collection("system_student_progress");

    const existingProgress = await progressCollection.findOne({ student_id: new ObjectId(student_id), topic_id: new ObjectId(topic_id) });

    if (existingProgress) {
      await progressCollection.updateOne(
        { _id: existingProgress._id },
        { $set: { score, grade, status, last_accessed: new Date() } }
      );
    } else {
      await progressCollection.insertOne({
        student_id: new ObjectId(student_id),
        topic_id: new ObjectId(topic_id),
        score,
        grade,
        status,
        last_accessed: new Date(),
      });
    }
    res.status(201).json({ message: "Progress updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/progress/:studentId", authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  try {
    const db = client.db(dbName);
    const progressCollection = db.collection("system_student_progress");
    const topicsCollection = db.collection("system_topics");
    const coursesCollection = db.collection("system_courses");

    const progress = await progressCollection.find({ student_id: new ObjectId(studentId) }).toArray();

    const detailedProgress = await Promise.all(progress.map(async (p) => {
      const topic = await topicsCollection.findOne({ _id: p.topic_id });
      const course = topic ? await coursesCollection.findOne({ _id: topic.course_id }) : null;
      return {
        ...p,
        topic_name: topic ? topic.name : "Unknown Topic",
        course_name: course ? course.name : "Unknown Course",
      };
    }));

    res.json(detailedProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

    // --- Adaptive Learning Algorithm (Enhanced Heuristic) ---
app.get("/api/recommendations/:studentId", authenticateToken, async (req, res) => {
      const { studentId } = req.params;
      try {
        const db = client.db(dbName);
        const studentsCollection = db.collection("system_students");
        const topicsCollection = db.collection("system_topics");
        const progressCollection = db.collection("system_student_progress");
        const materialsCollection = db.collection("system_study_materials");

        const studentObjectId = new ObjectId(studentId);
        const student = await studentsCollection.findOne({ _id: studentObjectId });
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        const learningStyle = student.learning_style || "visual"; // Default to visual

        const studentProgress = await progressCollection.find({ student_id: studentObjectId }).toArray();
        const completedTopicIds = studentProgress.filter(p => p.score >= 70).map(p => p.topic_id);
        const strugglingTopics = studentProgress.filter(p => p.score < 70); // Topics where score is less than 70
const unattemptedTopics = (await topicsCollection.find({ _id: { $nin: studentProgress.map(p => p.topic_id) } }).toArray());
const allTopics = await topicsCollection.find({}).toArray();

        let recommendations = [];

        // 1. Prioritize struggling topics with relevant materials based on learning style
        for (const p of strugglingTopics) {
          const topic = await topicsCollection.findOne({ _id: p.topic_id });
          if (!topic) continue;

let material = null;
          // Prioritize quizzes for struggling topics
          material = await materialsCollection.findOne({ topic_id: topic._id, type: "quiz" });

          // If no quiz, try to find a material that matches the student\'s learning style
          if (!material) {
            if (learningStyle === "visual") {
              material = await materialsCollection.findOne({ topic_id: topic._id, type: "video" });
            } else if (learningStyle === "auditory") {
              material = await materialsCollection.findOne({ topic_id: topic._id, type: "video" });
            } else if (learningStyle === "kinesthetic") {
              material = await materialsCollection.findOne({ topic_id: topic._id, type: "pdf" }); // PDFs can be interactive for kinesthetic
            }
          }

          // Fallback to any material if style-specific not found
          if (!material) {
            material = await materialsCollection.findOne({ topic_id: topic._id });
          }

          if (material) {
            recommendations.push({
              topic: topic.name,
              material: material,
              reason: `Improve score in ${topic.name} (score: ${p.score}) - tailored for ${learningStyle} learners`,
            });
          }
        }

        // 2. If fewer than 3 recommendations, suggest new unstarted topics
        if (recommendations.length < 3) {
          // Recommend unstarted topics, prioritizing those with quizzes
          const topicsToConsider = unattemptedTopics.filter(t => !completedTopicIds.includes(t._id.toString()));

          for (const topic of topicsToConsider) {
            if (recommendations.length >= 3) break;

            let material = await materialsCollection.findOne({ topic_id: topic._id, type: "quiz" });
            if (!material) {
              material = await materialsCollection.findOne({ topic_id: topic._id });
            }

            if (material) {
              recommendations.push({
                topic: topic.name,
                material: material,
                reason: `Explore new topic: ${topic.name}`,
              });
            }
          }
        }

        // Ensure diverse recommendations if still not enough
        if (recommendations.length < 3) {
          const allMaterials = await materialsCollection.find({}).limit(3 - recommendations.length).toArray();
          for (const material of allMaterials) {
            const topic = await topicsCollection.findOne({ _id: material.topic_id });
            if (topic && !recommendations.some(r => r.topic === topic.name)) {
              recommendations.push({
                topic: topic.name,
                material: material,
                reason: `General recommendation: ${topic.name}`,
              });
            }
          }
        }

        res.json(recommendations);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

