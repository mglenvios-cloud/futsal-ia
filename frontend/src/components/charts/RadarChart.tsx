'use client';

export function RadarChart({ stats }: { stats?: Record<string, number> }) {
  const categories = [
    { key: 'attack', label: 'Ataque', value: stats.attack || 75 },
    { key: 'defense', label: 'Defensa', value: stats.defense || 70 },
    { key: 'possession', label: 'Posesión', value: stats.possession || 60 },
    { key: 'goals', label: 'Goles', value: stats.goals || 80 },
    { key: 'passing', label: 'Pases', value: stats.passing || 65 },
    { key: 'discipline', label: 'Disciplina', value: stats.discipline || 55 },
  ];

  const size = 200;
  const center = size / 2;
  const radius = 80;
  const angleStep = (2 * Math.PI) / categories.length;

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = categories.map((cat, i) => getPoint(i, cat.value));
  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[20, 40, 60, 80, 100].map((val) => {
          const pts = categories.map((_, i) => {
            const p = getPoint(i, val);
            return `${p.x},${p.y}`;
          }).join(' ');
          return <polygon key={val} points={pts} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth={1} />;
        })}

        {categories.map((_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(148,163,184,0.1)" strokeWidth={1} />;
        })}

        <polygon points={polygonPath} fill="rgba(249,115,22,0.2)" stroke="#f97316" strokeWidth={2} />

        {categories.map((cat, i) => {
          const p = getPoint(i, cat.value);
          return (
            <g key={cat.key}>
              <circle cx={p.x} cy={p.y} r={4} fill="#f97316" />
              <text
                x={getPoint(i, 115).x}
                y={getPoint(i, 115).y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px]"
                fill="#94a3b8"
                fontSize="10"
              >
                {cat.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {categories.map((cat) => (
          <div key={cat.key} className="text-center">
            <p className="text-xs font-bold text-white">{cat.value}%</p>
            <p className="text-[10px] text-surface-500">{cat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
