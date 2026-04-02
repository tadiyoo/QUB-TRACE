import type { Metadata } from "next";
import TeamBResponsesSection from "@/components/dashboard/TeamBResponsesSection";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRACE Dashboard — Tool for Research Accounting of Carbon & Emissions",
  description:
    "PhD-ready carbon calculator dashboard. Understand, reduce, and report your research footprint.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f0e8] text-[#0d3b2c] antialiased" style={{ fontFamily: "system-ui, sans-serif" }}>
        <TeamBResponsesSection />
        {children}
      </body>
    </html>
  );
}
