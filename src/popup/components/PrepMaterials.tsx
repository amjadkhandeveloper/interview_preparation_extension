import { useState } from 'react';
import type { InterviewPrep } from '@/shared/types';

interface PrepMaterialsProps {
  prep: InterviewPrep;
}

type Section = 'technical' | 'behavioral' | 'company' | 'process' | 'salary';

export function PrepMaterials({ prep }: PrepMaterialsProps) {
  const [openSection, setOpenSection] = useState<Section | null>('technical');

  const toggle = (section: Section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections: { id: Section; label: string }[] = [
    { id: 'technical', label: 'Technical Topics' },
    { id: 'behavioral', label: 'Behavioral Questions' },
    { id: 'company', label: 'Company Research' },
    { id: 'process', label: 'Interview Process' },
    { id: 'salary', label: 'Salary Insights' },
  ];

  return (
    <div className="border-t border-gray-200">
      {sections.map(({ id, label }) => (
        <div key={id} className="border-b border-gray-100">
          <button
            type="button"
            onClick={() => toggle(id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {label}
            <span className="text-gray-400">{openSection === id ? '−' : '+'}</span>
          </button>

          {openSection === id && (
            <div className="px-4 pb-3 text-sm text-gray-700">
              {id === 'technical' &&
                prep.technicalTopics.map((topic) => (
                  <div key={topic.topic} className="mb-3">
                    <p className="font-medium">
                      {topic.topic}{' '}
                      <span className="text-xs text-gray-500">({topic.difficulty})</span>
                    </p>
                    <ul className="mt-1 list-disc pl-4 text-xs">
                      {topic.keyPoints.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}

              {id === 'behavioral' &&
                prep.behavioralQuestions.map((q) => (
                  <div key={q.question} className="mb-3">
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-1 text-xs text-gray-500">{q.suggestedApproach}</p>
                  </div>
                ))}

              {id === 'company' && (
                <div>
                  <p>
                    <strong>Industry:</strong> {prep.companyResearch.industry}
                  </p>
                  <ul className="mt-2 list-disc pl-4 text-xs">
                    {prep.companyResearch.interviewFocus.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {id === 'process' && (
                <div>
                  <p className="text-xs text-gray-500">
                    Total: {prep.interviewProcess.totalDuration}
                  </p>
                  {prep.interviewProcess.rounds.map((r) => (
                    <p key={r.round} className="mt-1 text-xs">
                      Round {r.round}: {r.type} ({r.duration} min)
                    </p>
                  ))}
                </div>
              )}

              {id === 'salary' && (
                <div>
                  <p>
                    ${prep.salaryInsights.range.min.toLocaleString()} – $
                    {prep.salaryInsights.range.max.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{prep.salaryInsights.marketTrend}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
