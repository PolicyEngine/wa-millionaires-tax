"use client";

import { useState } from "react";
import PolicyOverview from "@/components/PolicyOverview";
import ImpactAnalysis from "@/components/ImpactAnalysis";
import AggregateImpact from "@/components/AggregateImpact";

const TABS = [
  { id: "policy", label: "Policy overview" },
  { id: "household", label: "Your household" },
  { id: "national", label: "National impact" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("policy");

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          WA Millionaires&rsquo; Tax Calculator
        </h1>
        <p className="text-secondary-600 text-lg">
          Estimate the impact of Washington State SB 6346 — a 9.9% surtax on
          household income over $1 million, effective January 1, 2028.
        </p>
      </div>

      <div className="border-b border-secondary-200 mb-8">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-secondary-500 hover:text-secondary-800 hover:border-secondary-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "policy" && <PolicyOverview />}
      {activeTab === "household" && <ImpactAnalysis />}
      {activeTab === "national" && <AggregateImpact />}
    </main>
  );
}
