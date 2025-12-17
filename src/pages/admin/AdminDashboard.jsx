import { useState, useEffect } from 'react';
import api from '../../api/mockApi';

const AdminDashboard = () => {
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [testsCount, setTestsCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [mostDifficultTopics, setMostDifficultTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, testsRes, topicsResBySubject, resultsRes] =
          await Promise.all([
            api.get('/subjects'),
            api.get('/tests'),
            // Fetch topics for each subject to build a full topic list
            (async () => {
              const allTopics = [];
              const subjects = await api.get('/subjects');
              for (const subject of subjects.data) {
                try {
                  const res = await api.get(`/subjects/${subject.id}/topics`);
                  allTopics.push(...res.data);
                } catch (error) {
                  console.error(
                    `Error fetching topics for subject ${subject.id}:`,
                    error
                  );
                }
              }
              return { data: allTopics };
            })(),
            api.get('/results'),
          ]);

        setSubjectsCount(subjectsRes.data.length);
        setTestsCount(testsRes.data.length);

        // Average score across platform
        const allResults = resultsRes.data;
        if (allResults.length > 0) {
          const avg =
            allResults.reduce((sum, r) => sum + (r.score || 0), 0) /
            allResults.length;
          setAverageScore(Math.round(avg));
        } else {
          setAverageScore(0);
        }

        // Most difficult topics (lowest average score)
        const topics = topicsResBySubject.data;
        const tests = testsRes.data;

        const scoresByTopic = {};
        allResults.forEach((result) => {
          if (!result.testId) return;
          const test = tests.find((t) => t.id === result.testId);
          if (!test) return;
          const topicId = test.topicId;
          if (!scoresByTopic[topicId]) {
            scoresByTopic[topicId] = { totalScore: 0, count: 0 };
          }
          scoresByTopic[topicId].totalScore += result.score || 0;
          scoresByTopic[topicId].count += 1;
        });

        const topicAverages = Object.entries(scoresByTopic)
          .map(([topicId, info]) => {
            const topic = topics.find((t) => t.id === parseInt(topicId, 10));
            if (!topic || info.count === 0) return null;
            return {
              id: topic.id,
              title: topic.title,
              averageScore: Math.round(info.totalScore / info.count),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.averageScore - b.averageScore)
          .slice(0, 3);

        setMostDifficultTopics(topicAverages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">
            Overview of your exam preparation system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Subjects Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Total Subjects
                </p>
                <p className="text-6xl font-bold text-indigo-600">{subjectsCount}</p>
              </div>
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-indigo-600"
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
          </div>

          {/* Total Tests Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Total Tests
                </p>
                <p className="text-6xl font-bold text-indigo-600">{testsCount}</p>
              </div>
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-indigo-600"
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
          </div>
          {/* Average Score Across Platform */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Average Score (all users)
                </p>
                <p className="text-6xl font-bold text-green-600">
                  {averageScore}%
                </p>
              </div>
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
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
          </div>
        </div>

        {/* Most Difficult Topics */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Most Difficult Topics
          </h2>
          {mostDifficultTopics.length === 0 ? (
            <p className="text-gray-600">
              Not enough data yet to determine difficult topics.
            </p>
          ) : (
            <ul className="space-y-3">
              {mostDifficultTopics.map((topic) => (
                <li
                  key={topic.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <span className="font-semibold text-gray-800">
                    {topic.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    Average score:{" "}
                    <span className="font-semibold">{topic.averageScore}%</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

