require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

async function enhancedSeed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Clear existing collections
    const collections = ["system_courses", "system_topics", "system_study_materials"];
    for (const collName of collections) {
      await db.collection(collName).deleteMany({});
      console.log(`Cleared ${collName}`);
    }

    // Insert comprehensive courses
    const courses = [
      {
        name: "Mathematics",
        description: "Comprehensive mathematics curriculum covering algebra, geometry, calculus, and statistics"
      },
      {
        name: "Science",
        description: "Exploring physics, chemistry, biology, and earth sciences"
      },
      {
        name: "Computer Science",
        description: "Programming, algorithms, data structures, and software development"
      },
      {
        name: "English Language Arts",
        description: "Reading comprehension, writing skills, grammar, and literature analysis"
      }
    ];

    const courseResult = await db.collection("system_courses").insertMany(courses);
    const courseIds = Object.values(courseResult.insertedIds);
    console.log(`Inserted ${courseIds.length} courses`);

    // Insert comprehensive topics
    const topics = [
      // Mathematics topics
      { course_id: courseIds[0], name: "Algebra Basics", description: "Variables, equations, and basic algebraic operations" },
      { course_id: courseIds[0], name: "Geometry Fundamentals", description: "Shapes, angles, area, and perimeter calculations" },
      { course_id: courseIds[0], name: "Linear Equations", description: "Solving and graphing linear equations" },
      { course_id: courseIds[0], name: "Quadratic Equations", description: "Solving quadratic equations and understanding parabolas" },
      { course_id: courseIds[0], name: "Trigonometry", description: "Sine, cosine, tangent, and their applications" },
      { course_id: courseIds[0], name: "Calculus Introduction", description: "Limits, derivatives, and basic integration" },
      { course_id: courseIds[0], name: "Statistics Basics", description: "Mean, median, mode, and standard deviation" },
      { course_id: courseIds[0], name: "Probability Theory", description: "Understanding probability and random events" },

      // Science topics
      { course_id: courseIds[1], name: "Newton's Laws of Motion", description: "Understanding force, mass, and acceleration" },
      { course_id: courseIds[1], name: "Chemical Reactions", description: "Types of reactions and balancing equations" },
      { course_id: courseIds[1], name: "Cell Biology", description: "Structure and function of cells" },
      { course_id: courseIds[1], name: "Photosynthesis", description: "How plants convert light into energy" },
      { course_id: courseIds[1], name: "Atomic Structure", description: "Protons, neutrons, electrons, and electron configuration" },
      { course_id: courseIds[1], name: "Energy and Work", description: "Understanding kinetic and potential energy" },
      { course_id: courseIds[1], name: "Genetics Basics", description: "DNA, genes, and heredity" },
      { course_id: courseIds[1], name: "Ecosystems", description: "Food chains, energy flow, and ecological relationships" },

      // Computer Science topics
      { course_id: courseIds[2], name: "Programming Fundamentals", description: "Variables, loops, and conditionals" },
      { course_id: courseIds[2], name: "Data Structures", description: "Arrays, linked lists, stacks, and queues" },
      { course_id: courseIds[2], name: "Algorithms", description: "Sorting, searching, and algorithm complexity" },
      { course_id: courseIds[2], name: "Object-Oriented Programming", description: "Classes, objects, inheritance, and polymorphism" },
      { course_id: courseIds[2], name: "Web Development", description: "HTML, CSS, JavaScript, and responsive design" },
      { course_id: courseIds[2], name: "Databases", description: "SQL, NoSQL, and database design" },
      { course_id: courseIds[2], name: "Software Testing", description: "Unit testing, integration testing, and test-driven development" },

      // English Language Arts topics
      { course_id: courseIds[3], name: "Reading Comprehension", description: "Understanding and analyzing texts" },
      { course_id: courseIds[3], name: "Essay Writing", description: "Structure, thesis statements, and argumentation" },
      { course_id: courseIds[3], name: "Grammar Essentials", description: "Parts of speech, sentence structure, and punctuation" },
      { course_id: courseIds[3], name: "Literary Analysis", description: "Analyzing themes, characters, and symbolism" },
      { course_id: courseIds[3], name: "Creative Writing", description: "Storytelling, character development, and narrative techniques" },
      { course_id: courseIds[3], name: "Vocabulary Building", description: "Word roots, context clues, and advanced vocabulary" }
    ];

    const topicResult = await db.collection("system_topics").insertMany(topics);
    const topicIds = Object.values(topicResult.insertedIds);
    console.log(`Inserted ${topicIds.length} topics`);

    // Insert comprehensive study materials
    const materials = [];

    // Mathematics materials
    materials.push(
      { topic_id: topicIds[0], type: "video", title: "Algebra Basics Introduction", content_url: "https://www.youtube.com/watch?v=NybHckSEQBI" },
      { topic_id: topicIds[0], type: "pdf", title: "Algebra Basics Workbook", content_url: "https://www.khanacademy.org/math/algebra" },
      { topic_id: topicIds[0], type: "quiz", title: "Algebra Basics Quiz", quiz_data: {
        questions: [
          { question: "Solve for x: 2x + 5 = 15", options: ["x = 5", "x = 10", "x = 7.5", "x = 20"], correct: 0 },
          { question: "Simplify: 3(x + 2) - 2x", options: ["x + 6", "x + 2", "5x + 6", "x - 6"], correct: 0 },
          { question: "What is the value of x if x/4 = 8?", options: ["2", "32", "12", "4"], correct: 1 }
        ]
      }},
      
      { topic_id: topicIds[1], type: "video", title: "Geometry Fundamentals Explained", content_url: "https://www.youtube.com/watch?v=oSXGNucF-bA" },
      { topic_id: topicIds[1], type: "pdf", title: "Geometry Shapes Guide", content_url: "https://www.khanacademy.org/math/geometry" },
      { topic_id: topicIds[1], type: "quiz", title: "Geometry Quiz", quiz_data: {
        questions: [
          { question: "What is the area of a rectangle with length 8 and width 5?", options: ["13", "40", "26", "80"], correct: 1 },
          { question: "How many degrees are in a triangle?", options: ["90", "180", "360", "270"], correct: 1 },
          { question: "What is the perimeter of a square with side length 6?", options: ["12", "18", "24", "36"], correct: 2 }
        ]
      }},

      { topic_id: topicIds[2], type: "video", title: "Linear Equations Tutorial", content_url: "https://www.youtube.com/watch?v=ld5r385JbEA" },
      { topic_id: topicIds[2], type: "pdf", title: "Linear Equations Practice", content_url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs" },
      
      { topic_id: topicIds[3], type: "video", title: "Quadratic Equations Explained", content_url: "https://www.youtube.com/watch?v=i7idZfS8t8w" },
      { topic_id: topicIds[3], type: "quiz", title: "Quadratic Equations Quiz", quiz_data: {
        questions: [
          { question: "What is the standard form of a quadratic equation?", options: ["y = mx + b", "ax² + bx + c = 0", "x + y = z", "a/b = c"], correct: 1 },
          { question: "How many solutions can a quadratic equation have?", options: ["0, 1, or 2", "Always 2", "Always 1", "Infinite"], correct: 0 }
        ]
      }}
    );

    // Science materials
    materials.push(
      { topic_id: topicIds[8], type: "video", title: "Newton's Laws Explained", content_url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds" },
      { topic_id: topicIds[8], type: "pdf", title: "Physics Laws Guide", content_url: "https://www.khanacademy.org/science/physics/forces-newtons-laws" },
      { topic_id: topicIds[8], type: "quiz", title: "Newton's Laws Quiz", quiz_data: {
        questions: [
          { question: "What is Newton's First Law?", options: ["F = ma", "An object at rest stays at rest", "Action-reaction", "E = mc²"], correct: 1 },
          { question: "If force = 10N and mass = 2kg, what is acceleration?", options: ["5 m/s²", "20 m/s²", "12 m/s²", "8 m/s²"], correct: 0 }
        ]
      }},

      { topic_id: topicIds[9], type: "video", title: "Chemical Reactions Overview", content_url: "https://www.youtube.com/watch?v=7ERzPFCE7B0" },
      { topic_id: topicIds[9], type: "pdf", title: "Chemistry Reactions Guide", content_url: "https://www.khanacademy.org/science/chemistry/chemical-reactions-stoichiome" },
      
      { topic_id: topicIds[10], type: "video", title: "Cell Biology Introduction", content_url: "https://www.youtube.com/watch?v=URUJD5NEXC8" },
      { topic_id: topicIds[10], type: "quiz", title: "Cell Biology Quiz", quiz_data: {
        questions: [
          { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"], correct: 1 },
          { question: "Which organelle controls cell activities?", options: ["Mitochondria", "Cell membrane", "Nucleus", "Cytoplasm"], correct: 2 }
        ]
      }}
    );

    // Computer Science materials
    materials.push(
      { topic_id: topicIds[16], type: "video", title: "Programming Basics for Beginners", content_url: "https://www.youtube.com/watch?v=zOjov-2OZ0E" },
      { topic_id: topicIds[16], type: "pdf", title: "Programming Fundamentals Guide", content_url: "https://www.khanacademy.org/computing/computer-programming" },
      { topic_id: topicIds[16], type: "quiz", title: "Programming Quiz", quiz_data: {
        questions: [
          { question: "What is a variable?", options: ["A fixed value", "A container for data", "A function", "A loop"], correct: 1 },
          { question: "Which loop runs at least once?", options: ["for", "while", "do-while", "foreach"], correct: 2 }
        ]
      }},

      { topic_id: topicIds[17], type: "video", title: "Data Structures Explained", content_url: "https://www.youtube.com/watch?v=RBSGKlAvoiM" },
      { topic_id: topicIds[17], type: "pdf", title: "Data Structures Reference", content_url: "https://www.geeksforgeeks.org/data-structures/" },
      
      { topic_id: topicIds[18], type: "video", title: "Sorting Algorithms Visualized", content_url: "https://www.youtube.com/watch?v=kPRA0W1kECg" },
      { topic_id: topicIds[18], type: "quiz", title: "Algorithms Quiz", quiz_data: {
        questions: [
          { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1 },
          { question: "Which sorting algorithm is fastest on average?", options: ["Bubble sort", "Quick sort", "Selection sort", "Insertion sort"], correct: 1 }
        ]
      }}
    );

    // English Language Arts materials
    materials.push(
      { topic_id: topicIds[23], type: "video", title: "Reading Comprehension Strategies", content_url: "https://www.youtube.com/watch?v=8K6KXdNqPTo" },
      { topic_id: topicIds[23], type: "pdf", title: "Reading Comprehension Workbook", content_url: "https://www.khanacademy.org/ela/cc-2nd-reading-vocab" },
      { topic_id: topicIds[23], type: "quiz", title: "Reading Comprehension Quiz", quiz_data: {
        questions: [
          { question: "What is the main idea of a paragraph?", options: ["The first sentence", "The central point", "The last sentence", "All details"], correct: 1 },
          { question: "What is an inference?", options: ["A fact", "A conclusion based on evidence", "A quote", "A summary"], correct: 1 }
        ]
      }},

      { topic_id: topicIds[24], type: "video", title: "Essay Writing Structure", content_url: "https://www.youtube.com/watch?v=AzFbx3BtDyU" },
      { topic_id: topicIds[24], type: "pdf", title: "Essay Writing Guide", content_url: "https://owl.purdue.edu/owl/general_writing/academic_writing/essay_writing/index.html" },
      
      { topic_id: topicIds[25], type: "video", title: "Grammar Essentials", content_url: "https://www.youtube.com/watch?v=Mw6Pf9LHnZM" },
      { topic_id: topicIds[25], type: "quiz", title: "Grammar Quiz", quiz_data: {
        questions: [
          { question: "What is a noun?", options: ["An action word", "A person, place, or thing", "A describing word", "A connecting word"], correct: 1 },
          { question: "Which is a verb?", options: ["Happy", "Run", "Blue", "Quickly"], correct: 1 }
        ]
      }}
    );

    await db.collection("system_study_materials").insertMany(materials);
    console.log(`Inserted ${materials.length} study materials`);

    console.log("Enhanced seeding complete!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await client.close();
  }
}

enhancedSeed();

