import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/mockApi";

const AdminTestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  });
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: "",
    difficulty: "medium",
    count: 3,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetchTest();
  }, [id]);

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

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    });
    setShowForm(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all options are filled
    if (formData.options.some((opt) => !opt.trim())) {
      alert("All options must be filled");
      return;
    }

    try {
      if (editingQuestion) {
        await api.put(`/tests/${id}/questions/${editingQuestion.id}`, formData);
      } else {
        await api.post(`/tests/${id}/questions`, formData);
      }
      setShowForm(false);
      fetchTest();
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Error saving question");
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/tests/${id}/questions/${questionId}`);
        fetchTest();
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Error deleting question");
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // Call real backend AI service (Node/Express) to generate questions with OpenAI.
  const handleGenerateQuestions = async () => {
    setAiError("");

    if (!aiForm.topic.trim()) {
      setAiError("Please enter a topic or concept.");
      return;
    }

    const count = Math.max(1, Math.min(10, Number(aiForm.count) || 1));

    setAiLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: aiForm.topic.trim(),
            difficulty: aiForm.difficulty,
            count,
            role: user?.role,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate questions.");
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("AI did not return a valid questions list.");
      }

      setGeneratedQuestions(
        data.questions.map((q, index) => ({
          id: index + 1,
          text: q.text || "",
          options:
            Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ["", "", "", ""],
          correctAnswer:
            typeof q.correctAnswer === "number" &&
            q.correctAnswer >= 0 &&
            q.correctAnswer <= 3
              ? q.correctAnswer
              : 0,
          explanation: q.explanation || "",
        }))
      );
    } catch (error) {
      console.error("AI generation error:", error);
      setAiError(
        error.message ||
          "Something went wrong while generating questions. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleGeneratedQuestionChange = (index, field, value) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? field === "text" || field === "explanation"
            ? { ...q, [field]: value }
            : q
          : q
      )
    );
  };

  const handleGeneratedOptionChange = (qIndex, optIndex, value) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  };

  const handleGeneratedCorrectChange = (qIndex, value) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer: value } : q))
    );
  };

  const handleSaveGenerated = async () => {
    try {
      for (const q of generatedQuestions) {
        await api.post(`/tests/${id}/questions`, {
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: aiForm.difficulty,
        });
      }
      setShowAiGenerator(false);
      setGeneratedQuestions([]);
      fetchTest();
    } catch (error) {
      console.error("Error saving generated questions:", error);
      alert("Error saving generated questions");
    }
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
          <p className="text-red-600 mb-4">Test not found.</p>
          <Link
            to="/admin/tests"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin/tests"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          ← Back to Tests
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h1 className="text-3xl font-bold mb-3 text-gray-800">
            {test.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {test.questions?.length || 0} questions
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Questions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setAiError("");
                setGeneratedQuestions([]);
                setShowAiGenerator(true);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              ✨ Generate Questions (AI)
            </button>
            <button
              onClick={handleCreate}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              + Add Question
            </button>
          </div>
        </div>

        {/* AI Question Generator Modal */}
        {showAiGenerator && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                AI Question Generator
              </h3>
              <p className="text-gray-600 mb-6">
                This tool uses an AI model to create draft questions for this test.
                You can edit every question before saving it for students.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Topic or concept
                  </label>
                  <input
                    type="text"
                    value={aiForm.topic}
                    onChange={(e) =>
                      setAiForm({ ...aiForm, topic: e.target.value })
                    }
                    placeholder="e.g. Linear equations, Forces, Geometry basics"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) =>
                      setAiForm({ ...aiForm, difficulty: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Number of questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={aiForm.count}
                    onChange={(e) =>
                      setAiForm({ ...aiForm, count: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={aiLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? "Generating questions…" : "Generate draft questions"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAiGenerator(false);
                    setGeneratedQuestions([]);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>

              {aiError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {aiError}
                </div>
              )}

              {generatedQuestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xl font-bold mb-4 text-gray-900">
                    Generated questions (edit before saving)
                  </h4>
                  <div className="space-y-4">
                    {generatedQuestions.map((q, index) => (
                      <div
                        key={index}
                        className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-50"
                      >
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          Question {index + 1}
                        </p>
                        <textarea
                          value={q.text}
                          onChange={(e) =>
                            handleGeneratedQuestionChange(
                              index,
                              "text",
                              e.target.value
                            )
                          }
                          rows="2"
                          className="w-full mb-3 px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="space-y-2 mb-3">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-3"
                            >
                              <input
                                type="radio"
                                name={`generated-correct-${index}`}
                                checked={q.correctAnswer === optIndex}
                                onChange={() =>
                                  handleGeneratedCorrectChange(index, optIndex)
                                }
                                className="w-4 h-4 text-indigo-600"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleGeneratedOptionChange(
                                    index,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-4 py-2 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                        <textarea
                          value={q.explanation}
                          onChange={(e) =>
                            handleGeneratedQuestionChange(
                              index,
                              "explanation",
                              e.target.value
                            )
                          }
                          rows="2"
                          className="w-full px-4 py-2 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Explanation for this question..."
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={handleSaveGenerated}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Save all generated questions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-3xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-3xl font-bold mb-8 text-gray-900">
                {editingQuestion ? "Edit Question" : "Add Question"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Question Text
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    required
                    rows="4"
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Options (Select the correct answer)
                  </label>
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="mb-4 flex items-center space-x-4"
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() =>
                          setFormData({ ...formData, correctAnswer: index })
                        }
                        className="w-5 h-5 text-indigo-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        required
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Explanation (shown to students after they finish the test)
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) =>
                      setFormData({ ...formData, explanation: e.target.value })
                    }
                    rows="3"
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Explain why this answer is correct in a simple way..."
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {test.questions?.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600 text-center">
                No questions found. Add one to get started.
              </p>
            </div>
          ) : (
            test.questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      Question {index + 1}: {question.text}
                    </h3>
                    <ul className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <li
                          key={optIndex}
                          className={`text-sm p-2 rounded-lg ${
                            optIndex === question.correctAnswer
                              ? "bg-green-50 text-green-700 font-semibold border-2 border-green-200"
                              : "text-gray-600 bg-gray-50"
                          }`}
                        >
                          {optIndex === question.correctAnswer && "✓ "}
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-3 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTestDetails;
