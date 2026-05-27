const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'futsal.db');

async function main() {
  if (fs.existsSync(DB_PATH)) {
    const sqlite = require('./src/database/sqlite');
    await sqlite.init();
    const teams = sqlite.getTeams({});
    if (teams.length > 0) {
      console.log('DB exists with', teams.length, 'teams');
      await runEnhancements(sqlite);
      return;
    }
  }

  console.log('DB empty or missing, running seed...');
  execSync('node seed-reales-2026.js', { stdio: 'inherit' });
  execSync('node src/database/seedLibertadores.js', { stdio: 'inherit' });
  execSync('node src/database/seedSelecciones.js', { stdio: 'inherit' });
  console.log('Seed complete');
  const sqlite = require('./src/database/sqlite');
  await sqlite.init();
  await runEnhancements(sqlite);
  console.log('All data ready!');
}

async function runEnhancements(sqlite) {
  const teams = sqlite.getTeams({});
  const matchesResult = sqlite.getMatches({ limit: 1 });
  const matches = matchesResult.data || matchesResult;
  const playerCount = sqlite.getPlayers(teams[0]?.id)?.length || 0;
  const streamCount = matches.filter(m => m.stream_link || m.youtube_link).length;
  const teamCount = teams.length;

  console.log('Enhancements check:', { teams: teamCount, players: playerCount, streams: streamCount });

  if (playerCount === 0 && teamCount > 0) {
    console.log('Adding players...');
    seedPlayers(sqlite, teams);
  }

  if (streamCount === 0 && teamCount > 0) {
    console.log('Assigning stream links...');
    assignStreamLinks(sqlite, matches);
  }
}

function seedPlayers(db, teams) {
  const posiciones = ['Arquero', 'Cierre', 'Ala Derecho', 'Ala Izquierdo', 'Pívot'];
  const nombres = [
    'Lucas Martínez', 'Matías Gómez', 'Nicolás Fernández', 'Santiago López', 'Facundo Rodríguez',
    'Gonzalo Díaz', 'Tomás Pérez', 'Julián García', 'Franco Sánchez', 'Agustín Romero',
    'Emiliano Torres', 'Lautaro González', 'Federico Álvarez', 'Ignacio Castro', 'Brian Sosa',
    'Kevin Miranda', 'Alan Vargas', 'Diego Acosta', 'Luciano Medina', 'Mariano Morales',
    'Hernán Ortiz', 'Pablo Ruiz', 'Maxi Navarro', 'Gabriel Silva', 'Ramiro Herrera',
    'Joaquín Flores', 'Juan Cruz Pereyra', 'Alejandro Campos', 'Rodrigo Benítez', 'Sebastián Vega',
    'Damián Ríos', 'Leonardo Correa', 'Ezequiel Ferreyra', 'Cristian Mansilla', 'Rafael Cáceres',
    'Nahuel Agüero', 'Marcos Ojeda', 'Darío Roldán', 'Luis Soria', 'Hugo Castillo',
  ];
  for (const team of teams) {
    const numPlayers = 6 + Math.floor(Math.random() * 4);
    const usedNames = new Set();
    for (let p = 0; p < numPlayers; p++) {
      let name;
      do { name = nombres[Math.floor(Math.random() * nombres.length)]; } while (usedNames.has(name));
      usedNames.add(name);
      db.addPlayer({
        team_id: team.id, name,
        position: posiciones[Math.floor(Math.random() * posiciones.length)],
        number: 1 + Math.floor(Math.random() * 20),
        nationality: Math.random() > 0.9 ? ['Brasil', 'Uruguay', 'Paraguay'][Math.floor(Math.random() * 3)] : 'Argentina',
        age: 20 + Math.floor(Math.random() * 15),
        goals: Math.floor(Math.random() * 8),
        assists: Math.floor(Math.random() * 5),
        yellow_cards: Math.floor(Math.random() * 4),
        red_cards: Math.random() > 0.8 ? 1 : 0,
        matches_played: 5 + Math.floor(Math.random() * 20),
      });
    }
  }
  console.log('Players seeded:', db.getPlayers(teams[0]?.id).length);
}

function assignStreamLinks(db, matches) {
  for (const m of matches) {
    const isPrimeraA = m.league === 'primera-a' || m.league === 'femenino-a';
    const updates = {};
    if (isPrimeraA) {
      updates.stream_link = 'https://lpfplay.com/';
    } else {
      updates.youtube_link = `https://www.youtube.com/watch?v=${m.home_team?.toLowerCase().replace(/[^a-z0-9]/g, '')}-vs-${m.away_team?.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    }
    if (Object.keys(updates).length > 0) {
      db.updateMatch(m.id, updates);
    }
  }
  console.log('Stream links assigned to', matches.length, 'matches');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
