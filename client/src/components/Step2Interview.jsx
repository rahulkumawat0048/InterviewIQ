import React, { useEffect, useCallback, useRef, useState } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash, FaStop } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const Step2Interview = ({ interviewData, onFinish }) => {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 120);
  const recognitionRef = useRef(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const currentQuestion = questions[currentIndex];
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        setIsVoiceReady(true);
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        setIsVoiceReady(true);
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
      setIsVoiceReady(true);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const speakText = useCallback(
    async (text) => {
      return new Promise((resolve) => {
        if (!window.speechSynthesis || !selectedVoice) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const trySpeak = () => {
          const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

          const utterance = new SpeechSynthesisUtterance(humanText);
          utterance.voice = selectedVoice;
          utterance.rate = 0.92;
          utterance.pitch = 1.05;
          utterance.volume = 1;

          utterance.onstart = () => {
            if (isMountedRef.current) {
              setIsAIPlaying(true);
              videoRef.current?.play();
            }
          };

          utterance.onend = () => {
            if (isMountedRef.current) {
              videoRef.current?.pause();
              if (videoRef.current) videoRef.current.currentTime = 0;
              setIsAIPlaying(false);
              setTimeout(() => {
                if (isMountedRef.current) setSubtitle("");
                resolve();
              }, 300);
            } else {
              resolve();
            }
          };

          utterance.onerror = (event) => {
            console.error("Speech error:", event);
            if (isMountedRef.current) {
              setIsAIPlaying(false);
              setSubtitle("");
            }
            resolve();
          };

          if (isMountedRef.current) setSubtitle(text);
          window.speechSynthesis.speak(utterance);
        };

        setTimeout(trySpeak, 100);
      });
    },
    [selectedVoice],
  );

  // Initialize speech recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.log("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true; // Enable interim results for better UX

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setIsListening(true);
        setIsMicOn(true);
      }
    };

    recognition.onend = () => {
      if (isMountedRef.current) {
        setIsListening(false);
        // Auto restart if mic was supposed to be on
        if (isMicOn && !isSubmitting && !isAIPlaying && !feedback) {
          recognition.start();
        } else {
          setIsMicOn(false);
        }
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswer((prev) => prev + finalTranscript);
      }
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Please allow microphone access to use voice input.");
      }
      setIsListening(false);
      setIsMicOn(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    };
  }, [isSubmitting, isAIPlaying, feedback]);

  const toggleMic = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
      setIsMicOn(false);
    } else {
      // Start listening
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start recognition:", error);
        alert("Failed to start microphone. Please check permissions.");
      }
    }
  }, [isListening]);

  // Run intro or speak question
  useEffect(() => {
    if (!isVoiceReady || !selectedVoice) return;

    const runIntroOrQuestion = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          `I'll ask you a few questions. Just answer naturally, and take your time. Let's begin`,
        );

        if (isMountedRef.current) {
          setIsIntroPhase(false);
        }
      } else if (currentQuestion && !isSubmitting && !feedback) {
        await new Promise((r) => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);
      }
    };

    runIntroOrQuestion();
  }, [
    selectedVoice,
    isVoiceReady,
    isIntroPhase,
    currentIndex,
    currentQuestion,
    speakText,
    userName,
    questions.length,
    isSubmitting,
    feedback,
  ]);

  // Timer management
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (isSubmitting) return;
    if (feedback) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isIntroPhase, currentIndex, isSubmitting, currentQuestion, feedback]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback && !isAIPlaying) {
      submitAnswer();
    }
  }, [timeLeft, isIntroPhase, currentQuestion, isSubmitting, feedback, isAIPlaying]);

  // Reset timer when changing questions
  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion?.timeLimit || 120);
    }
  }, [currentIndex, isIntroPhase, currentQuestion]);

  // Stop mic when AI is speaking or submitting
  useEffect(() => {
    if ((isAIPlaying || isSubmitting || feedback) && isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsMicOn(false);
    }
  }, [isAIPlaying, isSubmitting, feedback, isListening]);

  const submitAnswer = useCallback(async () => {
    if (isSubmitting || isAIPlaying) return;

    // Stop mic if it's on
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsMicOn(false);
    }

    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const isLastQuestion = currentIndex === questions.length - 1;

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer: answer.trim(),
          timeTaken: (currentQuestion?.timeLimit || 120) - timeLeft,
        },
        { withCredentials: true },
      );

      if (!isMountedRef.current) return;

      setFeedback(result.data.feedback);

      await speakText(result.data.feedback);

      if (!isMountedRef.current) return;

      if (isLastQuestion) {
        await speakText("Great job, you have completed the interview.");

        const finishRes = await axios.post(
          ServerUrl + "/api/interview/finish",
          { interviewId },
          { withCredentials: true },
        );

        if (isMountedRef.current) {
          onFinish(finishRes.data);
        }
        return;
      }

      setIsSubmitting(false);
      setAnswer("");
    } catch (error) {
      console.log("❌ Submit Error:", error);
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    isSubmitting,
    isAIPlaying,
    currentIndex,
    questions.length,
    interviewId,
    answer,
    timeLeft,
    currentQuestion,
    speakText,
    onFinish,
    isListening,
  ]);

  const handleNext = useCallback(async () => {
    setAnswer("");
    setFeedback("");
    setIsSubmitting(false);
    setInterimTranscript("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    if (isMountedRef.current) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, questions.length, speakText]);

  const finishInterview = useCallback(async () => {
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        {
          interviewId,
        },
        { withCredentials: true },
      );
      if (isMountedRef.current) {
        onFinish(result.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [interviewId, onFinish]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center px-3 py-4">
      <div className="w-full max-w-6xl bg-white min-h-[80vh] rounded-xl shadow-lg border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT */}
        <div className="w-full lg:w-[32%] flex flex-col items-center p-4 space-y-4 border-r border-gray-200">
          {/* VIDEO */}
          <div className="w-full max-w-xs rounded-xl overflow-hidden shadow-md">
            <video
              key={videoSource}
              ref={videoRef}
              src={videoSource}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle  */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* TIMER CARD */}
          <div className="w-full max-w-xs bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Status</span>
              {isAIPlaying && (
                <span className="font-medium text-emerald-600">
                  AI Speaking
                </span>
              )}
              {isListening && !isAIPlaying && (
                <span className="font-medium text-blue-600 animate-pulse">
                  🎤 Listening...
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer
                totalTime={currentQuestion?.timeLimit}
                timeLeft={timeLeft}
              />
            </div>

            <div className="grid grid-cols-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-emerald-600">
                  {currentIndex + 1}
                </div>
                <div className="text-gray-400">Question</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">
                  {questions.length}
                </div>
                <div className="text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-600 mb-4">
            AI Interview
          </h2>

          {/* QUESTION */}
          {!isIntroPhase && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
              <p className="text-xs text-gray-400 mb-1">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}

          {/* ANSWER BOX */}
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              onChange={(e) => setAnswer(e.target.value)}
              value={answer + (interimTranscript ? ` ${interimTranscript}` : "")}
              placeholder="Type your answer... or click the microphone button and speak!"
              disabled={isAIPlaying || isSubmitting || !!feedback}
              className="flex-1 bg-gray-100 p-4 rounded-xl resize-none outline-none border border-gray-200 focus:ring-1 focus:ring-emerald-500 text-sm transition disabled:bg-gray-200 disabled:cursor-not-allowed min-h-[200px]"
            />
            
            {/* Interim transcript indicator */}
            {interimTranscript && isListening && (
              <p className="text-xs text-gray-400 italic">
                🎤 Speaking: {interimTranscript}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          {!feedback ? (
            <div className="flex items-center gap-3 mt-4">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                disabled={isAIPlaying || isSubmitting}
                className={`w-12 h-12 flex items-center justify-center rounded-full shadow transition-all ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-gray-800 text-white hover:bg-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting || isAIPlaying || isIntroPhase || (!answer.trim() && !interimTranscript)}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow hover:opacity-90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                disabled={isAIPlaying}
                className="w-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentIndex === questions.length - 1
                  ? "Finish Interview"
                  : "Next Question"}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Interview;