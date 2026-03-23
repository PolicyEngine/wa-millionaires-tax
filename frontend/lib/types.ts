export interface HouseholdRequest {
  age_head: number;
  age_spouse: number | null;
  dependent_ages: number[];
  income: number;
  year: number;
  max_earnings: number;
  state_code: string;
}

export interface BenefitAtIncome {
  baseline: number;
  reform: number;
  difference: number;
}

export interface HouseholdImpactResponse {
  income_range: number[];
  net_income_change: number[];
  benefit_at_income: BenefitAtIncome;
  x_axis_max: number;
}

export interface IncomeBracket {
  bracket: string;
  beneficiaries: number;
  total_cost: number;
  avg_benefit: number;
}

export interface BudgetImpact {
  budgetary_impact: number;
  tax_revenue_impact: number;
  benefit_spending_impact: number;
  households: number;
}

export interface DecileImpact {
  average: Record<string, number>;
  relative: Record<string, number>;
}

export interface IntraDecileAll {
  "Gain more than 5%": number;
  "Gain less than 5%": number;
  "No change": number;
  "Lose less than 5%": number;
  "Lose more than 5%": number;
}

export interface IntraDecileDeciles {
  "Gain more than 5%": number[];
  "Gain less than 5%": number[];
  "No change": number[];
  "Lose less than 5%": number[];
  "Lose more than 5%": number[];
}

export interface IntraDecile {
  all: IntraDecileAll;
  deciles: IntraDecileDeciles;
}

export interface AggregateImpactResponse {
  budget: BudgetImpact;
  decile: DecileImpact;
  intra_decile: IntraDecile;
  total_cost: number;
  beneficiaries: number;
  avg_benefit: number;
  winners: number;
  losers: number;
  winners_rate: number;
  losers_rate: number;
  poverty_baseline_rate: number;
  poverty_reform_rate: number;
  poverty_rate_change: number;
  poverty_percent_change: number;
  child_poverty_baseline_rate: number;
  child_poverty_reform_rate: number;
  child_poverty_rate_change: number;
  child_poverty_percent_change: number;
  by_income_bracket: IncomeBracket[];
}
