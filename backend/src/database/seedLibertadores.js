const sqlite = require('./sqlite');

const TYC_URL = 'https://play.tycsports.com/copa-libertadores/';
const YT_CONMEBOL = 'https://www.youtube.com/@conmebol';
const YT_UOL = 'https://www.youtube.com/@uolesporte';

const matches = [
  // === GROUP A ===
  // MD1 - May 24
  { group_name: 'A', home_team: 'Fantasmas M.M. (BOL)', away_team: 'Boca Juniors (ARG)', home_score: 0, away_score: 3, status: 'finished', date: '2026-05-24', time: '18:00', round: 'Fecha 1', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'A', home_team: 'Peñarol (URU)', away_team: 'Carlos Barbosa (BRA)', home_score: 1, away_score: 6, status: 'finished', date: '2026-05-24', time: '20:00', round: 'Fecha 1', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  // MD2 - May 25
  { group_name: 'A', home_team: 'Boca Juniors (ARG)', away_team: 'Peñarol (URU)', home_score: 5, away_score: 1, status: 'finished', date: '2026-05-25', time: '18:00', round: 'Fecha 2', stream_link: 'https://play.tycsports.com/copa-libertadores/-boca-juniors-arg-vs-penarol-uru-conmebol-libertadores-futsal-2026-id729169.html', youtube_link: YT_CONMEBOL },
  { group_name: 'A', home_team: 'Fantasmas M.M. (BOL)', away_team: 'Carlos Barbosa (BRA)', home_score: 0, away_score: 5, status: 'finished', date: '2026-05-25', time: '20:00', round: 'Fecha 2', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  // MD3 - May 26
  { group_name: 'A', home_team: 'Peñarol (URU)', away_team: 'Fantasmas M.M. (BOL)', home_score: 3, away_score: 3, status: 'finished', date: '2026-05-26', time: '18:00', round: 'Fecha 3', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'A', home_team: 'Carlos Barbosa (BRA)', away_team: 'Boca Juniors (ARG)', status: 'scheduled', date: '2026-05-26', time: '20:00', round: 'Fecha 3', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },

  // === GROUP B ===
  // MD1 - May 24
  { group_name: 'B', home_team: 'Magnus (BRA)', away_team: 'Divino Niño (ECU)', home_score: 5, away_score: 1, status: 'finished', date: '2026-05-24', time: '14:00', round: 'Fecha 1', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'B', home_team: 'Centauros (VEN)', away_team: 'Panta Walon (PER)', home_score: 3, away_score: 1, status: 'finished', date: '2026-05-24', time: '16:00', round: 'Fecha 1', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  // MD2 - May 25
  { group_name: 'B', home_team: 'Panta Walon (PER)', away_team: 'Magnus (BRA)', home_score: 0, away_score: 7, status: 'finished', date: '2026-05-25', time: '14:00', round: 'Fecha 2', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'B', home_team: 'Centauros (VEN)', away_team: 'Divino Niño (ECU)', home_score: 3, away_score: 1, status: 'finished', date: '2026-05-25', time: '16:00', round: 'Fecha 2', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  // MD3 - May 26
  { group_name: 'B', home_team: 'Magnus (BRA)', away_team: 'Centauros (VEN)', status: 'scheduled', date: '2026-05-26', time: '14:00', round: 'Fecha 3', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'B', home_team: 'Divino Niño (ECU)', away_team: 'Panta Walon (PER)', status: 'scheduled', date: '2026-05-26', time: '16:00', round: 'Fecha 3', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },

  // === GROUP C ===
  // MD1 - May 24
  { group_name: 'C', home_team: 'Nacional (URU)', away_team: 'Colo-Colo (CHI)', home_score: 7, away_score: 2, status: 'finished', date: '2026-05-24', time: '10:00', round: 'Fecha 1', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'C', home_team: 'Cerro Porteño (PAR)', away_team: 'Deportivo Lyon Cali (COL)', home_score: 3, away_score: 2, status: 'finished', date: '2026-05-24', time: '12:00', round: 'Fecha 1', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  // MD2 - May 25
  { group_name: 'C', home_team: 'Deportivo Lyon Cali (COL)', away_team: 'Nacional (URU)', home_score: 3, away_score: 1, status: 'finished', date: '2026-05-25', time: '10:00', round: 'Fecha 2', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'C', home_team: 'Cerro Porteño (PAR)', away_team: 'Colo-Colo (CHI)', home_score: 1, away_score: 5, status: 'finished', date: '2026-05-25', time: '12:00', round: 'Fecha 2', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  // MD3 - May 26
  { group_name: 'C', home_team: 'Nacional (URU)', away_team: 'Cerro Porteño (PAR)', status: 'scheduled', date: '2026-05-26', time: '10:00', round: 'Fecha 3', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
  { group_name: 'C', home_team: 'Colo-Colo (CHI)', away_team: 'Deportivo Lyon Cali (COL)', status: 'scheduled', date: '2026-05-26', time: '12:00', round: 'Fecha 3', stream_link: TYC_URL, youtube_link: YT_CONMEBOL },
];

async function seed() {
  await sqlite.init();
  for (const match of matches) {
    sqlite.upsertLibertadoresMatch(match);
  }
  const all = sqlite.getLibertadoresMatches();
  console.log(`Libertadores: ${all.length} matches seeded`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
