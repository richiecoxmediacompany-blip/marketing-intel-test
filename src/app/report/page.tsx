"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";

interface Product {
  name: string;
  description: string;
}

interface Competitor {
  name: string;
  description: string;
  website?: string;
}

interface NewsItem {
  title: string;
  summary: string;
  date?: string;
}

interface CompanyReport {
  companyName: string;
  website?: string;
  overview: string;
  businessModel: string;
  targetMarket: string;
  productsServices: Product[];
  competitors: Competitor[];
  recentNews: NewsItem[];
  marketPosition: {
    category: string;
    description: string;
  };
  keyMetrics?: {
    founded?: string;
    headquarters?: string;
    employeeCount?: string;
    fundingOrRevenue?: string;
  };
}

function LoadingState({ status }: { status: string }) {
  const stages = [
    "Initializing research...",
    "Searching the web...",
    "Analyzing competitors...",
    "Evaluating market position...",
    "Compiling report...",
  ];

  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        </div>
        <p className="text-lg font-medium text-slate-900">{status}</p>
        <p className="mt-2 text-sm text-slate-500">{stages[stageIndex]}</p>
        <div className="mt-6 space-y-3">
          <div className="skeleton h-3 w-full"></div>
          <div className="skeleton h-3 w-4/5"></div>
          <div className="skeleton h-3 w-3/5"></div>
        </div>
      </div>
    </div>
  );
}

function MarketPositionBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    leader: "bg-green-100 text-green-800 border-green-200",
    challenger: "bg-blue-100 text-blue-800 border-blue-200",
    niche: "bg-purple-100 text-purple-800 border-purple-200",
    emerging: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const colorClass = colors[category.toLowerCase()] || colors.niche;
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}
    >
      {label}
    </span>
  );
}

function ReportSection({
  title,
  icon,
  children,
  delay,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <section
      className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm fade-in fade-in-delay-${delay}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ReportView({ report }: { report: CompanyReport }) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {report.companyName}
            </h1>
            {report.website && (
              <p className="mt-1 text-sm text-blue-600">{report.website}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <MarketPositionBadge
              category={report.marketPosition?.category || "niche"}
            />
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {report.keyMetrics && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {report.keyMetrics.founded && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Founded
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.keyMetrics.founded}
                </p>
              </div>
            )}
            {report.keyMetrics.headquarters && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Headquarters
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.keyMetrics.headquarters}
                </p>
              </div>
            )}
            {report.keyMetrics.employeeCount && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Employees
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.keyMetrics.employeeCount}
                </p>
              </div>
            )}
            {report.keyMetrics.fundingOrRevenue && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Funding / Revenue
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.keyMetrics.fundingOrRevenue}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overview */}
      <ReportSection
        title="Company Overview"
        icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        delay={1}
      >
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
          {report.overview}
        </p>
      </ReportSection>

      {/* Business Model */}
      <ReportSection
        title="Business Model"
        icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        delay={2}
      >
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
          {report.businessModel}
        </p>
      </ReportSection>

      {/* Target Market */}
      <ReportSection
        title="Target Market"
        icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        delay={3}
      >
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
          {report.targetMarket}
        </p>
      </ReportSection>

      {/* Products & Services */}
      <ReportSection
        title="Products & Services"
        icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        delay={4}
      >
        <div className="grid gap-3">
          {report.productsServices?.map((product, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-slate-900">{product.name}</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Competitors */}
      <ReportSection
        title="Competitors"
        icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        delay={5}
      >
        <div className="grid gap-3">
          {report.competitors?.map((competitor, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {competitor.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">
                    {competitor.name}
                  </p>
                  {competitor.website && (
                    <span className="text-xs text-slate-400 truncate">
                      {competitor.website}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  {competitor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Recent News */}
      <ReportSection
        title="Recent News & Developments"
        icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"
        delay={6}
      >
        <div className="space-y-4">
          {report.recentNews?.map((news, i) => (
            <div key={i} className="border-l-2 border-blue-200 pl-4">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{news.title}</p>
              </div>
              {news.date && (
                <p className="text-xs text-slate-400 mt-0.5">{news.date}</p>
              )}
              <p className="text-sm text-slate-600 mt-1">{news.summary}</p>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Market Position */}
      <ReportSection
        title="Market Position"
        icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        delay={7}
      >
        <div className="flex items-start gap-3">
          <MarketPositionBadge
            category={report.marketPosition?.category || "niche"}
          />
          <p className="text-slate-700 leading-relaxed">
            {report.marketPosition?.description}
          </p>
        </div>
      </ReportSection>
    </div>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const company = searchParams.get("company");

  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Starting research...");

  const fetchReport = useCallback(async (companyName: string) => {
    setLoading(true);
    setError(null);
    setStatus("Starting research...");

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Research request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "status") {
              setStatus(data.message);
            } else if (data.type === "report") {
              setReport(data.data);
              setLoading(false);
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!company) {
      router.push("/");
      return;
    }
    fetchReport(company);
  }, [company, router, fetchReport]);

  if (!company) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Marketing Intel
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            New Search
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        {loading && <LoadingState status={status} />}

        {error && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Research Failed
              </h2>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => fetchReport(company)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  New Search
                </Link>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && report && <ReportView report={report} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-slate-400">
          Powered by Claude AI with real-time web research
        </div>
      </footer>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
