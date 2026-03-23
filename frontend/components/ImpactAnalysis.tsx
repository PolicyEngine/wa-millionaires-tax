"use client";

import { useState, useCallback } from "react";
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
import { useHouseholdImpact } from "@/hooks/useHouseholdImpact";
import { HouseholdRequest } from "@/lib/types";
import ChartWatermark from "./ChartWatermark";

function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function fmtAxis(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

function ImpactCard({
  difference,
  income,
}: {
  difference: number;
  income: number;
}) {
  const pct = income > 0 ? ((difference / income) * 100).toFixed(1) : "0.0";
  const isNegative = difference < -1;
  const isNeutral = Math.abs(difference) <= 1;

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${
        isNeutral
          ? "bg-secondary-50 border-secondary-200"
          : "bg-white border-secondary-200"
      }`}
    >
      <div className="text-sm font-medium text-secondary-600 mb-1">
        Annual change in net income
      </div>
      <div
        className={`text-3xl font-bold ${
          isNeutral
            ? "text-secondary-700"
            : isNegative
            ? "text-secondary-800"
            : "text-primary-600"
        }`}
      >
        {isNeutral ? "No change" : fmt(difference)}
      </div>
      {!isNeutral && (
        <div className="text-sm text-secondary-500 mt-1">
          {isNegative ? "−" : "+"}
          {Math.abs(parseFloat(pct))}% of household income
        </div>
      )}
      {isNegative && (
        <div className="mt-3 text-sm text-secondary-600">
          Under SB 6346, a WA household earning {fmt(income)} would pay an
          estimated {fmt(Math.abs(difference))} more per year in state income
          tax.
        </div>
      )}
      {isNeutral && (
        <div className="mt-3 text-sm text-secondary-500">
          Households earning below $1M are not affected by SB 6346.
        </div>
      )}
    </div>
  );
}

interface ChartPoint {
  income: number;
  change: number;
}

function ImpactChart({
  data,
  userIncome,
}: {
  data: ChartPoint[];
  userIncome: number;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-secondary-600 mb-3">
        Net income change across income levels
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="income"
            tickFormatter={fmtAxis}
            tick={{ fontSize: 11, fill: "#64748B" }}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fontSize: 11, fill: "#64748B" }}
            width={70}
          />
          <Tooltip
            formatter={(v: number) => [fmt(v), "Net income change"]}
            labelFormatter={(v: number) => `Income: ${fmt(v)}`}
          />
          <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1} />
          <ReferenceLine
            x={userIncome}
            stroke="#319795"
            strokeDasharray="4 4"
            label={{
              value: "Your income",
              position: "top",
              fontSize: 11,
              fill: "#319795",
            }}
          />
          <Line
            type="monotone"
            dataKey="change"
            stroke="#319795"
            strokeWidth={2}
            dot={false}
            name="Change"
          />
        </LineChart>
      </ResponsiveContainer>
      <ChartWatermark />
    </div>
  );
}

export default function ImpactAnalysis() {
  const [income, setIncome] = useState("1500000");
  const [ageHead, setAgeHead] = useState("40");
  const [married, setMarried] = useState(false);
  const [ageSpouse, setAgeSpouse] = useState("38");
  const [dependents, setDependents] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [request, setRequest] = useState<HouseholdRequest | null>(null);

  const addDependent = () => setDependents((d) => [...d, "10"]);
  const removeDependent = (i: number) =>
    setDependents((d) => d.filter((_, j) => j !== i));
  const updateDependent = (i: number, v: string) =>
    setDependents((d) => d.map((x, j) => (j === i ? v : x)));

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const incomeVal = parseFloat(income.replace(/,/g, "")) || 0;
      const newRequest: HouseholdRequest = {
        age_head: parseInt(ageHead) || 40,
        age_spouse: married ? parseInt(ageSpouse) || 38 : null,
        dependent_ages: dependents.map((d) => parseInt(d) || 10),
        income: incomeVal,
        year: 2028,
        max_earnings: Math.max(3_000_000, incomeVal * 1.5),
        state_code: "WA",
      };
      setRequest(newRequest);
      setSubmitted(true);
    },
    [income, ageHead, married, ageSpouse, dependents]
  );

  const { data, isLoading, error } = useHouseholdImpact(request, submitted);

  const chartData: ChartPoint[] =
    data?.income_range.map((inc, i) => ({
      income: Math.round(inc),
      change: Math.round(data.net_income_change[i]),
    })) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900 mb-5">
            Your household
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Annual household income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="1500000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Your age
              </label>
              <input
                type="number"
                min={18}
                max={100}
                value={ageHead}
                onChange={(e) => setAgeHead(e.target.value)}
                className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={married}
                  onChange={(e) => setMarried(e.target.checked)}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-400"
                />
                <span className="text-sm font-medium text-secondary-700">
                  Married filing jointly
                </span>
              </label>
            </div>

            {married && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Spouse age
                </label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={ageSpouse}
                  onChange={(e) => setAgeSpouse(e.target.value)}
                  className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary-700">
                  Dependents
                </span>
                <button
                  type="button"
                  onClick={addDependent}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add dependent
                </button>
              </div>
              {dependents.map((age, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min={0}
                    max={26}
                    value={age}
                    onChange={(e) => updateDependent(i, e.target.value)}
                    placeholder="Age"
                    className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeDependent(i)}
                    className="text-secondary-400 hover:text-secondary-600 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Calculate impact
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!submitted && (
          <div className="bg-secondary-50 rounded-xl border border-secondary-200 p-8 text-center text-secondary-500 h-full flex flex-col items-center justify-center gap-3">
            <svg
              className="w-10 h-10 text-secondary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">
              Enter your household details and click &ldquo;Calculate
              impact&rdquo; to see how SB 6346 affects you.
            </p>
          </div>
        )}

        {submitted && isLoading && <Spinner />}

        {submitted && error && (
          <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
            <div className="text-sm font-medium text-secondary-800 mb-2">
              Could not connect to the calculation backend
            </div>
            <div className="text-sm text-secondary-500">
              {error.message}
            </div>
            <p className="text-xs text-secondary-400 mt-3">
              Make sure the Python backend is running on port 8000 and try
              again.
            </p>
          </div>
        )}

        {submitted && data && (
          <>
            <ImpactCard
              difference={data.benefit_at_income.difference}
              income={parseFloat(income.replace(/,/g, "")) || 0}
            />
            <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm">
              <ImpactChart
                data={chartData}
                userIncome={parseFloat(income.replace(/,/g, "")) || 0}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
