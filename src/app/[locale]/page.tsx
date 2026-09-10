import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { contacts, copy, isLocale, profile } from "@/content/portfolio";
import { getPublishedProjects } from "@/lib/projects/public";
import { ArrowIcon, Asterisk } from "@/components/icons";
import { LanguageSwitch } from "@/components/language-switch";
import { Motion } from "@/components/motion";
import { ProjectCarousel } from "@/components/project-carousel";
import { ProjectsRetry } from "@/components/projects-retry";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { title, description } = copy[locale].meta;
  return {
    title, description,
    alternates: { canonical: `/${locale}`, languages: { ru: "/ru", en: "/en", "x-default": "/ru" } },
    openGraph: { title, description, type: "website", locale: locale === "ru" ? "ru_RU" : "en_US", alternateLocale: locale === "ru" ? "en_US" : "ru_RU" },
  };
}

export default async function Portfolio({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const text = copy[locale];
  const { projects, source } = await getPublishedProjects();

  return <>
    <a className="skip-link" href="#main">{text.skip}</a>
    <Motion />
    <header className="site-header page-padding">
      <a href={`/${locale}`} className="wordmark" aria-label={profile.name[locale]}>ya<span>.</span></a>
      <nav className="main-nav" aria-label={locale === "ru" ? "Основная навигация" : "Main navigation"}>{Object.entries(text.nav).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <LanguageSwitch locale={locale} label={text.language} />
    </header>
    <main id="main">
      <section className="hero page-padding" id="hero" aria-labelledby="hero-title">
        <div className="hero-topline"><span>{text.portfolio}</span><span className="hero-discipline"><span className="tiny-dot" />WEB DEVELOPMENT</span></div>
        <h1 id="hero-title" className={`hero-title hero-title-${locale}`}>{profile.name[locale]}</h1>
        <div className="hero-portrait"><div className="portrait-parallax"><Image src={profile.portrait} alt={text.hero.alt} width={941} height={1672} priority sizes="(max-width: 700px) 95vw, (max-width: 1023px) 58vw, 48vw" className="portrait-image" /></div></div>
        <div className="hero-copy"><p className="hero-role">{text.developer}</p><h2>{text.hero.intro}<br /><span>{text.hero.ending}</span></h2><p className="hero-description">{text.hero.description}</p><a className="pill-button" href="#projects">{text.hero.cta}<span><ArrowIcon direction="down" /></span></a></div>
        <div className="hero-side"><Asterisk /><p>{text.hero.side}</p></div>
        <div className="hero-bottom"><span><span className="small-cross">+</span>{text.hero.scroll}</span><span className="hero-bottom-right">{profile.name[locale]} © 2026<ArrowIcon direction="down" /></span></div>
      </section>

      <section id="about" className="about-section page-padding section-space" aria-labelledby="about-title">
        <div className="section-intro" data-reveal><p className="eyebrow"><span>01 /</span>{text.about.eyebrow}</p><div className="about-copy"><h2 id="about-title">{text.about.start} <span className="muted">{text.about.middle}</span> {text.about.highlight} <span className="muted">{text.about.end}</span></h2></div></div>
        <div className="services-grid" data-reveal>
          <article className="service-card frontend-card"><div className="service-top"><span className="service-label">Frontend</span><span className="service-symbol" aria-hidden="true">↗</span></div><h3>{text.about.frontend}</h3><div className="frontend-art" aria-hidden="true"><div className="wireframe"><span /><span /><span /><div className="wireframe-layout"><i /><div><b /><b /><b /></div></div></div><span className="code-tag">&lt;/&gt;</span><span className="art-cursor">↖</span></div><p>{text.about.frontendBody}</p><div className="service-tech-list">{profile.frontendTechnologies.map((technology) => <span key={technology}>{technology}</span>)}</div></article>
          <article className="service-card fullstack-card"><div className="service-top"><span className="service-label">Fullstack</span><span className="service-symbol" aria-hidden="true">✳</span></div><h3>{text.about.fullstack}</h3><div className="fullstack-art" aria-hidden="true"><span>UI</span><i /><span>API</span><i /><span>DB</span></div><p>{text.about.fullstackBody}</p><div className="service-tech-list">{profile.fullstackTechnologies.map((technology) => <span key={technology}>{technology}</span>)}</div></article>
        </div>
      </section>

      <section id="projects" className="projects-section section-space" aria-labelledby="projects-title">
        <div className="projects-heading page-padding" data-reveal><div><p className="eyebrow"><span>02 /</span>{text.work.eyebrow}</p><h2 id="projects-title">{text.work.title}<br /><span>{text.work.accent}</span><span className="project-count">({source === "error" ? "—" : String(projects.length).padStart(2, "0")})</span></h2></div><p className="projects-note">{text.work.note}</p></div>
        {projects.length ? <ProjectCarousel projects={projects} locale={locale} text={text.work} /> : <div className="projects-empty page-padding"><p>{source === "error" ? (locale === "ru" ? "Не удалось загрузить проекты. Попробуйте чуть позже." : "Projects could not be loaded. Please try again shortly.") : (locale === "ru" ? "Новые проекты скоро появятся здесь." : "New projects will appear here soon.")}</p>{source === "error" && <ProjectsRetry locale={locale} />}</div>}
      </section>
    </main>

    <footer id="contact" className="contact-section page-padding" aria-labelledby="contact-title">
      <div className="contact-top" data-reveal><p className="eyebrow"><span>03 /</span>{text.footer.eyebrow}</p><Asterisk /></div>
      <div className="contact-heading" data-reveal><h2 id="contact-title">{text.footer.line1}<br /><span>{text.footer.line2}</span></h2><p>{text.footer.description}</p></div>
      <div className="contact-list">{contacts.map((contact, index) => {
        const inner = <><span className="contact-number">0{index + 1}</span><span className="contact-name">{contact.label}</span><span className="contact-value">{contact.value ?? contact.label}</span><ArrowIcon /></>;
        return <a key={contact.kind} href={contact.href} className="contact-row" rel={contact.kind === "email" ? undefined : "noopener noreferrer"} target={contact.kind === "email" ? undefined : "_blank"}>{inner}</a>;
      })}</div>
      <div className="footer-bottom"><a href="#hero" className="wordmark" aria-label={text.footer.top}>ya<span>.</span></a><span>© 2026 {profile.name[locale]}<span className="footer-divider">/</span>{text.footer.signature}</span><a href="#hero" className="back-top">{text.footer.top}<ArrowIcon direction="up" /></a></div>
    </footer>
  </>;
}
