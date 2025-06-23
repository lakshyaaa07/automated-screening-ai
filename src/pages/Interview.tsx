import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Video, Square, RotateCcw, ArrowRight, ArrowLeft, Camera, CheckCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { useInterview } from "@/context/InterviewContext";

interface Question {
  id: number;
  text: string;
  category: string;
}

const InterviewPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState<boolean[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedVideos, setRecordedVideos] = useState<Blob[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate, questions, recordedAnswers, setRecordedAnswers, setQuestions } = useInterview();

  useEffect(() => {
    initializeRecording();
    setHasRecorded(new Array(questions.length).fill(false));
    setRecordedVideos(new Array(questions.length).fill(null));
    setPreviewUrls(new Array(questions.length).fill(''));
  }, [questions.length]);

  useEffect(() => {
    if (isRecording && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    // If questions are not set, fetch them from the API
    if ((!questions || questions.length === 0) && candidate?.candidateId) {
      fetch(`http://127.0.0.1:5001/interview_results/${candidate.candidateId}`)
        .then(res => res.json())
        .then(data => {
          if (data.feedback && Array.isArray(data.feedback)) {
            setQuestions(
              data.feedback.map((item: any, idx: number) => ({
                id: item.question_no || idx + 1,
                text: item.question_text,
                category: 'General',
              }))
            );
          }
        });
    }
  }, [candidate?.candidateId, questions, setQuestions]);

  const initializeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
      setPermissionsGranted(true);
      
      toast({
        title: "Camera and microphone ready! 📹",
        description: "You can now start recording your answers",
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Permission denied",
        description: "Please allow camera and microphone access to continue",
        variant: "destructive"
      });
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const newRecordedVideos = [...recordedVideos];
      newRecordedVideos[currentQuestion] = blob;
      setRecordedVideos(newRecordedVideos);
      
      const newHasRecorded = [...hasRecorded];
      newHasRecorded[currentQuestion] = true;
      setHasRecorded(newHasRecorded);
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls[currentQuestion] = URL.createObjectURL(blob);
      setPreviewUrls(newPreviewUrls);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);

    // Ensure video element shows live feed during recording
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.muted = false; // Unmute during recording
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      // Mute video after stopping recording
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  };

  const nextQuestion = () => {
    if (!hasRecorded[currentQuestion]) {
      toast({
        title: "Recording required",
        description: "Please record your answer before moving to the next question",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setRecordingTime(0);
    }
  };

  const submitInterview = async () => {
    const completedAnswers = hasRecorded.filter(Boolean).length;
    if (completedAnswers < questions.length) {
      toast({
        title: "Incomplete interview",
        description: `Please answer all ${questions.length} questions before submitting`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("candidate_id", candidate?.candidateId || "");
      recordedVideos.forEach((video, idx) => {
        if (video) formData.append("videos[]", video, `answer${idx + 1}.mp4`);
      });

      const response = await fetch("http://127.0.0.1:5001/evaluate_answers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Evaluation failed");

      toast({
        title: "Interview submitted successfully! 🎉",
        description: "Redirecting to your results...",
      });

      // Add a small delay before navigation for better UX
      setTimeout(() => {
        navigate("/results");
      }, 1500);

    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const completedAnswers = hasRecorded.filter(Boolean).length;
  const allQuestionsCompleted = completedAnswers === questions.length;
  const canMoveNext = hasRecorded[currentQuestion] || currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">Submitting Your Interview</h2>
            <p className="text-gray-400">Please wait while we process your responses...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            AI Interview Session
          </h1>
          <div className="flex items-center justify-center space-x-6 text-gray-400">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>•</span>
            <span>{completedAnswers}/{questions.length} completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="bg-gray-700 h-3" />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            {questions.map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold 
                  ${index < currentQuestion ? 'bg-green-500 text-white' : 
                    index === currentQuestion ? 'bg-blue-500 text-white' : 
                    'bg-gray-600 text-gray-400'}`}>
                  {hasRecorded[index] ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                  {questions[currentQuestion].category}
                </span>
                <span className="text-sm text-gray-400">
                  #{currentQuestion + 1}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-600">
                <p className="text-lg text-gray-200 leading-relaxed">
                  {questions[currentQuestion].text}
                </p>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-end">
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestion === questions.length - 1 || !hasRecorded[currentQuestion]}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Video Recording Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span className="flex items-center">
                  <Video className="w-5 h-5 mr-2" />
                  Record Your Answer
                </span>
                {isRecording && (
                  <span className="flex items-center text-red-400">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                    {formatTime(recordingTime)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                {permissionsGranted ? (
                  <>
                    {/* Live camera feed - show when not recorded or during recording */}
                    {(!hasRecorded[currentQuestion] || isRecording) && (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={!isRecording} // Only mute when not recording
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Preview of recorded video - only show when recorded and not recording */}
                    {hasRecorded[currentQuestion] && !isRecording && previewUrls[currentQuestion] && (
                      <video
                        src={previewUrls[currentQuestion]}
                        controls
                        playsInline
                        className="w-full h-full object-cover bg-black"
                      />
                    )}
                    
                    {/* Recording indicator overlay */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        REC {formatTime(recordingTime)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Camera access required</p>
                      <Button 
                        onClick={initializeRecording}
                        className="mt-4 bg-purple-500 hover:bg-purple-600"
                      >
                        Grant Access
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRecording && !hasRecorded[currentQuestion] && permissionsGranted && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full 
                      transition-all duration-300 hover:scale-105"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-full"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {hasRecorded[currentQuestion] && !isRecording && (
                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestion === questions.length - 1}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Status Message */}
              {!hasRecorded[currentQuestion] && permissionsGranted && !isRecording && (
                <div className="text-center p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 font-medium">
                    📹 Record your answer to proceed to the next question
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        {allQuestionsCompleted && (
          <div className="text-center mt-12 animate-fade-in">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-green-400 mb-2">🎉 All Questions Completed!</h3>
              <p className="text-gray-300">You've successfully recorded answers to all questions. Ready to submit?</p>
            </div>
            <Button
              onClick={submitInterview}
              disabled={isSubmitting}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                text-white px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 
                hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Submit Interview & Get Results
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
