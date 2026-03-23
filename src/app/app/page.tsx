"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ReportRow = {
  totalKgCo2e: number | null;
  updatedAt?: string;
};

const FACTS: Array<{ text: string; source: string }> = [
  {
    text: "The carbon footprint to produce and deliver an iPhone to the end user is 72 kg CO2, equivalent to driving a car for 366 km. This increases to 394 kg CO2 and 2000 km for a MacBook Pro.",
    source: "https://www.co2everything.com/co2e-of/apple-iphone",
  },
  {
    text: "On average, it takes 1,500 liters of water to make a single pair of jeans (accounting for production and delivery to store).",
    source: "https://www.unep.org/news-and-stories/story/puttingbrakes-fast-fashion",
  },
  {
    text: "Recycling one tonne of paper saves 17 trees from being cut down.",
    source: "https://www.unep.org/explore-topics/resource-efficiency/what-we-do/cities/solid-waste-management",
  },
  {
    text: "It can take a glass bottle more than a million years to decompose in the environment (possibly even more if it is in a landfill). This means glass used 5000 years ago may still be present in the environment.",
    source: "https://kpwb.org/environmental-fun-facts-2/",
  },
  {
    text: "91% of all plastic that has ever been made is not recycled. Considering plastic takes 400 years to decompose, it will be many generations until it ceases to exist.",
    source: "https://earth.org/how-does-food-waste-affect-the-environment/",
  },
  {
    text: "A third of food intended for human consumption, around 1.3 billion tons, is wasted or lost. This is enough to feed 3 billion people. Food waste and loss account for approximately one-quarter of greenhouse gas emissions annually.",
    source: "https://earth.org/how-does-food-waste-affect-the-environment/",
  },
  {
    text: "Water withdrawal from global usage of AI is projected to reach 4 to 7 billion cubic meters in 2027 (roughly 2.5 million Olympic swimming pools). This equates to the total annual water withdrawal from Denmark by 4 to 6 times.",
    source: "https://arxiv.org/pdf/2304.03271",
  },
  {
    text: "Residential and commercial buildings consume nearly 60 per cent of all electricity globally. As they continue to draw on coal, oil, and natural gas for heating and cooling, they emit significant greenhouse gas emissions.",
    source: "https://www.un.org/en/climatechange/science/causes-effects-climate-change",
  },
  {
    text: "Humans send over 2 million tonnes of waste to landfills each year. There are 7.9 billion people on earth, meaning that on average each person will send 3,950 tonnes of waste to landfills each year. That is equivalent to 790 elephants.",
    source: "https://datatopics.worldbank.org/what-a-waste/",
  },
  {
    text: "By weight, there will be more plastic in our oceans than fish by 2050. It is estimated there are around 3,500,000,000,000 fish currently in our oceans.",
    source: "https://www.wwf.org.uk/articles/will-there-be-more-plastic-fish-sea",
  },
  {
    text: "The last decade was the hottest in the past 125,000 years, and right now there is the most carbon dioxide in the atmosphere in the past 2 million years.",
    source: "https://earth.org/data_visualization/11-interesting-facts-about-climate-change/",
  },
  {
    text: "Nearly half of the world's population, 3.6 million people, are in areas that are highly vulnerable to climate change impacts.",
    source: "https://www.un.org/en/climatechange/science/key-findings",
  },
  {
    text: "Transport has one of the largest areas for improvement in terms of carbon emissions: without action, carbon emissions in the transport sector would increase by 65%, but with action could decrease by as much as 68%.",
    source: "https://www.un.org/en/climatechange/science/causes-effects-climate-change",
  },
];

const RESOURCE_LINKS: Array<{ label: string; href: string }> = [
  {
    label: "Strategies for carbon footprint reduction in research and higher education",
    href: "https://environmentalphysio.com/2024/11/06/strategies-for-carbon-footprint-reduction-in-research-and-higher-education/",
  },
  {
    label: "How to minimise your carbon footprint in academic work",
    href: "https://friendlyturtle.com/blogs/blog/how-to-minimise-your-carbon-footprint-in-academic-work?srsltid=AfmBOordARphAYJ1sDvdVWSyTpHFTYz6Jk5tSkTK1LxYNI8Z3mWMd1V5",
  },
  {
    label: "Ten simple rules to make your computing more environmentally sustainable",
    href: "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1009324",
  },
  {
    label: "A study highlighting impact and reduction of international conferences",
    href: "https://www.nature.com/articles/s44168-024-00184-4",
  },
  {
    label: "Decarbonising the international research projects",
    href: "https://www.sciencedirect.com/science/article/pii/S0959652622027627",
  },
  {
    label: "Case study on carbon reduction in academia in Mexico",
    href: "https://www.mdpi.com/2071-1050/15/12/9745",
  },
];

export default function AppHomePage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : { reports: [] }))
      .then((data) => setReports(data.reports ?? []))
      .catch(() => setReports([]));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((idx) => (idx + 1) % FACTS.length);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const totalKg = reports.reduce((sum, r) => sum + (r.totalKgCo2e ?? 0), 0);
    const avgKg = totalReports > 0 ? totalKg / totalReports : 0;
    const latestReport = reports
      .filter((r) => !!r.updatedAt)
      .sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime())[0];
    return { totalReports, totalKg, avgKg, latestUpdatedAt: latestReport?.updatedAt ?? null };
  }, [reports]);

  const activeFact = FACTS[factIndex];
  const normAvg = Math.min(Math.round((stats.avgKg / 1000) * 100), 100);
  const normTotal = Math.min(Math.round((stats.totalKg / 10000) * 100), 100);

  const previousFact = () => {
    setFactIndex((idx) => (idx - 1 + FACTS.length) % FACTS.length);
  };

  const nextFact = () => {
    setFactIndex((idx) => (idx + 1) % FACTS.length);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-fr">
        <article className="rounded-3xl border border-trace-sand/60 bg-gradient-to-br from-white via-trace-cream/35 to-white p-6 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal" />
          <h2 className="text-2xl font-semibold text-trace-forest mb-2">What is TRACE?</h2>
          <p className="text-sm text-trace-stone mb-4">
            The Tool for Research Accounting of Carbon and Emissions is a research ready carbon calculator that can quantify emissions of a project and provide
            advice on methods of reducing the possible impact.
          </p>
          <h3 className="text-lg font-semibold text-trace-forest mb-2">What is the goal?</h3>
          <p className="text-sm text-trace-stone mb-4">
            Academic research can be a major contributor to carbon emissions, a study has found that, the annual footprint of PhD project can equate to{" "}
            <a
              href="https://www.sciencedirect.com/science/article/pii/S1470160X13002306"
              target="_blank"
              rel="noreferrer"
              className="text-trace-teal underline underline-offset-2"
            >
              32% of the total annual footprint of an average citizen
            </a>
            ! TRACE has been created to help reduce this impact by bringing awareness to students of the possible impact that research projects can have.
          </p>
          <h3 className="text-lg font-semibold text-trace-forest mb-2">How to use TRACE?</h3>
          <ol className="list-decimal pl-5 text-sm text-trace-stone space-y-1.5">
            <li>Navigate to the dashboard to name and create a new project.</li>
            <li>You will be asked to complete a set of questions so we can assess the projected emissions of the project.</li>
            <li>TRACE will then calculate and give a summary of your results and provide advice on possible reduction methods.</li>
            <li>
              You can also export your results in your needed format for future reference (your project will also be saved to your dashboard where you can
              review and edit it)
            </li>
          </ol>
        </article>

        <article className="rounded-3xl border border-trace-sand/60 bg-gradient-to-br from-white via-trace-mint/25 to-trace-cream/40 text-trace-forest p-6 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trace-teal via-trace-mint to-trace-forest" />
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-trace-mint/30 blur-xl" />
          <h2 className="text-2xl font-semibold mb-1 relative z-10">Your Impact Signal</h2>
          <p className="text-sm text-trace-stone mb-5 relative z-10">
            A visual snapshot from your saved TRACE reports.
          </p>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/85 border border-trace-sand/60 p-4 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <defs>
                    <linearGradient id="impactRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#0d3b2c" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#e7e1d4" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="url(#impactRingGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(8, (normTotal / 100) * 302)} 302`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[11px] text-trace-stone">Total</p>
                  <p className="text-lg font-semibold text-trace-forest">{Math.round(stats.totalKg).toLocaleString()}</p>
                  <p className="text-[11px] text-trace-stone">kg CO2e</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-trace-stone">Portfolio footprint scale</p>
            </div>
            <div className="rounded-2xl bg-white/85 border border-trace-sand/60 p-4">
              <p className="text-xs text-trace-stone mb-2">Intensity bars</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Average/report</span>
                    <span>{Math.round(stats.avgKg).toLocaleString()} kg</span>
                  </div>
                  <div className="h-2 rounded-full bg-trace-sand/40 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-trace-teal to-trace-forest" style={{ width: `${normAvg}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Portfolio total</span>
                    <span>{Math.round(stats.totalKg).toLocaleString()} kg</span>
                  </div>
                  <div className="h-2 rounded-full bg-trace-sand/40 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-trace-forest to-trace-mint" style={{ width: `${normTotal}%` }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-trace-sand/70 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-trace-cream/50 px-2 py-2">
                    <p className="text-[11px] text-trace-stone">Reports</p>
                    <p className="text-lg font-semibold">{stats.totalReports}</p>
                  </div>
                  <div className="rounded-xl bg-trace-cream/50 px-2 py-2">
                    <p className="text-[11px] text-trace-stone">Latest</p>
                    <p className="text-xs font-semibold leading-5">
                      {stats.latestUpdatedAt ? new Date(stats.latestUpdatedAt).toLocaleDateString() : "No reports"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-trace-sand/60 bg-gradient-to-br from-white via-trace-cream/35 to-white p-6 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal" />
          <h2 className="text-2xl font-semibold text-trace-forest mb-4">Additional Links and Resources</h2>
          <div className="space-y-2">
            {RESOURCE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start justify-between gap-3 rounded-xl border border-trace-sand/60 bg-trace-cream/35 px-3 py-2.5 hover:bg-trace-mint/20 transition-colors"
              >
                <span className="text-sm text-trace-stone group-hover:text-trace-forest">{link.label}</span>
                <ExternalLink className="w-4 h-4 text-trace-teal flex-shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-trace-sand/60 bg-gradient-to-br from-white via-trace-cream/35 to-white p-6 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal" />
          <h2 className="text-2xl font-semibold text-trace-forest mb-4">Fun Facts</h2>
          <div className="rounded-2xl bg-gradient-to-br from-trace-forest via-trace-mint to-trace-teal min-h-[260px] p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center rounded-full bg-white/20 text-white px-3 py-1 text-xs font-medium">
                Fact {factIndex + 1} of {FACTS.length}
              </span>
            </div>

            <div className="flex-1 flex items-center py-4">
              <p className="text-base sm:text-lg text-white font-semibold leading-7">{activeFact.text}</p>
            </div>

            <div className="pt-3 border-t border-white/25 flex items-center justify-between gap-3">
              <a
                href={activeFact.source}
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm text-white underline underline-offset-2 break-all"
              >
                Source link
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={previousFact}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Previous fact"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextFact}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Next fact"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

