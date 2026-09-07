import type { SVGProps } from "react";

export function ArrowIcon({ direction = "up-right", ...props }: SVGProps<SVGSVGElement> & { direction?: "up-right" | "right" | "left" | "down" | "up" }) {
  const rotation = { "up-right": 0, right: 45, left: 225, down: 135, up: -45 }[direction];
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><g transform={`rotate(${rotation} 12 12)`}><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></g></svg>;
}

export function Asterisk({ className }: { className?: string }) {
  return <svg className={className} width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M22 2v40M2 22h40M8 8l28 28M8 36 36 8" stroke="currentColor" strokeWidth="5" /></svg>;
}
