"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

type LoadingImageProps = ImageProps & {
  loadingLabel: string;
  errorLabel: string;
  statusVariant?: "badge" | "hero";
};

export function LoadingImage({ loadingLabel, errorLabel, alt, statusVariant = "badge", onLoad, onError, ...props }: LoadingImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const statusText = status === "error" ? errorLabel : loadingLabel;

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    setStatus(image.naturalWidth > 0 ? "ready" : "error");
  }, []);

  return <>
    {status !== "ready" && <span className={`image-status image-status-${status} image-status-${statusVariant}`} role="status" aria-label={statusText}>
      {statusVariant === "hero" && status === "loading" ? <span className="sr-only">{statusText}</span> : <>
        {status === "loading" && <span className="image-loader" aria-hidden="true">✳</span>}
        <span>{statusText}</span>
      </>}
    </span>}
    <Image
      {...props}
      ref={imageRef}
      alt={alt}
      data-image-state={status}
      onLoad={(event) => { setStatus("ready"); onLoad?.(event); }}
      onError={(event) => { setStatus("error"); onError?.(event); }}
    />
    <noscript><style>{`.image-status { display: none; } .portrait-image { opacity: 1 !important; transform: none !important; }`}</style></noscript>
  </>;
}
