import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/mockApi';

const AdminSubjectDetails = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [subjectRes, topicsRes] = await Promise.all([
        api.get(`/subjects/${id}`),
        api.get(`/subjects/${id}/topics`)
      ]);
      setSubject(subjectRes.data);
      setTopics(topicsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTopic(null);
    setFormData({ title: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({ title: topic.title, description: topic.description });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        await api.put(`/topics/${editingTopic.id}`, {
          ...formData,
          subjectId: parseInt(id)
        });
      } else {
        await api.post('/topics', {
          ...formData,
          subjectId: parseInt(id)
        });
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Error saving topic');
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await api.delete(`/topics/${topicId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting topic:', error);
        alert('Error deleting topic');
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

  if (!subject) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600 mb-4">Subject not found.</p>
          <Link to="/admin/subjects" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Subjects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/admin/subjects" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium">
          ← Back to Subjects
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h1 className="text-3xl font-bold mb-3 text-gray-800">{subject.title}</h1>
          <p className="text-gray-600 text-lg">{subject.description}</p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Topics</h2>
          <button
            onClick={handleCreate}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            + Create Topic
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-gray-200">
              <h3 className="text-3xl font-bold mb-8 text-gray-900">
                {editingTopic ? 'Edit Topic' : 'Create Topic'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
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
            <h3 className="text-xl font-bold text-gray-900">Topics List</h3>
          </div>
          <table className="w-full">
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
              {topics.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-12 text-center text-gray-600">
                    No topics found. Create one to get started.
                  </td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-indigo-50 transition-colors border-b border-gray-100">
                    <td className="px-8 py-5 text-base font-semibold text-gray-900">
                      {topic.title}
                    </td>
                    <td className="px-8 py-5 text-base text-gray-600">
                      {topic.description}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(topic)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
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
  );
};

export default AdminSubjectDetails;

