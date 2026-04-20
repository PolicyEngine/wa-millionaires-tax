import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const GA_ID = 'G-2YHG89FY0N';
const TOOL_NAME = 'wa-millionaires-tax';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const SITE_URL = 'https://policyengine.org/us/wa-millionaires-tax';
const OG_IMAGE_URL = 'https://policyengine.org/images/logos/policyengine/profile/white_bg_color_logo.png';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2C7A7B',
};

export const metadata: Metadata = {
  title: {
    default: "WA Millionaires' Tax Calculator | PolicyEngine",
    template: "%s | WA Millionaires' Tax Calculator",
  },
  description:
    "Calculate your personal tax impact under Washington State SB 6346, the Millionaires' Tax — a 9.9% surtax on household income over $1 million. Free calculator by PolicyEngine.",
  keywords: [
    'Washington millionaires tax',
    'WA SB 6346',
    'Washington State tax calculator',
    'millionaires tax calculator',
    'capital gains tax Washington',
    'PolicyEngine',
    'tax impact calculator',
    'Washington income tax',
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "WA Millionaires' Tax Calculator | PolicyEngine",
    description:
      "Calculate your personal tax impact under Washington State SB 6346, the Millionaires' Tax — a 9.9% surtax on household income over $1 million.",
    url: SITE_URL,
    siteName: 'PolicyEngine',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "PolicyEngine - WA Millionaires' Tax Calculator",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@PolicyEngine',
    creator: '@PolicyEngine',
    title: "WA Millionaires' Tax Calculator | PolicyEngine",
    description:
      "Calculate your personal tax impact under Washington State SB 6346, the Millionaires' Tax.",
    images: [OG_IMAGE_URL],
  },
  icons: {
    icon: '/us/wa-millionaires-tax/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: "WA Millionaires' Tax Calculator",
  description:
    "Calculate your personal tax impact under Washington State SB 6346, the Millionaires' Tax — a 9.9% surtax on household income over $1 million.",
  url: SITE_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'PolicyEngine',
    url: 'https://policyengine.org',
    logo: OG_IMAGE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { tool_name: '${TOOL_NAME}' });
          `}
        </Script>
        <Script id="engagement-tracking" strategy="afterInteractive">
          {`
            (function() {
              var TOOL_NAME = '${TOOL_NAME}';
              if (typeof window === 'undefined' || !window.gtag) return;

              var scrollFired = {};
              window.addEventListener('scroll', function() {
                var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (docHeight <= 0) return;
                var pct = Math.floor((window.scrollY / docHeight) * 100);
                [25, 50, 75, 100].forEach(function(m) {
                  if (pct >= m && !scrollFired[m]) {
                    scrollFired[m] = true;
                    window.gtag('event', 'scroll_depth', { percent: m, tool_name: TOOL_NAME });
                  }
                });
              }, { passive: true });

              [30, 60, 120, 300].forEach(function(sec) {
                setTimeout(function() {
                  if (document.visibilityState !== 'hidden') {
                    window.gtag('event', 'time_on_tool', { seconds: sec, tool_name: TOOL_NAME });
                  }
                }, sec * 1000);
              });

              document.addEventListener('click', function(e) {
                var link = e.target && e.target.closest ? e.target.closest('a') : null;
                if (!link || !link.href) return;
                try {
                  var url = new URL(link.href, window.location.origin);
                  if (url.hostname && url.hostname !== window.location.hostname) {
                    window.gtag('event', 'outbound_click', {
                      url: link.href,
                      target_hostname: url.hostname,
                      tool_name: TOOL_NAME
                    });
                  }
                } catch (err) {}
              });
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
