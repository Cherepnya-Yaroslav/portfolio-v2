import { pixelCopy } from "@/content/pixel-portfolio";
import type { Locale } from "@/content/portfolio";
import { AIIcon, CodeIcon, ServerIcon } from "./icons";

const serviceIcons = { frontend: CodeIcon, backend: ServerIcon, ai: AIIcon };

export function TechnologySection({ locale }: { locale: Locale }) {
  return (
    <section
      className="pf-about pf-section"
      id="about"
      aria-labelledby="technology-title"
    >
      <h2 className="pf-sr-only" id="technology-title">
        {pixelCopy[locale].nav.about}
      </h2>
      <div className="pf-services">
        {pixelCopy[locale].services.map((service) => {
          const Icon = serviceIcons[service.id];
          return (
            <article className="pf-service" key={service.id}>
              <div className="pf-service-heading">
                <h3>{service.label}</h3>
                <Icon />
              </div>
              <p className="pf-service-title">{service.title}</p>
              <p>{service.description}</p>
              <ul className="pf-tech-list">
                {service.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
