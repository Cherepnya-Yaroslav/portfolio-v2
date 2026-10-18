import Image from "next/image";
import { ArrowIcon, Asterisk } from "@/components/icons";
import { contacts, copy, profile, type Locale } from "@/content/portfolio";
import { getPublishedProjects } from "@/lib/projects/public";
import { ProjectsRetry } from "@/components/projects-retry";
import { CodeIcon } from "./prototype-icons";

export function PrototypeAbout({ locale }: { locale: Locale }) {
  const ru = locale === "ru";
  const text = copy[locale].about;
  return (
    <section
      className="pv-about pv-section"
      id="about"
      aria-labelledby="pv-about-title"
    >
      <div className="pv-about-heading">
        <h2 id="pv-about-title">
          {ru ? (
            <>
              Один разработчик.
              <br />
              <span>Целая картина.</span>
            </>
          ) : (
            <>
              One developer.
              <br />
              <span>The whole picture.</span>
            </>
          )}
        </h2>
        <p>
          {ru
            ? "Думаю не только о том, как выглядит кнопка, но и о том, что происходит после нажатия. Соединяю интерфейс, логику и данные в работающий продукт."
            : "I think about how a button looks, and what happens after you click it. Connecting interfaces, logic, and data into a working product."}
        </p>
      </div>
      <div className="pv-services">
        <article className="pv-service">
          <div className="pv-service-heading">
            <h3>Frontend</h3>
            <CodeIcon />
          </div>
          <h4>{text.frontend}</h4>
          <p>{text.frontendBody}</p>
          <ul className="pv-tech-list">
            {profile.frontendTechnologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </article>
        <article className="pv-service">
          <div className="pv-service-heading">
            <h3>Backend & beyond</h3>
            <Asterisk />
          </div>
          <h4>{text.fullstack}</h4>
          <p>{text.fullstackBody}</p>
          <ul className="pv-tech-list">
            {profile.fullstackTechnologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export function PrototypeProjectsLoading({ locale }: { locale: Locale }) {
  return (
    <section className="pv-projects pv-section" id="projects" aria-busy="true">
      <h2>{copy[locale].work.title}</h2>
      <p role="status">
        {locale === "ru" ? "Загружаем проекты…" : "Loading projects…"}
      </p>
    </section>
  );
}

export async function PrototypeProjects({ locale }: { locale: Locale }) {
  const result = await getPublishedProjects();
  const ru = locale === "ru";
  return (
    <section
      className="pv-projects pv-section"
      id="projects"
      aria-labelledby="pv-projects-title"
    >
      <div className="pv-section-heading">
        <h2 id="pv-projects-title">
          {ru ? (
            <>
              Меньше слов.
              <br />
              <span>Больше дела.</span>
            </>
          ) : (
            <>
              Less talk.
              <br />
              <span>More making.</span>
            </>
          )}
        </h2>
        <p>
          {result.source === "demo"
            ? ru
              ? "Концепты интерфейсов. Разные задачи — один подход к деталям."
              : "Interface concepts. Different challenges, the same attention to detail."
            : ru
              ? "Избранные проекты. От интерфейса до работающей системы."
              : "Selected projects. From interface to working system."}
        </p>
      </div>
      {result.projects.length ? (
        <div className="pv-project-list">
          {result.projects.map((project, index) => (
            <article className="pv-project" key={project.id}>
              <div className="pv-project-image">
                <Image
                  src={project.preview}
                  alt={project.text[locale].alt}
                  width={1200}
                  height={800}
                  sizes="(max-width: 700px) 90vw, 65vw"
                />
                <span className="pv-project-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="pv-project-info">
                <div className="pv-project-title">
                  <h3>
                    {project.name}
                    <span>.</span>
                  </h3>
                  {project.demo && (
                    <span className="pv-demo-label">
                      {ru ? "Концепт" : "Concept"}
                    </span>
                  )}
                </div>
                <p className="pv-project-category">
                  {project.text[locale].category}
                </p>
                <p>{project.text[locale].description}</p>
                <ul className="pv-tech-list">
                  {project.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                <div className="pv-project-links">
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ru ? "Открыть проект" : "View project"}
                      <ArrowIcon />
                    </a>
                  )}
                  {project.repository && (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                      <ArrowIcon />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="pv-project-empty">
          <p>
            {result.source === "error"
              ? ru
                ? "Не удалось загрузить проекты. Попробуйте ещё раз."
                : "Projects could not be loaded. Please try again."
              : ru
                ? "Новые проекты скоро появятся здесь."
                : "New projects will appear here soon."}
          </p>
          {result.source === "error" && <ProjectsRetry locale={locale} />}
        </div>
      )}
    </section>
  );
}

export function PrototypeContact({ locale }: { locale: Locale }) {
  const ru = locale === "ru";
  return (
    <footer
      className="pv-contact pv-section"
      id="contact"
      aria-labelledby="pv-contact-title"
    >
      <div className="pv-contact-heading">
        <h2 id="pv-contact-title">
          {ru ? (
            <>
              Есть идея?
              <br />
              <span>Давайте соберём.</span>
            </>
          ) : (
            <>
              Have an idea?
              <br />
              <span>Let’s build it.</span>
            </>
          )}
        </h2>
        <Asterisk />
      </div>
      <p>
        {ru
          ? "Расскажите, что вы задумали. Начнём с разговора."
          : "Tell me what you have in mind. Let’s start with a conversation."}
      </p>
      <div className="pv-contact-list">
        {contacts.map((contact) => (
          <a
            key={contact.kind}
            href={contact.href}
            target={contact.kind === "email" ? undefined : "_blank"}
            rel={contact.kind === "email" ? undefined : "noopener noreferrer"}
          >
            <span>{contact.label}</span>
            <span>{contact.value}</span>
            <ArrowIcon />
          </a>
        ))}
      </div>
      <div className="pv-footer-bottom">
        <span>© 2026 {profile.name[locale]}</span>
        <span>React. Python. Human.</span>
        <a href="#hero">
          {copy[locale].footer.top}
          <ArrowIcon direction="up" />
        </a>
      </div>
    </footer>
  );
}
