
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Video, Mic, Square, Play, RotateCcw, ArrowRight, ArrowLeft, Camera, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Sample AI-generated questions (in real app, these would come from backend)
  const questions: Question[] = [
    {
      id: 1,
      text: "Tell me about yourself and your professional background.",
      category: "General"
    },
    {
      id: 2,
      text: "What interests you most about this role and our company?",
      category: "Motivation"
    },
    {
      id: 3,
      text: "Describe a challenging project you've worked on and how you overcame obstacles.",
      category: "Problem Solving"
    },
    {
      id: 4,
      text: "How do you handle working under pressure and tight deadlines?",
      category: "Work Style"
    },
    {
      id: 5,
      text: "Where do you see yourself in the next 5 years?",
      category: "Career Goals"
    },
    {
      id: 6,
      text: "What are your greatest strengths and how do they apply to this position?",
      category: "Strengths"
    },
    {
      id: 7,
      text: "Do you have any questions about the role or company culture?",
      category: "Questions"
    }
  ];

  useEffect(() => {
    initializeRecording();
    setHasRecorded(new Array(questions.length).fill(false));
    setRecordedVideos(new Array(questions.length).fill(null));
  }, []);

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

  const initializeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
      
      toast({
        title: "Camera and microphone ready! 📹",
        description: "You can now start recording your answers",
      });
    } catch (error) {
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
      
      setPreviewUrl(URL.createObjectURL(blob));
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const retakeRecording = () => {
    setPreviewUrl(null);
    const newHasRecorded = [...hasRecorded];
    newHasRecorded[currentQuestion] = false;
    setHasRecorded(newHasRecorded);
    setRecordingTime(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setPreviewUrl(null);
      setRecordingTime(0);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setPreviewUrl(null);
      setRecordingTime(0);
    }
  };

  const submitInterview = () => {
    const completedAnswers = hasRecorded.filter(Boolean).length;
    if (completedAnswers < questions.length) {
      toast({
        title: "Incomplete interview",
        description: `Please answer all ${questions.length} questions before submitting`,
        variant: "destructive"
      });
      return;
    }

    // Store interview data (will be replaced with Supabase)
    const interviewData = {
      candidateId: location.state?.candidateId || 'TEMP_ID',
      completedAt: new Date().toISOString(),
      answers: recordedVideos.length,
      questions: questions.map(q => q.text)
    };
    
    localStorage.setItem('interviewData', JSON.stringify(interviewData));
    
    toast({
      title: "Interview completed! 🎉",
      description: "Your answers are being processed...",
    });

    setTimeout(() => {
      navigate('/results');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const completedAnswers = hasRecorded.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            AI Interview Session
          </h1>
          <div className="flex items-center justify-center space-x-6 text-gray-400">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>•</span>
            <span>{completedAnswers} completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="bg-gray-700 h-2" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
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
            <CardContent>
              <p className="text-lg text-gray-200 leading-relaxed mb-6">
                {questions[currentQuestion].text}
              </p>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 relative">
                {permissionsGranted ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    {previewUrl && !isRecording && (
                      <video
                        src={previewUrl}
                        controls
                        className="absolute inset-0 w-full h-full object-cover bg-black"
                      />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Camera access required</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRecording && !hasRecorded[currentQuestion] && (
                  <Button
                    onClick={startRecording}
                    disabled={!permissionsGranted}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full 
                      transition-all duration-300 hover:scale-105"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {hasRecorded[currentQuestion] && !isRecording && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={retakeRecording}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <div className="flex items-center text-green-400">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Recorded
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        {completedAnswers === questions.length && (
          <div className="text-center mt-8">
            <Button
              onClick={submitInterview}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 
                hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 group"
            >
              <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Submit Interview & Get Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
