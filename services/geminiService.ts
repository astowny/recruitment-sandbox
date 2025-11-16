
import { GoogleGenAI, Type } from "@google/genai";
import type { RecruitmentOutput } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateRecruitmentAssets = async (notes: string): Promise<RecruitmentOutput> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Based on the following raw notes about a job role, generate two distinct assets:
        1. A polished and professionally formatted Job Description suitable for posting on LinkedIn.
        2. An Interview Guide containing exactly 10 behavioral questions designed to assess the key soft and hard skills implied by the job description.

        Raw notes: "${notes}"`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobDescription: {
              type: Type.STRING,
              description: "The full, formatted job description for LinkedIn."
            },
            interviewGuide: {
              type: Type.ARRAY,
              description: "A list of 10 behavioral interview questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "A single behavioral interview question."
                  }
                },
                required: ["question"]
              }
            }
          },
          required: ["jobDescription", "interviewGuide"]
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedResponse = JSON.parse(jsonString);

    // Basic validation to ensure the structure matches our expectations
    if (
        !parsedResponse.jobDescription || 
        !Array.isArray(parsedResponse.interviewGuide) ||
        parsedResponse.interviewGuide.length === 0 ||
        !parsedResponse.interviewGuide[0].question
    ) {
        throw new Error("Received unexpected format from API.");
    }
    
    return parsedResponse as RecruitmentOutput;
  } catch (error) {
    console.error("Error generating recruitment assets:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};
