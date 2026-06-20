// CSS/SVG building illustrations for each board location.
// All use viewBox="0 0 80 72" for a consistent style.

function OfficeTower({ wallColor, accentColor, floors = 3 }: {
  wallColor: string; accentColor: string; floors?: number
}) {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Antenna */}
      <line x1="40" y1="6" x2="40" y2="14" stroke="#9CA3AF" strokeWidth="1.5" />
      <circle cx="40" cy="6" r="2" fill={accentColor} />
      {/* Main tower */}
      <rect x="16" y="14" width="48" height={52} rx="1" fill={wallColor} />
      {/* Accent top band */}
      <rect x="16" y="14" width="48" height="6" rx="1" fill={accentColor} opacity="0.8" />
      {/* Window grid */}
      {Array.from({ length: floors }).map((_, f) =>
        [0, 1, 2].map(w => (
          <rect
            key={`${f}-${w}`}
            x={22 + w * 15}
            y={24 + f * 14}
            width="10"
            height="9"
            rx="1"
            fill="#BAE6FD"
            stroke="#7DD3FC"
            strokeWidth="0.5"
          />
        ))
      )}
      {/* Lobby entrance */}
      <rect x="26" y="54" width="28" height="12" rx="1" fill={accentColor} opacity="0.4" />
      <rect x="36" y="56" width="8" height="10" rx="1" fill="#BAE6FD" />
      {/* Ground strip */}
      <rect x="10" y="65" width="60" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function HospitalBuilding() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Main body */}
      <rect x="8" y="18" width="64" height="48" rx="1" fill="#E2E8F0" />
      {/* Blue roof stripe */}
      <rect x="8" y="18" width="64" height="7" rx="1" fill="#1D4ED8" />
      {/* "H" sign */}
      <rect x="28" y="5" width="24" height="16" rx="2" fill="#1D4ED8" />
      <text x="40" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">H</text>
      {/* Red cross */}
      <rect x="33" y="28" width="14" height="20" rx="1" fill="#EF4444" />
      <rect x="27" y="33" width="26" height="10" rx="1" fill="#EF4444" />
      <rect x="35" y="30" width="10" height="16" rx="1" fill="#FCA5A5" />
      <rect x="30" y="35" width="20" height="6" rx="1" fill="#FCA5A5" />
      {/* Windows */}
      {[0, 1].map(w => (
        <rect key={w} x={14 + w * 44} y="52" width="12" height="9" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      ))}
      {/* Entrance */}
      <rect x="30" y="56" width="20" height="10" rx="1" fill="#BAE6FD" />
      <rect x="4" y="65" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function UniversityBuilding() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Dome */}
      <ellipse cx="40" cy="14" rx="14" ry="10" fill="#D97706" />
      <ellipse cx="40" cy="14" rx="10" ry="7" fill="#FDE68A" />
      {/* Cross on dome */}
      <line x1="40" y1="6" x2="40" y2="22" stroke="#B45309" strokeWidth="1.5" />
      {/* Main body */}
      <rect x="8" y="22" width="64" height="44" rx="1" fill="#FDE68A" />
      {/* Columns */}
      {[14, 26, 38, 50, 62].map(x => (
        <rect key={x} x={x} y="22" width="6" height="36" rx="1" fill="#F59E0B" opacity="0.7" />
      ))}
      {/* Frieze */}
      <rect x="8" y="22" width="64" height="6" rx="1" fill="#D97706" />
      {/* Windows */}
      {[0, 1].map(w => (
        <rect key={w} x={16 + w * 32} y="42" width="14" height="12" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      ))}
      {/* Entrance arch */}
      <path d="M30,66 L30,56 Q40,48 50,56 L50,66" fill="#D97706" />
      <path d="M32,66 L32,57 Q40,51 48,57 L48,66" fill="#BAE6FD" />
      {/* Steps */}
      <rect x="24" y="64" width="32" height="3" rx="1" fill="#B45309" />
    </svg>
  )
}

function LibraryBuilding() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Roof flat with parapet */}
      <rect x="6" y="18" width="68" height="5" rx="1" fill="#92400E" />
      {/* Body */}
      <rect x="10" y="23" width="60" height="43" rx="1" fill="#FDE68A" />
      {/* Arched windows */}
      {[0, 1, 2].map(w => (
        <g key={w}>
          <rect x={14 + w * 18} y="32" width="12" height="14" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
          <ellipse cx={20 + w * 18} cy="32" rx="6" ry="5" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
        </g>
      ))}
      {/* Carved text band */}
      <rect x="10" y="23" width="60" height="7" rx="1" fill="#D97706" opacity="0.5" />
      {/* Door */}
      <rect x="30" y="52" width="20" height="14" rx="2" fill="#78350F" />
      <ellipse cx="40" cy="52" rx="10" ry="7" fill="#92400E" />
      {/* Steps */}
      <rect x="26" y="64" width="28" height="3" rx="1" fill="#92400E" />
    </svg>
  )
}

function OnlineLearning() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* House */}
      <polygon points="8,32 40,12 72,32" fill="#B45309" />
      <rect x="10" y="32" width="60" height="34" rx="1" fill="#FDE68A" />
      {/* Screen/laptop on house */}
      <rect x="18" y="38" width="44" height="24" rx="2" fill="#1E293B" />
      <rect x="20" y="40" width="40" height="18" rx="1" fill="#0EA5E9" opacity="0.8" />
      {/* Screen content lines */}
      <rect x="24" y="43" width="20" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="24" y="47" width="14" height="2" rx="1" fill="white" opacity="0.5" />
      <rect x="24" y="51" width="16" height="2" rx="1" fill="white" opacity="0.5" />
      {/* Play button */}
      <polygon points="46,48 46,55 52,51.5" fill="#FCD34D" />
      {/* Laptop base */}
      <rect x="14" y="62" width="52" height="3" rx="1" fill="#374151" />
    </svg>
  )
}

function RetailBuilding() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Body */}
      <rect x="6" y="20" width="68" height="46" rx="1" fill="#DBEAFE" />
      {/* Flat roof */}
      <rect x="4" y="16" width="72" height="6" rx="1" fill="#1D4ED8" />
      {/* Awning */}
      <path d="M6,22 Q20,30 34,22 Q48,30 62,22 Q70,28 74,22" fill="#2563EB" />
      {/* Display window */}
      <rect x="10" y="32" width="60" height="22" rx="1" fill="#BAE6FD" stroke="#93C5FD" strokeWidth="1" />
      {/* Window frame divider */}
      <line x1="40" y1="32" x2="40" y2="54" stroke="#93C5FD" strokeWidth="1.5" />
      {/* Cart icon in window */}
      <text x="22" y="47" fontSize="14" textAnchor="middle">🛒</text>
      <text x="58" y="47" fontSize="11" textAnchor="middle">💰</text>
      {/* Door */}
      <rect x="30" y="56" width="20" height="10" rx="1" fill="#BAE6FD" />
      <rect x="4" y="64" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function EmploymentOffice() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Building body */}
      <rect x="10" y="16" width="60" height="50" rx="1" fill="#EDE9FE" />
      {/* Roof band */}
      <rect x="8" y="12" width="64" height="6" rx="1" fill="#7C3AED" />
      {/* Sign */}
      <rect x="22" y="20" width="36" height="10" rx="1" fill="#7C3AED" />
      <text x="40" y="29" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">JOBS</text>
      {/* Window grid */}
      {[0, 1, 2].map(w =>
        [0, 1].map(f => (
          <rect key={`${f}-${w}`} x={14 + w * 18} y={36 + f * 14} width="12" height="9" rx="1" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="0.5" />
        ))
      )}
      {/* Door */}
      <rect x="30" y="56" width="20" height="10" rx="1" fill="#7C3AED" opacity="0.6" />
      <rect x="34" y="58" width="6" height="8" rx="1" fill="#C4B5FD" />
      <rect x="40" y="58" width="6" height="8" rx="1" fill="#C4B5FD" />
      <rect x="4" y="65" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function MarketBuilding() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Left stall */}
      <rect x="6" y="34" width="28" height="28" rx="1" fill="#FED7AA" />
      <path d="M4,24 L20,16 L36,24 L36,34 L4,34 Z" fill="#EA580C" />
      {/* Right stall */}
      <rect x="46" y="34" width="28" height="28" rx="1" fill="#FED7AA" />
      <path d="M44,24 L60,16 L76,24 L76,34 L44,34 Z" fill="#C2410C" />
      {/* Stall contents */}
      <text x="20" y="52" fontSize="12" textAnchor="middle">🥦</text>
      <text x="60" y="52" fontSize="12" textAnchor="middle">🍎</text>
      {/* Middle gap / path */}
      <rect x="34" y="34" width="12" height="28" fill="#1F2937" />
      <rect x="36" y="64" width="8" height="4" rx="1" fill="#374151" />
      {/* Bunting */}
      {[10, 20, 30, 40, 50, 60, 70].map((x, i) => (
        <polygon key={x} points={`${x},20 ${x + 5},28 ${x - 5},28`} fill={['#EF4444','#F59E0B','#22C55E'][i % 3]} opacity="0.9" />
      ))}
    </svg>
  )
}

function ClothingStore() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      <rect x="6" y="18" width="68" height="48" rx="1" fill="#FDE8F8" />
      {/* Sign */}
      <rect x="4" y="12" width="72" height="8" rx="1" fill="#9333EA" />
      <text x="40" y="19" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">FASHION</text>
      {/* Awning */}
      <path d="M6,20 L6,30 Q20,36 34,30 L34,20" fill="#A855F7" />
      <path d="M46,20 L46,30 Q60,36 74,30 L74,20" fill="#9333EA" />
      {/* Display window L */}
      <rect x="8" y="32" width="28" height="24" rx="1" fill="#F5D0FE" stroke="#D946EF" strokeWidth="0.8" />
      {/* Dress silhouette */}
      <path d="M18,36 L14,52 L30,52 L26,36 Q22,40 18,36Z" fill="#A855F7" opacity="0.7" />
      {/* Display window R */}
      <rect x="44" y="32" width="28" height="24" rx="1" fill="#F5D0FE" stroke="#D946EF" strokeWidth="0.8" />
      <text x="58" y="48" fontSize="14" textAnchor="middle">👔</text>
      {/* Door */}
      <rect x="31" y="54" width="18" height="12" rx="1" fill="#D946EF" opacity="0.4" />
      <rect x="4" y="64" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function SocialClub() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      <rect x="6" y="20" width="68" height="46" rx="1" fill="#FCE7F3" />
      {/* Roof */}
      <rect x="4" y="14" width="72" height="8" rx="1" fill="#DB2777" />
      {/* Neon sign */}
      <rect x="18" y="18" width="44" height="10" rx="3" fill="#831843" />
      <text x="40" y="26" textAnchor="middle" fill="#F9A8D4" fontSize="7" fontWeight="bold" fontFamily="sans-serif">CLUB</text>
      {/* Windows with glow */}
      {[0, 1, 2].map(w => (
        <rect key={w} x={12 + w * 20} y="36" width="14" height="12" rx="2" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />
      ))}
      {/* Disco lights */}
      <circle cx="22" cy="32" r="3" fill="#F472B6" opacity="0.8" />
      <circle cx="40" cy="32" r="3" fill="#60A5FA" opacity="0.8" />
      <circle cx="58" cy="32" r="3" fill="#34D399" opacity="0.8" />
      {/* Entrance */}
      <rect x="28" y="52" width="24" height="14" rx="2" fill="#DB2777" opacity="0.5" />
      <rect x="32" y="54" width="8" height="12" rx="1" fill="#FDE68A" opacity="0.7" />
      <rect x="40" y="54" width="8" height="12" rx="1" fill="#FDE68A" opacity="0.7" />
      <rect x="4" y="64" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function ParkArea() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      {/* Sky */}
      <rect x="0" y="0" width="80" height="72" rx="2" fill="#0F172A" />
      {/* Grass */}
      <ellipse cx="40" cy="66" rx="38" ry="10" fill="#166534" />
      <rect x="2" y="60" width="76" height="12" fill="#15803D" rx="1" />
      {/* Path */}
      <path d="M40,65 Q44,55 46,44 Q48,34 40,28 Q32,34 34,44 Q36,55 40,65" fill="#374151" opacity="0.7" />
      {/* Left tree */}
      <rect x="14" y="44" width="5" height="18" rx="1" fill="#78350F" />
      <circle cx="16" cy="36" r="12" fill="#15803D" />
      <circle cx="10" cy="40" r="8" fill="#166534" />
      <circle cx="22" cy="40" r="9" fill="#14532D" />
      {/* Right tree */}
      <rect x="58" y="46" width="5" height="16" rx="1" fill="#78350F" />
      <circle cx="60" cy="38" r="11" fill="#166534" />
      <circle cx="54" cy="43" r="7" fill="#15803D" />
      <circle cx="66" cy="43" r="8" fill="#14532D" />
      {/* Bench */}
      <rect x="34" y="55" width="12" height="3" rx="1" fill="#92400E" />
      <rect x="33" y="57" width="2" height="4" rx="1" fill="#78350F" />
      <rect x="45" y="57" width="2" height="4" rx="1" fill="#78350F" />
      {/* Small flowers */}
      <circle cx="26" cy="60" r="2" fill="#F472B6" />
      <circle cx="54" cy="61" r="2" fill="#FBBF24" />
      <circle cx="50" cy="63" r="1.5" fill="#F472B6" />
    </svg>
  )
}

function GymBuilding() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      <rect x="6" y="18" width="68" height="48" rx="1" fill="#FEE2E2" />
      {/* Roof */}
      <rect x="4" y="12" width="72" height="8" rx="1" fill="#DC2626" />
      {/* Sign */}
      <rect x="16" y="14" width="48" height="10" rx="2" fill="#991B1B" />
      <text x="40" y="22" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">GYM</text>
      {/* Dumbbell in window */}
      <rect x="10" y="30" width="28" height="20" rx="1" fill="#FECACA" stroke="#F87171" strokeWidth="0.8" />
      <rect x="14" y="37" width="20" height="6" rx="2" fill="#DC2626" />
      <circle cx="14" cy="40" r="5" fill="#991B1B" />
      <circle cx="34" cy="40" r="5" fill="#991B1B" />
      {/* Stats chart window */}
      <rect x="42" y="30" width="28" height="20" rx="1" fill="#FECACA" stroke="#F87171" strokeWidth="0.8" />
      <rect x="46" y="44" width="4" height="6" fill="#DC2626" />
      <rect x="52" y="40" width="4" height="10" fill="#EF4444" />
      <rect x="58" y="36" width="4" height="14" fill="#DC2626" />
      <rect x="64" y="33" width="4" height="17" fill="#EF4444" />
      {/* Entrance */}
      <rect x="26" y="52" width="28" height="14" rx="1" fill="#DC2626" opacity="0.4" />
      <rect x="32" y="54" width="10" height="12" rx="1" fill="#FECACA" />
      <rect x="4" y="64" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function MusicStudio() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      <rect x="6" y="20" width="68" height="46" rx="1" fill="#FDF2F8" />
      {/* Curved roof */}
      <path d="M4,20 Q40,8 76,20" fill="#BE185D" />
      {/* Music notes floating */}
      <text x="14" y="14" fontSize="10" fill="#F9A8D4">♪</text>
      <text x="52" y="11" fontSize="12" fill="#FBCFE8">♫</text>
      <text x="34" y="16" fontSize="8" fill="#F9A8D4">♩</text>
      {/* Speaker grills */}
      <rect x="10" y="28" width="22" height="26" rx="2" fill="#831843" />
      {[0, 1, 2, 3].map(r =>
        [0, 1, 2].map(c => (
          <circle key={`${r}-${c}`} cx={16 + c * 7} cy={33 + r * 6} r="1.5" fill="#FCE7F3" opacity="0.6" />
        ))
      )}
      {/* Window */}
      <rect x="36" y="28" width="34" height="22" rx="1" fill="#FBCFE8" stroke="#F472B6" strokeWidth="0.8" />
      <text x="53" y="43" fontSize="18" textAnchor="middle">🎸</text>
      {/* Door */}
      <rect x="28" y="54" width="24" height="12" rx="1" fill="#BE185D" opacity="0.5" />
      <rect x="4" y="64" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function ArtStudio() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      <rect x="6" y="16" width="68" height="50" rx="1" fill="#FDF4FF" />
      {/* Artistic roof with skylight */}
      <rect x="4" y="10" width="72" height="8" rx="1" fill="#9333EA" />
      <rect x="28" y="6" width="24" height="10" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="1" />
      {/* Large studio window */}
      <rect x="10" y="24" width="44" height="30" rx="1" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1" />
      {/* Canvas inside */}
      <rect x="14" y="28" width="36" height="22" rx="1" fill="white" />
      {/* Colorful painting */}
      <circle cx="24" cy="36" r="5" fill="#EF4444" opacity="0.7" />
      <circle cx="32" cy="40" r="5" fill="#3B82F6" opacity="0.7" />
      <circle cx="40" cy="35" r="5" fill="#22C55E" opacity="0.7" />
      <circle cx="34" cy="34" r="5" fill="#F59E0B" opacity="0.6" />
      {/* Palette */}
      <rect x="58" y="28" width="14" height="22" rx="3" fill="#E9D5FF" stroke="#A855F7" strokeWidth="0.8" />
      {['#EF4444','#3B82F6','#22C55E','#F59E0B'].map((c, i) => (
        <circle key={i} cx={62 + (i % 2) * 6} cy={33 + Math.floor(i / 2) * 8} r="3" fill={c} />
      ))}
      {/* Door */}
      <rect x="28" y="56" width="24" height="10" rx="1" fill="#9333EA" opacity="0.4" />
      <rect x="4" y="64" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function BudgetHouse() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Small simple house */}
      <polygon points="14,32 40,16 66,32" fill="#065F46" />
      <rect x="16" y="32" width="48" height="32" rx="1" fill="#D1FAE5" />
      {/* Chimney */}
      <rect x="50" y="14" width="6" height="14" rx="1" fill="#065F46" />
      {/* Door */}
      <rect x="34" y="46" width="14" height="18" rx="1" fill="#78350F" />
      <circle cx="44" cy="56" r="1.5" fill="#FCD34D" />
      {/* Windows */}
      <rect x="20" y="38" width="10" height="8" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      <line x1="25" y1="38" x2="25" y2="46" stroke="#7DD3FC" strokeWidth="0.5" />
      <rect x="50" y="38" width="10" height="8" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      <line x1="55" y1="38" x2="55" y2="46" stroke="#7DD3FC" strokeWidth="0.5" />
      {/* Garden / fence */}
      <rect x="4" y="60" width="10" height="5" fill="#15803D" />
      <rect x="66" y="60" width="10" height="5" fill="#15803D" />
      {/* Step */}
      <rect x="32" y="64" width="18" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function MidHouse() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Two-story house with porch */}
      <polygon points="8,28 40,10 72,28" fill="#059669" />
      <rect x="8" y="28" width="64" height="38" rx="1" fill="#A7F3D0" />
      {/* Chimney */}
      <rect x="56" y="10" width="6" height="14" rx="1" fill="#065F46" />
      {/* Upper windows */}
      <rect x="14" y="32" width="12" height="9" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      <rect x="32" y="32" width="12" height="9" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      <rect x="50" y="32" width="12" height="9" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      {/* Porch roof */}
      <rect x="26" y="46" width="28" height="4" fill="#065F46" />
      <rect x="28" y="50" width="2" height="16" fill="#065F46" />
      <rect x="50" y="50" width="2" height="16" fill="#065F46" />
      {/* Door */}
      <rect x="34" y="50" width="12" height="16" rx="1" fill="#78350F" />
      <circle cx="43" cy="58" r="1.5" fill="#FCD34D" />
      {/* Lower windows */}
      <rect x="14" y="52" width="10" height="10" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      <rect x="56" y="52" width="10" height="10" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.5" />
      {/* Garden */}
      <rect x="4" y="62" width="6" height="4" fill="#15803D" />
      <rect x="70" y="62" width="6" height="4" fill="#15803D" />
      <circle cx="8" cy="60" r="3" fill="#15803D" />
      <circle cx="72" cy="60" r="3" fill="#15803D" />
    </svg>
  )
}

function LuxuryMansion() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="2" y="66" width="76" height="4" rx="1" fill="#374151" />
      {/* Center tower */}
      <polygon points="30,20 40,8 50,20" fill="#064E3B" />
      <rect x="30" y="20" width="20" height="46" rx="1" fill="#ECFDF5" />
      {/* Side wings */}
      <polygon points="4,32 16,22 28,32" fill="#065F46" />
      <rect x="4" y="32" width="24" height="34" rx="1" fill="#D1FAE5" />
      <polygon points="52,32 64,22 76,32" fill="#065F46" />
      <rect x="52" y="32" width="24" height="34" rx="1" fill="#D1FAE5" />
      {/* Gold trim */}
      <rect x="30" y="32" width="20" height="2" fill="#FCD34D" />
      {/* Crown / spire */}
      <line x1="40" y1="8" x2="40" y2="3" stroke="#FCD34D" strokeWidth="1.5" />
      <circle cx="40" cy="3" r="2" fill="#FCD34D" />
      {/* Central balcony */}
      <rect x="30" y="42" width="20" height="8" fill="#FCD34D" opacity="0.3" stroke="#FCD34D" strokeWidth="0.5" />
      <rect x="34" y="40" width="12" height="14" rx="1" fill="#7C2D12" />
      <ellipse cx="40" cy="40" rx="6" ry="3" fill="#7C2D12" />
      {/* Upper windows on tower */}
      <rect x="34" y="26" width="5" height="8" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="41" y="26" width="5" height="8" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      {/* Wing windows */}
      <rect x="8" y="38" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="18" y="38" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="56" y="38" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="66" y="38" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="8" y="52" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="18" y="52" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="56" y="52" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="66" y="52" width="6" height="9" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
      {/* Steps */}
      <rect x="28" y="64" width="24" height="3" fill="#92400E" />
      <rect x="26" y="66" width="28" height="2" fill="#7C2D12" />
      {/* Fountain */}
      <circle cx="12" cy="63" r="3" fill="#60A5FA" opacity="0.6" />
      <circle cx="68" cy="63" r="3" fill="#60A5FA" opacity="0.6" />
    </svg>
  )
}

function McDonaldsRestaurant() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Big golden arches sign on a pole */}
      <rect x="38" y="22" width="4" height="14" fill="#9CA3AF" />
      <path d="M22,22 C22,8 34,8 34,22 M34,22 C34,12 40,12 40,22 M40,22 C40,12 46,12 46,22 M46,22 C46,8 58,8 58,22"
        fill="none" stroke="#FBBF24" strokeWidth="7" strokeLinecap="round" />
      {/* Restaurant body — red base, white upper */}
      <rect x="8" y="36" width="64" height="30" rx="1" fill="#FEF3C7" />
      <rect x="8" y="58" width="64" height="8" rx="1" fill="#DC2626" />
      {/* Red roof band */}
      <rect x="6" y="33" width="68" height="5" rx="1" fill="#DC2626" />
      {/* Windows */}
      {[0, 1, 2, 3].map(w => (
        <rect key={w} x={12 + w * 15} y="42" width="11" height="12" rx="1" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="0.6" />
      ))}
      {/* Drive-thru / entrance */}
      <rect x="30" y="56" width="20" height="10" rx="1" fill="#FBBF24" />
      <rect x="34" y="58" width="6" height="8" rx="1" fill="#FEF3C7" />
      <rect x="40" y="58" width="6" height="8" rx="1" fill="#FEF3C7" />
      <rect x="4" y="65" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

function FancyRestaurant() {
  return (
    <svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="4" y="66" width="72" height="4" rx="1" fill="#374151" />
      {/* Elegant dark facade */}
      <rect x="8" y="20" width="64" height="46" rx="1" fill="#1E293B" />
      {/* Gold cornice */}
      <rect x="6" y="16" width="68" height="6" rx="1" fill="#D4AF37" />
      <rect x="6" y="22" width="68" height="2" fill="#B8860B" />
      {/* Awning — striped maroon */}
      <path d="M8,28 L8,36 Q24,42 40,36 Q56,42 72,36 L72,28 Z" fill="#7F1D1D" />
      {[12, 24, 36, 48, 60].map(x => (
        <rect key={x} x={x} y="28" width="6" height="9" fill="#B91C1C" opacity="0.7" />
      ))}
      {/* Name plaque */}
      <rect x="24" y="17" width="32" height="6" rx="1" fill="#0F172A" />
      <text x="40" y="22" textAnchor="middle" fill="#D4AF37" fontSize="5" fontWeight="bold" fontFamily="Georgia, serif">BISTRO</text>
      {/* Warm-lit windows */}
      {[0, 1].map(w => (
        <rect key={w} x={12 + w * 42} y="44" width="20" height="16" rx="1" fill="#FDE68A" stroke="#D4AF37" strokeWidth="0.8" />
      ))}
      {/* Wine glass in window */}
      <text x="22" y="58" fontSize="11" textAnchor="middle">🍷</text>
      <text x="58" y="58" fontSize="11" textAnchor="middle">🍽️</text>
      {/* Grand entrance with gold trim */}
      <rect x="34" y="46" width="12" height="20" rx="1" fill="#7C2D12" />
      <rect x="34" y="46" width="12" height="20" rx="1" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
      <circle cx="44" cy="57" r="1.3" fill="#FCD34D" />
      {/* Topiary planters */}
      <rect x="10" y="60" width="6" height="6" fill="#475569" />
      <circle cx="13" cy="58" r="4" fill="#15803D" />
      <rect x="64" y="60" width="6" height="6" fill="#475569" />
      <circle cx="67" cy="58" r="4" fill="#15803D" />
      <rect x="4" y="65" width="72" height="3" rx="1" fill="#4B5563" />
    </svg>
  )
}

export function BuildingArt({ locationId }: { locationId: string }) {
  switch (locationId) {
    case 'employment_office':  return <EmploymentOffice />
    case 'tech_company':       return <OfficeTower wallColor="#DBEAFE" accentColor="#2563EB" floors={3} />
    case 'hospital':           return <HospitalBuilding />
    case 'office_building':    return <McDonaldsRestaurant />
    case 'retail_store':       return <RetailBuilding />
    case 'school':             return <FancyRestaurant />
    case 'university':         return <UniversityBuilding />
    case 'library':            return <LibraryBuilding />
    case 'online_courses':     return <OnlineLearning />
    case 'apartment_budget':   return <BudgetHouse />
    case 'apartment_mid':      return <MidHouse />
    case 'apartment_luxury':   return <LuxuryMansion />
    case 'market':             return <MarketBuilding />
    case 'clothing_store':     return <ClothingStore />
    case 'social_club':        return <SocialClub />
    case 'park':               return <ParkArea />
    case 'gym':                return <GymBuilding />
    case 'music_studio':       return <MusicStudio />
    case 'art_studio':         return <ArtStudio />
    default:                   return <OfficeTower wallColor="#E2E8F0" accentColor="#64748B" floors={2} />
  }
}
