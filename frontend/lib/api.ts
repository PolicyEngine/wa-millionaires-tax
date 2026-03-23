import { HouseholdRequest, HouseholdImpactResponse } from "./types";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const api = {
  async calculateHouseholdImpact(
    request: HouseholdRequest
  ): Promise<HouseholdImpactResponse> {
    const response = await fetch(`${BASE_PATH}/api/household-impact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      let message = `API error ${response.status}`;
      try {
        const body = await response.json();
        if (body.detail) message = body.detail;
      } catch {
        // ignore
      }
      throw new Error(message);
    }
    return response.json();
  },
};
