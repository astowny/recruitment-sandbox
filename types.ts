
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface RecruitmentOutput {
  jobDescription: string;
  interviewGuide: {
    question: string;
  }[];
}
