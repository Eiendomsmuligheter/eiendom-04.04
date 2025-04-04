"""
Eiendomsmuligheter Platform Backend API
----------------------------------------

Dette er hovedapplikasjonen for backend-API-et.
Den importerer og registrerer alle API-ruter og håndterer konfigurasjonen av FastAPI.
"""
import logging
import os
import sys
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
import traceback

# Legg til prosjektets rotmappe i PYTHONPATH
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, PROJECT_ROOT)

# Forsøk å laste miljøvariabler fra .env-fil
try:
    load_dotenv()
except Exception as e:
    print(f"Kunne ikke laste .env fil: {e}")

# Konfigurer logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("eiendomsmuligheter")

# Import AI modules
from ai_modules import AlterraML, CommuneConnect

# Initialize AI modules
alterra_ml = AlterraML()
commune_connect = CommuneConnect()

# Opprett FastAPI-app
app = FastAPI(
    title="Eiendomsmuligheter API",
    description="API for å analysere og visualisere eiendomsdata",
    version="0.1.0"
)

# Konfigurer CORS for å tillate forespørsler fra frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # I produksjon bør du begrense dette til faktiske domener
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Statiske filer
os.makedirs(os.path.join(SCRIPT_DIR, "static"), exist_ok=True)
os.makedirs("static/heightmaps", exist_ok=True)
os.makedirs("static/textures", exist_ok=True)
os.makedirs("static/models", exist_ok=True)
os.makedirs("static/cache", exist_ok=True)
app.mount("/api/static", StaticFiles(directory="static"), name="static")

# Forsøk å importere routes
try:
    from routes.property_routes import router as property_router
    from routes.auth_routes import router as auth_router
    
    # Inkluder routes
    app.include_router(auth_router, prefix="/auth")
    app.include_router(property_router, prefix="")  # La prefix være tom siden router allerede har prefix="/properties"
    
    logger.info("API-ruter lastet vellykket")
except ImportError as e:
    logger.error(f"Kunne ikke importere routes: {e}")
    logger.debug(f"Import exception: {traceback.format_exc()}")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with API information"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Eiendomsmuligheter API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .endpoint { background-color: #f8f9fa; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            code { background-color: #e9ecef; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>Eiendomsmuligheter API</h1>
        <p>Velkommen til Eiendomsmuligheter API. Dette API-et tilbyr funksjoner for eiendomsanalyse og utvikling.</p>
        
        <h2>Nøkkelendepunkter:</h2>
        <div class="endpoint">
            <strong>Eiendomsliste:</strong> <code>GET /properties/</code>
        </div>
        <div class="endpoint">
            <strong>Eiendomsdetaljer:</strong> <code>GET /properties/{property_id}</code>
        </div>
        <div class="endpoint">
            <strong>Eiendomsanalyse:</strong> <code>POST /properties/analyze</code>
        </div>
        <div class="endpoint">
            <strong>Autentisering:</strong> <code>POST /auth/token</code>
        </div>
        
        <p>For komplett API-dokumentasjon, se <a href="/docs">/docs</a>.</p>
    </body>
    </html>
    """
    return html_content

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "components": {
            "ai_modules": {
                "alterra_ml": alterra_ml.models_loaded,
                "commune_connect": commune_connect.api_ready
            }
        }
    }

# Kjøres hvis denne filen er hovedskriptet
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) 