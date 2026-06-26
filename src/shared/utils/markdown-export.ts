import type { AnalysisRecord } from '@/shared/types';

export function generateMarkdownExport(record: AnalysisRecord): string {
  const { job, prep } = record;
  const lines: string[] = [
    `# Interview Prep: ${job.title} at ${job.company}`,
    '',
    `**Platform:** ${job.platform}`,
    `**URL:** ${job.url}`,
    `**Generated:** ${new Date(prep.generatedAt).toLocaleString()}`,
    '',
    '## Skills Identified',
    ...job.skills.map((s) => `- ${s}`),
    '',
    '## Technical Topics',
  ];

  for (const topic of prep.technicalTopics) {
    lines.push(`### ${topic.topic} (${topic.difficulty})`);
    lines.push(`*Estimated prep: ${topic.estimatedPrep} minutes*`);
    lines.push('');
    lines.push('**Key Points:**');
    lines.push(...topic.keyPoints.map((p) => `- ${p}`));
    if (topic.resources.length > 0) {
      lines.push('');
      lines.push('**Resources:**');
      lines.push(...topic.resources.map((r) => `- [${r.title}](${r.url}) (${r.type})`));
    }
    lines.push('');
  }

  lines.push('## Behavioral Questions');
  for (const q of prep.behavioralQuestions) {
    lines.push(`### ${q.question}`);
    lines.push(`*Category: ${q.category}*`);
    lines.push('');
    lines.push(`**Approach:** ${q.suggestedApproach}`);
    lines.push('');
    lines.push('**STAR Examples:**');
    lines.push(...q.starExamples.map((e) => `- ${e}`));
    lines.push('');
  }

  lines.push('## Company Research');
  lines.push(`**Industry:** ${prep.companyResearch.industry}`);
  lines.push('');
  lines.push('**Culture Focus:**');
  lines.push(...prep.companyResearch.cultureFocus.map((c) => `- ${c}`));
  lines.push('');
  lines.push('**Interview Focus:**');
  lines.push(...prep.companyResearch.interviewFocus.map((f) => `- ${f}`));

  lines.push('');
  lines.push('## Interview Process');
  lines.push(`**Total Duration:** ${prep.interviewProcess.totalDuration}`);
  lines.push('');
  for (const round of prep.interviewProcess.rounds) {
    lines.push(`### Round ${round.round}: ${round.type} (${round.duration} min)`);
    lines.push(...round.focus.map((f) => `- ${f}`));
    lines.push('');
  }

  lines.push('## Salary Insights');
  lines.push(
    `**Range:** $${prep.salaryInsights.range.min.toLocaleString()} - $${prep.salaryInsights.range.max.toLocaleString()}`
  );
  lines.push(`**Market Trend:** ${prep.salaryInsights.marketTrend}`);
  lines.push('');
  lines.push('**Negotiation Tips:**');
  lines.push(...prep.salaryInsights.negotiationTips.map((t) => `- ${t}`));

  return lines.join('\n');
}
