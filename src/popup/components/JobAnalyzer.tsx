import { useEffect, useState } from 'react';
import type { InterviewPrep, JobDescription } from '@/shared/types';
import type { AppShell } from '@/app/App';
import { openAnalyzeTab, openSidePanel, isSupportedJobUrl } from '@/shared/utils/messaging';
import { loadPasteDraft, savePasteDraft } from '@/shared/utils/paste-draft';

type InputMode = 'page' | 'paste';

interface JobAnalyzerProps {
  shell: AppShell;
  loading: boolean;
  currentJob: JobDescription | null;
  prepMaterials: InterviewPrep | null;
  isSupportedTab: boolean;
  credentialsConfigured: boolean;
  error: string | null;
  onExtractAndAnalyze: () => void;
  onExtractFromUrlAndAnalyze: (url: string) => void;
  onPasteAndAnalyze: (title: string, company: string, description: string) => void;
  onSaveAnalysis: () => void;
}

export function JobAnalyzer({
  shell,
  loading,
  currentJob,
  prepMaterials,
  isSupportedTab,
  credentialsConfigured,
  error,
  onExtractAndAnalyze,
  onExtractFromUrlAndAnalyze,
  onPasteAndAnalyze,
  onSaveAnalysis,
}: JobAnalyzerProps) {
  const [inputMode, setInputMode] = useState<InputMode>(
    shell === 'page' ? 'page' : 'paste'
  );
  const [panelError, setPanelError] = useState<string | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [pastedDescription, setPastedDescription] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    void loadPasteDraft().then((draft) => {
      if (draft) {
        setJobTitle(draft.jobTitle);
        setCompany(draft.company);
        setPastedDescription(draft.description);
        setJobUrl(draft.jobUrl ?? '');
        setInputMode(draft.inputMode);
      }
      setDraftLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;

    const timer = setTimeout(() => {
      void savePasteDraft({
        jobTitle,
        company,
        description: pastedDescription,
        jobUrl,
        inputMode,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [jobTitle, company, pastedDescription, jobUrl, inputMode, draftLoaded]);

  const trimmedUrl = jobUrl.trim();
  const hasValidUrl = trimmedUrl.length > 0 && isSupportedJobUrl(trimmedUrl);
  const canAnalyzeCurrentTab = isSupportedTab && credentialsConfigured && !loading && !trimmedUrl;
  const canAnalyzeUrl = hasValidUrl && credentialsConfigured && !loading;
  const canAnalyzePaste =
    credentialsConfigured &&
    !loading &&
    jobTitle.trim().length > 0 &&
    pastedDescription.trim().length >= 50;

  const handlePasteAnalyze = () => {
    onPasteAndAnalyze(jobTitle, company, pastedDescription);
  };

  const handleOpenSidePanel = async () => {
    setPanelError(null);
    try {
      await openSidePanel();
    } catch (error) {
      setPanelError(
        error instanceof Error
          ? error.message
          : 'Could not open side panel. Click the extension icon in the toolbar instead.'
      );
    }
  };

  const handleOpenAnalyzeTab = async () => {
    setPanelError(null);
    try {
      await openAnalyzeTab();
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : 'Could not open analyze tab');
    }
  };

  const showPopupCloseWarning = shell === 'popup' && inputMode === 'paste';

  return (
    <div className="space-y-4 p-4">
      {!credentialsConfigured && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Configure your API key in Settings before analyzing jobs.
        </div>
      )}

      <div className="flex rounded-lg border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => setInputMode('page')}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
            inputMode === 'page'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          From Page
        </button>
        <button
          type="button"
          onClick={() => setInputMode('paste')}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
            inputMode === 'paste'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Paste JD
        </button>
      </div>

      {showPopupCloseWarning && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
          <p className="font-medium">Popups close when you switch tabs to copy text.</p>
          <p className="mt-1 text-xs text-blue-800">
            Click the <strong>extension icon</strong> in the toolbar to open the side panel, or use{' '}
            <strong>Open in Tab</strong>. Your draft is saved automatically.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void handleOpenSidePanel()}
              className="flex-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Open Side Panel
            </button>
            <button
              type="button"
              onClick={() => void handleOpenAnalyzeTab()}
              className="flex-1 rounded-md border border-blue-600 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Open in Tab
            </button>
          </div>
          {panelError && <p className="mt-2 text-xs text-red-600">{panelError}</p>}
        </div>
      )}

      {shell === 'sidepanel' && inputMode === 'paste' && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-800">
          Side panel stays open while you copy from other tabs. Paste your JD below.
        </div>
      )}

      {inputMode === 'page' ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Paste a job posting URL, or analyze the page you currently have open.
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-700">Job posting URL</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {trimmedUrl && !hasValidUrl && (
              <p className="mt-1 text-xs text-red-500">
                Use a LinkedIn, Indeed, or Glassdoor job link (https).
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onExtractFromUrlAndAnalyze(trimmedUrl)}
            disabled={!canAnalyzeUrl}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? 'Loading & analyzing...' : 'Analyze from URL'}
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 flex-shrink text-xs text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {!isSupportedTab && !trimmedUrl && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-600">
              Open a job posting on LinkedIn, Indeed, or Glassdoor — or paste a URL above.
            </div>
          )}

          <button
            type="button"
            onClick={onExtractAndAnalyze}
            disabled={!canAnalyzeCurrentTab}
            className="w-full rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            {loading ? 'Analyzing...' : 'Analyze Current Tab'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {shell === 'popup'
              ? 'Tip: Open Side Panel or Tab first, then copy from any job site.'
              : 'Copy a job description from any site and paste it below. This view stays open.'}
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-700">Job Title *</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Job Description *
            </label>
            <textarea
              value={pastedDescription}
              onChange={(e) => setPastedDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={shell === 'popup' ? 6 : 12}
              className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              {pastedDescription.trim().length} characters (min 50)
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasteAnalyze}
            disabled={!canAnalyzePaste}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? 'Analyzing...' : 'Analyze Pasted JD'}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
