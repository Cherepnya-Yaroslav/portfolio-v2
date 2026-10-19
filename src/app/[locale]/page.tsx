import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/content/portfolio";
import { pixelCopy } from "@/content/pixel-portfolio";
import { PixelHero } from "@/components/portfolio/pixel-hero";
import { TechnologySection } from "@/components/portfolio/technology-section";
import { Testimonials } from "@/components/portfolio/testimonials";
import { PortfolioLoading } from "@/components/portfolio/portfolio-loading";
import {
  Projects,
  ProjectsLoading,
  Contact,
} from "@/components/portfolio/sections";
import "./portfolio.css";

type PageProps = {
  params: Promise<{ locale: string }>;
};

function getMetadataBase() {
  const siteUrl = process.env.SITE_URL?.trim();
  if (!siteUrl) return undefined;
  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { title, description } = pixelCopy[locale].meta;
  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ru: "/ru", en: "/en", "x-default": "/ru" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? "en_US" : "ru_RU",
    },
  };
}

export default async function Portfolio({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="portfolio-site">
      <PortfolioLoading locale={locale}>
        <a className="skip-link" href="#main">
          {copy[locale].skip}
        </a>
        <main id="main">
          <PixelHero locale={locale} />
          <TechnologySection locale={locale} />
          <Suspense fallback={<ProjectsLoading locale={locale} />}>
            <Projects locale={locale} />
          </Suspense>
          <Testimonials locale={locale} />
        </main>
        <Contact locale={locale} />
      </PortfolioLoading>
    </div>
  );
}
