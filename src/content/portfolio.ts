import portrait from "../../public/images/yaroslav.webp";

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale => locales.some((locale) => locale === value);

export const profile = {
  name: { ru: "Ярослав", en: "Yaroslav" },
  portrait,
  frontendTechnologies: ["TypeScript", "React", "Next.js", "Tailwind CSS", "HTML", "CSS", "Figma"],
  fullstackTechnologies: ["Python", "FastAPI", "Node.js", "PostgreSQL", "SQLAlchemy", "Redis", "RabbitMQ", "Docker", "CI/CD", "OpenAI / RAG"],
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
    id: "forma", name: "forma", preview: "/projects/forma.svg", theme: "store", demo: true,
    technologies: ["React", "TypeScript", "CSS", "Responsive UI"],
    text: {
      ru: { category: "E-commerce", description: "Адаптивный интерфейс интернет-магазина с понятной структурой каталога, быстрым сценарием выбора товара и аккуратной подготовкой UI к интеграции с backend.", role: "Frontend-разработка", alt: "Интерфейс интернет-магазина forma: каталог предметов интерьера в оливковых и кремовых тонах" },
      en: { category: "E-commerce", description: "A responsive storefront interface with a clear catalog structure, a fast product selection flow and UI prepared for backend integration.", role: "Frontend development", alt: "Forma e-commerce interface: a homeware catalog in olive and cream tones" },
    },
  },
  {
    id: "pulse", name: "pulse", preview: "/projects/pulse.svg", theme: "analytics", demo: true,
    technologies: ["React", "TypeScript", "REST API", "Redux"],
    text: {
      ru: { category: "Аналитический кабинет", description: "Интерфейс кабинета для работы с данными: состояния загрузки, графики, фильтры и компоненты, которые помогают быстро считывать ключевые показатели.", role: "Frontend · архитектура интерфейса", alt: "Интерфейс pulse: тёмная аналитическая панель с сиреневыми графиками" },
      en: { category: "Analytics dashboard", description: "A data-focused dashboard interface with loading states, charts, filters and components designed for fast reading of key metrics.", role: "Frontend · interface architecture", alt: "Pulse interface: a dark analytics dashboard with lavender charts" },
    },
  },
  {
    id: "spot", name: "spot", preview: "/projects/spot.svg", theme: "booking", demo: true,
    technologies: ["React", "Node.js", "REST API", "Nginx"],
    text: {
      ru: { category: "Сервис бронирования", description: "Веб-приложение со сценарием поиска, выбора времени и бронирования. Акцент на предсказуемой навигации, адаптивности и готовности к серверной интеграции.", role: "Fullstack-разработка", alt: "Интерфейс spot: светлый сервис бронирования с календарём и карточкой пространства" },
      en: { category: "Booking platform", description: "A web application flow for discovery, scheduling and booking, focused on predictable navigation, responsiveness and server-side integration readiness.", role: "Fullstack development", alt: "Spot interface: a light booking service with a calendar and a workspace card" },
    },
  },
];

export const copy = {
  ru: {
    meta: { title: "Ярослав Черепня — Fullstack-разработчик", description: "Fullstack-разработчик: React, TypeScript, Next.js, Python, FastAPI, PostgreSQL и запуск веб-продуктов в production." },
    nav: { about: "Обо мне", projects: "Проекты", contact: "Контакты" },
    skip: "Перейти к содержимому", language: "Язык сайта", portfolio: "ПОРТФОЛИО / 2026", developer: "Fullstack-разработчик · React / Python",
    hero: { intro: "Веб-продукты", ending: "от интерфейса до production.", description: "Разрабатываю frontend на React, TypeScript и Next.js, backend на Python/FastAPI и Node.js, проектирую API и схемы данных.", cta: "Смотреть проекты", scroll: "Опыт, стек и проекты ниже", alt: "Ярослав протягивает открытый ноутбук к зрителю", side: "FRONTEND И BACKEND.\nPRODUCTION-ПОДХОД." },
    about: { eyebrow: "ОБО МНЕ", start: "Fullstack-разработчик.", middle: "Работаю с полным циклом веб-разработки:", highlight: "от интерфейса до API и базы данных.", end: "Запускаю продукты в production, интегрирую внешние и AI-сервисы, настраиваю инфраструктуру и CI/CD.", frontend: "Интерфейсы для веб-продуктов.", frontendBody: "React, TypeScript и Next.js. Делаю адаптивные интерфейсы по Figma, продумываю состояния и подключаю их к REST API.", fullstack: "Backend, данные и production.", fullstackBody: "Python, FastAPI, Node.js и PostgreSQL. Проектирую API, интеграции и фоновые задачи, работаю с Redis, RabbitMQ, Docker и CI/CD." },
    work: { eyebrow: "ПРОЕКТЫ И ОПЫТ", title: "Работы", accent: "и кейсы", note: "Коммерческие задачи, продуктовые интерфейсы\nи собственные веб-проекты.", demoNote: "Магазин, аналитика и бронирование.\nДемонстрационные концепты интерфейсов.", demo: "Демонстрационный кейс", concept: "Интерфейс проекта", role: "Моя роль", pending: "", website: "Открыть сайт", repository: "Смотреть код", previous: "Предыдущий проект", next: "Следующий проект", carousel: "Карусель проектов", slide: "Проект", of: "из", hint: "Листайте, чтобы увидеть больше" },
    footer: { eyebrow: "ОТКРЫТ К ПРЕДЛОЖЕНИЯМ", line1: "Ищу сильную", line2: "продуктовую команду.", description: "Готов обсудить работу в команде или веб-проект с React, Python и современной инфраструктурой.", top: "Наверх", signature: "React · Python · PostgreSQL" },
  },
  en: {
    meta: { title: "Yaroslav Cherepnya — Fullstack Developer", description: "Fullstack developer working with React, TypeScript, Next.js, Python, FastAPI and PostgreSQL to ship web products to production." },
    nav: { about: "About", projects: "Projects", contact: "Contact" },
    skip: "Skip to content", language: "Website language", portfolio: "PORTFOLIO / 2026", developer: "Fullstack Developer · React / Python",
    hero: { intro: "Web products", ending: "from interface to production.", description: "I build frontend with React, TypeScript and Next.js, backend with Python/FastAPI and Node.js, and design APIs and data models.", cta: "Explore projects", scroll: "Experience, stack and projects below", alt: "Yaroslav holding an open laptop towards the viewer", side: "FRONTEND AND BACKEND.\nPRODUCTION MINDSET." },
    about: { eyebrow: "ABOUT ME", start: "Fullstack developer.", middle: "I work across the full web development cycle:", highlight: "from interface to API and database.", end: "I ship products to production, integrate external and AI services, and configure infrastructure and CI/CD.", frontend: "Interfaces for web products.", frontendBody: "React, TypeScript and Next.js. I build responsive interfaces from Figma, design clear UI states and connect them to REST APIs.", fullstack: "Backend, data and production.", fullstackBody: "Python, FastAPI, Node.js and PostgreSQL. I design APIs, integrations and background jobs, and work with Redis, RabbitMQ, Docker and CI/CD." },
    work: { eyebrow: "PROJECTS AND EXPERIENCE", title: "Work", accent: "and cases", note: "Commercial tasks, product interfaces\nand personal web projects.", demoNote: "Commerce, analytics and booking.\nDemonstration interface concepts.", demo: "Demo case", concept: "Project interface", role: "My role", pending: "", website: "Visit website", repository: "View code", previous: "Previous project", next: "Next project", carousel: "Project carousel", slide: "Project", of: "of", hint: "Scroll to discover more" },
    footer: { eyebrow: "OPEN TO OPPORTUNITIES", line1: "Looking for a strong", line2: "product team.", description: "Open to joining a team or discussing a web project involving React, Python and modern infrastructure.", top: "Back to top", signature: "React · Python · PostgreSQL" },
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof copy)[Locale];
