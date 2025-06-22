
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AutoInterview.ai
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-12">
            Experience the future of interviews with AI-powered question generation, 
            video recording, and intelligent evaluation feedback.
          </p>
          
          {/* Single CTA Button */}
          <Button 
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
              text-white px-12 py-6 text-xl font-semibold rounded-full transition-all duration-300 
              hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 group"
          >
            <Sparkles className="w-6 h-6 mr-3 group-hover:animate-pulse" />
            Start Interview with AI
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
