import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/mockApi";

const DashboardPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectProgress, setSubjectProgress] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, resultsRes, testsRes] = await Promise.all([
          api.get("/subjects"),
          api.get("/results", { params: { userEmail: user.email } }),
          api.get("/tests"),
        ]);
        setSubjects(subjectsRes.data);
        setResults(resultsRes.data);

        // Build a map of subjectId -> topicIds
        const subjectTopicsMap = {};
        for (const subject of subjectsRes.data) {
          try {
            const topicsRes = await api.get(`/subjects/${subject.id}/topics`);
            subjectTopicsMap[subject.id] = topicsRes.data.map(
              (topic) => topic.id
            );
          } catch (error) {
            console.error(
              `Error fetching topics for subject ${subject.id}:`,
              error
            );
          }
        }

        // Load progress from localStorage
        const progressKey = `userProgress_${user.email}`;
        const storedProgress =
          JSON.parse(localStorage.getItem(progressKey)) || {
            subjects: {},
            topics: {},
          };

        // Compute per-subject progress
        const progressBySubject = {};
        subjectsRes.data.forEach((subject) => {
          const topicIds = subjectTopicsMap[subject.id] || [];
          const subjectTests = testsRes.data.filter((test) =>
            topicIds.includes(test.topicId)
          );
          const totalTests = subjectTests.length;

          const storedSubject =
            storedProgress.subjects[subject.id] || { completedTestIds: [] };
          const completedCount = subjectTests.filter((test) =>
            storedSubject.completedTestIds?.includes(test.id)
          ).length;

          const percentage =
            totalTests > 0
              ? Math.round((completedCount / totalTests) * 100)
              : 0;

          let status = "Not started";
          if (completedCount === 0) {
            status = "Not started";
          } else if (completedCount < totalTests) {
            status = "In progress";
          } else if (totalTests > 0) {
            status = "Completed";
          }

          progressBySubject[subject.id] = {
            totalTests,
            completedCount,
            percentage,
            status,
          };
        });

        setSubjectProgress(progressBySubject);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.email]);

  const testsTaken = results.length;
  const averageScore =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(
          1
        )
      : 0;

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split("@")[0]}!
          </h1>
          <p className="text-lg text-gray-600">
            Track your progress and explore available subjects
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Tests Taken Card */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide">
                Tests Taken
              </h2>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold text-indigo-600">{testsTaken}</p>
          </div>

          {/* Average Score Card */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide">
                Average Score
              </h2>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold text-green-600">{averageScore}%</p>
          </div>

          {/* Available Subjects Card */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide">
                Available Subjects
              </h2>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold text-blue-600">
              {subjects.length}
            </p>
          </div>
        </div>

        {/* Subjects Section with progress */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Explore Subjects and Your Progress
          </h2>
          {subjects.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600 text-lg">
                No subjects available yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjects.map((subject) => {
                const progress = subjectProgress[subject.id] || {
                  totalTests: 0,
                  completedCount: 0,
                  percentage: 0,
                  status: "Not started",
                };

                return (
                  <Link
                    key={subject.id}
                    to={`/subjects/${subject.id}`}
                    className="group bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {subject.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {subject.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-indigo-600">
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Status:{" "}
                      <span className="font-semibold">{progress.status}</span>
                      {progress.totalTests > 0 && (
                        <>
                          {" "}
                          • Tests completed: {progress.completedCount} /{" "}
                          {progress.totalTests}
                        </>
                      )}
                    </p>

                    <div className="mt-4 flex items-center text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
