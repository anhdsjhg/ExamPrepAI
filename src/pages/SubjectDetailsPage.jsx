import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/mockApi";

const SubjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("none");
  const [userResults, setUserResults] = useState([]);

  // Helper: build quick lookup for latest result per test
  const latestResultByTestId = userResults.reduce((map, result) => {
    if (!result.testId) {
      return map;
    }
    const existing = map[result.testId];
    if (!existing || new Date(result.date) > new Date(existing.date)) {
      map[result.testId] = result;
    }
    return map;
  }, {});

  // Read completion info from localStorage progress
  const progressKey = user ? `userProgress_${user.email}` : null;
  const storedProgress = progressKey
    ? JSON.parse(localStorage.getItem(progressKey) || '{"subjects":{},"topics":{}}')
    : { subjects: {}, topics: {} };

  // Filter and sort tests according to UI controls
  const filteredTests = tests
    .map((test) => {
      const completed =
        storedProgress.subjects[subject?.id]?.completedTestIds?.includes(
          test.id
        ) || false;
      const latestResult = latestResultByTestId[test.id];

      return {
        ...test,
        completed,
        latestScore: latestResult ? latestResult.score : null,
        latestDate: latestResult ? latestResult.date : null,
      };
    })
    .filter((test) => {
      // Topic filter
      if (selectedTopic !== "all" && test.topic !== selectedTopic) {
        return false;
      }
      // Difficulty filter
      if (
        selectedDifficulty !== "all" &&
        test.difficulty !== selectedDifficulty
      ) {
        return false;
      }
      // Completion status filter
      if (selectedStatus === "completed" && !test.completed) {
        return false;
      }
      if (selectedStatus === "notCompleted" && test.completed) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "difficulty") {
        const order = { easy: 1, medium: 2, hard: 3 };
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      }
      if (sortBy === "score") {
        const scoreA = a.latestScore ?? -1;
        const scoreB = b.latestScore ?? -1;
        return scoreB - scoreA; // highest score first
      }
      if (sortBy === "date") {
        if (!a.latestDate && !b.latestDate) return 0;
        if (!a.latestDate) return 1;
        if (!b.latestDate) return -1;
        return new Date(b.latestDate) - new Date(a.latestDate); // newest first
      }
      return 0;
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем предмет и его темы
        const [subjectRes, topicsRes, resultsRes] = await Promise.all([
          api.get(`/subjects/${id}`),
          api.get(`/subjects/${id}/topics`),
          api.get("/results", {
            params: { userEmail: user.email },
          }),
        ]);
        setSubject(subjectRes.data);
        setTopics(topicsRes.data);
        setUserResults(resultsRes.data);

        // Загружаем все тесты для всех тем и добавляем поля topic и difficulty
        const allTests = [];
        for (const topic of topicsRes.data) {
          try {
            const testsRes = await api.get(`/topics/${topic.id}/tests`);
            const topicTests = testsRes.data.map((test) => ({
              ...test,
              topic: topic.title,
              // Default difficulty is 'medium' if not provided
              difficulty: test.difficulty || "medium",
            }));
            allTests.push(...topicTests);
          } catch (error) {
            console.error(`Error fetching tests for topic ${topic.id}:`, error);
          }
        }
        setTests(allTests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user.email]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">Subject not found.</p>
        <Link
          to="/subjects"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          ← Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <Link
          to="/subjects"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8 font-semibold transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Subjects
        </Link>

        {/* Subject Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-10 rounded-2xl shadow-xl mb-10 text-white">
          <h1 className="text-4xl font-bold mb-4">{subject.title}</h1>
          <p className="text-xl text-indigo-100 leading-relaxed">{subject.description}</p>
        </div>

        {/* Topics */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Topics</h2>
          {topics.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
              <p className="text-gray-600 text-center">No topics available for this subject.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{topic.title}</h3>
                  <p className="text-gray-600">{topic.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.title}>
                {topic.title}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="notCompleted">Not completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="none">Sort: Default</option>
            <option value="difficulty">Sort by difficulty</option>
            <option value="score">Sort by score</option>
            <option value="date">Sort by date</option>
          </select>
        </div>

        {/* Available Tests */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Available Tests</h2>
          {filteredTests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
              <p className="text-gray-600 text-center">
                No tests match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{test.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {test.questions?.length || 0} questions
                    </p>
                    <p className="text-gray-500 text-sm">
                      Topic: {test.topic}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Difficulty: {test.difficulty}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Status:{" "}
                      <span className="font-semibold">
                        {test.completed ? "Completed" : "Not completed"}
                      </span>
                      {test.latestScore != null && (
                        <> • Last score: {test.latestScore}%</>
                      )}
                    </p>
                  </div>
                  <Link
                    to={`/tests/${test.id}`}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                  >
                    Start Test
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailsPage;
