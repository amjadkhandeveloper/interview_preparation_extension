import type { InterviewPrep, JobDescription } from '@/shared/types';

interface JobAnalyzerProps {
  loading: boolean;
  currentJob: JobDescription | null;
  prepMaterials: InterviewPrep | null;
  isSupportedTab: boolean;
  credentialsConfigured: boolean;
  error: string | null;
  onExtractAndAnalyze: () => void;
  onSaveAnalysis: () => void;
}

export function JobAnalyzer({
  loading,
  currentJob,
  prepMaterials,
  isSupportedTab,
  credentialsConfigured,
  error,
  onExtractAndAnalyze,
  onSaveAnalysis,
}: JobAnalyzerProps) {
  const canAnalyze = isSupportedTab && credentialsConfigured && !loading;

  return (
    <div className="space-y-4 p-4">
      {!credentialsConfigured && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Configure your API key in Settings before analyzing jobs.
        </div>
      )}

      {!isSupportedTab && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-600">
          Navigate to a job posting on LinkedIn, Indeed, or Glassdoor to analyze.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onExtractAndAnalyze}
        disabled={!canAnalyze}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {loading ? 'Analyzing...' : 'Analyze This Job'}
      </button>

      {currentJob && (
        <div className="rounded-lg border border-gray-200 p-3">
          <h2 className="text-base font-semibold text-gray-900">{currentJob.title}</h2>
          <p className="text-sm text-gray-600">{currentJob.company}</p>
          <p className="mt-1 text-xs text-gray-400">{currentJob.platform}</p>
          {currentJob.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {currentJob.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {prepMaterials && (
        <button
          type="button"
          onClick={onSaveAnalysis}
          className="w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Save Analysis
        </button>
      )}
    </div>
  );
}
