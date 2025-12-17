import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/mockApi"; // замените на ваш реальный API, если есть

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    registeredAt: "", // можно подгружать с API
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Запрашиваем результаты пользователя
        const response = await api.get("/results", {
          params: { userEmail: user.email },
        });
        const results = response.data;

        const testsCompleted = results.length;
        const averageScore =
          testsCompleted > 0
            ? Math.round(
                results.reduce((sum, r) => sum + r.score, 0) / testsCompleted
              )
            : 0;

        setStats({
          testsCompleted,
          averageScore,
          registeredAt: user.registeredAt || "N/A", // если есть поле в user
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.email, user.registeredAt]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  const avatarLetter = user.email.charAt(0).toUpperCase();

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-10 text-gray-900">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center text-3xl font-bold">
              {avatarLetter}
            </div>
            <div>
              <p className="text-white text-xl font-semibold">{user.email}</p>
              <span className="inline-block mt-2 px-4 py-1 bg-indigo-500 text-white text-sm rounded-full uppercase font-semibold">
                {user.role}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Account Info */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Account Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Email</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Role</p>
                  <p className="text-lg capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Registered
                  </p>
                  <p className="text-lg">{stats.registeredAt}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-6 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.testsCompleted}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Tests completed</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-8 flex justify-end">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
