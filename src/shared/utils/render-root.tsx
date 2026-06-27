import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';

const ROOT_KEY = '__interviewPrepReactRoot';

type ContainerWithRoot = HTMLElement & { [ROOT_KEY]?: Root };

export function renderRoot(ui: ReactNode, containerId = 'root'): void {
  const container = document.getElementById(containerId) as ContainerWithRoot | null;
  if (!container) return;

  let root = container[ROOT_KEY];
  if (!root) {
    root = createRoot(container);
    container[ROOT_KEY] = root;
  }

  root.render(ui);
}
