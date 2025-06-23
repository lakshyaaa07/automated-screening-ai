import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Candidate {
  candidate_id: string;
  name: string;
  email: string;
  resume_url: string;
}

interface FeedbackItem {
  question_no: number;
  question_text: string;
  answer_text: string;
  remark: string;
  improvement: string;
  score: number;
}

interface CandidateDetailsData {
  candidate: Candidate;
  questions: { question_no: number; question_text: string }[];
  video_answers: { question_no: number; video_url: string }[];
  evaluation_feedback: FeedbackItem[];
  final_score: number;
  is_shortlisted: boolean;
}

const CandidateDetails = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [details, setDetails] = useState<CandidateDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!candidateId) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:5001/all_candidate_details/${candidateId}`);
        if (!response.ok) throw new Error("Failed to fetch candidate details");
        const data = await response.json();
        setDetails(data.details);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [candidateId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button variant="outline" className="mb-6 border-purple-500/50 text-purple-300 hover:bg-purple-500/10" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </Button>
        <Card className="bg-gray-900/80 border border-gray-700 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Candidate Details</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-lg text-gray-300">Loading candidate details...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : !details ? (
              <div className="text-center py-8 text-gray-400">No details found.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0 mb-4">
                  <div>
                    <div className="text-lg font-bold text-purple-300">{details.candidate.name}</div>
                    <div className="text-gray-300">{details.candidate.email}</div>
                    <a href={details.candidate.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">View Resume</a>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    <div className="text-sm text-gray-400">Final Score</div>
                    <div className={
                      details.final_score >= 8.5
                        ? "text-green-400 text-3xl font-bold"
                        : details.final_score >= 7.0
                        ? "text-blue-400 text-3xl font-bold"
                        : details.final_score >= 6.0
                        ? "text-yellow-400 text-3xl font-bold"
                        : "text-red-400 text-3xl font-bold"
                    }>
                      {details.final_score?.toFixed(1) ?? "-"}
                    </div>
                    <div className="mt-2">
                      {details.is_shortlisted ? (
                        <span className="px-2 py-1 rounded bg-green-700/60 text-green-200 text-xs font-semibold">Shortlisted</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-red-700/60 text-red-200 text-xs font-semibold">Not Shortlisted</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-purple-200 mb-2">Questions & Answers</div>
                  <div className="space-y-4">
                    {details.evaluation_feedback.map((item, idx) => (
                      <Card key={idx} className="bg-gray-800/70 border border-gray-700 mb-2">
                        <CardHeader>
                          <CardTitle className="text-white text-base">Q{item.question_no}: {item.question_text}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-2">
                            <span className="font-semibold text-blue-300">Answer: </span>
                            <span className="text-gray-200">{item.answer_text}</span>
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold text-green-300">Remark: </span>
                            <span className="text-gray-200">{item.remark}</span>
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold text-yellow-300">Improvement: </span>
                            <span className="text-gray-200">{item.improvement}</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <span className="text-sm text-gray-400 mr-2">Score:</span>
                            <span className={
                              item.score >= 8.5
                                ? "text-green-400 font-bold"
                                : item.score >= 7.0
                                ? "text-blue-400 font-bold"
                                : item.score >= 6.0
                                ? "text-yellow-400 font-bold"
                                : "text-red-400 font-bold"
                            }>
                              {item.score?.toFixed(1) ?? "-"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-purple-200 mb-2">Video Answers</div>
                  <div className="space-y-2">
                    {details.video_answers.map((va, idx) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <span className="text-gray-300">Q{va.question_no}</span>
                        <a href={va.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">View Video</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateDetails; 