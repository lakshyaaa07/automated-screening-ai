import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Candidate {
  candidate_id: string;
  name: string;
  email: string;
  resume_url: string;
}

interface CandidateRecord {
  candidate: Candidate;
  questions: { question_no: number; question_text: string }[];
  video_answers: { question_no: number; video_url: string }[];
  evaluation_feedback: {
    question_no: number;
    question_text: string;
    answer_text: string;
    remark: string;
    improvement: string;
    score: number;
  }[];
  final_score: number;
  is_shortlisted: boolean;
}

const Dashboard = () => {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:5001/all_candidate_details");
        if (!response.ok) throw new Error("Failed to fetch candidates");
        const data = await response.json();
        setCandidates(data.candidates || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Candidate Dashboard
          </h1>
          <p className="text-gray-400">View all recorded candidates and their interview results</p>
        </div>
        <Card className="bg-gray-900/80 border border-gray-700 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-white">All Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-lg text-gray-300">Loading candidates...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No candidates found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-purple-900/60 to-gray-900/60 border-b border-gray-700">
                      <TableHead className="text-purple-300 font-bold">Name</TableHead>
                      <TableHead className="text-purple-300 font-bold">Email</TableHead>
                      <TableHead className="text-purple-300 font-bold">Resume</TableHead>
                      <TableHead className="text-purple-300 font-bold">Final Score</TableHead>
                      <TableHead className="text-purple-300 font-bold">Shortlisted</TableHead>
                      <TableHead className="text-purple-300 font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((rec) => (
                      <TableRow key={rec.candidate.candidate_id} className="hover:bg-purple-800/20 border-b border-gray-800 transition-colors">
                        <TableCell className="font-medium text-white">{rec.candidate.name}</TableCell>
                        <TableCell className="text-gray-300">{rec.candidate.email}</TableCell>
                        <TableCell>
                          <a
                            href={rec.candidate.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline hover:text-blue-300"
                          >
                            View Resume
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className={
                            rec.final_score >= 8.5
                              ? "text-green-400"
                              : rec.final_score >= 7.0
                              ? "text-blue-400"
                              : rec.final_score >= 6.0
                              ? "text-yellow-400"
                              : "text-red-400"
                          }>
                            {rec.final_score?.toFixed(1) ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {rec.is_shortlisted ? (
                            <span className="px-2 py-1 rounded bg-green-700/60 text-green-200 text-xs font-semibold">Yes</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-red-700/60 text-red-200 text-xs font-semibold">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md px-5 py-2 transition-all duration-200 hover:brightness-110 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                            onClick={() => navigate(`/dashboard/${rec.candidate.candidate_id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 