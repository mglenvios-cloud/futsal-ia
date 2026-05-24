const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'futsal.db');

function main() {
  // Check if DB exists and has data
  if (fs.existsSync(DB_PATH)) {
    try {
      const db = require('better-sqlite3')(DB_PATH);
      const count = db.prepare('SELECT COUNT(*) as c FROM teams').get();
      db.close();
      if (count.c > 0) {
        console.log('DB exists with', count.c, 'teams');
        runEnhancements();
        return;
      }
    } catch(e) {}
  }

  // Seed the database
  console.log('DB empty or missing, running seed...');
  execSync('node seed-reales-2026.js', { stdio: 'inherit' });
  console.log('Seed complete');
  runEnhancements();
  console.log('All data ready!');
}

function runEnhancements() {
  const db2 = require('better-sqlite3')(DB_PATH);
  try {
    // Check if players exist
    const playerCount = db2.prepare('SELECT COUNT(*) as c FROM players').get().c;
    const streamCount = db2.prepare("SELECT COUNT(*) as c FROM matches WHERE length(stream_link) > 0 OR length(youtube_link) > 0").get().c;
    const teamCount = db2.prepare('SELECT COUNT(*) as c FROM teams').get().c;

    console.log('Enhancements check:', { teams: teamCount, players: playerCount, streams: streamCount });

    // Seed players if missing
    if (playerCount === 0 && teamCount > 0) {
      console.log('Adding players...');
      seedPlayers(db2);
    }

    // Assign stream links if missing
    if (streamCount === 0 && teamCount > 0) {
      console.log('Assigning stream links...');
      assignStreamLinks(db2);
    }
  } catch(e) {
    console.error('Enhancement error:', e.message);
  }
  db2.close();
}

function seedPlayers(db) {
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
  const teams = db.prepare('SELECT id, name FROM teams').all();
  for (const team of teams) {
    const numPlayers = 6 + Math.floor(Math.random() * 4);
    const usedNames = new Set();
    for (let p = 0; p < numPlayers; p++) {
      let name;
      do { name = nombres[Math.floor(Math.random() * nombres.length)]; } while (usedNames.has(name));
      usedNames.add(name);
      db.prepare(`INSERT INTO players (team_id, name, position, number, nationality, age, goals, assists, yellow_cards, red_cards, matches_played)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        team.id, name, posiciones[Math.floor(Math.random() * posiciones.length)],
        1 + Math.floor(Math.random() * 20),
        Math.random() > 0.9 ? ['Brasil', 'Uruguay', 'Paraguay'][Math.floor(Math.random() * 3)] : 'Argentina',
        20 + Math.floor(Math.random() * 15),
        Math.floor(Math.random() * 8), Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 4), Math.random() > 0.8 ? 1 : 0,
        5 + Math.floor(Math.random() * 20)
      );
    }
  }
  console.log('Players seeded:', db.prepare('SELECT COUNT(*) as c FROM players').get().c);
}

function assignStreamLinks(db) {
  const matches = db.prepare('SELECT id, league, home_team, away_team FROM matches').all();
  for (const m of matches) {
    const isPrimeraA = m.league === 'primera-a' || m.league === 'femenino-a';
    const updates = {};
    if (isPrimeraA) {
      updates.stream_link = 'https://lpfplay.com/';
    } else {
      updates.youtube_link = `https://www.youtube.com/watch?v=${m.home_team?.toLowerCase().replace(/[^a-z0-9]/g, '')}-vs-${m.away_team?.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    }
    if (Object.keys(updates).length > 0) {
      const set = Object.keys(updates).map(k => `"${k}" = ?`).join(', ');
      db.prepare(`UPDATE matches SET ${set} WHERE id = ?`).run(...Object.values(updates), m.id);
    }
  }
  console.log('Stream links assigned to', matches.length, 'matches');
}

main();
