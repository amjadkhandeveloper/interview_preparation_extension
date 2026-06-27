import { useEffect, useState } from 'react';
import type { AiProvider, ExtensionSettings } from '@/shared/types';
import {
  getCredentialsStatus,
  getSettings,
  saveCredentials,
  updateSettings,
} from '@/shared/utils/messaging';
import { validateApiKey } from '@/shared/utils/validator';

interface SettingsProps {
  compact?: boolean;
}

export function Settings({ compact = false }: SettingsProps) {
  const [settings, setSettings] = useState<ExtensionSettings>({
    provider: 'OpenAI',
    useConsolidatedPrompt: true,
  });
  const [apiKey, setApiKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [configured, setConfigured] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    const [s, credStatus] = await Promise.all([getSettings(), getCredentialsStatus()]);
    setSettings(s);
    setConfigured(credStatus);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      await updateSettings(settings);

      if (apiKey) {
        if (!validateApiKey(settings.provider, apiKey)) {
          setStatus('Invalid API key format for selected provider');
          return;
        }
        await saveCredentials({ provider: settings.provider, apiKey }, passphrase || undefined);
        setApiKey('');
        setConfigured(true);
      }

      setStatus('Settings saved successfully');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-4 ${compact ? 'p-4' : ''}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700">AI Provider</label>
        <select
          value={settings.provider}
          onChange={(e) =>
            setSettings({ ...settings, provider: e.target.value as AiProvider })
          }
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="OpenAI">OpenAI</option>
          <option value="Anthropic">Anthropic</option>
          <option value="GoogleAI">Google AI</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          API Key {configured && <span className="text-green-600">(configured)</span>}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={configured ? 'Enter new key to update' : 'Enter API key'}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Keys are encrypted locally and never sent to our servers.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Encryption Passphrase (optional)
        </label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Optional extra security"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={settings.useConsolidatedPrompt}
          onChange={(e) =>
            setSettings({ ...settings, useConsolidatedPrompt: e.target.checked })
          }
        />
        Use consolidated prompt (faster, single API call)
      </label>

      {status && (
        <p
          className={`text-sm ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}
        >
          {status}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
