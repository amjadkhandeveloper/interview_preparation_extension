import { useEffect } from 'react';
import { JobAnalyzer } from '@/popup/components/JobAnalyzer';
import { History } from '@/popup/components/History';
import { PrepMaterials } from '@/popup/components/PrepMaterials';
import { Settings } from '@/popup/components/Settings';
import { useAppStore } from '@/app/store';
import {
  analyzeJob,
  getCredentialsStatus,
  getHistory,
  isSupportedJobTab,
  saveAnalysis,
  saveJob,
  extractJobFromTab,
  extractJobFromUrl,
} from '@/shared/utils/messaging';
import type { JobDescription } from '@/shared/types';
import { parsePastedJob } from '@/shared/utils/job-parser';
import { clearPasteDraft } from '@/shared/utils/paste-draft';

export type AppShell = 'popup' | 'sidepanel' | 'page';

type TabType = 'analyze' | 'history' | 'settings';

const shellClass: Record<AppShell, string> = {
  popup: 'popup-container',
  sidepanel: 'sidepanel-container',
  page: 'page-container',
};

interface AppProps {
  shell?: AppShell;
}

export function App({ shell = 'popup' }: AppProps) {
  const {
    activeTab,
    loading,
    error,
    currentJob,
    prepMaterials,
    history,
    isSupportedTab,
    credentialsConfigured,
    setActiveTab,
    setLoading,
    setError,
    setCurrentJob,
    setPrepMaterials,
    setHistory,
    setIsSupportedTab,
    setCredentialsConfigured,
  } = useAppStore();

  useEffect(() => {
    void initialize();
  }, []);

  const initialize = async () => {
    const [historyData, supported, configured] = await Promise.all([
      getHistory(),
      isSupportedJobTab(),
      getCredentialsStatus(),
    ]);
    setHistory(historyData);
    setIsSupportedTab(supported);
    setCredentialsConfigured(configured);
  };

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleExtractAndAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      const jobData = await extractJobFromTab(tab.id);
      await runAnalysis(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing job description');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFromUrlAndAnalyze = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const jobData = await extractJobFromUrl(url);
      await runAnalysis(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing job URL');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (jobData: JobDescription) => {
    setCurrentJob(jobData);
    await saveJob(jobData);

    const prep = await analyzeJob(jobData.id);
    setPrepMaterials(prep);
    setActiveTab('analyze');
    await loadHistory();
  };

  const handlePasteAndAnalyze = async (title: string, company: string, description: string) => {
    setLoading(true);
    setError(null);

    try {
      const jobData = parsePastedJob(title, company, description);
      await clearPasteDraft();
      await runAnalysis(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing job description');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!prepMaterials) return;
    await saveAnalysis(prepMaterials);
    await loadHistory();
  };

  const handleSelectHistory = (record: (typeof history)[0]) => {
    setCurrentJob(record.job);
    setPrepMaterials(record.prep);
    setActiveTab('analyze');
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'analyze', label: 'Analyze' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className={`${shellClass[shell]} bg-white`}>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <h1 className="px-4 pt-3 text-lg font-bold text-gray-900">Interview Prep</h1>
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {activeTab === 'analyze' && (
          <>
            <JobAnalyzer
              shell={shell}
              loading={loading}
              currentJob={currentJob}
              prepMaterials={prepMaterials}
              isSupportedTab={isSupportedTab}
              credentialsConfigured={credentialsConfigured}
              error={error}
              onExtractAndAnalyze={handleExtractAndAnalyze}
              onExtractFromUrlAndAnalyze={handleExtractFromUrlAndAnalyze}
              onPasteAndAnalyze={handlePasteAndAnalyze}
              onSaveAnalysis={handleSaveAnalysis}
            />
            {prepMaterials && <PrepMaterials prep={prepMaterials} />}
          </>
        )}

        {activeTab === 'history' && (
          <History
            history={history}
            onSelect={handleSelectHistory}
            onRefresh={loadHistory}
          />
        )}

        {activeTab === 'settings' && <Settings compact />}
      </main>
    </div>
  );
}
