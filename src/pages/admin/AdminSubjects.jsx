import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/mockApi";

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setFormData({ title: "", description: "" });
    setShowForm(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({ title: subject.title, description: subject.description });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, formData);
      } else {
        await api.post("/subjects", formData);
      }
      setShowForm(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Error saving subject");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject:", error);
        alert("Error deleting subject");
      }
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

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-gray-900">
                Manage Subjects
              </h1>
              <p className="text-lg text-gray-600">
                Create, edit, and manage exam subjects
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Create Subject
            </button>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-gray-200">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                {editingSubject ? "Edit Subject" : "Create Subject"}
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
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows="4"
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingSubject ? "Update Subject" : "Create Subject"}
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
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          <div className="px-6 py-4 bg-indigo-50 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Subjects List</h2>
          </div>

          {/* SCROLL CONTAINER */}
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Title
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Description
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-8 py-12 text-center text-gray-600"
                    >
                      No subjects found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="hover:bg-indigo-50 transition-colors border-b border-gray-100"
                    >
                      <td className="px-8 py-5 text-base font-semibold text-gray-900">
                        {subject.title}
                      </td>
                      <td className="px-8 py-5 text-base text-gray-600">
                        {subject.description}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/admin/subjects/${subject.id}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg text-sm"
                          >
                            Manage Topics
                          </Link>
                          <button
                            onClick={() => handleEdit(subject)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
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

export default AdminSubjects;
