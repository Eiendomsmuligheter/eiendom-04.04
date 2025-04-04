# Hurtigstartveiledning for Eiendomsmuligheter Platform

Denne veiledningen vil hjelpe deg med å sette opp og kjøre Eiendomsmuligheter Platform lokalt på din maskin.

## Forutsetninger

Før du starter, sørg for at du har følgende installert:

- Node.js (v16 eller høyere)
- npm (følger med Node.js) eller yarn
- Git

## 1. Klone prosjektet

Først, klon prosjektet til din lokale maskin:

```bash
git clone https://github.com/eiendomsmuligheter/plattform.git
cd plattform
```

## 2. Installere avhengigheter

### Frontend-avhengigheter

```bash
# Fra prosjektets rotmappe
npm install
```

### Backend-avhengigheter

```bash
# Fra prosjektets rotmappe
cd backend
npm install
```

## 3. Starte serverne

### Starte backend-server

```bash
# Fra backend-mappen
npm start
```

Backend-serveren vil kjøre på http://localhost:5000

### Starte frontend-server

Åpne en ny terminal og kjør:

```bash
# Fra prosjektets rotmappe
npm run dev
```

Frontend-serveren vil kjøre på http://localhost:3000

## 4. Teste plattformen

1. Åpne nettleseren din og gå til http://localhost:3000
2. Prøv å søke etter "Solbergveien 47" i søkefeltet på forsiden
3. Utforsk 3D-visualiseringen og eiendomsanalysen

## Mest relevante filer

### Frontend

- `frontend/components/property/PropertySearch.tsx` - Søkekomponent for eiendommer
- `frontend/components/visualization/SimplePropertyViewer.tsx` - 3D-visualisering
- `frontend/services/api.js` - API-klient for kommunikasjon med backend

### Backend

- `backend/server.js` - Express-server med API-endepunkter

## API-endepunkter

- `GET /api/properties/search?address=...` - Søker etter eiendom basert på adresse
- `GET /api/properties/:id` - Henter detaljert informasjon om en eiendom
- `POST /api/auth/register` - Registrerer en ny bruker
- `POST /api/auth/login` - Logger inn en bruker

## Eksempeldata

For demonstrasjonsformål er det lagt inn mockdata for én eiendom:

- **Adresse**: Solbergveien 47, 3057 Solbergmoen
- **ID**: solbergveien-47

Du kan søke etter denne adressen for å se hvordan plattformen fungerer.

## Feilsøking

### Backend-serveren starter ikke

Kontroller at:
- Port 5000 er tilgjengelig
- Du har installert alle avhengigheter med `npm install`
- Du kjører Node.js v16 eller høyere

### Frontend-serveren starter ikke

Kontroller at:
- Port 3000 er tilgjengelig
- Du har installert alle avhengigheter med `npm install`
- Du har riktig konfigurert Next.js

### API-tilkoblingsfeil

Hvis frontend ikke kan kommunisere med backend:
- Sjekk at backend-serveren kjører på port 5000
- Kontroller at CORS er konfigurert riktig i backend/server.js
- Verifiser at API_URL i frontend/services/api.js peker på riktig URL 