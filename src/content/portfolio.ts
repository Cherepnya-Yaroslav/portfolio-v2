import portrait from "../../public/images/yaroslav.webp";

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale => locales.some((locale) => locale === value);

export const profile = {
  name: { ru: "Ярослав", en: "Yaroslav" },
  portrait,
  frontendTechnologies: ["JavaScript", "TypeScript", "React.js", "Next.js", "Redux", "Material UI", "HTML", "CSS", "Sass"],
  fullstackTechnologies: ["Node.js", "REST API", "Strapi", "Headless CMS", "Nginx", "Docker", "GitHub Actions", "VPS", "Telegram Web Apps"],
};

export type Contact = {
  label: string;
  kind: "telegram" | "email" | "github";
  href?: string;
  value?: string;
};

export const contacts: Contact[] = [
  { label: "Telegram", kind: "telegram", href: "https://t.me/itstancpol", value: "@itstancpol" },
  { label: "Email", kind: "email", href: "mailto:cherepnyayar@gmail.com", value: "cherepnyayar@gmail.com" },
  { label: "GitHub", kind: "github", href: "https://github.com/Cherepnya-Yaroslav", value: "Cherepnya-Yaroslav" },
];

export type Project = {
  id: string;
  name: string;
  preview: string;
  theme: "store" | "analytics" | "booking";
  technologies: string[];
  demo: boolean;
  status?: "live" | "code" | "wip";
  website?: string;
  repository?: string;
  text: Record<Locale, { category: string; description: string; role: string; alt: string }>;
};

export const projects: Project[] = [
  {
    id: "forma", name: "forma", preview: "/projects/forma.svg", theme: "store", demo: false,
    technologies: ["Next.js", "TypeScript", "React", "CSS"],
    text: {
      ru: { category: "E-commerce", description: "Адаптивный интерфейс интернет-магазина с понятной структурой каталога, быстрым сценарием выбора товара и аккуратной подготовкой UI к интеграции с backend.", role: "Frontend-разработка", alt: "Интерфейс интернет-магазина forma: каталог предметов интерьера в оливковых и кремовых тонах" },
      en: { category: "E-commerce", description: "A responsive storefront interface with a clear catalog structure, a fast product selection flow and UI prepared for backend integration.", role: "Frontend development", alt: "Forma e-commerce interface: a homeware catalog in olive and cream tones" },
    },
  },
  {
    id: "pulse", name: "pulse", preview: "/projects/pulse.svg", theme: "analytics", demo: false,
    technologies: ["React", "TypeScript", "REST API", "Redux"],
    text: {
      ru: { category: "Аналитический кабинет", description: "Интерфейс кабинета для работы с данными: состояния загрузки, графики, фильтры и компоненты, которые помогают быстро считывать ключевые показатели.", role: "Frontend · архитектура интерфейса", alt: "Интерфейс pulse: тёмная аналитическая панель с сиреневыми графиками" },
      en: { category: "Analytics dashboard", description: "A data-focused dashboard interface with loading states, charts, filters and components designed for fast reading of key metrics.", role: "Frontend · interface architecture", alt: "Pulse interface: a dark analytics dashboard with lavender charts" },
    },
  },
  {
    id: "spot", name: "spot", preview: "/projects/spot.svg", theme: "booking", demo: false,
    technologies: ["Next.js", "Node.js", "REST API", "Nginx"],
    text: {
      ru: { category: "Сервис бронирования", description: "Веб-приложение со сценарием поиска, выбора времени и бронирования. Акцент на предсказуемой навигации, адаптивности и готовности к серверной интеграции.", role: "Fullstack-разработка", alt: "Интерфейс spot: светлый сервис бронирования с календарём и карточкой пространства" },
      en: { category: "Booking platform", description: "A web application flow for discovery, scheduling and booking, focused on predictable navigation, responsiveness and server-side integration readiness.", role: "Fullstack development", alt: "Spot interface: a light booking service with a calendar and a workspace card" },
    },
  },
];

export const copy = {
  ru: {
    meta: { title: "Ярослав Черепня — Frontend-разработчик", description: "Портфолио frontend-разработчика Ярослава Черепни: React, Next.js, TypeScript, интеграции с API и CMS, production-ready интерфейсы." },
    nav: { about: "Обо мне", projects: "Проекты", contact: "Контакты" },
    skip: "Перейти к содержимому", language: "Язык сайта", portfolio: "ПОРТФОЛИО / 2026", developer: "Frontend-разработчик · React / Next.js",
    hero: { intro: "Производительные интерфейсы", ending: "для веб-продуктов.", description: "Разрабатываю frontend на React и Next.js, интегрирую его с API и CMS, довожу продукт до стабильного production-запуска.", cta: "Смотреть проекты", scroll: "Опыт, стек и проекты ниже", alt: "Ярослав протягивает открытый ноутбук к зрителю", side: "REACT И NEXT.JS.\nPRODUCTION-ПОДХОД." },
    about: { eyebrow: "ОБО МНЕ", start: "Frontend-разработчик", middle: "с более чем 1.5 годами коммерческого опыта.", highlight: "Специализируюсь на React.js и Next.js.", end: "Работал с полным циклом разработки: архитектура frontend-приложений, интеграции с backend и CMS, адаптивные интерфейсы, деплой на VPS и поддержка после релиза.", frontend: "Frontend для продуктовых команд.", frontendBody: "React.js, Next.js, TypeScript, Redux, Material UI, HTML, CSS и Sass. Делаю адаптивные интерфейсы, pixel-perfect верстку по Figma и интерактивные компоненты: формы, календари, динамические блоки.", fullstack: "Интеграции и запуск в production.", fullstackBody: "Node.js, REST API, Strapi, headless CMS, Telegram Web Apps, Nginx, Docker, VPS и GitHub Actions. Могу связать frontend с данными, настроить окружение и довести релиз до работающего сервера." },
    work: { eyebrow: "ПРОЕКТЫ И ОПЫТ", title: "Работы", accent: "и кейсы", note: "Коммерческие задачи, продуктовые интерфейсы\nи собственные веб-проекты.", demo: "Проект", concept: "Интерфейс проекта", role: "Моя роль", pending: "", website: "Открыть сайт", repository: "Смотреть код", previous: "Предыдущий проект", next: "Следующий проект", carousel: "Карусель проектов", slide: "Проект", of: "из", hint: "Листайте, чтобы увидеть больше" },
    footer: { eyebrow: "ОТКРЫТ К ПРЕДЛОЖЕНИЯМ", line1: "Ищу сильную", line2: "frontend-команду.", description: "Готов обсудить позицию frontend-разработчика, продуктовую команду или проект с React и Next.js.", top: "Наверх", signature: "React · Next.js · TypeScript" },
  },
  en: {
    meta: { title: "Yaroslav Cherepnya — Frontend Developer", description: "Frontend developer portfolio by Yaroslav Cherepnya: React, Next.js, TypeScript, API and CMS integrations, production-ready interfaces." },
    nav: { about: "About", projects: "Projects", contact: "Contact" },
    skip: "Skip to content", language: "Website language", portfolio: "PORTFOLIO / 2026", developer: "Frontend Developer · React / Next.js",
    hero: { intro: "Production-ready interfaces", ending: "for web products.", description: "I build frontend with React and Next.js, integrate it with APIs and CMS platforms, and bring products to stable production releases.", cta: "Explore projects", scroll: "Experience, stack and projects below", alt: "Yaroslav holding an open laptop towards the viewer", side: "REACT AND NEXT.JS.\nPRODUCTION MINDSET." },
    about: { eyebrow: "ABOUT ME", start: "Frontend developer", middle: "with 1.5+ years of commercial experience.", highlight: "Focused on React.js and Next.js.", end: "I have worked across the full development cycle: frontend architecture, backend and CMS integrations, responsive interfaces, VPS deployment and post-release support.", frontend: "Frontend for product teams.", frontendBody: "JavaScript, TypeScript, React.js, Next.js, Redux, Material UI, HTML, CSS and Sass. I build responsive interfaces, pixel-perfect layouts from Figma and interactive UI components: forms, calendars and dynamic blocks.", fullstack: "Integrations and production launch.", fullstackBody: "Node.js, REST API, Strapi, headless CMS, Telegram Web Apps, Nginx, Docker, VPS and GitHub Actions. I can connect frontend to data, configure the environment and bring a release to a working server." },
    work: { eyebrow: "PROJECTS AND EXPERIENCE", title: "Work", accent: "and cases", note: "Commercial tasks, product interfaces\nand personal web projects.", demo: "Project", concept: "Project interface", role: "My role", pending: "", website: "Visit website", repository: "View code", previous: "Previous project", next: "Next project", carousel: "Project carousel", slide: "Project", of: "of", hint: "Scroll to discover more" },
    footer: { eyebrow: "OPEN TO OPPORTUNITIES", line1: "Looking for a strong", line2: "frontend team.", description: "Ready to discuss a frontend developer role, a product team or a React and Next.js project.", top: "Back to top", signature: "React · Next.js · TypeScript" },
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof copy)[Locale];
