"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useAggregateImpact } from "@/hooks/useAggregateImpact";
import ChartWatermark from "./ChartWatermark";

const YEARS = [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return `${n < 0 ? "−" : ""}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000)
    return `${n < 0 ? "−" : ""}$${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000)
    return `${n < 0 ? "−" : ""}$${(abs / 1_000).toFixed(0)}k`;
  return `${n < 0 ? "−" : ""}$${Math.abs(n).toFixed(0)}`;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm">
      <div className="text-2xl font-bold text-secondary-900">{value}</div>
      <div className="text-sm font-medium text-secondary-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-secondary-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AggregateImpact() {
  const [year, setYear] = useState(2028);
  const [decileMode, setDecileMode] = useState<"average" | "relative">(
    "average"
  );

  const { data, isLoading, error } = useAggregateImpact(true, year);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-secondary-200 p-8 text-center">
        <p className="text-secondary-600 text-sm font-medium mb-2">
          Aggregate data not yet available
        </p>
        <p className="text-secondary-400 text-xs">
          Run <code className="bg-secondary-100 px-1 py-0.5 rounded">python scripts/pipeline.py</code> to
          generate the CSV data files, then redeploy.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const decileData = Array.from({ length: 10 }, (_, i) => ({
    decile: `D${i + 1}`,
    value:
      decileMode === "average"
        ? (data.decile.average[String(i + 1)] ?? 0)
        : (data.decile.relative[String(i + 1)] ?? 0) * 100,
  }));

  const intraLabels = [
    "Lose more than 5%",
    "Lose less than 5%",
    "No change",
    "Gain less than 5%",
    "Gain more than 5%",
  ] as const;
  const intraColors = ["#64748B", "#94A3B8", "#CBD5E1", "#4FD1C5", "#319795"];

  const intraData = Array.from({ length: 10 }, (_, i) => {
    const d: Record<string, string | number> = { decile: `D${i + 1}` };
    intraLabels.forEach((label) => {
      const vals = data.intra_decile.deciles[label];
      d[label] = vals ? (vals[i] ?? 0) * 100 : 0;
    });
    return d;
  });

  const bracketData = data.by_income_bracket.map((b) => ({
    bracket: b.bracket,
    avgBenefit: Math.round(b.avg_benefit),
    beneficiaries: Math.round(b.beneficiaries),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-secondary-900">
          National impact in Washington State
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary-600">Year:</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm border border-secondary-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Tax revenue raised"
          value={fmt(data.budget.tax_revenue_impact)}
          sub="annual"
        />
        <StatCard
          label="Households affected"
          value={data.winners.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
          sub="pay more"
        />
        <StatCard
          label="Average tax increase"
          value={fmt(Math.abs(data.avg_benefit))}
          sub="among affected"
        />
        <StatCard
          label="Share of households"
          value={`${data.losers_rate.toFixed(1)}%`}
          sub="pay any tax"
        />
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-secondary-900">
            Impact by income decile
          </h3>
          <div className="flex rounded-lg border border-secondary-200 overflow-hidden text-xs">
            {(["average", "relative"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDecileMode(mode)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  decileMode === mode
                    ? "bg-primary-600 text-white"
                    : "text-secondary-600 hover:bg-secondary-50"
                }`}
              >
                {mode === "average" ? "Avg $ change" : "Rel % change"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={decileData}
            margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="decile"
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              tickFormatter={(v) =>
                decileMode === "average" ? fmt(v) : `${v.toFixed(1)}%`
              }
              tick={{ fontSize: 11, fill: "#64748B" }}
              width={70}
            />
            <Tooltip
              formatter={(v: number) =>
                decileMode === "average"
                  ? [fmt(v), "Avg change"]
                  : [`${v.toFixed(2)}%`, "Relative change"]
              }
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {decileData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.value < 0 ? "#64748B" : "#319795"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartWatermark />
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-secondary-900 mb-4">
          Winners and losers by decile
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={intraData}
            stackOffset="expand"
            margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="decile"
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 11, fill: "#64748B" }}
              width={50}
            />
            <Tooltip
              formatter={(v: number, name: string) => [
                `${(v).toFixed(1)}%`,
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {intraLabels.map((label, i) => (
              <Bar key={label} dataKey={label} stackId="a" fill={intraColors[i]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <ChartWatermark />
      </div>

      {bracketData.length > 0 && (
        <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-secondary-900 mb-4">
            Impact by income bracket
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 pr-4 text-secondary-600 font-medium">
                    Income bracket
                  </th>
                  <th className="text-right py-2 pr-4 text-secondary-600 font-medium">
                    Households affected
                  </th>
                  <th className="text-right py-2 text-secondary-600 font-medium">
                    Avg annual change
                  </th>
                </tr>
              </thead>
              <tbody>
                {bracketData.map((row) => (
                  <tr
                    key={row.bracket}
                    className="border-b border-secondary-100 hover:bg-secondary-50"
                  >
                    <td className="py-2 pr-4 font-medium text-secondary-800">
                      {row.bracket}
                    </td>
                    <td className="text-right py-2 pr-4 text-secondary-600">
                      {row.beneficiaries.toLocaleString()}
                    </td>
                    <td className="text-right py-2 text-secondary-800 font-medium">
                      {fmt(row.avgBenefit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
