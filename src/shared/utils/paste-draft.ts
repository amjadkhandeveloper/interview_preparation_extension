export const PASTE_DRAFT_KEY = 'meta_paste_jd_draft';

export interface PasteDraft {
  jobTitle: string;
  company: string;
  description: string;
  jobUrl: string;
  inputMode: 'page' | 'paste';
}

export async function loadPasteDraft(): Promise<PasteDraft | null> {
  const result = await chrome.storage.session.get(PASTE_DRAFT_KEY);
  return (result[PASTE_DRAFT_KEY] as PasteDraft) || null;
}

export async function savePasteDraft(draft: PasteDraft): Promise<void> {
  await chrome.storage.session.set({ [PASTE_DRAFT_KEY]: draft });
}

export async function clearPasteDraft(): Promise<void> {
  await chrome.storage.session.remove(PASTE_DRAFT_KEY);
}
