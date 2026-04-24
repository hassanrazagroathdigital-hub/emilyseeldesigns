/**
 * Decorative folk-pattern divider strip — Scandinavian/Eastern European
 * embroidery border in terracotta, forest green, cream. Used between every
 * major section. Pure SVG, ~22px tall, repeats horizontally.
 */
export function FolkDivider({ className = "" }: { className?: string }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`w-full h-[22px] bg-cream ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 22px",
        backgroundPosition: "center",
      }}
    />
  );
}

const T = "#C0392B"; // terracotta
const G = "#2D5A3D"; // forest
const C = "#F5F0EB"; // cream
const I = "#2C2C2A"; // ink

const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='22' viewBox='0 0 160 22' fill='none'>
  <rect width='160' height='22' fill='${C}'/>
  <line x1='0' y1='2' x2='160' y2='2' stroke='${T}' stroke-width='0.6' stroke-dasharray='2 2' opacity='0.55'/>
  <line x1='0' y1='20' x2='160' y2='20' stroke='${T}' stroke-width='0.6' stroke-dasharray='2 2' opacity='0.55'/>

  <g>
    <!-- repeating motif group, repeats every 40px -->
    <g transform='translate(0,0)'>
      <circle cx='8' cy='11' r='2.6' fill='${T}'/>
      <circle cx='8' cy='11' r='1' fill='${C}'/>
      <path d='M18 11 q4 -7 8 0 q-4 7 -8 0z' fill='${G}'/>
      <circle cx='30' cy='11' r='1.4' fill='${T}'/>
      <circle cx='34' cy='6' r='1' fill='${G}'/>
      <circle cx='34' cy='16' r='1' fill='${G}'/>
    </g>
    <g transform='translate(40,0)'>
      <circle cx='8' cy='11' r='2.6' fill='${T}'/>
      <circle cx='8' cy='11' r='1' fill='${C}'/>
      <path d='M18 11 q4 -7 8 0 q-4 7 -8 0z' fill='${G}'/>
      <circle cx='30' cy='11' r='1.4' fill='${T}'/>
      <circle cx='34' cy='6' r='1' fill='${G}'/>
      <circle cx='34' cy='16' r='1' fill='${G}'/>
    </g>
    <g transform='translate(80,0)'>
      <circle cx='8' cy='11' r='2.6' fill='${T}'/>
      <circle cx='8' cy='11' r='1' fill='${C}'/>
      <path d='M18 11 q4 -7 8 0 q-4 7 -8 0z' fill='${G}'/>
      <circle cx='30' cy='11' r='1.4' fill='${T}'/>
      <circle cx='34' cy='6' r='1' fill='${G}'/>
      <circle cx='34' cy='16' r='1' fill='${G}'/>
    </g>
    <g transform='translate(120,0)'>
      <circle cx='8' cy='11' r='2.6' fill='${T}'/>
      <circle cx='8' cy='11' r='1' fill='${C}'/>
      <path d='M18 11 q4 -7 8 0 q-4 7 -8 0z' fill='${G}'/>
      <circle cx='30' cy='11' r='1.4' fill='${T}'/>
      <circle cx='34' cy='6' r='1' fill='${G}'/>
      <circle cx='34' cy='16' r='1' fill='${G}'/>
    </g>
  </g>

  <!-- subtle ink dots -->
  <g fill='${I}' opacity='0.35'>
    <circle cx='2' cy='11' r='0.6'/>
    <circle cx='158' cy='11' r='0.6'/>
  </g>
</svg>`;
