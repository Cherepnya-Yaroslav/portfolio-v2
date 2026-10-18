import { profile } from "./portfolio";

export const aiTechnologies = [
  "Codex",
  "Higgsfield",
  "RAG",
  "MCP",
  "Skills",
  "LLM",
  "AI Agents",
  "OpenAI API",
  "Embeddings",
  "Vector Search",
  "Tool Calling",
];

export const backendTechnologies = [
  "Python",
  "FastAPI",
  "Node.js",
  "PostgreSQL",
  "SQLAlchemy",
  "Redis",
  "RabbitMQ",
  "Docker",
  "CI/CD",
];

export const pixelCopy = {
  ru: {
    meta: {
      title: "Ярослав Черепня — AI-разработчик",
      description:
        "Собираю веб-продукты, создаю сервисы и интегрирую AI. Frontend, backend, AI-агенты, RAG и MCP — от идеи до запуска.",
    },
    nav: { about: "Технологии", projects: "Проекты", contact: "Контакты" },
    hero: {
      lines: ["ОТ ИДЕИ", "ДО ГОТОВОГО", "ПРОДУКТА"],
      role: "AI-разработчик",
      description:
        "Собираю веб-продукты, делаю сервисы, интегрирую AI. Беру задачу целиком: от идеи до запуска.",
      cta: "СМОТРЕТЬ ПРОЕКТЫ",
      footnote: "ОТ ЗАДАЧИ ДО ЗАПУСКА.",
      scroll: "ЛИСТАЙТЕ ВНИЗ",
    },
    services: [
      {
        id: "frontend",
        label: "Frontend",
        title: "Интерфейсы для веб-продуктов.",
        description:
          "Адаптивные сайты и приложения. Продумываю взаимодействие, состояния и подключение к API.",
        technologies: profile.frontendTechnologies,
      },
      {
        id: "backend",
        label: "Backend",
        title: "Сервисы, данные и интеграции.",
        description:
          "API, базы данных, фоновые задачи и инфраструктура. Соединяю части продукта в работающую систему.",
        technologies: backendTechnologies,
      },
      {
        id: "ai",
        label: "AI",
        title: "AI в продуктах и процессах.",
        description:
          "AI-агенты, RAG-поиск и MCP-интеграции. Codex и Skills для разработки, Higgsfield для контента и автоматизация рабочих процессов.",
        technologies: aiTechnologies,
      },
    ],
  },
  en: {
    meta: {
      title: "Yaroslav Cherepnya — AI Developer",
      description:
        "I build web products, create services, and integrate AI. Frontend, backend, AI agents, RAG, and MCP — from idea to launch.",
    },
    nav: { about: "Stack", projects: "Projects", contact: "Contact" },
    hero: {
      lines: ["FROM IDEA", "TO WORKING", "PRODUCT"],
      role: "AI developer",
      description:
        "I build web products, create services, and integrate AI. Taking ownership of the whole task, from idea to launch.",
      cta: "EXPLORE PROJECTS",
      footnote: "FROM CHALLENGE TO LAUNCH.",
      scroll: "SCROLL TO OPEN",
    },
    services: [
      {
        id: "frontend",
        label: "Frontend",
        title: "Interfaces for web products.",
        description:
          "Responsive websites and applications. Clear interactions, interface states, and API integration.",
        technologies: profile.frontendTechnologies,
      },
      {
        id: "backend",
        label: "Backend",
        title: "Services, data, and integrations.",
        description:
          "APIs, databases, background tasks, and infrastructure. Connecting the pieces into a working product.",
        technologies: backendTechnologies,
      },
      {
        id: "ai",
        label: "AI",
        title: "AI for products and workflows.",
        description:
          "AI agents, RAG search, and MCP integrations. Codex and Skills for development, Higgsfield for content, and workflow automation.",
        technologies: aiTechnologies,
      },
    ],
  },
} as const;
