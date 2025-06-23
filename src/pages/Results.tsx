import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, TrendingUp, Download, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useInterview } from "@/context/InterviewContext";

interface FeedbackItem {
  question: string;
  answer: string;
  remark: string;
  improvement: string;
  score: number;
}

interface EvaluationData {
  candidate_id: string;
  feedback: FeedbackItem[];
  final_score: number;
}

const ResultsPage = () => {
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const { candidate } = useInterview();

  useEffect(() => {
    const fetchResults = async () => {
      if (!candidate?.candidateId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5001/interview_results/${candidate.candidateId}`);
        if (!response.ok) throw new Error("Failed to fetch results");
        const data = await response.json();
        // TEMP: Override final_score for testing congratulatory effect
        data.final_score = 9.0; // Remove or comment out after testing
        setEvaluationData(data);
        // Animate final score
        let current = 0;
        const target = data.final_score;
        const increment = target / 100;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
            if (target >= 7.0) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }
          }
          setAnimatedScore(current);
        }, 20);
      } catch (error) {
        setEvaluationData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    // eslint-disable-next-line
  }, [candidate?.candidateId]);

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-400";
    if (score >= 7.0) return "text-blue-400";
    if (score >= 6.0) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8.5) return "from-green-500 to-emerald-500";
    if (score >= 7.0) return "from-blue-500 to-cyan-500";
    if (score >= 6.0) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return "Excellent";
    if (score >= 7.0) return "Good";
    if (score >= 6.0) return "Fair";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Analyzing Your Interview</h2>
          <p className="text-gray-400">Our AI is evaluating your responses...</p>
        </div>
      </div>
    );
  }

  if (!evaluationData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Interview Results
          </h1>
          <p className="text-gray-400">
            Here's your comprehensive AI-powered interview evaluation
          </p>
        </div>

        {/* Final Score Card */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreBackground(evaluationData.final_score)} 
                flex items-center justify-center text-4xl font-bold text-white shadow-xl`}>
                {animatedScore.toFixed(1)}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Overall Score: {getScoreLabel(evaluationData.final_score)}
            </h2>
            <p className="text-gray-400 mb-6">
              Based on your responses across {evaluationData.feedback.length} questions
            </p>
            
            {evaluationData.final_score >= 7.0 && (
              <div className="flex items-center justify-center text-green-400 mb-4">
                <Trophy className="w-6 h-6 mr-2" />
                <span className="text-lg font-semibold">Congratulations! Strong Performance</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <div className="grid gap-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Detailed Feedback
          </h3>
          
          {evaluationData.feedback.map((item, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="text-lg">Question {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <Star className={`w-5 h-5 ${getScoreColor(item.score)}`} />
                    <span className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(1)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Question:</h4>
                  <p className="text-gray-300">{item.question}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">AI Evaluation:</h4>
                  <p className="text-gray-300">{item.remark}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">Improvement Suggestions:</h4>
                  <p className="text-gray-300">{item.improvement}</p>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Score</span>
                    <span>{item.score.toFixed(1)}/10</span>
                  </div>
                  <Progress value={item.score * 10} className="bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Steps
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
            <p className="text-gray-300 mb-6">
              Based on your performance, here are some recommended next steps to enhance your interview skills.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                Practice More Questions
              </Button>
              <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10">
                Download Study Guide
              </Button>
              <Button variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-500/10">
                Schedule Mock Interview
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default ResultsPage;
