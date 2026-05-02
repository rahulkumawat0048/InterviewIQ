import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

const NavBar = () => {

  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='bg-[#f6f7f9] flex justify-center px-4 pt-5'>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl backdrop-blur-xl bg-white/80 border border-gray-200 shadow-md rounded-2xl px-6 py-3 flex justify-between items-center relative"
      >

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-black text-white p-2 rounded-lg group-hover:scale-105 transition">
            <BsRobot size={16} />
          </div>
          <h1 className="font-medium text-sm md:text-base tracking-tight">
            InterviewIQ.AI
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 relative">

          {/* CREDITS */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) return setShowAuth(true);
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm transition"
            >
              <BsCoin size={16} />
              {userData?.credits || 0}
            </button>

            <AnimatePresence>
              {showCreditPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-56 bg-white shadow-xl border rounded-xl p-4 z-50"
                >
                  <p className="text-xs text-gray-600 mb-3">
                    Need more credits?
                  </p>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full bg-black text-white py-2 rounded-lg text-xs"
                  >
                    Buy Credits
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* USER */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) return setShowAuth(true);
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold"
            >
              {userData
                ? userData?.name.slice(0, 1).toUpperCase()
                : <FaUserAstronaut size={14} />}
            </button>

            <AnimatePresence>
              {showUserPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 mt-3 w-44 bg-white shadow-xl border rounded-xl p-4 z-50"
                >
                  <p className="text-sm text-blue-500 font-medium mb-2">
                    {userData?.name}
                  </p>

                  <button
                    onClick={() => navigate("/history")}
                    className="w-full text-left text-xs py-2 text-gray-600 hover:text-black"
                  >
                    Interview History
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-xs py-2 flex items-center gap-2 text-red-500"
                  >
                    <HiOutlineLogout size={14} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default NavBar;