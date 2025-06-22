
import { createContext, useContext, useState, ReactNode } from 'react';

interface CandidateData {
  candidateId: string;
  name: string;
  email: string;
  resumeUrl?: string;
}

interface Question {
  id: number;
  text: string;
  category: string;
}

interface InterviewContextType {
  candidate: CandidateData | null;
  setCandidateData: (data: CandidateData) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  recordedAnswers: Blob[];
  setRecordedAnswers: (answers: Blob[]) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider = ({ children }: InterviewProviderProps) => {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState<Blob[]>([]);

  const setCandidateData = (data: CandidateData) => {
    setCandidate(data);
  };

  return (
    <InterviewContext.Provider
      value={{
        candidate,
        setCandidateData,
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        recordedAnswers,
        setRecordedAnswers,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};
