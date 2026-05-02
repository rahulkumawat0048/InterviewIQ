import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../App";
import { FaArrowLeft } from "react-icons/fa";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/get-interview",
          { withCredentials: true }
        );
        setInterviews(result.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getMyInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Heading */}
        <div className="mb-8 flex items-start gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Interview History
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track your past interviews and performance reports
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500">Loading interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500">
              No interviews found. Start your first interview.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((item, index) => (
              <div
                onClick={() => navigate(`/report/${item._id}`)}
                key={index}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.role}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {item.experience}{" "}
                      <span className="font-semibold text-black">
                        + {item.mode}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {item.finalScore || 0}/10
                      </p>
                      <p className="text-xs text-gray-400">Overall Score</p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;