export function Brand({ size = 'md', color = 'var(--ink)' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const lg = size === 'lg';
  const sz = lg ? 40 : 28;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color }}>
      <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="22" stroke={color} strokeWidth="1.6" />
        <rect x="8" y="6" width="16" height="22" fill={color} opacity=".08" />
        <path d="M4 14h24M4 20h24M4 26h24" stroke={color} strokeWidth="1" opacity=".5" />
        <path d="M12 6V4h8v2" stroke={color} strokeWidth="1.6" />
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div className="label" style={{ fontSize: lg ? 10 : 9, color: 'var(--muted)' }}>Edifício</div>
        <div className="disp" style={{ fontSize: lg ? 22 : 15, fontWeight: 600, letterSpacing: '-0.02em', color }}>
          Mansão Heitor Villa Lobos
        </div>
      </div>
    </div>
  );
}
