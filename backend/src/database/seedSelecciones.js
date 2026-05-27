const sqlite = require('./sqlite');

const matches = [
  // === SELECCION SENIOR (Copa América Futsal 2026) ===
  { category: 'senior', competition: 'copa-america', home_team: 'Argentina', away_team: 'Brasil', home_score: 2, away_score: 5, status: 'finished', date: '2026-02-01', time: '20:00', venue: 'Asunción, Paraguay', stream_link: 'https://play.tycsports.com/', youtube_link: 'https://www.youtube.com/@conmebol' },

  // === SELECCION SUB-20 (Sudamericano Sub-20 2026) ===
  { category: 'sub20', competition: 'sudamericano', home_team: 'Argentina', away_team: 'Brasil', status: 'scheduled', date: '2026-06-15', time: '18:00', venue: 'Lima, Perú' },
  { category: 'sub20', competition: 'sudamericano', home_team: 'Argentina', away_team: 'Paraguay', status: 'scheduled', date: '2026-06-18', time: '16:00', venue: 'Lima, Perú' },
  { category: 'sub20', competition: 'sudamericano', home_team: 'Argentina', away_team: 'Colombia', status: 'scheduled', date: '2026-06-21', time: '18:00', venue: 'Lima, Perú' },

  // === SELECCION SUB-17 (Sudamericano Sub-17 2026) ===
  { category: 'sub17', competition: 'sudamericano', home_team: 'Argentina', away_team: 'Brasil', status: 'scheduled', date: '2026-07-10', time: '16:00', venue: 'Montevideo, Uruguay' },
  { category: 'sub17', competition: 'sudamericano', home_team: 'Argentina', away_team: 'Venezuela', status: 'scheduled', date: '2026-07-13', time: '14:00', venue: 'Montevideo, Uruguay' },

  // === SELECCION FEMENINA ===
  { category: 'femenina', competition: 'copa-america', home_team: 'Argentina', away_team: 'Brasil', status: 'scheduled', date: '2026-08-20', time: '19:00', venue: 'Buenos Aires, Argentina' },
  { category: 'femenina', competition: 'copa-america', home_team: 'Argentina', away_team: 'Colombia', status: 'scheduled', date: '2026-08-23', time: '17:00', venue: 'Buenos Aires, Argentina' },
];

async function seed() {
  await sqlite.init();
  for (const match of matches) {
    sqlite.upsertSeleccionesMatch(match);
  }
  const all = sqlite.getSeleccionesMatches();
  console.log(`Selecciones: ${all.length} matches seeded`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
