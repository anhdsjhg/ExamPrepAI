import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/mockApi";

const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    topicId: "",
    difficulty: "medium",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, subjectsRes] = await Promise.all([
        api.get("/tests"),
        api.get("/subjects"),
      ]);
      setTests(testsRes.data);

      // Fetch all topics
      const allTopics = [];
      for (const subject of subjectsRes.data) {
        try {
          const topicsRes = await api.get(`/subjects/${subject.id}/topics`);
          allTopics.push(...topicsRes.data);
        } catch (error) {
          console.error(
            `Error fetching topics for subject ${subject.id}:`,
            error
          );
        }
      }
      setTopics(allTopics);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTest(null);
    setFormData({ title: "", topicId: "", difficulty: "medium" });
    setShowForm(true);
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      topicId: test.topicId.toString(),
      difficulty: test.difficulty || "medium",
    });
    setShowForm(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const testData = {
        ...formData,
        topicId: parseInt(formData.topicId),
        questions: editingTest ? editingTest.questions || [] : [],
        difficulty: formData.difficulty || "medium",
      };

      if (editingTest) {
        await api.put(`/tests/${editingTest.id}`, testData);
      } else {
        await api.post("/tests", testData);
      }

      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Error saving test:", error);
      alert("Error saving test");
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await api.delete(`/tests/${testId}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting test:", error);
        alert("Error deleting test");
      }
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.title : "Unknown Topic";
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

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-gray-900">
                Manage Tests
              </h1>
              <p className="text-lg text-gray-600">
                Create, edit, and manage exam tests
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Create Test
            </button>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-gray-200">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                {editingTest ? "Edit Test" : "Create Test"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Topic
                  </label>
                  <select
                    value={formData.topicId}
                    onChange={(e) =>
                      setFormData({ ...formData, topicId: e.target.value })
                    }
                    required
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    required
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingTest ? "Update Test" : "Create Test"}
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

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Tests List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Title
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Topic
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Questions
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-8 py-12 text-center text-gray-600"
                    >
                      No tests found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <tr
                      key={test.id}
                      className="hover:bg-indigo-50 transition-colors border-b border-gray-100"
                    >
                      <td className="px-8 py-5 text-base font-semibold text-gray-900">
                        {test.title}
                      </td>
                      <td className="px-8 py-5 text-base text-gray-600">
                        {getTopicName(test.topicId)}
                      </td>
                      <td className="px-8 py-5 text-base text-gray-600">
                        {test.questions?.length || 0}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/admin/tests/${test.id}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg text-sm"
                          >
                            Manage Questions
                          </Link>
                          <button
                            onClick={() => handleEdit(test)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTests;
