import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/mockApi";

const TestPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${id}`);
        setTest(response.data);
      } catch (error) {
        console.error("Error fetching test:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {
    // Calculate score
    let correct = 0;
    test.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / test.questions.length) * 100);

    // Save result (with extra optional fields for analysis and progress)
    try {
      await api.post("/results", {
        userEmail: user.email,
        testTitle: test.title,
        score: calculatedScore,
        testId: test.id,
        topicId: test.topicId,
        totalQuestions: test.questions.length,
        correctAnswers: correct,
      });
    } catch (error) {
      console.error("Error saving result:", error);
    }

    // Navigate to detailed review / analysis page
    navigate(`/tests/${id}/review`, {
      state: {
        test,
        answers,
        score: calculatedScore,
        correctAnswers: correct,
        totalQuestions: test.questions.length,
      },
    });
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600">Test not found.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const hasAnswer = answers[currentQuestion.id] !== undefined;

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-3xl w-full border-2 border-gray-200">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">
                  {currentQuestionIndex + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </p>
                <p className="text-xs text-gray-500">{test.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-600">
                {Math.round(
                  ((currentQuestionIndex + 1) / test.questions.length) * 100
                )}
                %
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / test.questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 leading-tight">
            {currentQuestion.text}
          </h2>
          <p className="text-sm text-gray-500 mt-2">Select your answer below</p>
        </div>

        {/* Options as Large Clickable Buttons */}
        <div className="space-y-4 mb-10">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestion.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${
                  isSelected
                    ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-lg scale-[1.02]"
                    : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50 shadow-md"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm flex-shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span
                    className={`text-lg font-semibold ${
                      isSelected ? "text-indigo-900" : "text-gray-800"
                    }`}
                  >
                    {option}
                  </span>
                  {isSelected && (
                    <div className="ml-auto">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600 disabled:hover:shadow-md"
          >
            ← Previous
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleFinish}
              disabled={!hasAnswer}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              ✓ Finish Test
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
