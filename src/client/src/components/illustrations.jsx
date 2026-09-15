// Small, original decorative SVG shapes used to dress up dashboard cards —
// coins, sparkles, organic blobs. Kept separate from the beaver mascot art.

export function Coin({ className = "", size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
      <circle cx="16" cy="16" r="14.5" fill="#E1AE55" stroke="#B98639" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#F6DFAF" strokeWidth="1.5" strokeDasharray="2 3.2" />
      <path
        d="M16 10.5c-2 0-3.4 1.1-3.4 2.5 0 3.2 5.6 1.8 5.6 4.4 0 1.1-1.1 1.9-2.6 1.9-1.3 0-2.3-.5-2.9-1.3M16 9.3v1.3M16 21.4v-1.3"
        stroke="#8A5F22"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CoinStack({ className = "", size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
      <ellipse cx="20" cy="31" rx="14" ry="4.2" fill="#B98639" />
      <ellipse cx="20" cy="26" rx="14" ry="4.2" fill="#E1AE55" />
      <ellipse cx="20" cy="21" rx="14" ry="4.2" fill="#EFC978" />
      <ellipse cx="20" cy="16" rx="14" ry="4.2" fill="#E1AE55" />
      <ellipse cx="20" cy="16" rx="14" ry="4.2" fill="none" stroke="#B98639" strokeWidth="1.2" />
      <text x="20" y="19.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#8A5F22">
        $
      </text>
    </svg>
  );
}

export function SparkleBurst({ className = "", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 1.5c.4 4 1.9 6.7 5.7 8.3.4.2.4.9 0 1L12 13.2c-.4 4-1.9 6.7-5.7 8.3-.4.2-.4-.9 0-1L12 10.5c.4-4 1.9-6.7 5.7-8.3.4-.2.4.9 0 1L6.3 11.8"
        fill="currentColor"
        opacity="0"
      />
      <path
        d="M12 2c.55 3.7 2.05 6.15 5.6 7.6.5.2.5.6 0 .8-3.55 1.45-5.05 3.9-5.6 7.6-.55-3.7-2.05-6.15-5.6-7.6-.5-.2-.5-.6 0-.8C9.95 8.15 11.45 5.7 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Blob({ className = "", fill = "currentColor" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" preserveAspectRatio="none">
      <path
        d="M45.6,-58.3C58.8,-49.7,68.4,-34.6,71.8,-18.2C75.2,-1.8,72.5,16,64.1,30.3C55.7,44.7,41.6,55.6,25.9,62.1C10.2,68.6,-7.1,70.8,-23.7,66.7C-40.3,62.6,-56.2,52.2,-65.4,37.5C-74.6,22.8,-77.1,3.8,-72.8,-13.2C-68.5,-30.3,-57.4,-45.4,-43.2,-54.1C-29,-62.8,-14.5,-65.2,1.6,-67.2C17.7,-69.2,32.4,-66.9,45.6,-58.3Z"
        fill={fill}
        transform="translate(100 100)"
      />
    </svg>
  );
}

export function Flag({ className = "", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 21V3" stroke="#7c6a54" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 4.5c2-1.3 4-1.3 6 0s4 1.3 6 0v9c-2 1.3-4 1.3-6 0s-4-1.3-6 0Z" fill="currentColor" />
    </svg>
  );
}

export function SavingsJar({ className = "", size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 48" className={className} fill="none">
      <rect x="10" y="4" width="20" height="6" rx="2" fill="#8A7A66" />
      <path
        d="M8 12c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v28a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z"
        fill="#EAF1EC"
        stroke="#A9C6A0"
        strokeWidth="1.6"
      />
      <path d="M8 24h24v16a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill="#CFE3D2" />
      <circle cx="20" cy="18" r="3.6" fill="#E1AE55" stroke="#B98639" strokeWidth="1.1" />
    </svg>
  );
}

export function ReceiptStack({ className = "", size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 40" className={className} fill="none">
      <path d="M3 0h24v34l-3-3-3 3-3-3-3 3-3-3-3 3-3-3-3 3V0Z" fill="#FBFAF5" stroke="#E4E4DA" strokeWidth="1" />
      <rect x="8" y="7" width="16" height="2.2" rx="1.1" fill="#C9C6B8" />
      <rect x="8" y="12.5" width="16" height="2.2" rx="1.1" fill="#C9C6B8" />
      <rect x="8" y="18" width="10" height="2.2" rx="1.1" fill="#C9C6B8" />
      <rect x="8" y="25" width="16" height="2.6" rx="1.1" fill="#D77F6C" />
    </svg>
  );
}

export function WalletIllustration({ className = "", size = 44 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 44 30" className={className} fill="none">
      <rect x="0" y="0" width="44" height="30" rx="7" fill="#2B5F47" />
      <rect x="0" y="0" width="44" height="12" rx="7" fill="#356F53" />
      <circle cx="34" cy="15" r="5" fill="#E1AE55" stroke="#B98639" strokeWidth="1" />
    </svg>
  );
}
