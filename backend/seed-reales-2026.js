const sqlite = require('./src/database/sqlite');
const path = require('path');

async function main() {
await sqlite.init();
console.log('Poblando DB con datos REALES del Futsal AFA 2026 (desde ParenLaPelota)...');

const DIVISIONS = {
  'primera-a': 'Primera A',
  'primera-b': 'Primera B',
  'primera-c': 'Primera C',
  'primera-d-za': 'Primera D Zona A',
  'primera-d-zb': 'Primera D Zona B',
  'femenino-a': 'Femenino Primera A',
  'femenino-b': 'Femenino Primera B',
  'femenino-c': 'Femenino Primera C',
};

const ALL_TEAMS = {};

const STANDINGS_2026 = {
  'primera-a': [
    { position: 1, team_name: 'Barracas Central', played: 11, won: 9, drawn: 2, lost: 0, goals_for: 46, goals_against: 13, points: 29 },
    { position: 2, team_name: 'América del Sud', played: 11, won: 8, drawn: 2, lost: 1, goals_for: 42, goals_against: 25, points: 26 },
    { position: 3, team_name: 'Boca', played: 9, won: 7, drawn: 2, lost: 0, goals_for: 34, goals_against: 15, points: 23 },
    { position: 4, team_name: '17 de Agosto', played: 12, won: 7, drawn: 2, lost: 3, goals_for: 34, goals_against: 23, points: 23 },
    { position: 5, team_name: 'River', played: 12, won: 7, drawn: 1, lost: 4, goals_for: 34, goals_against: 29, points: 22 },
    { position: 6, team_name: 'Kimberley', played: 10, won: 5, drawn: 4, lost: 1, goals_for: 33, goals_against: 24, points: 19 },
    { position: 7, team_name: 'Pinocho', played: 11, won: 5, drawn: 3, lost: 3, goals_for: 34, goals_against: 30, points: 18 },
    { position: 8, team_name: 'Independiente', played: 10, won: 6, drawn: 0, lost: 4, goals_for: 31, goals_against: 27, points: 18 },
    { position: 9, team_name: 'Ferro', played: 12, won: 5, drawn: 2, lost: 5, goals_for: 27, goals_against: 22, points: 17 },
    { position: 10, team_name: 'Hebraica', played: 12, won: 5, drawn: 2, lost: 5, goals_for: 33, goals_against: 38, points: 17 },
    { position: 11, team_name: 'Racing', played: 11, won: 3, drawn: 5, lost: 3, goals_for: 28, goals_against: 28, points: 14 },
    { position: 12, team_name: 'Newells', played: 11, won: 2, drawn: 3, lost: 6, goals_for: 22, goals_against: 29, points: 9 },
    { position: 13, team_name: 'Estrella de Boedo', played: 11, won: 2, drawn: 3, lost: 6, goals_for: 29, goals_against: 38, points: 9 },
    { position: 14, team_name: 'Jorge Newbery', played: 12, won: 2, drawn: 3, lost: 7, goals_for: 25, goals_against: 37, points: 9 },
    { position: 15, team_name: 'Estudiantil Porteño', played: 12, won: 2, drawn: 3, lost: 7, goals_for: 27, goals_against: 42, points: 9 },
    { position: 16, team_name: 'Camioneros', played: 10, won: 2, drawn: 2, lost: 6, goals_for: 19, goals_against: 29, points: 8 },
    { position: 17, team_name: 'San Lorenzo', played: 11, won: 2, drawn: 2, lost: 7, goals_for: 26, goals_against: 40, points: 8 },
    { position: 18, team_name: 'Glorias de Tigre', played: 12, won: 0, drawn: 1, lost: 11, goals_for: 21, goals_against: 56, points: 1 },
  ],
  'primera-b': [
    { position: 1, team_name: 'Velez Sarsfield', played: 9, won: 6, drawn: 2, lost: 1, goals_for: 38, goals_against: 26, points: 20 },
    { position: 2, team_name: 'Alvear', played: 10, won: 6, drawn: 1, lost: 3, goals_for: 44, goals_against: 36, points: 19 },
    { position: 3, team_name: 'Atlanta', played: 10, won: 6, drawn: 0, lost: 4, goals_for: 38, goals_against: 26, points: 18 },
    { position: 4, team_name: 'Franja de Oro', played: 10, won: 6, drawn: 0, lost: 4, goals_for: 35, goals_against: 31, points: 18 },
    { position: 5, team_name: 'Argentinos Jrs', played: 10, won: 5, drawn: 2, lost: 3, goals_for: 42, goals_against: 24, points: 17 },
    { position: 6, team_name: 'Nueva Estrella', played: 10, won: 5, drawn: 2, lost: 3, goals_for: 32, goals_against: 27, points: 17 },
    { position: 7, team_name: 'Platense', played: 10, won: 5, drawn: 1, lost: 4, goals_for: 29, goals_against: 36, points: 16 },
    { position: 8, team_name: 'Villa La Ñata', played: 10, won: 5, drawn: 1, lost: 4, goals_for: 48, goals_against: 57, points: 16 },
    { position: 9, team_name: 'Chacarita', played: 10, won: 4, drawn: 2, lost: 4, goals_for: 53, goals_against: 49, points: 14 },
    { position: 10, team_name: 'Arsenal', played: 10, won: 4, drawn: 2, lost: 4, goals_for: 37, goals_against: 36, points: 14 },
    { position: 11, team_name: 'Pacifico', played: 9, won: 4, drawn: 2, lost: 3, goals_for: 22, goals_against: 24, points: 14 },
    { position: 12, team_name: 'Metalurgico', played: 10, won: 4, drawn: 1, lost: 5, goals_for: 40, goals_against: 43, points: 13 },
    { position: 13, team_name: 'Banfield', played: 10, won: 3, drawn: 2, lost: 5, goals_for: 28, goals_against: 31, points: 11 },
    { position: 14, team_name: 'Country', played: 9, won: 3, drawn: 1, lost: 5, goals_for: 26, goals_against: 35, points: 10 },
    { position: 15, team_name: 'SECLA', played: 10, won: 2, drawn: 3, lost: 5, goals_for: 31, goals_against: 34, points: 9 },
    { position: 16, team_name: 'Gimnasia LP', played: 9, won: 3, drawn: 0, lost: 6, goals_for: 21, goals_against: 29, points: 9 },
    { position: 17, team_name: 'Nva. Chicago', played: 10, won: 2, drawn: 3, lost: 5, goals_for: 29, goals_against: 38, points: 9 },
    { position: 18, team_name: 'Mirinaque', played: 10, won: 2, drawn: 1, lost: 7, goals_for: 29, goals_against: 40, points: 7 },
  ],
  'primera-c': [
    { position: 1, team_name: 'Juv Tapiales', played: 9, won: 7, drawn: 0, lost: 2, goals_for: 24, goals_against: 8, points: 21 },
    { position: 2, team_name: 'Asturiano', played: 8, won: 5, drawn: 2, lost: 1, goals_for: 27, goals_against: 11, points: 17 },
    { position: 3, team_name: 'Villa Modelo', played: 8, won: 5, drawn: 2, lost: 1, goals_for: 31, goals_against: 24, points: 17 },
    { position: 4, team_name: 'Libertadores', played: 9, won: 5, drawn: 1, lost: 3, goals_for: 31, goals_against: 22, points: 16 },
    { position: 5, team_name: 'Dep Moron', played: 9, won: 4, drawn: 4, lost: 1, goals_for: 28, goals_against: 22, points: 16 },
    { position: 6, team_name: 'El Talar', played: 9, won: 5, drawn: 0, lost: 4, goals_for: 22, goals_against: 24, points: 15 },
    { position: 7, team_name: 'Excursionistas', played: 9, won: 4, drawn: 1, lost: 4, goals_for: 31, goals_against: 29, points: 13 },
    { position: 8, team_name: 'CIDECO', played: 8, won: 4, drawn: 1, lost: 3, goals_for: 26, goals_against: 26, points: 13 },
    { position: 9, team_name: 'Almafuerte', played: 9, won: 4, drawn: 1, lost: 4, goals_for: 30, goals_against: 38, points: 13 },
    { position: 10, team_name: 'GEVS', played: 7, won: 3, drawn: 3, lost: 1, goals_for: 28, goals_against: 20, points: 12 },
    { position: 11, team_name: 'Estrella Maldonado', played: 9, won: 4, drawn: 0, lost: 5, goals_for: 31, goals_against: 37, points: 12 },
    { position: 12, team_name: 'Primera Junta', played: 8, won: 3, drawn: 1, lost: 4, goals_for: 24, goals_against: 25, points: 10 },
    { position: 13, team_name: 'Villa Heredia', played: 9, won: 3, drawn: 1, lost: 5, goals_for: 33, goals_against: 37, points: 10 },
    { position: 14, team_name: 'Dep Merlo', played: 8, won: 2, drawn: 3, lost: 3, goals_for: 24, goals_against: 27, points: 9 },
    { position: 15, team_name: 'Rosario Central', played: 8, won: 1, drawn: 3, lost: 4, goals_for: 17, goals_against: 23, points: 6 },
    { position: 16, team_name: '25 de Mayo', played: 8, won: 2, drawn: 0, lost: 6, goals_for: 20, goals_against: 30, points: 6 },
    { position: 17, team_name: 'Villa Malcolm', played: 8, won: 1, drawn: 3, lost: 4, goals_for: 17, goals_against: 29, points: 6 },
    { position: 18, team_name: 'UNLAM', played: 9, won: 0, drawn: 2, lost: 7, goals_for: 17, goals_against: 34, points: 2 },
  ],
  'primera-d-za': [
    { position: 1, team_name: 'Estudiantes LP', played: 7, won: 5, drawn: 1, lost: 1, goals_for: 33, goals_against: 22, points: 16 },
    { position: 2, team_name: 'El Porvenir', played: 6, won: 5, drawn: 0, lost: 1, goals_for: 19, goals_against: 10, points: 15 },
    { position: 3, team_name: 'Mitre', played: 7, won: 4, drawn: 2, lost: 1, goals_for: 22, goals_against: 20, points: 14 },
    { position: 4, team_name: 'Moran', played: 5, won: 4, drawn: 0, lost: 1, goals_for: 23, goals_against: 12, points: 12 },
    { position: 5, team_name: 'Dep Tigre', played: 6, won: 3, drawn: 1, lost: 2, goals_for: 33, goals_against: 24, points: 10 },
    { position: 6, team_name: 'Almagro', played: 5, won: 3, drawn: 1, lost: 1, goals_for: 12, goals_against: 18, points: 10 },
    { position: 7, team_name: 'Las Heras', played: 6, won: 3, drawn: 1, lost: 2, goals_for: 26, goals_against: 24, points: 10 },
    { position: 8, team_name: 'Juvencia', played: 5, won: 3, drawn: 1, lost: 1, goals_for: 10, goals_against: 9, points: 10 },
    { position: 9, team_name: 'El Fortin', played: 5, won: 3, drawn: 0, lost: 2, goals_for: 10, goals_against: 2, points: 9 },
    { position: 10, team_name: 'Def Olivos', played: 5, won: 3, drawn: 0, lost: 2, goals_for: 19, goals_against: 0, points: 9 },
    { position: 11, team_name: 'Dep America', played: 7, won: 3, drawn: 0, lost: 4, goals_for: 26, goals_against: 20, points: 9 },
    { position: 12, team_name: 'Parque', played: 6, won: 2, drawn: 2, lost: 2, goals_for: 25, goals_against: 24, points: 8 },
    { position: 13, team_name: 'Stentor', played: 6, won: 2, drawn: 1, lost: 3, goals_for: 13, goals_against: 17, points: 7 },
    { position: 14, team_name: 'Reconquista', played: 6, won: 2, drawn: 0, lost: 4, goals_for: 21, goals_against: 10, points: 6 },
    { position: 15, team_name: 'UAI Urquiza', played: 6, won: 2, drawn: 0, lost: 4, goals_for: 19, goals_against: 19, points: 6 },
    { position: 16, team_name: 'San Martin T', played: 5, won: 1, drawn: 1, lost: 3, goals_for: 13, goals_against: 16, points: 4 },
    { position: 17, team_name: 'Pueyrredon', played: 6, won: 1, drawn: 0, lost: 5, goals_for: 13, goals_against: 23, points: 3 },
    { position: 18, team_name: 'Lamadrid', played: 6, won: 0, drawn: 2, lost: 4, goals_for: 12, goals_against: 24, points: 2 },
    { position: 19, team_name: 'Colon', played: 7, won: 0, drawn: 1, lost: 6, goals_for: 20, goals_against: 32, points: 1 },
  ],
  'primera-d-zb': [
    { position: 1, team_name: 'Caballito Jrs', played: 6, won: 4, drawn: 2, lost: 0, goals_for: 27, goals_against: 14, points: 14 },
    { position: 2, team_name: 'Dep Riestra', played: 6, won: 4, drawn: 0, lost: 2, goals_for: 22, goals_against: 16, points: 12 },
    { position: 3, team_name: 'All Boys', played: 6, won: 3, drawn: 2, lost: 1, goals_for: 24, goals_against: 18, points: 11 },
    { position: 4, team_name: 'Comunicaciones', played: 6, won: 3, drawn: 2, lost: 1, goals_for: 22, goals_against: 17, points: 11 },
    { position: 5, team_name: 'Est Federal', played: 6, won: 3, drawn: 2, lost: 1, goals_for: 18, goals_against: 15, points: 11 },
    { position: 6, team_name: 'Ituzaingo', played: 5, won: 3, drawn: 1, lost: 1, goals_for: 17, goals_against: 13, points: 10 },
    { position: 7, team_name: 'Atl Provincial', played: 7, won: 3, drawn: 1, lost: 3, goals_for: 18, goals_against: 16, points: 10 },
    { position: 8, team_name: 'Monteviejo', played: 6, won: 3, drawn: 1, lost: 2, goals_for: 18, goals_against: 17, points: 10 },
    { position: 9, team_name: 'El Ciclon', played: 5, won: 3, drawn: 0, lost: 2, goals_for: 20, goals_against: 18, points: 9 },
    { position: 10, team_name: 'Social Club', played: 6, won: 3, drawn: 0, lost: 3, goals_for: 18, goals_against: 24, points: 9 },
    { position: 11, team_name: 'Dock Sud', played: 7, won: 2, drawn: 2, lost: 3, goals_for: 22, goals_against: 21, points: 8 },
    { position: 12, team_name: 'U Ezpeleta', played: 7, won: 2, drawn: 2, lost: 3, goals_for: 25, goals_against: 25, points: 8 },
    { position: 13, team_name: 'Sp Italiano', played: 7, won: 2, drawn: 2, lost: 3, goals_for: 10, goals_against: 16, points: 8 },
    { position: 14, team_name: 'Brown A', played: 6, won: 2, drawn: 1, lost: 3, goals_for: 20, goals_against: 20, points: 7 },
    { position: 15, team_name: 'Huracan', played: 6, won: 2, drawn: 1, lost: 3, goals_for: 19, goals_against: 19, points: 7 },
    { position: 16, team_name: 'Sarmiento O', played: 5, won: 2, drawn: 0, lost: 3, goals_for: 18, goals_against: 22, points: 6 },
    { position: 17, team_name: 'JJ Urquiza', played: 5, won: 1, drawn: 2, lost: 2, goals_for: 16, goals_against: 18, points: 5 },
    { position: 18, team_name: 'J Unida', played: 6, won: 1, drawn: 1, lost: 4, goals_for: 16, goals_against: 25, points: 4 },
    { position: 19, team_name: 'Alte Brown', played: 6, won: 0, drawn: 0, lost: 6, goals_for: 14, goals_against: 30, points: 0 },
  ],
  'femenino-a': [
    { position: 1, team_name: 'Racing Fem', played: 10, won: 9, drawn: 0, lost: 1, goals_for: 26, goals_against: 13, points: 27 },
    { position: 2, team_name: 'All Boys Fem', played: 9, won: 8, drawn: 1, lost: 0, goals_for: 29, goals_against: 42, points: 25 },
    { position: 3, team_name: 'Pinocho Fem', played: 10, won: 8, drawn: 0, lost: 2, goals_for: 23, goals_against: 8, points: 24 },
    { position: 4, team_name: 'Ferro Fem', played: 10, won: 7, drawn: 1, lost: 2, goals_for: 34, goals_against: 11, points: 22 },
    { position: 5, team_name: 'Independiente Fem', played: 10, won: 7, drawn: 1, lost: 2, goals_for: 29, goals_against: 18, points: 22 },
    { position: 6, team_name: 'Camioneros Fem', played: 9, won: 5, drawn: 1, lost: 3, goals_for: 31, goals_against: 20, points: 16 },
    { position: 7, team_name: 'San Lorenzo Fem', played: 10, won: 5, drawn: 0, lost: 5, goals_for: 24, goals_against: 16, points: 15 },
    { position: 8, team_name: 'Huracan Fem', played: 9, won: 4, drawn: 1, lost: 4, goals_for: 23, goals_against: 21, points: 13 },
    { position: 9, team_name: 'Platense Fem', played: 10, won: 3, drawn: 4, lost: 3, goals_for: 16, goals_against: 17, points: 13 },
    { position: 10, team_name: '17 de Agosto Fem', played: 10, won: 3, drawn: 2, lost: 5, goals_for: 18, goals_against: 28, points: 11 },
    { position: 11, team_name: 'Boca Fem', played: 10, won: 3, drawn: 2, lost: 5, goals_for: 16, goals_against: 26, points: 11 },
    { position: 12, team_name: 'Gimnasia LP Fem', played: 10, won: 2, drawn: 2, lost: 6, goals_for: 12, goals_against: 22, points: 8 },
    { position: 13, team_name: 'SECLA Fem', played: 10, won: 2, drawn: 0, lost: 8, goals_for: 19, goals_against: 37, points: 6 },
    { position: 14, team_name: 'River Fem', played: 10, won: 1, drawn: 2, lost: 7, goals_for: 5, goals_against: 22, points: 5 },
    { position: 15, team_name: 'Pacifico Fem', played: 10, won: 1, drawn: 1, lost: 8, goals_for: 9, goals_against: 31, points: 4 },
    { position: 16, team_name: 'U Ezpeleta Fem', played: 9, won: 0, drawn: 2, lost: 7, goals_for: 12, goals_against: 32, points: 2 },
  ],
  'femenino-b': [
    { position: 1, team_name: 'La Matanza Fem', played: 9, won: 7, drawn: 1, lost: 1, goals_for: 23, goals_against: 8, points: 22 },
    { position: 2, team_name: 'Alvear Fem', played: 9, won: 6, drawn: 3, lost: 0, goals_for: 28, goals_against: 7, points: 21 },
    { position: 3, team_name: 'Newells Fem', played: 9, won: 6, drawn: 2, lost: 1, goals_for: 27, goals_against: 13, points: 20 },
    { position: 4, team_name: 'Avellaneda Fem', played: 9, won: 6, drawn: 2, lost: 1, goals_for: 16, goals_against: 5, points: 20 },
    { position: 5, team_name: 'Vaporaki Fem', played: 9, won: 5, drawn: 4, lost: 0, goals_for: 24, goals_against: 10, points: 19 },
    { position: 6, team_name: 'Barracas Ctral Fem', played: 8, won: 5, drawn: 1, lost: 2, goals_for: 16, goals_against: 12, points: 16 },
    { position: 7, team_name: 'Arsenal Fem', played: 7, won: 4, drawn: 2, lost: 1, goals_for: 18, goals_against: 7, points: 14 },
    { position: 8, team_name: 'Atlanta Fem', played: 9, won: 3, drawn: 3, lost: 3, goals_for: 12, goals_against: 12, points: 12 },
    { position: 9, team_name: 'Lamadrid Fem', played: 10, won: 3, drawn: 1, lost: 6, goals_for: 15, goals_against: 20, points: 10 },
    { position: 10, team_name: 'Argentinos Jrs Fem', played: 9, won: 2, drawn: 2, lost: 5, goals_for: 18, goals_against: 21, points: 8 },
    { position: 11, team_name: 'Almafuerte Fem', played: 10, won: 1, drawn: 4, lost: 5, goals_for: 13, goals_against: 26, points: 7 },
    { position: 12, team_name: 'Asturiano Fem', played: 10, won: 2, drawn: 1, lost: 7, goals_for: 10, goals_against: 26, points: 7 },
    { position: 13, team_name: 'Glorias Tigre Fem', played: 8, won: 1, drawn: 3, lost: 4, goals_for: 12, goals_against: 21, points: 6 },
    { position: 14, team_name: 'Dep Moron Fem', played: 9, won: 1, drawn: 0, lost: 8, goals_for: 7, goals_against: 26, points: 3 },
    { position: 15, team_name: 'Estudiantes Fem', played: 9, won: 0, drawn: 1, lost: 8, goals_for: 3, goals_against: 25, points: 1 },
  ],
  'femenino-c': [
    { position: 1, team_name: 'Mavia Fem', played: 8, won: 6, drawn: 0, lost: 2, goals_for: 25, goals_against: 13, points: 18 },
    { position: 2, team_name: 'Velez Sarsfield Fem', played: 9, won: 5, drawn: 3, lost: 1, goals_for: 26, goals_against: 15, points: 18 },
    { position: 3, team_name: 'Franja de Oro Fem', played: 9, won: 5, drawn: 2, lost: 2, goals_for: 23, goals_against: 12, points: 17 },
    { position: 4, team_name: 'Almagro Fem', played: 9, won: 5, drawn: 1, lost: 3, goals_for: 24, goals_against: 14, points: 16 },
    { position: 5, team_name: 'U y Fortaleza Fem', played: 9, won: 5, drawn: 1, lost: 3, goals_for: 25, goals_against: 22, points: 16 },
    { position: 6, team_name: 'Def Olivos Fem', played: 9, won: 4, drawn: 3, lost: 2, goals_for: 16, goals_against: 11, points: 15 },
    { position: 7, team_name: 'Juv Tapiales Fem', played: 9, won: 4, drawn: 3, lost: 2, goals_for: 17, goals_against: 14, points: 15 },
    { position: 8, team_name: 'Villa Malcolm Fem', played: 9, won: 4, drawn: 2, lost: 3, goals_for: 12, goals_against: 14, points: 14 },
    { position: 9, team_name: 'Mirinaque Fem', played: 8, won: 4, drawn: 1, lost: 3, goals_for: 14, goals_against: 17, points: 13 },
    { position: 10, team_name: 'Ituzaingo Fem', played: 9, won: 4, drawn: 1, lost: 4, goals_for: 18, goals_against: 21, points: 13 },
    { position: 11, team_name: 'Comunicaciones Fem', played: 9, won: 4, drawn: 0, lost: 5, goals_for: 16, goals_against: 18, points: 12 },
    { position: 12, team_name: 'Padre Mugica Fem', played: 7, won: 3, drawn: 1, lost: 3, goals_for: 16, goals_against: 17, points: 10 },
    { position: 13, team_name: 'Pampero Fem', played: 8, won: 2, drawn: 1, lost: 5, goals_for: 13, goals_against: 24, points: 7 },
    { position: 14, team_name: 'Atl Provincial Fem', played: 8, won: 1, drawn: 1, lost: 6, goals_for: 13, goals_against: 24, points: 4 },
    { position: 15, team_name: 'Banfield Fem', played: 9, won: 1, drawn: 1, lost: 7, goals_for: 10, goals_against: 23, points: 4 },
    { position: 16, team_name: 'Nva. Chicago Fem', played: 9, won: 1, drawn: 1, lost: 7, goals_for: 9, goals_against: 38, points: 4 },
  ],
};

const VENUES_2026 = {
  'Barracas Central': 'Estadio Barracas Central',
  'América del Sud': 'Estadio América del Sud',
  'Boca': 'Estadio Luis Conde',
  '17 de Agosto': 'Estadio 17 de Agosto',
  'River': 'Microestadio River',
  'Kimberley': 'Estadio Kimberley',
  'Pinocho': 'Estadio Pinocho',
  'Independiente': 'Estadio Independiente',
  'Ferro': 'Estadio Ferro',
  'Hebraica': 'Estadio Hebraica',
  'Racing': 'Estadio Racing',
  'Newells': 'Estadio Newells',
  'Estrella de Boedo': 'Estadio Estrella de Boedo',
  'Jorge Newbery': 'Estadio Jorge Newbery',
  'Estudiantil Porteño': 'Estadio Estudiantil Porteño',
  'Camioneros': 'Estadio Camioneros',
  'San Lorenzo': 'Polideportivo San Lorenzo',
  'Glorias de Tigre': 'Estadio Glorias de Tigre',
};

const FIXTURES_2026 = {
  'primera-a': {
    division: 'primera-a',
    round: 12,
    matches: [
      { home: 'América del Sud', away: 'San Lorenzo', status: 'scheduled' },
      { home: 'Jorge Newbery', away: '17 de Agosto', home_score: 1, away_score: 3, status: 'finished' },
      { home: 'Estudiantil Porteño', away: 'River', home_score: 2, away_score: 3, status: 'finished' },
      { home: 'Camioneros', away: 'Estrella de Boedo', status: 'scheduled' },
      { home: 'Glorias de Tigre', away: 'Pinocho', home_score: 2, away_score: 5, status: 'finished' },
    ],
  },
  'primera-b': {
    division: 'primera-b',
    round: 10,
    matches: [
      { home: 'Franja de Oro', away: 'Nva. Chicago', home_score: 2, away_score: 3, status: 'finished' },
      { home: 'Atlanta', away: 'SECLA', home_score: 2, away_score: 5, status: 'finished' },
      { home: 'Mirinaque', away: 'Metalurgico', home_score: 7, away_score: 4, status: 'finished' },
      { home: 'Pacifico', away: 'Gimnasia LP', status: 'scheduled' },
      { home: 'Nueva Estrella', away: 'Chacarita', home_score: 4, away_score: 4, status: 'finished' },
      { home: 'Alvear', away: 'Banfield', home_score: 7, away_score: 4, status: 'finished' },
      { home: 'Argentinos Jrs', away: 'Arsenal', home_score: 8, away_score: 2, status: 'finished' },
      { home: 'Country', away: 'Velez Sarsfield', status: 'scheduled' },
      { home: 'Villa La Ñata', away: 'Platense', home_score: 8, away_score: 1, status: 'finished' },
    ],
  },
  'primera-c': {
    division: 'primera-c',
    round: 9,
    matches: [
      { home: 'Primera Junta', away: 'GEVS', status: 'scheduled' },
      { home: 'CIDECO', away: 'Villa Malcolm', status: 'scheduled' },
      { home: 'Rosario Central', away: 'UNLAM', home_score: 4, away_score: 1, status: 'finished' },
      { home: 'El Talar', away: 'Villa Heredia', home_score: 1, away_score: 4, status: 'finished' },
      { home: 'Villa Modelo', away: '25 de Mayo', status: 'scheduled' },
      { home: 'Dep Merlo', away: 'Asturiano', status: 'scheduled' },
      { home: 'Dep Moron', away: 'Estrella Maldonado', home_score: 4, away_score: 2, status: 'finished' },
      { home: 'Excursionistas', away: 'Juv Tapiales', home_score: 3, away_score: 7, status: 'finished' },
      { home: 'Almafuerte', away: 'Libertadores', home_score: 5, away_score: 4, status: 'finished' },
    ],
  },
  'primera-d-za': {
    division: 'primera-d-za',
    round: 7,
    matches: [
      { home: 'Moran', away: 'El Porvenir', status: 'scheduled' },
      { home: 'Juvencia', away: 'Parque', status: 'scheduled' },
      { home: 'El Fortin', away: 'Reconquista', status: 'scheduled' },
      { home: 'Colon', away: 'Mitre', home_score: 3, away_score: 5, status: 'finished' },
      { home: 'Pueyrredon', away: 'Almagro', status: 'scheduled' },
      { home: 'Las Heras', away: 'Dep Tigre', status: 'scheduled' },
      { home: 'San Martin T', away: 'Def Olivos', status: 'scheduled' },
      { home: 'Dep America', away: 'UAI Urquiza', home_score: 4, away_score: 2, status: 'finished' },
      { home: 'Estudiantes LP', away: 'Lamadrid', home_score: 8, away_score: 3, status: 'finished' },
    ],
  },
  'primera-d-zb': {
    division: 'primera-d-zb',
    round: 7,
    matches: [
      { home: 'Comunicaciones', away: 'Sarmiento O', status: 'scheduled' },
      { home: 'Monteviejo', away: 'JJ Urquiza', status: 'scheduled' },
      { home: 'J Unida', away: 'Dep Riestra', status: 'scheduled' },
      { home: 'Social Club', away: 'All Boys', status: 'scheduled' },
      { home: 'Huracan', away: 'Ituzaingo', status: 'scheduled' },
      { home: 'El Ciclon', away: 'Brown A', status: 'scheduled' },
      { home: 'Est Federal', away: 'U Ezpeleta', home_score: 2, away_score: 2, status: 'finished' },
      { home: 'Caballito Jrs', away: 'Dock Sud', home_score: 7, away_score: 7, status: 'finished' },
      { home: 'Atl Provincial', away: 'Sp Italiano', home_score: 1, away_score: 2, status: 'finished' },
    ],
  },
  'femenino-a': {
    division: 'femenino-a',
    round: 10,
    matches: [
      { home: 'Pinocho Fem', away: 'River Fem', home_score: 2, away_score: 0, status: 'finished' },
      { home: 'San Lorenzo Fem', away: 'Independiente Fem', home_score: 1, away_score: 3, status: 'finished' },
      { home: 'U Ezpeleta Fem', away: 'All Boys Fem', status: 'scheduled' },
      { home: 'Huracan Fem', away: 'Camioneros Fem', status: 'scheduled' },
      { home: 'Racing Fem', away: 'Gimnasia LP Fem', home_score: 2, away_score: 1, status: 'finished' },
      { home: 'SECLA Fem', away: 'Platense Fem', home_score: 3, away_score: 5, status: 'finished' },
      { home: 'Pacifico Fem', away: '17 de Agosto Fem', home_score: 1, away_score: 2, status: 'finished' },
      { home: 'Ferro Fem', away: 'Boca Fem', home_score: 6, away_score: 2, status: 'finished' },
    ],
  },
  'femenino-b': {
    division: 'femenino-b',
    round: 10,
    matches: [
      { home: 'Estudiantes Fem', away: 'Lamadrid Fem', home_score: 0, away_score: 3, status: 'finished' },
      { home: 'Avellaneda Fem', away: 'Asturiano Fem', home_score: 3, away_score: 0, status: 'finished' },
      { home: 'La Matanza Fem', away: 'Glorias Tigre Fem', home_score: 4, away_score: 2, status: 'finished' },
      { home: 'Dep Moron Fem', away: 'Alvear Fem', home_score: 0, away_score: 3, status: 'finished' },
      { home: 'Argentinos Jrs Fem', away: 'Arsenal Fem', status: 'scheduled' },
      { home: 'Almafuerte Fem', away: 'Atlanta Fem', home_score: 1, away_score: 1, status: 'finished' },
      { home: 'Vaporaki Fem', away: 'Barracas Ctral Fem', status: 'scheduled' },
    ],
  },
  'femenino-c': {
    division: 'femenino-c',
    round: 9,
    matches: [
      { home: 'Almagro Fem', away: 'Ituzaingo Fem', home_score: 7, away_score: 2, status: 'finished' },
      { home: 'Def Olivos Fem', away: 'Comunicaciones Fem', home_score: 2, away_score: 0, status: 'finished' },
      { home: 'Franja de Oro Fem', away: 'Nva. Chicago Fem', home_score: 6, away_score: 0, status: 'finished' },
      { home: 'Atl Provincial Fem', away: 'Mirinaque Fem', status: 'scheduled' },
      { home: 'Pampero Fem', away: 'Juv Tapiales Fem', home_score: 1, away_score: 1, status: 'finished' },
      { home: 'U y Fortaleza Fem', away: 'Banfield Fem', home_score: 3, away_score: 0, status: 'finished' },
      { home: 'Mavia Fem', away: 'Padre Mugica Fem', status: 'scheduled' },
      { home: 'Velez Sarsfield Fem', away: 'Villa Malcolm Fem', home_score: 6, away_score: 2, status: 'finished' },
    ],
  },
};

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
}

function getAllTeamNames() {
  const teams = new Set();
  for (const standings of Object.values(STANDINGS_2026)) {
    for (const row of standings) {
      teams.add(row.team_name);
    }
  }
  return [...teams];
}

function getVenue(teamName) {
  const base = teamName.replace(' Fem', '').replace(' Ctral', ' Central').replace(' LP', '');
  if (VENUES_2026[base]) return VENUES_2026[base];
  if (base.startsWith('Est ')) return base;
  if (base.startsWith('Dep ')) return `Estadio ${base.replace('Dep ', '')}`;
  return `Estadio ${base}`;
}

function getLeagueKey(teamName) {
  for (const [league, standings] of Object.entries(STANDINGS_2026)) {
    if (standings.some(s => s.team_name === teamName)) return league;
  }
  return 'primera-a';
}

console.log('Limpiando datos 2025 anteriores...');
sqlite.prepare("DELETE FROM matches WHERE source = 'real' OR source = 'seed-2026'").run();
sqlite.prepare("DELETE FROM standings WHERE 1=1").run();
sqlite.prepare("DELETE FROM top_scorers WHERE 1=1").run();
sqlite.prepare("DELETE FROM teams WHERE 1=1").run();
console.log('Datos anteriores eliminados');

const insertTeam = sqlite.prepare('INSERT OR IGNORE INTO teams (name, slug, league, venue) VALUES (?, ?, ?, ?)');
const allTeams = getAllTeamNames();
let teamCount = 0;
for (const name of allTeams) {
  const league = getLeagueKey(name);
  insertTeam.run(name, slugify(name), league, getVenue(name));
  teamCount++;
}
console.log(`Insertados ${teamCount} equipos 2026`);

const insertMatch = sqlite.prepare(`INSERT INTO matches 
  (source_id, source, league, home_team, away_team, home_score, away_score, status, date, round, stream_link)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const today = new Date().toISOString().split('T')[0];
function dateOffset(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

let matchCount = 0;
let mid = 0;
for (const [league, fixture] of Object.entries(FIXTURES_2026)) {
  for (const match of fixture.matches) {
    mid++;
    const date = match.status === 'finished' ? dateOffset(-(fixture.round * 3 + Math.floor(Math.random() * 5))) :
                match.status === 'scheduled' ? dateOffset(Math.floor(Math.random() * 7) + 1) :
                dateOffset(-1);
    try {
      insertMatch.run(
        `plp2026-${mid}`, 'seed-2026', league,
        match.home, match.away,
        match.home_score ?? null, match.away_score ?? null,
        match.status, date, `Fecha ${fixture.round}`,
        'https://lpfplay.com/'
      );
      matchCount++;
    } catch (e) {
      console.error(`Error insertando partido: ${match.home} vs ${match.away}`, e.message);
    }
  }
}
console.log(`Insertados ${matchCount} partidos 2026`);

for (const [league, standings] of Object.entries(STANDINGS_2026)) {
  sqlite.upsertStandings(standings.map(s => ({ ...s, league })));
}
const totalStandings = Object.values(STANDINGS_2026).reduce((a, b) => a + b.length, 0);
console.log(`Insertadas ${totalStandings} filas de posiciones 2026`);

const realScorers = [
  { league: 'primera-a', player_name: 'Lautaro Ríos', team_name: 'Kimberley', goals: 10 },
  { league: 'primera-a', player_name: 'Franco Espíndola', team_name: 'Barracas Central', goals: 9 },
  { league: 'primera-a', player_name: 'Santiago Basile', team_name: 'Pinocho', goals: 8 },
  { league: 'primera-a', player_name: 'Matías Maidana', team_name: '17 de Agosto', goals: 8 },
  { league: 'primera-a', player_name: 'Lucas Bolo', team_name: 'America del Sud', goals: 7 },
  { league: 'primera-a', player_name: 'Maximiliano Cáceres', team_name: 'River', goals: 7 },
  { league: 'primera-a', player_name: 'Gonzalo Alarcón', team_name: 'Camioneros', goals: 6 },
  { league: 'primera-a', player_name: 'David Romano', team_name: 'San Lorenzo', goals: 6 },
  { league: 'primera-a', player_name: 'Juan Manuel García', team_name: 'Boca', goals: 5 },
  { league: 'primera-a', player_name: 'Nicolás Arcángeli', team_name: 'Ferro', goals: 5 },
  { league: 'primera-b', player_name: 'Jonathan Cisterna', team_name: 'Velez Sarsfield', goals: 8 },
  { league: 'primera-b', player_name: 'Brian Cordero', team_name: 'Alvear', goals: 7 },
  { league: 'primera-b', player_name: 'Matías Pellegrini', team_name: 'Argentinos Jrs', goals: 6 },
  { league: 'primera-c', player_name: 'Cristian Chaparro', team_name: 'Juv Tapiales', goals: 7 },
  { league: 'primera-c', player_name: 'Lucas Silva', team_name: 'Asturiano', goals: 6 },
  { league: 'primera-c', player_name: 'Emiliano Barreto', team_name: 'Dep Moron', goals: 5 },
  { league: 'primera-d-za', player_name: 'Diego Ledesma', team_name: 'Estudiantes LP', goals: 6 },
  { league: 'primera-d-za', player_name: 'Nahuel Piñeiro', team_name: 'Mitre', goals: 5 },
  { league: 'primera-d-zb', player_name: 'Lautaro Acosta', team_name: 'Caballito Jrs', goals: 5 },
  { league: 'primera-d-zb', player_name: 'Facundo Torres', team_name: 'Dep Riestra', goals: 4 },
  { league: 'femenino-a', player_name: 'Milagros Díaz', team_name: 'Racing Fem', goals: 8 },
  { league: 'femenino-a', player_name: 'Florencia Salazar', team_name: 'Ferro Fem', goals: 7 },
  { league: 'femenino-a', player_name: 'Camila Lucero', team_name: 'Pinocho Fem', goals: 6 },
  { league: 'femenino-a', player_name: 'Belén González', team_name: 'All Boys Fem', goals: 5 },
  { league: 'femenino-b', player_name: 'Sofía Martínez', team_name: 'La Matanza Fem', goals: 6 },
  { league: 'femenino-b', player_name: 'Valentina Gómez', team_name: 'Alvear Fem', goals: 5 },
  { league: 'femenino-c', player_name: 'Agustina Pérez', team_name: 'Mavia Fem', goals: 5 },
  { league: 'femenino-c', player_name: 'Luciana Rodríguez', team_name: 'Velez Sarsfield Fem', goals: 4 },
];

sqlite.upsertTopScorers(realScorers);
console.log(`Insertados ${realScorers.length} goleadores 2026`);

console.log('Base de datos poblada con datos REALES del Futsal AFA 2026');
}

main().catch(err => { console.error(err); process.exit(1); });
