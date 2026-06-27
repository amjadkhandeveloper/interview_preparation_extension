import { create } from 'zustand';
import type { AnalysisRecord, ExtensionSettings, InterviewPrep, JobDescription } from '@/shared/types';

interface AppState {
  activeTab: 'analyze' | 'history' | 'settings';
  loading: boolean;
  error: string | null;
  currentJob: JobDescription | null;
  prepMaterials: InterviewPrep | null;
  history: AnalysisRecord[];
  settings: ExtensionSettings;
  isSupportedTab: boolean;
  credentialsConfigured: boolean;

  setActiveTab: (tab: AppState['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentJob: (job: JobDescription | null) => void;
  setPrepMaterials: (prep: InterviewPrep | null) => void;
  setHistory: (history: AnalysisRecord[]) => void;
  setSettings: (settings: ExtensionSettings) => void;
  setIsSupportedTab: (supported: boolean) => void;
  setCredentialsConfigured: (configured: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'analyze',
  loading: false,
  error: null,
  currentJob: null,
  prepMaterials: null,
  history: [],
  settings: { provider: 'OpenAI', useConsolidatedPrompt: true },
  isSupportedTab: false,
  credentialsConfigured: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentJob: (currentJob) => set({ currentJob }),
  setPrepMaterials: (prepMaterials) => set({ prepMaterials }),
  setHistory: (history) => set({ history }),
  setSettings: (settings) => set({ settings }),
  setIsSupportedTab: (isSupportedTab) => set({ isSupportedTab }),
  setCredentialsConfigured: (credentialsConfigured) => set({ credentialsConfigured }),
}));
