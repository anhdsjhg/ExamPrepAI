import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const api = axios.create({
  baseURL: "/api",
});

const mock = new MockAdapter(api, { delayResponse: 500 });

const load = (key, fallback) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

let subjects = load("subjects", [
  {
    id: 1,
    title: "Mathematics",
    description: "Basic mathematics concepts and problem solving",
  },
  {
    id: 2,
    title: "Science",
    description: "General science knowledge and concepts",
  },
]);

let topics = load("topics", [
  {
    id: 1,
    subjectId: 1,
    title: "Algebra",
    description: "Basic algebraic equations",
  },
  {
    id: 2,
    subjectId: 1,
    title: "Geometry",
    description: "Shapes and spatial reasoning",
  },
  {
    id: 3,
    subjectId: 2,
    title: "Physics",
    description: "Fundamental physics principles",
  },
]);

let tests = load("tests", [
  {
    id: 1,
    topicId: 1,
    title: "Algebra Basics Test",
    difficulty: "medium",
    questions: [
      {
        id: 1,
        text: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        difficulty: "easy",
        explanation: "2 + 2 equals 4 because you are adding two groups of two.",
      },
      {
        id: 2,
        text: "What is 5 × 3?",
        options: ["8", "15", "10", "20"],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "5 × 3 means 5 added 3 times: 5 + 5 + 5 = 15.",
      },
    ],
  },
  {
    id: 2,
    topicId: 2,
    title: "Geometry Basics Test",
    difficulty: "medium",
    questions: [
      {
        id: 3,
        text: "How many sides does a triangle have?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        difficulty: "easy",
        explanation: "A triangle always has 3 sides, no matter its shape.",
      },
    ],
  },
  {
    id: 3,
    topicId: 3,
    title: "Physics Intro Test",
    difficulty: "medium",
    questions: [
      {
        id: 4,
        text: "What force pulls objects toward Earth?",
        options: ["Magnetism", "Gravity", "Friction", "Electricity"],
        correctAnswer: 1,
        difficulty: "medium",
        explanation:
          "Gravity is the force that pulls objects with mass toward each other, including toward Earth.",
      },
    ],
  },
]);

let results = load("results", []);

// Helper function to extract ID from URL
const extractId = (url, pattern) => {
  const match = url.match(pattern);
  return match ? parseInt(match[1]) : null;
};

// ============================================
// SUBJECTS ENDPOINTS
// ============================================

// GET /api/subjects → returns all subjects
mock.onGet("/subjects").reply(async () => {
  return [200, subjects];
});

// GET /api/subjects/:id → returns the subject with the given id
mock.onGet(/^\/subjects\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/subjects\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid subject ID format" }];
  }

  const subject = subjects.find((s) => s.id === id);
  if (!subject) {
    return [404, { error: `Subject with ID ${id} not found` }];
  }

  return [200, subject];
});

// POST /api/subjects → creates a new subject
mock.onPost("/subjects").reply(async (config) => {
  try {
    const newSubject = JSON.parse(config.data);

    // Validate required fields
    if (!newSubject.title || !newSubject.description) {
      return [400, { error: "Title and description are required" }];
    }

    // Generate new ID
    newSubject.id =
      subjects.length > 0 ? Math.max(...subjects.map((s) => s.id)) + 1 : 1;

    subjects.push(newSubject);
    save("subjects", subjects);
    return [201, newSubject];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// PUT /api/subjects/:id → updates the subject with the given id
mock.onPut(/^\/subjects\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/subjects\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid subject ID format" }];
  }

  try {
    const updatedSubject = JSON.parse(config.data);
    const index = subjects.findIndex((s) => s.id === id);

    if (index === -1) {
      return [404, { error: `Subject with ID ${id} not found` }];
    }

    subjects[index] = { ...updatedSubject, id };
    save("subjects", subjects);
    return [200, subjects[index]];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// DELETE /api/subjects/:id → deletes the subject and its topics
mock.onDelete(/^\/subjects\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/subjects\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid subject ID format" }];
  }

  const index = subjects.findIndex((s) => s.id === id);

  if (index === -1) {
    return [404, { error: `Subject with ID ${id} not found` }];
  }

  // Cascade delete: remove all topics belonging to this subject
  const topicIdsToDelete = topics
    .filter((t) => t.subjectId === id)
    .map((t) => t.id);

  // Remove topics
  topics = topics.filter((t) => t.subjectId !== id);

  // Cascade delete: remove all tests belonging to deleted topics
  tests = tests.filter((test) => !topicIdsToDelete.includes(test.topicId));

  // Remove subject
  subjects = subjects.filter((s) => s.id !== id);
  save("subjects", subjects);
  save("topics", topics);
  save("tests", tests);

  return [
    200,
    {
      success: true,
      message: `Subject ${id} and its related topics and tests deleted successfully`,
    },
  ];
});

// ============================================
// TOPICS ENDPOINTS
// ============================================

// GET /api/subjects/:id/topics → returns all topics for the subject
mock.onGet(/^\/subjects\/(\d+)\/topics$/).reply(async (config) => {
  const subjectId = extractId(config.url, /^\/subjects\/(\d+)\/topics$/);
  if (!subjectId) {
    return [404, { error: "Invalid subject ID format" }];
  }

  // Verify subject exists
  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) {
    return [404, { error: `Subject with ID ${subjectId} not found` }];
  }

  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);
  return [200, subjectTopics];
});

// GET /api/topics/:id → returns a single topic
mock.onGet(/^\/topics\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/topics\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid topic ID format" }];
  }

  const topic = topics.find((t) => t.id === id);
  if (!topic) {
    return [404, { error: `Topic with ID ${id} not found` }];
  }

  return [200, topic];
});

// POST /api/topics → creates a new topic
mock.onPost("/topics").reply(async (config) => {
  try {
    const newTopic = JSON.parse(config.data);

    // Validate required fields
    if (!newTopic.title || !newTopic.description || !newTopic.subjectId) {
      return [400, { error: "Title, description, and subjectId are required" }];
    }

    // Verify subject exists
    const subject = subjects.find((s) => s.id === newTopic.subjectId);
    if (!subject) {
      return [
        404,
        { error: `Subject with ID ${newTopic.subjectId} not found` },
      ];
    }

    // Generate new ID
    newTopic.id =
      topics.length > 0 ? Math.max(...topics.map((t) => t.id)) + 1 : 1;

    topics.push(newTopic);
    save("topics", topics);
    return [201, newTopic];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// PUT /api/topics/:id → updates a topic
mock.onPut(/^\/topics\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/topics\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid topic ID format" }];
  }

  try {
    const updatedTopic = JSON.parse(config.data);
    const index = topics.findIndex((t) => t.id === id);

    if (index === -1) {
      return [404, { error: `Topic with ID ${id} not found` }];
    }

    // If subjectId is being updated, verify the new subject exists
    if (
      updatedTopic.subjectId &&
      updatedTopic.subjectId !== topics[index].subjectId
    ) {
      const subject = subjects.find((s) => s.id === updatedTopic.subjectId);
      if (!subject) {
        return [
          404,
          { error: `Subject with ID ${updatedTopic.subjectId} not found` },
        ];
      }
    }

    topics[index] = { ...updatedTopic, id };
    save("topics", topics);
    return [200, topics[index]];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// DELETE /api/topics/:id → deletes a topic and its tests
mock.onDelete(/^\/topics\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/topics\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid topic ID format" }];
  }

  const index = topics.findIndex((t) => t.id === id);
  if (index === -1) {
    return [404, { error: `Topic with ID ${id} not found` }];
  }

  // Cascade delete: remove all tests belonging to this topic
  tests = tests.filter((test) => test.topicId !== id);

  // Remove topic
  topics = topics.filter((t) => t.id !== id);
  save("topics", topics);
  save("tests", tests);

  return [
    200,
    {
      success: true,
      message: `Topic ${id} and its related tests deleted successfully`,
    },
  ];
});

// ============================================
// TESTS ENDPOINTS
// ============================================

// GET /api/tests → returns all tests
mock.onGet("/tests").reply(async () => {
  // Ensure every test has a difficulty value for older stored data
  const normalizedTests = tests.map((t) => ({
    ...t,
    difficulty: t.difficulty || "medium",
  }));

  return [200, normalizedTests];
});

// GET /api/tests/:id → returns a single test
mock.onGet(/^\/tests\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/tests\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid test ID format" }];
  }

  const test = tests.find((t) => t.id === id);
  if (!test) {
    return [404, { error: `Test with ID ${id} not found` }];
  }

  // Always return a difficulty value
  return [200, { ...test, difficulty: test.difficulty || "medium" }];
});

// GET /api/topics/:id/tests → returns all tests for a topic
mock.onGet(/^\/topics\/(\d+)\/tests$/).reply(async (config) => {
  const topicId = extractId(config.url, /^\/topics\/(\d+)\/tests$/);
  if (!topicId) {
    return [404, { error: "Invalid topic ID format" }];
  }

  // Verify topic exists
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) {
    return [404, { error: `Topic with ID ${topicId} not found` }];
  }

  const topicTests = tests
    .filter((t) => t.topicId === topicId)
    .map((t) => ({
      ...t,
      difficulty: t.difficulty || "medium",
    }));

  return [200, topicTests];
});

// POST /api/tests → creates a new test
mock.onPost("/tests").reply(async (config) => {
  try {
    const newTest = JSON.parse(config.data);

    // Validate required fields (difficulty will fall back to 'medium' if missing)
    if (!newTest.title || newTest.topicId === undefined) {
      return [400, { error: "Title and topicId are required" }];
    }

    const topic = topics.find((t) => t.id === newTest.topicId);
    if (!topic) {
      return [404, { error: `Topic with ID ${newTest.topicId} not found` }];
    }

    newTest.id = tests.length > 0 ? Math.max(...tests.map((t) => t.id)) + 1 : 1;
    newTest.questions = newTest.questions || [];
    newTest.difficulty = newTest.difficulty || "medium";

    tests.push(newTest);
    save("tests", tests);

    return [201, newTest];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// PUT /api/tests/:id → updates a test
mock.onPut(/^\/tests\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/tests\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid test ID format" }];
  }

  try {
    const updatedTest = JSON.parse(config.data);
    const index = tests.findIndex((t) => t.id === id);

    if (index === -1) {
      return [404, { error: `Test with ID ${id} not found` }];
    }

    // If topicId is being updated, verify the new topic exists
    if (updatedTest.topicId && updatedTest.topicId !== tests[index].topicId) {
      const topic = topics.find((t) => t.id === updatedTest.topicId);
      if (!topic) {
        return [
          404,
          { error: `Topic with ID ${updatedTest.topicId} not found` },
        ];
      }
    }

    const existingTest = tests[index];

    // Preserve existing questions if not provided
    if (!updatedTest.questions) {
      updatedTest.questions = existingTest.questions || [];
    }

    const difficulty =
      updatedTest.difficulty || existingTest.difficulty || "medium";

    tests[index] = {
      ...existingTest,
      ...updatedTest,
      id,
      difficulty,
    };
    save("tests", tests);
    return [200, tests[index]];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// DELETE /api/tests/:id → deletes a test
mock.onDelete(/^\/tests\/(\d+)$/).reply(async (config) => {
  const id = extractId(config.url, /^\/tests\/(\d+)$/);
  if (!id) {
    return [404, { error: "Invalid test ID format" }];
  }

  const index = tests.findIndex((t) => t.id === id);
  if (index === -1) {
    return [404, { error: `Test with ID ${id} not found` }];
  }

  tests = tests.filter((t) => t.id !== id);
  save("tests", tests);
  return [
    200,
    { success: true, message: `Test with ID ${id} deleted successfully` },
  ];
});

// ============================================
// QUESTIONS ENDPOINTS (for admin)
// ============================================

// POST /api/tests/:id/questions → creates a new question
mock.onPost(/^\/tests\/(\d+)\/questions$/).reply(async (config) => {
  const testId = extractId(config.url, /^\/tests\/(\d+)\/questions$/);
  if (!testId) {
    return [404, { error: "Invalid test ID format" }];
  }

  try {
    const test = tests.find((t) => t.id === testId);
    if (!test) {
      return [404, { error: `Test with ID ${testId} not found` }];
    }

    const newQuestion = JSON.parse(config.data);

    // Validate required fields
    if (
      !newQuestion.text ||
      !newQuestion.options ||
      newQuestion.correctAnswer === undefined
    ) {
      return [400, { error: "Text, options, and correctAnswer are required" }];
    }

    // Ensure questions array exists
    if (!test.questions) {
      test.questions = [];
    }

    // Generate new ID
    newQuestion.id =
      test.questions.length > 0
        ? Math.max(...test.questions.map((q) => q.id)) + 1
        : 1;

    // Default difficulty for questions if not provided
    newQuestion.difficulty = newQuestion.difficulty || "medium";

    test.questions.push(newQuestion);
    save("tests", tests);
    return [201, newQuestion];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// PUT /api/tests/:id/questions/:questionId → updates a question
mock.onPut(/^\/tests\/(\d+)\/questions\/(\d+)$/).reply(async (config) => {
  const match = config.url.match(/^\/tests\/(\d+)\/questions\/(\d+)$/);
  if (!match) {
    return [404, { error: "Invalid URL format" }];
  }

  const testId = parseInt(match[1]);
  const questionId = parseInt(match[2]);

  try {
    const test = tests.find((t) => t.id === testId);
    if (!test) {
      return [404, { error: `Test with ID ${testId} not found` }];
    }

    if (!test.questions) {
      return [404, { error: `Question with ID ${questionId} not found` }];
    }

    const index = test.questions.findIndex((q) => q.id === questionId);
    if (index === -1) {
      return [404, { error: `Question with ID ${questionId} not found` }];
    }

    const updatedQuestion = JSON.parse(config.data);
    const existingQuestion = test.questions[index];

    const difficulty =
      updatedQuestion.difficulty || existingQuestion.difficulty || "medium";

    test.questions[index] = {
      ...existingQuestion,
      ...updatedQuestion,
      id: questionId,
      difficulty,
    };
    save("tests", tests);

    return [200, test.questions[index]];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

// DELETE /api/tests/:id/questions/:questionId → deletes a question
mock.onDelete(/^\/tests\/(\d+)\/questions\/(\d+)$/).reply(async (config) => {
  const match = config.url.match(/^\/tests\/(\d+)\/questions\/(\d+)$/);
  if (!match) {
    return [404, { error: "Invalid URL format" }];
  }

  const testId = parseInt(match[1]);
  const questionId = parseInt(match[2]);

  const test = tests.find((t) => t.id === testId);
  if (!test) {
    return [404, { error: `Test with ID ${testId} not found` }];
  }

  if (!test.questions) {
    return [404, { error: `Question with ID ${questionId} not found` }];
  }

  const initialLength = test.questions.length;
  test.questions = test.questions.filter((q) => q.id !== questionId);
  save("tests", tests);

  if (test.questions.length === initialLength) {
    return [404, { error: `Question with ID ${questionId} not found` }];
  }

  return [
    200,
    {
      success: true,
      message: `Question with ID ${questionId} deleted successfully`,
    },
  ];
});

// ============================================
// RESULTS ENDPOINTS
// ============================================

// GET /api/results → returns all results (optionally filtered by userEmail)
mock.onGet("/results").reply(async (config) => {
  const userEmail = config.params?.userEmail;
  if (userEmail) {
    const userResults = results.filter((r) => r.userEmail === userEmail);
    return [200, userResults];
  }
  return [200, results];
});

// POST /api/results → creates a new result
mock.onPost("/results").reply(async (config) => {
  try {
    const newResult = JSON.parse(config.data);

    // Validate required fields
    if (
      !newResult.userEmail ||
      !newResult.testTitle ||
      newResult.score === undefined
    ) {
      return [400, { error: "userEmail, testTitle, and score are required" }];
    }

    // Generate new ID
    newResult.id =
      results.length > 0 ? Math.max(...results.map((r) => r.id)) + 1 : 1;
    newResult.date = new Date().toISOString();

    results.push(newResult);
    save("results", results);
    return [201, newResult];
  } catch (error) {
    return [400, { error: "Invalid JSON data" }];
  }
});

export default api;
