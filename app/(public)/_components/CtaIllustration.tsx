/**
 * Ilustrasi abstrak orisinal untuk kartu CTA gelap (SVG asli, bukan gambar
 * impor): grid titik data → batang tren yang "tumbuh" → garis jembatan
 * titik-ke-titik dari simpul UMKM menuju simpul bank. Motif: data transaksi
 * menjadi kepercayaan. Animasi tumbuh berjalan SEKALI saat section masuk
 * viewport (kelas .cta-bar/.cta-node di globals.css, mati saat
 * prefers-reduced-motion).
 */
export const CtaIllustration = () => (
  <svg
    viewBox="0 0 340 240"
    fill="none"
    aria-hidden="true"
    className="h-auto w-full max-w-sm"
  >
    {/* grid titik data di latar */}
    <defs>
      <pattern id="cta-dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.4" className="fill-blue-300/20" />
      </pattern>
    </defs>
    <rect width="340" height="240" fill="url(#cta-dots)" />

    {/* batang tren tumbuh (pertumbuhan UMKM) */}
    <rect x="46" y="168" width="26" height="42" rx="4" className="cta-bar fill-blue-400/40" style={{ transitionDelay: '150ms' }} />
    <rect x="92" y="146" width="26" height="64" rx="4" className="cta-bar fill-blue-300/50" style={{ transitionDelay: '300ms' }} />
    <rect x="138" y="118" width="26" height="92" rx="4" className="cta-bar fill-emerald-500/60" style={{ transitionDelay: '450ms' }} />
    <rect x="184" y="84" width="26" height="126" rx="4" className="cta-bar fill-emerald-400" style={{ transitionDelay: '600ms' }} />

    {/* jembatan kepercayaan: simpul UMKM → simpul bank */}
    <path
      d="M 59 150 C 100 90, 200 60, 282 52"
      className="cta-node stroke-emerald-300/70"
      strokeWidth="1.5"
      strokeDasharray="4 5"
      style={{ transitionDelay: '750ms' }}
    />
    <g className="cta-node" style={{ transitionDelay: '800ms' }}>
      <circle cx="59" cy="150" r="5" className="fill-emerald-300" />
      <circle cx="139" cy="84" r="3.5" className="fill-blue-200" />
      <circle cx="212" cy="60" r="3.5" className="fill-blue-200" />
    </g>
    <g className="cta-node" style={{ transitionDelay: '950ms' }}>
      {/* simpul tujuan: "bank" — lingkaran cincin dengan tanda centang */}
      <circle cx="282" cy="52" r="14" className="stroke-emerald-400" strokeWidth="2" fill="none" />
      <circle cx="282" cy="52" r="8" className="fill-emerald-400" />
      <path d="m278.5 52 2.5 2.5 4.5-5" className="stroke-blue-950" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* garis dasar */}
    <line x1="30" y1="210" x2="310" y2="210" className="stroke-blue-300/30" strokeWidth="1.5" />
  </svg>
)
