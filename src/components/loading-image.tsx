"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function LoadingImage({ loadingLabel, errorLabel, alt, ...props }: ImageProps & { loadingLabel: string; errorLabel: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return <>
    {status !== "ready" && <span className={`image-status image-status-${status}`} role="status">
      {status === "loading" && <span className="image-loader" aria-hidden="true">✳</span>}
      <span>{status === "error" ? errorLabel : loadingLabel}</span>
    </span>}
    <Image {...props} alt={alt} data-image-state={status} onLoad={() => setStatus("ready")} onError={() => setStatus("error")} />
    <noscript><style>{`.image-status { display: none; }`}</style></noscript>
  </>;
}
