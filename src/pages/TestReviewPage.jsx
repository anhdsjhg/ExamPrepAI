import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/mockApi";

const TestReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const passedData = location.state;
  const [test, setTest] = useState(passedData?.test || null);
  const [answers, setAnswers] = useState(passedData?.answers || {});
  const [score, setScore] = useState(passedData?.score || null);
  const [summary, setSummary] = useState({
    correctAnswers: passedData?.correctAnswers || 0,
    totalQuestions: passedData?.totalQuestions || 0,
  });
  const [topicName, setTopicName] = useState("");
  const [loading, setLoading] = useState(!passedData);

  // If user somehow opens this page directly, try to recover minimal data
  useEffect(() => {
    const fetchDataIfNeeded = async () => {
      if (passedData) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/tests/${id}`);
        const fetchedTest = response.data;
        setTest(fetchedTest);
        setSummary({
          correctAnswers: 0,
          totalQuestions: fetchedTest.questions?.length || 0,
        });
      } catch (error) {
        console.error("Error loading test for review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataIfNeeded();
  }, [id, passedData]);

  // Load topic name and update progress in localStorage
  useEffect(() => {
    const updateMetaAndProgress = async () => {
      if (!test || !user?.email) return;

      try {
        const topicRes = await api.get(`/topics/${test.topicId}`);
        const topic = topicRes.data;
        setTopicName(topic.title);

        const progressKey = `userProgress_${user.email}`;
        const stored = JSON.parse(localStorage.getItem(progressKey)) || {
          subjects: {},
          topics: {},
        };

        // Mark topic progress
        const topicProgress = stored.topics[topic.id] || {
          completedTestIds: [],
        };
        if (!topicProgress.completedTestIds.includes(test.id)) {
          topicProgress.completedTestIds.push(test.id);
        }
        stored.topics[topic.id] = topicProgress;

        // Mark subject progress
        const subjectProgress = stored.subjects[topic.subjectId] || {
          completedTestIds: [],
        };
        if (!subjectProgress.completedTestIds.includes(test.id)) {
          subjectProgress.completedTestIds.push(test.id);
        }
        stored.subjects[topic.subjectId] = subjectProgress;

        localStorage.setItem(progressKey, JSON.stringify(stored));
      } catch (error) {
        console.error("Error updating topic / progress:", error);
      }
    };

    updateMetaAndProgress();
  }, [test, user]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Preparing your analysis...</div>
      </div>
    );
  }

  if (!test || score === null) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-200 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            Analysis is available right after you complete a test.
          </h1>
          <p className="text-gray-600 mb-6">
            Please finish a test first, then you&apos;ll see a detailed review
            of your answers here.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { correctAnswers, totalQuestions } = summary;
  const weakTopicMessage =
    correctAnswers < totalQuestions ? topicName || "this topic" : null;

  const scoreColor =
    score >= 85
      ? "text-green-600"
      : score >= 60
      ? "text-yellow-600"
      : "text-red-600";
  const scoreBg =
    score >= 85 ? "bg-green-100" : score >= 60 ? "bg-yellow-100" : "bg-red-100";

  let recommendation = "";
  if (score < 60) {
    recommendation =
      "We recommend trying an easier or medium-level test on this topic to build your confidence.";
  } else if (score > 85) {
    recommendation =
      "You did very well! You can try a harder test or explore more advanced topics.";
  } else {
    recommendation =
      "Good work! Review the explanations below and then try another test on this topic.";
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Summary card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test Review: {test.title}
              </h1>
              {topicName && (
                <p className="text-sm text-gray-600 mb-1">
                  Topic: <span className="font-semibold">{topicName}</span>
                </p>
              )}
              <p className="text-gray-600">
                You answered{" "}
                <span className="font-semibold text-indigo-600">
                  {correctAnswers}
                </span>{" "}
                out of{" "}
                <span className="font-semibold text-indigo-600">
                  {totalQuestions}
                </span>{" "}
                questions correctly.
              </p>
            </div>
            <div className="text-center">
              <div
                className={`inline-block px-8 py-4 rounded-2xl ${scoreBg} mb-2`}
              >
                <p className={`text-5xl font-bold ${scoreColor}`}>{score}%</p>
              </div>
              <p className="text-sm text-gray-600">
                Overall performance in this test
              </p>
            </div>
          </div>

          {/* Weak topics and recommendations */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-indigo-800 mb-1 uppercase tracking-wide">
                Key Feedback
              </h2>
              <p className="text-sm text-indigo-900">{recommendation}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-1 uppercase tracking-wide">
                Weak Topics
              </h2>
              {weakTopicMessage ? (
                <p className="text-sm text-gray-700">
                  You made mistakes in{" "}
                  <span className="font-semibold">{weakTopicMessage}</span>.
                  Revisit the theory and try another test on this area.
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  Great job! You answered all questions correctly for this
                  topic.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Questions review */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Question-by-question analysis
          </h2>
          <div className="space-y-6">
            {test.questions.map((question, index) => {
              const userAnswerIndex = answers[question.id];
              const isCorrect = userAnswerIndex === question.correctAnswer;

              return (
                <div
                  key={question.id}
                  className={`rounded-2xl border-2 p-5 ${
                    isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Question {index + 1}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {question.text}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Your answer:
                    </p>
                    {userAnswerIndex === undefined ? (
                      <p className="text-sm text-gray-600 italic">
                        You did not select an answer for this question.
                      </p>
                    ) : (
                      <p
                        className={`inline-block px-3 py-1 rounded-lg text-sm ${
                          isCorrect
                            ? "bg-green-200 text-green-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {question.options[userAnswerIndex]}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Correct answer:
                    </p>
                    <p className="inline-block px-3 py-1 rounded-lg text-sm bg-green-200 text-green-900">
                      {question.options[question.correctAnswer]}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-gray-700">
                      {question.explanation ||
                        "The correct answer matches the concept explained in your study materials."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/results")}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            View All Results
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-gray-600 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestReviewPage;
