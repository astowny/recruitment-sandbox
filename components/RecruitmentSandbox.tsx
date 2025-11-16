
import React, { useState, useCallback } from 'react';
import { generateRecruitmentAssets } from '../services/geminiService';
import type { RecruitmentOutput } from '../types';
import { LoadingIcon, SparklesIcon } from './icons';

const RecruitmentSandbox: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<RecruitmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!notes.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedAssets = await generateRecruitmentAssets(notes);
      setResult(generatedAssets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [notes, isLoading]);

  const ResultDisplay: React.FC<{ output: RecruitmentOutput }> = ({ output }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">Generated Job Description</h3>
        <div className="prose prose-invert prose-sm max-w-none bg-gray-900 p-4 rounded-md whitespace-pre-wrap font-mono text-gray-300 overflow-x-auto">
          {output.jobDescription}
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-teal-400">Generated Interview Guide</h3>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
          {output.interviewGuide.map((item, index) => (
            <li key={index} className="bg-gray-900 p-3 rounded-md">{item.question}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-2">Recruitment Sandbox</h2>
        <p className="text-gray-400 mb-4">
          Enter raw notes about a job role. Our AI, powered by Gemini 2.5 Pro with enhanced thinking, will generate a professional job description and a targeted interview guide.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Senior Frontend Engineer, React, TypeScript, 5+ years experience, remote, needs to be a team player, experience with Tailwind CSS is a plus..."
          className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-y"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !notes.trim()}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
        >
          {isLoading ? <><LoadingIcon /> Generating...</> : <><SparklesIcon /> Generate Assets</>}
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700">
          <LoadingIcon />
          <p className="mt-4 text-lg font-medium text-gray-300">Engaging Gemini 2.5 Pro's advanced thinking...</p>
          <p className="text-gray-400">This may take a moment as the AI crafts the perfect assets for you.</p>
        </div>
      )}
      
      {error && (
         <div className="p-4 text-red-400 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="font-bold">An error occurred:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && <ResultDisplay output={result} />}
    </div>
  );
};

export default RecruitmentSandbox;
