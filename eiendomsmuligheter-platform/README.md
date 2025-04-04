# Eiendomsmuligheter Platform

![Eiendomsmuligheter Logo](./static/images/logo.png)

En komplett plattform for å identifisere, analysere og visualisere utviklingspotensial for norske eiendommer.

## Oversikt

Eiendomsmuligheter Platform er en innovativ løsning som kombinerer offentlige data, avansert 3D-visualisering og AI-drevet analyse for å hjelpe eiendomseiere, utviklere og investorer med å avdekke utviklingsmuligheter for eiendommer i Norge. Plattformen integrerer et bredt spekter av tjenester, inkludert:

- **Eiendomssøk og visualisering**: Finn eiendommer og se dem i 3D.
- **Reguleringsanalyse**: Automatisk tolkning av kommunale reguleringsplaner.
- **Utviklingspotensialberegninger**: AI-drevne analyser av bygningspotensial.
- **3D-modellering**: Avanserte visualiseringer av både eksisterende bygg og utviklingspotensial.
- **Verdianalyse**: Vurdering av nåværende og fremtidig eiendomsverdi.
- **Energiberegninger**: Analyser av energieffektivitet og -potensial.
- **Søknadsgenerering**: Automatisk generering av byggesøknader med alle nødvendige vedlegg.
- **Integrasjon med eksterne tjenester**: Støtte for SpacelyAI, RoomsGPT, Decoratly og Archi.
- **Premiumtjenester**: Abonnementsbaserte funksjoner for profesjonelle brukere.

## Hovedfunksjoner

### Eiendomssøk og -analyse
- Søk etter eiendommer ved adresse, koordinater, eller andre kriterier
- Detaljert eiendomsinformasjon fra offentlige kilder
- Integrert med Kartverket for oppdaterte eiendomsdata

### 3D-visualisering
- Realistiske 3D-modeller av eiendommer og terrenget rundt
- Interaktiv utforskning i nettleseren
- Eksport i flere formater (GLB, OBJ, STL)

### Reguleringsanalyse
- Automatisk innhenting av gjeldende reguleringsplaner
- Tolkning av byggeforskrifter og -regler
- Visualisering av byggegrenser og -soner

### Utviklingspotensial
- AI-drevet analyse av byggemuligheter
- Visualisering av potensielle utbyggingsscenarier
- Anbefalinger for optimal utnyttelse

### Verdi- og lønnsomhetsvurdering
- Estimering av nåværende markedsverdi
- Analyse av potensial for verdistigning
- ROI-beregninger for ulike utbyggingsscenarier

### Energianalyse
- Beregning av energieffektivitet for eksisterende bygninger
- Anbefalinger for energioppgradering
- Estimater for energibehov ved nybygg

### Automatisk byggesøknadsgenerering
- Generering av komplette byggesøknader basert på analyse
- Inkludering av alle nødvendige dokumenter og tegninger
- Mulighet for å inkludere 3D-modeller i søknadene
- Integrasjon med følgende eksterne tjenester:
  - **SpacelyAI**: Avansert romplanlegging
  - **RoomsGPT**: Interiørvisualisering
  - **Decoratly**: Interiørdesignanbefalinger
  - **Archi**: Arkitektonisk visualisering

## Systemarkitektur

Plattformen er bygget som en moderne, mikroservice-basert applikasjon med følgende komponenter:

### Frontend
- **Next.js**: Moderne React-rammeverk med SSR og statiske sider
- **TailwindCSS**: For responsivt og konsistent design
- **Three.js**: For 3D-visualisering i nettleseren

### Backend
- **Node.js med Express**: For autentisering og enkle tjenester
- **Python med FastAPI**: For avansert analyse og 3D-modellering
- **PostgreSQL**: For databaselagring
- **Redis**: For caching og ytelsesoptimalisering

### Teknologistabel

#### Frontend
- Next.js / React
- TailwindCSS
- Three.js for 3D-visualisering
- TypeScript
- Redux for tilstandshåndtering
- Stripe for betalingshåndtering

#### Backend
- Node.js / Express
- Python / FastAPI
- JWT for autentisering
- Stripe for betalingsintegrasjon
- PostgreSQL databasesystem
- Redis for caching

#### 3D-modellering og AI
- AlterraML (egenutviklet AI-motor for eiendomsanalyse)
- Trimesh for 3D-modellering
- NumPy og SciPy for vitenskapelige beregninger
- TensorFlow og PyTorch for modellering og markedsanalyse
- Integrasjon med SpacelyAI, RoomsGPT, Decoratly og Archi

#### DevOps
- Docker for containerisering
- Docker Compose for orkestrering
- Nginx for omvendt proxy
- Kontinuerlig integrasjon med GitHub Actions
- Git for versjonskontroll

## Oppsett og installasjon

### Forutsetninger
- Docker og Docker Compose
- Git
- Node.js 16+ (for lokal utvikling)
- Python 3.9+ (for lokal utvikling)
- Stripe-konto (for betalingsintegrasjon)
- Kartverket API-nøkkel (for eiendomsdata)

### Installasjon

1. Klon repositoriet:
```bash
git clone https://github.com/din-organisasjon/eiendomsmuligheter-platform.git
cd eiendomsmuligheter-platform
```

2. Opprett en `.env`-fil med nødvendige variabler:
```
# Generelle innstillinger
NODE_ENV=development
DEBUG=true

# Database
POSTGRES_USER=eiendom_user
POSTGRES_PASSWORD=password
POSTGRES_DB=eiendomsmuligheter

# API-nøkler
KARTVERKET_API_KEY=your_kartverket_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# JWT
JWT_SECRET=your_jwt_secret
```

3. Start tjenestene med Docker Compose:
```bash
docker-compose up -d
```

4. Kjør database-migreringer:
```bash
docker-compose exec backend python -m alembic upgrade head
```

5. Åpne nettleseren på http://localhost:3000

### Utvikling

For utvikling anbefales det å kjøre frontend og backend separat:

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

#### Backend:
```bash
cd backend
pip install -r requirements.txt
python run.py
```

#### Node.js Backend:
```bash
cd backend
npm install
npm run dev
```

## Produksjonsmiljø

For produksjonsmiljø, bruk produksjonskonfigurasjonen:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Se `docker-compose.prod.yml` for produksjonskonfigurasjon.

## API-dokumentasjon

### Node.js API

#### Autentisering
- `POST /api/auth/register`: Registrere ny bruker
- `POST /api/auth/login`: Logge inn
- `POST /api/auth/logout`: Logge ut
- `GET /api/auth/me`: Hente innlogget bruker

#### Brukerhåndtering
- `GET /api/users`: Liste alle brukere (admin)
- `GET /api/users/:id`: Hente bruker
- `PUT /api/users/:id`: Oppdatere bruker
- `DELETE /api/users/:id`: Slette bruker (admin)

#### Betalingshåndtering
- `GET /api/payments/products`: Liste alle produkter
- `POST /api/payments/checkout`: Opprette checkout-sesjon
- `POST /api/payments/subscriptions/cancel`: Kansellere abonnement
- `GET /api/payments/invoices`: Liste fakturaer

### Python API

#### Eiendomshåndtering
- `GET /api/properties`: Liste eiendommer
- `GET /api/properties/search`: Søke etter eiendommer
- `GET /api/properties/{id}`: Hente eiendom
- `POST /api/properties`: Opprette eiendom
- `PUT /api/properties/{id}`: Oppdatere eiendom
- `DELETE /api/properties/{id}`: Slette eiendom

#### Analyse
- `POST /api/properties/analyze`: Analysere eiendom
- `GET /api/properties/{id}/development-potential`: Hente utviklingspotensial
- `GET /api/properties/{id}/value-assessment`: Hente verdivurdering

#### 3D-modellering
- `GET /api/properties/{id}/3d-model`: Generere 3D-modell
- `GET /api/properties/{id}/3d-model/view`: Vise 3D-modell
- `GET /api/properties/{id}/3d-model/download`: Laste ned 3D-modell

#### Søknadsgenerering
- `POST /api/properties/{id}/application`: Generere byggesøknad
- `GET /api/properties/{id}/application/documents/{type}`: Laste ned dokument
- `GET /api/properties/{id}/application/download`: Laste ned komplett søknad

## Komponentbeskrivelser

### Frontend-komponenter

#### Hovedsider
- `pages/index.tsx`: Hovedside
- `pages/properties/index.tsx`: Eiendomsoversikt
- `pages/properties/[id].tsx`: Eiendomsdetaljer
- `pages/properties/[id]/analysis.tsx`: Eiendomsanalyse
- `pages/properties/[id]/3d.tsx`: 3D-visualisering
- `pages/properties/[id]/application.tsx`: Byggesøknadsgenerering

#### Komponenter
- `components/PropertySearch.tsx`: Søkekomponent
- `components/3D/TerrainVisualizer.ts`: 3D-visualisering av terreng
- `components/3D/BuildingVisualizer.ts`: 3D-visualisering av bygninger
- `components/Analysis/DevelopmentPotential.tsx`: Visualisering av utviklingspotensial
- `components/Application/ApplicationForm.tsx`: Byggesøknadsskjema

### Backend-komponenter

#### Node.js Backend
- `backend/auth`: Autentisering og autorisasjon
- `backend/api`: API-endepunkter
- `backend/services`: Forretningstjenester
- `backend/middleware`: Middleware-komponenter

#### Python Backend
- `backend/api`: FastAPI-applikasjon
- `backend/models`: Datamodeller
- `backend/services`: Forretningstjenester
- `backend/middleware`: Middleware-komponenter

#### AI-moduler
- `ai_modules/AlterraML.py`: Hovedmodul for AI-analyse
- `ai_modules/src/optimization`: Optimeringsalgoritmer
- `ai_modules/energy_analysis.py`: Energianalyse
- `ai_modules/floor_plan_generator.py`: Plantegningsgenerator
- `ai_modules/image_analysis.py`: Bildeanalyse

#### 3D-modellering
- `backend/services/modeling_3d.py`: 3D-modelleringstjeneste
- `backend/services/kartverket_api.py`: Integrasjon med Kartverket

#### Søknadsgenerering
- `core_modules/docs_generator/building_application_generator.py`: Byggesøknadsgenerator
- `core_modules/docs_generator/templates`: Søknadsmaler

## Sikkerhetsaspekter

Plattformen implementerer følgende sikkerhetstiltak:

- **JWT-basert autentisering**: Sikker brukerautentisering
- **HTTPS**: All kommunikasjon er kryptert
- **CORS-beskyttelse**: Hindrer uautoriserte kryssdomeneforespørsler
- **Rate-begrensning**: Beskytter mot DDoS-angrep
- **Input-validering**: Validerer all brukerinput
- **Rollebasert tilgangskontroll**: Begrenser tilgang basert på brukerroller
- **SQL-injeksjonsbeskyttelse**: Beskytter mot databaseinjeksjonsangrep
- **XSS-beskyttelse**: Hindrer kryssskriptangrep
- **CSRF-beskyttelse**: Beskytter mot forfalskning av forespørsler
- **Sikker lagring av passord**: Bruker bcrypt for passordhasher

## Skaleringsaspekter

Plattformen er designet for å skalere horisontalt:

- **Mikroservicearkitektur**: Muliggjør uavhengig skalering av komponenter
- **Docker Compose**: Forenkler orkestrering av tjenester
- **Redis-caching**: Reduserer databasebelastning
- **Lazy-loading av ressurser**: Forbedrer ytelse for sluttbrukere
- **CDN-integrasjon**: For statiske ressurser og 3D-modeller
- **Batchprosessering**: For tunge beregninger
- **Asynkron behandling**: For tidkrevende operasjoner

## Feilsøking

### Vanlige problemer

#### Docker-problemer
- **Problem**: Docker-tjenester starter ikke
- **Løsning**: Sjekk at Docker er installert og kjører. Prøv å stoppe og starte tjenestene igjen med `docker-compose down` etterfulgt av `docker-compose up -d`.

#### PostgreSQL-problemer
- **Problem**: Kan ikke koble til databasen
- **Løsning**: Sjekk at PostgreSQL kjører: `docker-compose ps`

#### API-problemer
- **Problem**: Får 401 Unauthorized fra API
- **Løsning**: Sjekk at JWT-tokenet er gyldig og inkludert i forespørselen.

#### 3D-modelleringsproblemer
- **Problem**: 3D-modeller genereres ikke
- **Løsning**: Sjekk API-loggene: `docker-compose logs backend`

### Logganalyse

For å sjekke logger:
```bash
docker-compose logs
```

For å sjekke spesifikke tjenester:
```bash
docker-compose logs frontend
docker-compose logs backend
```

## Vedlikehold

### Databasesikkerhetskopi
```bash
docker-compose exec postgres pg_dump -U postgres eiendomsmuligheter > backup.sql
```

### Oppdateringer
```bash
git pull
docker-compose down
docker-compose up -d
```

### Overvåking
Bruk Prometheus og Grafana for overvåking.

## Bidragsytere

- Eiendomsmuligheter-teamet
- Norske kommuner
- Kartverket
- Åpen kildekode-fellesskapet

## Kontakt

For spørsmål eller support, kontakt:
- support@eiendomsmuligheter.no
- [GitHub Issues](https://github.com/din-organisasjon/eiendomsmuligheter-platform/issues)