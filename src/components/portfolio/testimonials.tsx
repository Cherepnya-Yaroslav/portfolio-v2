"use client";

import { useRef } from "react";
import { ArrowIcon } from "@/components/icons";
import type { Locale } from "@/content/portfolio";
import { reviews, type Review } from "@/content/testimonials";
import "./testimonials.css";

function ReviewDisclosure({ review, locale }: { review: Review; locale: Locale }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const date = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${review.date}T00:00:00Z`));

  function collapse() {
    if (!detailsRef.current) return;
    detailsRef.current.open = false;
    summaryRef.current?.focus();
  }

  return (
    <details className="rv-disclosure" ref={detailsRef} lang="ru">
      <summary ref={summaryRef}>
        <span className="rv-disclosure-person">
          <span className="rv-person-name">{review.name}</span>
          <span>{review.service}</span>
        </span>
        <span className="rv-disclosure-meta">
          <span
            className="rv-rating"
            role="img"
            aria-label={locale === "ru" ? `${review.rating} из 5` : `${review.rating} out of 5`}
            lang={locale}
          >
            {Array.from({ length: review.rating }, (_, index) => (
              <svg key={index} viewBox="0 0 24 24" aria-hidden="true" shapeRendering="crispEdges">
                <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z" />
              </svg>
            ))}
          </span>
          <time dateTime={review.date} lang={locale}>{date}</time>
        </span>
        <svg className="rv-expand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </summary>
      <div className="rv-disclosure-body">
        <blockquote><p>{review.text}</p></blockquote>
        <button type="button" className="rv-close-review" onClick={collapse} lang={locale}>
          {locale === "ru" ? "Свернуть отзыв" : "Collapse review"}
          <ArrowIcon direction="up" />
        </button>
      </div>
    </details>
  );
}

export function Testimonials({ locale }: { locale: Locale }) {
  return (
    <section className="rv-section pf-section" id="reviews" aria-labelledby="reviews-title">
      <div className="rv-heading">
        <h2 id="reviews-title">
          {locale === "ru" ? "Слово" : "Over to"}<br />
          <span>{locale === "ru" ? "клиентам." : "my clients."}</span>
        </h2>
      </div>
      <div className="rv-disclosures">
        {reviews.map((review) => <ReviewDisclosure key={review.id} review={review} locale={locale} />)}
      </div>
    </section>
  );
}
