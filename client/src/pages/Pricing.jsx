import React, { useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaChartLine, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
      icon: <FaChartLine className="text-emerald-500" />,
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
      icon: <FaRobot className="text-emerald-500" />,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.98 },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom * 0.1, duration: 0.3 },
    }),
  };

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);
      
      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;
      
      // Create order
      const orderResponse = await axios.post(ServerUrl + "/api/payment/order", {
        planId: plan.id,
        amount: amount,
        credits: plan.credits
      }, { withCredentials: true });
      
      const order = orderResponse.data;
      
      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount, // Amount is already in paise from backend
        currency: order.currency || "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              ServerUrl + "/api/payment/verify", 
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }, 
              { withCredentials: true }
            );
            
            if (verifyResponse.data.success) {
              dispatch(setUserData(verifyResponse.data.user));
              alert("Payment Successful! Credits Added!");
              navigate("/");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoadingPlan(null);
          }
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: function() {
            setLoadingPlan(null);
            alert("Payment cancelled");
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
        setLoadingPlan(null);
      });
      rzp.open();
      
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Failed to create payment order");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12 px-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-10 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FaArrowLeft className="text-gray-600 text-sm" />
        </motion.button>

        <div className="flex-1 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-500 mt-2 text-base"
          >
            Flexible pricing to match your interview preparation goals.
          </motion.p>
        </div>
      </div>

      {/* Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={!plan.default ? { 
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              } : {}}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-2xl p-6 transition-all duration-300 border cursor-pointer overflow-hidden
                ${
                  isSelected
                    ? "border-emerald-500 shadow-xl bg-white ring-2 ring-emerald-200"
                    : "border-gray-200 bg-white shadow-md hover:shadow-lg"
                }
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {/* Background Gradient on Hover/Select */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-transparent pointer-events-none
                  ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"}
                `}
                initial={false}
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Badges */}
              {plan.badge && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="absolute top-4 right-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow-md z-10"
                >
                  {plan.badge}
                </motion.div>
              )}

              {plan.default && (
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200 z-10">
                  Default
                </div>
              )}

              {/* Plan Icon */}
              <motion.div 
                className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {plan.icon || <FaCreditCard className="text-emerald-500 text-xl" />}
              </motion.div>

              {/* Plan Name */}
              <h3 className="text-lg font-semibold text-gray-800">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mt-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {plan.price}
                </span>
                <span className="text-gray-400 text-sm ml-1">/one-time</span>
                <p className="text-gray-500 text-sm mt-0.5">{plan.credits} Credits</p>
              </div>

              {/* Description */}
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                {plan.description}
              </p>

              {/* Features */}
              <motion.div className="mt-5 space-y-2.5">
                {plan.features.map((feature, i) => (
                  <motion.div 
                    custom={i}
                    variants={featureVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-2.5" 
                    key={i}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                    >
                      <FaCheckCircle className="text-emerald-500 text-xs" />
                    </motion.div>
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Button */}
              {!plan.default && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id);
                    } else {
                      handlePayment(plan);
                    }
                  }}
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={loadingPlan === plan.id}
                  className={`w-full mt-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200"
                    }
                    ${loadingPlan === plan.id ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                  {loadingPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : isSelected ? "Proceed to Pay" : "Select Plan"}
                </motion.button>
              )}

              {/* Selected Indicator */}
              {isSelected && !plan.default && (
                <motion.div 
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer Note */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-gray-400 text-xs mt-10"
      >
        All plans include access to basic features. Credits never expire.
      </motion.p>
    </div>
  );
};

export default Pricing;