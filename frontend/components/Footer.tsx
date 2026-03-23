const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Footer() {
  return (
    <footer className="bg-secondary-800 text-secondary-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <img
            src={`${BASE_PATH}/policyengine-logo-white.png`}
            alt="PolicyEngine"
            height={24}
            className="h-6 mb-3 opacity-80"
          />
          <p className="text-sm leading-relaxed">
            PolicyEngine computes the impact of public policy on people&apos;s
            lives using open-source microsimulation.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">About</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://policyengine.org/about"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                About us
              </a>
            </li>
            <li>
              <a
                href="https://policyengine.org/us/research"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Research
              </a>
            </li>
            <li>
              <a
                href="https://github.com/PolicyEngine"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://policyengine.org/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Donate
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">This tool</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/PolicyEngine/wa-millionaires-tax"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Source code
              </a>
            </li>
            <li>
              <a
                href="https://policyengine.org/us"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Model SB 6346 yourself
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-secondary-400">
        © {new Date().getFullYear()} PolicyEngine. Calculations are estimates
        and for informational purposes only.
      </div>
    </footer>
  );
}
