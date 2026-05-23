type IconProps = { n: string; size?: number; stroke?: number; color?: string; className?: string };

export function Icon({ n, size = 20, stroke = 1.6, color = 'currentColor', className }: IconProps) {
  const c: React.SVGProps<SVGPathElement> = {
    fill: 'none', stroke: color, strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  } as any;

  const paths: Record<string, React.ReactNode> = {
    home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-4v-6h-8v6H4a1 1 0 0 1-1-1Z" {...c} />,
    box: <g {...c}><path d="M3 8 12 4l9 4-9 4-9-4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></g>,
    calendar: <g {...c}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></g>,
    user: <g {...c}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></g>,
    chev: <path d="m9 6 6 6-6 6" {...c} />,
    chevL: <path d="m15 6-6 6 6 6" {...c} />,
    chevD: <path d="m6 9 6 6 6-6" {...c} />,
    check: <path d="M5 12.5 10 17 19 7" {...c} />,
    plus: <path d="M12 5v14M5 12h14" {...c} />,
    search: <g {...c}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></g>,
    bell: <g {...c}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" /><path d="M10 21h4" /></g>,
    camera: <g {...c}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><circle cx="12" cy="13.5" r="3.5" /></g>,
    package: <g {...c}><path d="M3 8 12 4l9 4-9 4-9-4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="m7.5 6 9 4" /></g>,
    download: <g {...c}><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></g>,
    close: <path d="M6 6l12 12M18 6 6 18" {...c} />,
    arrow: <g {...c}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></g>,
    arrowL: <g {...c}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></g>,
    cog: <g {...c}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></g>,
    door: <g {...c}><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" /><path d="M2 21h20M15 12.5v.01" /></g>,
    report: <g {...c}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></g>,
    key: <g {...c}><circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 9-9M16 7l3 3" /></g>,
    eye: <g {...c}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></g>,
    whatsapp: <g {...c}><path d="M3 21l1.5-4.5A8.5 8.5 0 1 1 8 20Z" /><path d="M8.5 9.5c.5 2 2 3.5 4 4 .8.2 1.4-.4 1.5-1l.2-.6c.1-.4.5-.6.9-.4l1.4.5c.4.1.6.5.4 1A3 3 0 0 1 14 15a6.4 6.4 0 0 1-5-5 3 3 0 0 1 1.5-2.9c.5-.2.9 0 1 .4l.5 1.4c.1.4 0 .8-.3.9l-.6.2c-.6.1-1 .7-1 1.5Z" /></g>,
    ball: <g {...c}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></g>,
    sparkles: <g {...c}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" /></g>,
    grid: <g {...c}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></g>,
    logout: <g {...c}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" {...c} /><line x1="21" y1="12" x2="9" y2="12" {...c} /></g>,
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ flexShrink: 0 }}>
      {paths[n] ?? null}
    </svg>
  );
}
