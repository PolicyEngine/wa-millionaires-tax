"use client";

import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary-800 to-primary-600 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a
          href="https://policyengine.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <img
            src={`${BASE_PATH}/policyengine-logo-white.png`}
            alt="PolicyEngine"
            height={24}
            className="h-6"
          />
        </a>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-white/90">
          <a
            href="https://policyengine.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            PolicyEngine
          </a>
          <a
            href="https://policyengine.org/us/research"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Research
          </a>
          <a
            href="https://policyengine.org/us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            Model the reform
          </a>
        </nav>

        <button
          className="sm:hidden text-white p-1"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden bg-primary-800 border-t border-white/10 px-4 py-3 flex flex-col gap-3 text-sm text-white/90">
          <a href="https://policyengine.org" target="_blank" rel="noopener noreferrer">
            PolicyEngine
          </a>
          <a
            href="https://policyengine.org/us/research"
            target="_blank"
            rel="noopener noreferrer"
          >
            Research
          </a>
          <a href="https://policyengine.org/us" target="_blank" rel="noopener noreferrer">
            Model the reform
          </a>
        </div>
      )}
    </header>
  );
}
