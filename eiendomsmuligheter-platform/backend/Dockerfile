FROM python:3.11-slim

WORKDIR /app

# Installerer systemavhengigheter
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python-avhengigheter
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopier prosjektfiler
COPY . .

# Eksponere port
EXPOSE 8000

# Opprett nødvendige mapper
RUN mkdir -p static/models static/heightmaps static/textures static/cache

# Kommando for å kjøre serveren
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]