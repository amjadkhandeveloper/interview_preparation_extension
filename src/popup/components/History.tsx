import type { AnalysisRecord } from '@/shared/types';
import { deleteAnalysis, exportMarkdown } from '@/shared/utils/messaging';

interface HistoryProps {
  history: AnalysisRecord[];
  onSelect: (record: AnalysisRecord) => void;
  onRefresh: () => void;
}

export function History({ history, onSelect, onRefresh }: HistoryProps) {
  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this analysis?')) return;
    await deleteAnalysis(jobId);
    onRefresh();
  };

  const handleExport = async (jobId: string) => {
    try {
      await exportMarkdown(jobId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Export failed');
    }
  };

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No analyses yet. Analyze a job description to get started!
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {history.map((record) => (
        <li key={record.jobId} className="p-4 hover:bg-gray-50">
          <button
            type="button"
            onClick={() => onSelect(record)}
            className="w-full text-left"
          >
            <p className="text-sm font-medium text-gray-900">{record.title}</p>
            <p className="text-xs text-gray-600">{record.company}</p>
            <time className="text-xs text-gray-400">
              {new Date(record.generatedAt).toLocaleDateString()}
            </time>
          </button>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleExport(record.jobId)}
              className="text-xs text-blue-600 hover:underline"
            >
              Export MD
            </button>
            <button
              type="button"
              onClick={() => handleDelete(record.jobId)}
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
