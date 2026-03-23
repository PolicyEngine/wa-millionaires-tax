import { useQuery } from "@tanstack/react-query";
import parseCSV from "@/lib/parseCSV";
import { AggregateImpactResponse } from "@/lib/types";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

async function fetchCSV(
  filename: string
): Promise<Record<string, string | number>[]> {
  const res = await fetch(`${BASE_PATH}/data/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  const text = await res.text();
  return parseCSV(text);
}

async function buildAggregateResponse(
  year: number
): Promise<AggregateImpactResponse> {
  const [distributional, metrics, winnersLosers, incomeBrackets] =
    await Promise.all([
      fetchCSV("distributional_impact.csv"),
      fetchCSV("metrics.csv"),
      fetchCSV("winners_losers.csv"),
      fetchCSV("income_brackets.csv"),
    ]);

  const metricsForYear = metrics.filter((r) => r.year === year);
  const metric = (key: string) =>
    (metricsForYear.find((r) => r.metric === key)?.value as number) ?? 0;

  const distForYear = distributional.filter((r) => r.year === year);
  const decileAverage: Record<string, number> = {};
  const decileRelative: Record<string, number> = {};
  distForYear.forEach((r) => {
    decileAverage[String(r.decile)] = r.average_change as number;
    decileRelative[String(r.decile)] = r.relative_change as number;
  });

  const wlForYear = winnersLosers.filter((r) => r.year === year);
  const wlAll = wlForYear.find((r) => r.decile === "All") ?? {};
  const wlDeciles = Array.from({ length: 10 }, (_, i) =>
    wlForYear.find((r) => r.decile === String(i + 1)) ?? {}
  );

  const intraLabels = [
    "Gain more than 5%",
    "Gain less than 5%",
    "No change",
    "Lose less than 5%",
    "Lose more than 5%",
  ] as const;
  const labelToKey: Record<string, string> = {
    "Gain more than 5%": "gain_more_5pct",
    "Gain less than 5%": "gain_less_5pct",
    "No change": "no_change",
    "Lose less than 5%": "lose_less_5pct",
    "Lose more than 5%": "lose_more_5pct",
  };

  const intraAll = {} as AggregateImpactResponse["intra_decile"]["all"];
  const intraDeciles =
    {} as AggregateImpactResponse["intra_decile"]["deciles"];
  intraLabels.forEach((label) => {
    const k = labelToKey[label];
    intraAll[label] = (wlAll[k] as number) ?? 0;
    intraDeciles[label] = wlDeciles.map((d) => (d[k] as number) ?? 0);
  });

  const bracketsForYear = incomeBrackets.filter((r) => r.year === year);
  const byIncomeBracket = bracketsForYear.map((r) => ({
    bracket: r.bracket as string,
    beneficiaries: r.beneficiaries as number,
    total_cost: r.total_cost as number,
    avg_benefit: r.avg_benefit as number,
  }));

  return {
    budget: {
      budgetary_impact: metric("budgetary_impact"),
      tax_revenue_impact: metric("tax_revenue_impact"),
      benefit_spending_impact: metric("benefit_spending_impact"),
      households: metric("households"),
    },
    decile: { average: decileAverage, relative: decileRelative },
    intra_decile: { all: intraAll, deciles: intraDeciles },
    total_cost: metric("total_cost"),
    beneficiaries: metric("beneficiaries"),
    avg_benefit: metric("avg_benefit"),
    winners: metric("winners"),
    losers: metric("losers"),
    winners_rate: metric("winners_rate"),
    losers_rate: metric("losers_rate"),
    poverty_baseline_rate: metric("poverty_baseline_rate"),
    poverty_reform_rate: metric("poverty_reform_rate"),
    poverty_rate_change: metric("poverty_rate_change"),
    poverty_percent_change: metric("poverty_percent_change"),
    child_poverty_baseline_rate: metric("child_poverty_baseline_rate"),
    child_poverty_reform_rate: metric("child_poverty_reform_rate"),
    child_poverty_rate_change: metric("child_poverty_rate_change"),
    child_poverty_percent_change: metric("child_poverty_percent_change"),
    by_income_bracket: byIncomeBracket,
  };
}

export function useAggregateImpact(enabled: boolean, year: number = 2028) {
  return useQuery<AggregateImpactResponse, Error>({
    queryKey: ["aggregateImpact", year],
    queryFn: () => buildAggregateResponse(year),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}
