
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Video, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Upload,
      title: "Upload Resume",
      description: "Upload your resume and let AI generate personalized interview questions",
      action: () => navigate('/upload'),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Video,
      title: "Record Answers",
      description: "Answer AI-generated questions through video recordings",
      action: () => navigate('/interview'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Get Feedback",
      description: "Receive detailed AI-powered evaluation and improvement suggestions",
      action: () => navigate('/results'),
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AutoInterview.ai
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience the future of interviews with AI-powered question generation, 
            video recording, and intelligent evaluation feedback.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`bg-gray-800/50 border-gray-700 backdrop-blur-sm transition-all duration-500 cursor-pointer
                ${hoveredCard === index ? 'scale-105 shadow-2xl border-purple-500/50' : 'hover:scale-102'}
              `}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={feature.action}
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} 
                  flex items-center justify-center transform transition-transform duration-300
                  ${hoveredCard === index ? 'rotate-12 scale-110' : ''}
                `}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                <div className={`flex items-center justify-center text-purple-400 transition-all duration-300
                  ${hoveredCard === index ? 'translate-x-2' : ''}
                `}>
                  <span className="mr-2">Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
              text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 
              hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 group"
          >
            <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            Start Your AI Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
