"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import ChartWatermark from "./ChartWatermark";

const THRESHOLD = 1_000_000;
const RATE = 0.099;

function buildTaxData() {
  const points = [];
  for (let income = 0; income <= 5_000_000; income += 100_000) {
    const taxOwed = income > THRESHOLD ? (income - THRESHOLD) * RATE : 0;
    points.push({ income, taxOwed });
  }
  return points;
}

const taxData = buildTaxData();

function fmt(n: number, decimals = 0) {
  if (Math.abs(n) >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(decimals === 0 ? 1 : decimals)}M`;
  if (Math.abs(n) >= 1_000)
    return `$${(n / 1_000).toFixed(decimals === 0 ? 0 : decimals)}k`;
  return `$${n.toLocaleString()}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { income: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { income } = payload[0].payload;
  const taxOwed = payload[0].value;
  return (
    <div className="bg-white border border-secondary-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <div className="text-secondary-600">Income: {fmt(income)}</div>
      <div className="font-semibold text-secondary-900">
        Annual tax: {fmt(taxOwed)}
      </div>
      {income > 0 && (
        <div className="text-secondary-500">
          Effective rate: {((taxOwed / income) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default function PolicyOverview() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-secondary-900 mb-3">
          What is WA SB 6346?
        </h2>
        <p className="text-secondary-700 leading-relaxed mb-4">
          Washington State Senate Bill 6346 introduces a{" "}
          <strong>9.9% surtax</strong> on Washington taxable income exceeding{" "}
          <strong>$1 million</strong>. The tax would be paid by WA residents
          with high incomes — roughly the top 1% of earners in the state.
          It takes effect January 1, 2028.
        </p>
        <p className="text-secondary-700 leading-relaxed">
          Washington currently has no state income tax. SB 6346 would create a
          narrow, targeted tax that applies only above the $1M threshold.
          Revenue would support education, childcare, and other public
          investments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tax rate", value: "9.9%", sub: "on income over $1M" },
          { label: "Income threshold", value: "$1M", sub: "WA taxable income" },
          { label: "Effective date", value: "Jan 1, 2028", sub: "first tax year" },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm text-center"
          >
            <div className="text-2xl font-bold text-primary-600">{value}</div>
            <div className="text-sm font-medium text-secondary-800 mt-1">{label}</div>
            <div className="text-xs text-secondary-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-secondary-900 mb-1">
          Estimated annual tax by income
        </h3>
        <p className="text-sm text-secondary-500 mb-4">
          Tax owed under SB 6346 for a single WA resident, 2028
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={taxData}
            margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="income"
              tickFormatter={(v) => fmt(v)}
              tick={{ fontSize: 12, fill: "#64748B" }}
            />
            <YAxis
              tickFormatter={(v) => fmt(v)}
              tick={{ fontSize: 12, fill: "#64748B" }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={THRESHOLD}
              stroke="#94A3B8"
              strokeDasharray="4 4"
              label={{ value: "$1M threshold", position: "top", fontSize: 11, fill: "#64748B" }}
            />
            <Line
              type="monotone"
              dataKey="taxOwed"
              stroke="#319795"
              strokeWidth={2}
              dot={false}
              name="Tax owed"
            />
          </LineChart>
        </ResponsiveContainer>
        <ChartWatermark />
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          How is it calculated?
        </h3>
        <div className="bg-secondary-50 rounded-lg p-4 font-mono text-sm text-secondary-800">
          Tax owed = 9.9% × max(0, WA taxable income − $1,000,000)
        </div>
        <div className="mt-4 space-y-2 text-sm text-secondary-700">
          <p>
            <strong>Example 1:</strong> $800,000 income → $0 tax (below
            threshold)
          </p>
          <p>
            <strong>Example 2:</strong> $1,500,000 income → 9.9% × $500,000 ={" "}
            <strong>$49,500</strong> tax
          </p>
          <p>
            <strong>Example 3:</strong> $3,000,000 income → 9.9% × $2,000,000
            = <strong>$198,000</strong> tax
          </p>
        </div>
      </div>
    </div>
  );
}
