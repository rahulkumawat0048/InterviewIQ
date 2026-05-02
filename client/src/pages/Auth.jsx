import React, { use } from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios"
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

export default function Auth({isModel=false}) {
  const dispatch=useDispatch()

  const handleGoogleAuth= async ()=>{
    try {
      const response =await signInWithPopup(auth,provider)
      let user=response.user
      let name=user.displayName
      let email=user.email

      const result= await axios.post(ServerUrl+"/api/auth/google",{name,email},{withCredentials:true})
      dispatch(setUserData(result.data))

    } catch (error) {
      console.log(error)
      dispatch(setUserData(null))
    }
  }



  return (
    <div className={`relative w-full ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20 overflow-hidden"} `}>
      {/* Only background glow element added */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-green-300 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className={`relative w-full ${isModel ? "max-w-md p-8 rounded-xl":"max-w-lg p-12 rounded-[32px"}   bg-white shadow-2xl border border-gray-200`}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg">InterviewIQ.AI</h2>
        </div>

        <h1 className="text-lg lg:text-xl flex flex-col items-center  md:text-[22px] font-semibold text-center leading-snug mb-4">
          Continue with
          <span className="bg-green-100 text-xl md:text-[26px] text-green-600 px-6 py-2 rounded-full inline-flex mt-2 items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress, and
          unlock detailed performance insights.
        </p>

        <motion.button
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.98 }}
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          Continue with Google
        </motion.button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
