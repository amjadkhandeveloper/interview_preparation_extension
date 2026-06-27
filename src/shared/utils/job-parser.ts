import { MAX_DESCRIPTION_LENGTH, SKILL_KEYWORDS } from '@/shared/constants';
import type { JobDescription, JobPlatform } from '@/shared/types';

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function extractSkills(text: string): string[] {
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const skill of SKILL_KEYWORDS) {
    if (new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&').toLowerCase()}\\b`, 'i').test(lowerText)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills).sort();
}

export function extractRequirements(text: string): string[] {
  const requirementSection = text.split(
    /requirements|qualifications|must have|what you should have|what you will need|you should have|desired|prefer/i
  )[1];

  if (!requirementSection) {
    return extractBulletLines(text).slice(0, 10);
  }

  return extractBulletLines(requirementSection).slice(0, 10);
}

function extractBulletLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 15)
    .filter((line) => /^[-•*]|^(\d+\.)/.test(line) || /^[A-Z]/.test(line))
    .map((line) => line.replace(/^[-•*\d.]+\s*/, '').trim())
    .filter(Boolean);
}

export function extractResponsibilities(text: string): string[] {
  const responsibilitySection = text.split(
    /responsibilities|you will:|as a .+ you will|what you will do|key responsibilities/i
  )[1];

  const source = responsibilitySection || text;
  return extractBulletLines(source).slice(0, 10);
}

export function buildJobDescription(params: {
  title: string;
  company: string;
  description: string;
  url?: string;
  platform?: JobPlatform;
}): JobDescription {
  const trimmedDescription = params.description.trim().slice(0, MAX_DESCRIPTION_LENGTH);

  return {
    id: generateJobId(),
    title: params.title.trim(),
    company: params.company.trim() || 'Unknown',
    description: trimmedDescription,
    url: params.url || '',
    platform: params.platform || 'Company Career',
    extractedAt: Date.now(),
    skills: extractSkills(trimmedDescription),
    responsibilities: extractResponsibilities(trimmedDescription),
    requirements: extractRequirements(trimmedDescription),
  };
}

export function parsePastedJob(
  title: string,
  company: string,
  description: string
): JobDescription {
  if (!title.trim()) {
    throw new Error('Job title is required');
  }
  if (!description.trim()) {
    throw new Error('Job description is required');
  }
  if (description.trim().length < 50) {
    throw new Error('Job description is too short. Paste the full job description.');
  }

  return buildJobDescription({
    title,
    company,
    description,
    platform: 'Company Career',
  });
}
