import React, { useState } from "react";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import { useDispatch, useSelector } from "react-redux";

import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AuthModel from "../components/AuthModel";
import hrImg from "../assets/HR.png";
import evalImg from "../assets/ai-ans.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from "../components/Footer";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col relative overflow-hidden">
      {/* Glow FIX */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 2 }}
        className="absolute top-[-50px] left-[-50px] w-[220px] h-[220px] md:w-[420px] md:h-[420px] bg-green-300 rounded-full blur-[120px]"
      />

      <NavBar />

      <div className="flex-1 px-4 md:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
            >
              <HiSparkles size={16} className="text-green-600" />
              AI Powered Smart Interview Platform
            </motion.div>
          </div>

          {/* Heading */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-semibold leading-tight max-w-3xl mx-auto"
            >
              Practice Interviews with <br />
              <span className="inline-block mt-3 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm">
                AI Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 mt-6 max-w-xl mx-auto text-base"
            >
              Role-based mock interviews with smart follow-ups, adaptive
              difficulty and real-time performance evaluation.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/interview");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-black text-white px-8 py-2.5 rounded-full shadow"
              >
                Start Interview
              </motion.button>

              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/history");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="border border-gray-300 px-8 py-2.5 rounded-full hover:bg-gray-100"
              >
                View History
              </motion.button>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-24">
            {[
              {
                icon: <BsRobot size={24} />,
                step: "STEP 1",
                title: "Role & Experience Selection",
                desc: "AI adjusts difficulty based on selected job role.",
              },
              {
                icon: <BsMic size={24} />,
                step: "STEP 2",
                title: "Smart Voice Interview",
                desc: "Dynamic follow-up questions based on your answers.",
              },
              {
                icon: <BsClock size={24} />,
                step: "STEP 3",
                title: "Timer Based Simulation",
                desc: "Real interview pressure with time tracking.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 60,
                  rotate: index === 0 ? -3 : index === 1 ? 2 : -2,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotate: index === 0 ? -3 : index === 1 ? 2 : -2,
                }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.06 }}
                className="relative hover:border-green-600 bg-white rounded-3xl border p-8 w-72 shadow-md hover:shadow-2xl transition"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white border-2 border-green-500 text-green-600 w-14 h-14 rounded-xl flex items-center justify-center shadow">
                  {item.icon}
                </div>
                <div className="pt-8 text-center">
                  <div className="text-xs text-green-600 font-semibold mb-2 tracking-wider">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2 text-base">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features */}
          <div className="mb-28">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-semibold text-center mb-14"
            >
              Advanced AI <span className="text-green-600">Capabilities</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  image: evalImg,
                  icon: <BsBarChart size={20} />,
                  title: "AI Answer Evaluation",
                  desc: "Scores communication, technical accuracy and confidence.",
                },
                {
                  image: resumeImg,
                  icon: <BsFileEarmarkText size={20} />,
                  title: "Resume Based Interview",
                  desc: "Project-specific questions based on uploaded resume.",
                },
                {
                  image: pdfImg,
                  icon: <BsFileEarmarkText size={20} />,
                  title: "Downloadable PDF Report",
                  desc: "Detailed strengths, weakness and improvement insights.",
                },
                {
                  image: analyticsImg,
                  icon: <BsBarChart size={20} />,
                  title: "History & Analytics",
                  desc: "Track progress with performance graps and topic analysis.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-1/2 flex justify-center">
                      <img src={item.image} className="max-h-48" />
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="bg-green-50 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold mb-2 text-lg">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Modes */}
          <div className="mb-28">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-semibold text-center mb-14"
            >
              Multiple Interview <span className="text-green-600">Modes</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  image: hrImg,
                  title: "HR Interviews Mode",
                  desc: "Behaviour and communication based evaluation.",
                },
                {
                  image: techImg,
                  title: "Technical Mode",
                  desc: "Deep technical questioning based on selected role.",
                },
                {
                  image: confidenceImg,
                  title: "Confidence Detection",
                  desc: "Basic tone and voice analysis insights.",
                },
                {
                  image: creditImg,
                  title: "Credits System",
                  desc: "Unlock premium interview sessions easily.",
                },
              ].map((mode, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {mode.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{mode.desc}</p>
                    </div>
                    <img src={mode.image} className="w-20 h-20" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  );
};

export default Home;
