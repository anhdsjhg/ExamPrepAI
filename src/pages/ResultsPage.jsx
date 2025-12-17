import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/mockApi";

const ResultsPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/results", {
          params: { userEmail: user.email },
        });
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user.email]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Calculate stats
  const testsTaken = results.length;
  const averageScore =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(
          1
        )
      : 0;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            My Test Results
          </h1>
          <p className="text-lg text-gray-600">
            Track your progress and view your test performance
          </p>
        </div>

        {/* Stats Cards */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Tests Taken Card */}
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Tests Taken
                  </p>
                  <p className="text-5xl font-bold text-indigo-600">
                    {testsTaken}
                  </p>
                </div>
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-indigo-600"
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

            {/* Average Score Card */}
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Average Score
                  </p>
                  <p className="text-5xl font-bold text-green-600">
                    {averageScore}%
                  </p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
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
        )}

        {/* Results Table or Empty State */}
        {results.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-md border-2 border-gray-200 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Results Yet
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                You haven't taken any tests yet. Start taking tests to see your
                results here!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Test History</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Test Title
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Score
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Date Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr
                    key={result.id}
                    className="hover:bg-indigo-50 transition-colors border-b border-gray-100"
                  >
                    <td className="px-8 py-5 text-base font-semibold text-gray-900">
                      {result.testTitle}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-base font-bold ${
                          result.score >= 70
                            ? "bg-green-100 text-green-700 border-2 border-green-200"
                            : result.score >= 50
                            ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-200"
                            : "bg-red-100 text-red-700 border-2 border-red-200"
                        }`}
                      >
                        {result.score}%
                      </span>
                    </td>
                    <td className="px-8 py-5 text-base text-gray-600">
                      {formatDate(result.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
