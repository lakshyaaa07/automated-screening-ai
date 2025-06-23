import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, User, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useInterview } from "@/context/InterviewContext";

const UploadPage = () => {
  const [candidateData, setCandidateData] = useState({
    name: '',
    email: '',
    candidateId: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setCandidateData: setInterviewCandidateData, setQuestions } = useInterview();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateCandidateId = () => {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `cd_${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateData.name || !candidateData.email || !file) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and upload a resume",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const candidateId = generateCandidateId();
    try {
      // Prepare form data for API
      const formData = new FormData();
      formData.append("candidate_id", candidateId);
      formData.append("resume_file", file);
      formData.append("name", candidateData.name);
      formData.append("email", candidateData.email);
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      // Call API
      const response = await fetch("http://127.0.0.1:5001/upload_resume", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      // Save candidate and questions in context
      setInterviewCandidateData({
        candidateId,
        name: candidateData.name,
        email: candidateData.email,
      });
      setQuestions(
        (data.questions || []).map((q: string, idx: number) => ({
          id: idx + 1,
          text: q,
          category: "General"
        }))
      );
      toast({
        title: "Upload successful! 🎉",
        description: "Your resume has been processed. Generating interview questions...",
      });
      setTimeout(() => {
        navigate("/interview");
      }, 1200);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-2xl py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Upload Your Resume
          </h1>
          <p className="text-gray-400">
            Let our AI analyze your resume and generate personalized interview questions
          </p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <User className="w-5 h-5 mr-2" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={candidateData.name}
                    onChange={(e) => setCandidateData({...candidateData, name: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={candidateData.email}
                    onChange={(e) => setCandidateData({...candidateData, email: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Resume Upload</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
                    ${dragActive 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : file 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-green-400 font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400">Ready to upload</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-2">Drop your resume here or click to browse</p>
                      <p className="text-sm text-gray-500">Supports PDF and DOCX files</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Uploading and processing...</span>
                    <span className="text-purple-400">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="bg-gray-700" />
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={uploading || !file || !candidateData.name || !candidateData.email}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
                  text-white py-3 font-semibold rounded-lg transition-all duration-300 
                  hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing Resume...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FileText className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Generate Interview Questions
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;
