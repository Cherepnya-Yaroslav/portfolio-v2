export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale => locales.some((locale) => locale === value);

export const profile = {
  name: { ru: "Ярослав", en: "Yaroslav" },
  portrait: "/images/yaroslav.webp",
  technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
};

export type Contact = {
  label: string;
  kind: "telegram" | "email" | "github";
  href?: string;
  value?: string;
};

export const contacts: Contact[] = [
  { label: "Telegram", kind: "telegram" },
  { label: "Email", kind: "email" },
  { label: "GitHub", kind: "github" },
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
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    text: {
      ru: { category: "Интернет-магазин", description: "Меньше шагов между «нравится» и «моё». Концепт магазина предметов для дома с понятным каталогом и быстрым оформлением заказа.", role: "Frontend · UI-разработка", alt: "Концепт магазина forma: каталог предметов интерьера в оливковых и кремовых тонах" },
      en: { category: "E-commerce", description: "Fewer steps from love it to own it. A homeware store concept with an intuitive catalog and a simple checkout experience.", role: "Frontend · UI development", alt: "Forma store concept: homeware catalog in olive and cream tones" },
    },
  },
  {
    id: "pulse", name: "pulse", preview: "/projects/pulse.svg", theme: "analytics", demo: true,
    technologies: ["React", "Node.js", "PostgreSQL"],
    text: {
      ru: { category: "Аналитический кабинет", description: "Вся картина на одном экране. Концепт кабинета, который превращает сложные данные в понятные графики и помогает замечать главное.", role: "Fullstack · Архитектура приложения", alt: "Концепт pulse: тёмная аналитическая панель с сиреневыми графиками" },
      en: { category: "Analytics dashboard", description: "The big picture, on one screen. A dashboard concept that turns complex data into clear charts and brings what matters into focus.", role: "Fullstack · Application architecture", alt: "Pulse concept: dark analytics dashboard with lavender charts" },
    },
  },
  {
    id: "spot", name: "spot", preview: "/projects/spot.svg", theme: "booking", demo: true,
    technologies: ["Next.js", "Node.js", "PostgreSQL"],
    text: {
      ru: { category: "Сервис бронирования", description: "Найти своё место — в пару кликов. Концепт сервиса для поиска пространств, выбора свободного времени и бронирования без лишней переписки.", role: "Fullstack · UI-разработка", alt: "Концепт spot: светлый интерфейс бронирования с календарём и карточкой пространства" },
      en: { category: "Booking platform", description: "Find your spot in a few clicks. A concept for discovering spaces, choosing an available time and booking without the back-and-forth.", role: "Fullstack · UI development", alt: "Spot concept: light booking interface with a calendar and a workspace card" },
    },
  },
];

export const copy = {
  ru: {
    meta: { title: "Ярослав — Frontend / Fullstack-разработчик", description: "Портфолио Ярослава. Веб-проекты, интерфейсы и fullstack-разработка — от первого экрана до серверной логики." },
    nav: { about: "Обо мне", projects: "Проекты", contact: "Контакты" },
    skip: "Перейти к содержимому", language: "Язык сайта", portfolio: "ПОРТФОЛИО / 2026", developer: "Frontend / Fullstack-разработчик",
    hero: { intro: "От первого экрана", ending: "до серверной логики.", description: "Создаю веб-проекты, в которых продуманный интерфейс встречается с работающей идеей.", cta: "Смотреть проекты", scroll: "Листайте — дальше интереснее", alt: "Ярослав протягивает открытый ноутбук к зрителю", side: "ДИЗАЙН В ДЕТАЛЯХ.\nЛОГИКА В ОСНОВЕ." },
    about: { eyebrow: "НЕМНОГО ОБО МНЕ", start: "Привет, я Ярослав.", middle: "Создаю веб-проекты, которыми", highlight: "приятно пользоваться.", end: "Соединяю выразительный frontend с продуманной серверной логикой — от идеи до работающего продукта.", stack: "Пример стека · заменим на актуальный", frontend: "Интерфейс, который чувствуется.", frontendBody: "Адаптивные страницы, внимание к деталям и плавные взаимодействия. Чтобы на любом экране всё было на своём месте.", fullstack: "Красиво снаружи. Продумано внутри.", fullstackBody: "Интерфейс, API и данные — части одной системы. Продумываю их вместе, чтобы продукт работал последовательно и понятно.", draft: "Предварительное описание специализации" },
    work: { eyebrow: "ОТ ИДЕИ К ИНТЕРФЕЙСУ", title: "Избранные", accent: "проекты", note: "Три концепта. Разные задачи.\nОдинаковое внимание к деталям.", demo: "Демо-проект", concept: "Концепт интерфейса", role: "Роль в концепте", pending: "Демо — ссылки появятся позже", website: "Открыть сайт", repository: "Смотреть код", previous: "Предыдущий проект", next: "Следующий проект", carousel: "Карусель проектов", slide: "Проект", of: "из", hint: "Листайте, чтобы увидеть больше" },
    footer: { eyebrow: "ДАВАЙТЕ СОЗДАДИМ ЧТО-ТО ХОРОШЕЕ", line1: "Есть идея?", line2: "Давайте обсудим.", description: "Интересный проект или предложение о работе — всё начинается с разговора.", pending: "Контакт появится позже", demo: "Демоверсия портфолио", top: "Наверх", signature: "С вниманием к каждому пикселю." },
  },
  en: {
    meta: { title: "Yaroslav — Frontend / Fullstack Developer", description: "Yaroslav’s portfolio. Web projects, interfaces and fullstack development — from the first screen to the server logic." },
    nav: { about: "About", projects: "Projects", contact: "Contact" },
    skip: "Skip to content", language: "Website language", portfolio: "PORTFOLIO / 2026", developer: "Frontend / Fullstack Developer",
    hero: { intro: "From the first screen", ending: "to the server logic.", description: "I build web projects where thoughtful interfaces meet ideas that work.", cta: "Explore projects", scroll: "Scroll — there’s more to see", alt: "Yaroslav holding an open laptop towards the viewer", side: "DESIGN IN THE DETAILS.\nLOGIC AT THE CORE." },
    about: { eyebrow: "A LITTLE ABOUT ME", start: "Hey, I’m Yaroslav.", middle: "I build web projects that", highlight: "feel good to use.", end: "Bringing expressive frontend and thoughtful server logic together — from an idea to a working product.", stack: "Example stack · to be updated", frontend: "Interfaces you can feel.", frontendBody: "Responsive pages, thoughtful details and smooth interactions. Everything in the right place, on every screen.", fullstack: "Good looks. Solid foundations.", fullstackBody: "Interface, API and data are parts of one system. I think about them together to make the whole experience consistent and clear.", draft: "Preliminary specialization description" },
    work: { eyebrow: "FROM IDEA TO INTERFACE", title: "Selected", accent: "projects", note: "Three concepts. Different challenges.\nThe same attention to detail.", demo: "Demo project", concept: "Interface concept", role: "Concept role", pending: "Demo — links coming later", website: "Visit website", repository: "View code", previous: "Previous project", next: "Next project", carousel: "Project carousel", slide: "Project", of: "of", hint: "Scroll to discover more" },
    footer: { eyebrow: "LET’S MAKE SOMETHING GOOD", line1: "Have an idea?", line2: "Let’s talk.", description: "An interesting project or a job opportunity — it all starts with a conversation.", pending: "Contact coming soon", demo: "Portfolio demo", top: "Back to top", signature: "Made with an eye for every pixel." },
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof copy)[Locale];
