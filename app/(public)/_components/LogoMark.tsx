/**
 * Simbol brand orisinal: tiga batang naik (pertumbuhan UMKM) di dalam bingkai
 * membulat, batang terakhir emerald + titik "terhubung" — data jadi kepercayaan.
 * Digambar sendiri (SVG inline), bukan logo pihak ketiga.
 */
export const LogoMark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <rect x="1.5" y="1.5" width="21" height="21" rx="6" className="fill-blue-900" />
    <rect x="6" y="13" width="3" height="5.5" rx="1" className="fill-blue-300" />
    <rect x="10.5" y="10" width="3" height="8.5" rx="1" className="fill-blue-100" />
    <rect x="15" y="7" width="3" height="11.5" rx="1" className="fill-emerald-400" />
    <circle cx="16.5" cy="5" r="1.6" className="fill-emerald-300" />
  </svg>
)
