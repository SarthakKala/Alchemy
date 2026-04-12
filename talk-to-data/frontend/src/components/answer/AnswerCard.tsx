'use client';

import type { QueryResponse } from '@/lib/types';
import { DynamicChart } from '@/components/charts/DynamicChart';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ShowMyWork } from './ShowMyWork';

interface Props {
  response: QueryResponse;
}

export function AnswerCard({ response }: Props) {
  if (response.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
        {response.error}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2 flex-wrap">
        {response.intent && (
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md capitalize">
            {response.intent}
          </span>
        )}
        {response.confidence && (
          <ConfidenceBadge
            level={response.confidence}
            reason={response.confidence_reason || ''}
          />
        )}
      </div>

      {response.answer_text && (
        <p className="text-white text-sm leading-relaxed">{response.answer_text}</p>
      )}

      {response.chart_data && response.chart_data.length > 0 && (
        <DynamicChart
          type={response.chart_type || 'bar'}
          data={response.chart_data}
          columns={response.columns_used || []}
        />
      )}

      {response.generated_sql && (
        <ShowMyWork
          sql={response.generated_sql}
          columnsUsed={response.columns_used || []}
          rowCount={response.row_count || 0}
        />
      )}
    </div>
  );
}
