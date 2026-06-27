import '@/styles/index.css';
import { Settings } from '@/popup/components/Settings';
import { renderRoot } from '@/shared/utils/render-root';

function OptionsPage() {
  return (
    <div className="options-container">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Interview Prep Settings</h1>
      <p className="mb-6 text-sm text-gray-600">
        Configure your AI provider and API credentials. Keys are encrypted locally using Web
        Crypto.
      </p>
      <Settings />
    </div>
  );
}

renderRoot(<OptionsPage />);
