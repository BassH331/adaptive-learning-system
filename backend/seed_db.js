
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "adaptive_learning_db";
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding!");
    const db = client.db(dbName);

    // Clear existing data (optional, for fresh seeding)
    await db.collection("system_students").deleteMany({});
    await db.collection("system_courses").deleteMany({});
    await db.collection("system_topics").deleteMany({});
    await db.collection("system_study_materials").deleteMany({});
    await db.collection("system_student_progress").deleteMany({});
    await db.collection("system_recommendations").deleteMany({});
    console.log("Cleared existing collections.");

    // Sample Students
    const hashedPasswordAlice = await bcrypt.hash("password123", 10);
    const hashedPasswordBob = await bcrypt.hash("securepass", 10);
    const hashedPasswordCharlie = await bcrypt.hash("testpass", 10);

    const students = [
      { name: "Alice Smith", email: "alice@example.com", password: hashedPasswordAlice, learning_style: "visual" },
      { name: "Bob Johnson", email: "bob@example.com", password: hashedPasswordBob, learning_style: "auditory" },
      { name: "Charlie Brown", email: "charlie@example.com", password: hashedPasswordCharlie, learning_style: "kinesthetic" },
    ];
    const studentResult = await db.collection("system_students").insertMany(students);
    const studentIds = Object.values(studentResult.insertedIds);
    const aliceId = studentIds[0];
    const bobId = studentIds[1];
    const charlieId = studentIds[2];
    console.log("Students seeded.");

    // Sample Courses
    const courses = [
      { name: "Mathematics", description: "Fundamental concepts of mathematics." },
      { name: "Science", description: "Exploring the natural world." },
      { name: "History", description: "Study of past events." },
    ];
    const courseResult = await db.collection("system_courses").insertMany(courses);
    const courseIds = Object.values(courseResult.insertedIds);
    const mathCourseId = courseIds[0];
    const scienceCourseId = courseIds[1];
    // const historyCourseId = courseIds[2];
    console.log("Courses seeded.");

    // Sample Topics for Mathematics
    const topics = [
      { course_id: mathCourseId, name: "Algebra Basics", description: "Introduction to algebraic expressions and equations." },
      { course_id: mathCourseId, name: "Geometry Fundamentals", description: "Basic concepts of shapes, sizes, and properties of space." },
      { course_id: mathCourseId, name: "Calculus Introduction", description: "Limits, derivatives, and integrals." },
      { course_id: scienceCourseId, name: "Physics Principles", description: "Laws governing motion, energy, and matter." },
      { course_id: scienceCourseId, name: "Chemistry Basics", description: "Elements, compounds, and chemical reactions." },
      { course_id: scienceCourseId, name: "Biology Fundamentals", description: "Study of living organisms." },
    ];
    const topicResult = await db.collection("system_topics").insertMany(topics);
    const topicIds = Object.values(topicResult.insertedIds);
    const algebraBasicsId = topicIds[0];
    const geometryFundamentalsId = topicIds[1];
    const physicsPrinciplesId = topicIds[3];
    console.log("Topics seeded.");

    // Sample Study Materials
    const materials = [
      // For Algebra Basics
      { topic_id: algebraBasicsId, type: "video", title: "Algebra for Beginners", content_url: "https://www.youtube.com/watch?v=NybHc_XJ2oQ", quiz_data: null },
      { topic_id: algebraBasicsId, type: "pdf", title: "Algebra Basics Notes", content_url: "https://example.com/algebra_notes.pdf", quiz_data: null },
      { topic_id: algebraBasicsId, type: "quiz", title: "Algebra Quiz 1", content_url: null, quiz_data: {
          questions: [
            { question: "What is 2x + 5 = 11?", options: ["x=2", "x=3", "x=4"], answer: "x=3" },
            { question: "Simplify: 3(a + 2b) - 2a", options: ["a+6b", "a+2b", "5a+6b"], answer: "a+6b" }
          ]
        }
      },
      // For Geometry Fundamentals
      { topic_id: geometryFundamentalsId, type: "pdf", title: "Geometry Definitions", content_url: "https://example.com/geometry_defs.pdf", quiz_data: null },
      { topic_id: geometryFundamentalsId, type: "video", title: "Introduction to Geometry", content_url: "https://www.youtube.com/watch?v=WMt21e_Qh7g", quiz_data: null },
      // For Physics Principles
      { topic_id: physicsPrinciplesId, type: "video", title: "Newton's Laws Explained", content_url: "https://www.youtube.com/watch?v=kY6g_Y-gK2Q", quiz_data: null },
      { topic_id: physicsPrinciplesId, type: "pdf", title: "Physics Formulas Sheet", content_url: "https://example.com/physics_formulas.pdf", quiz_data: null },
    ];
    await db.collection("system_study_materials").insertMany(materials);
    console.log("Study materials seeded.");

    // Sample Student Progress
    const progress = [
      // Alice (visual learner)
      { student_id: aliceId, topic_id: algebraBasicsId, score: 65.00, grade: "C", status: "in_progress", last_accessed: new Date() },
      { student_id: aliceId, topic_id: geometryFundamentalsId, score: 88.00, grade: "B+", status: "completed", last_accessed: new Date() },
      // Bob (auditory learner)
      { student_id: bobId, topic_id: algebraBasicsId, score: 72.50, grade: "B-", status: "completed", last_accessed: new Date() },
      { student_id: bobId, topic_id: physicsPrinciplesId, score: 55.00, grade: "D", status: "in_progress", last_accessed: new Date() },
      // Charlie (kinesthetic learner)
      { student_id: charlieId, topic_id: geometryFundamentalsId, score: 78.00, grade: "B", status: "in_progress", last_accessed: new Date() },
    ];
    await db.collection("system_student_progress").insertMany(progress);
    console.log("Student progress seeded.");

    console.log("Database seeding complete!");
  } catch (err) {
    console.error("Database seeding failed:", err);
  } finally {
    await client.close();
  }
}

seedDatabase();

