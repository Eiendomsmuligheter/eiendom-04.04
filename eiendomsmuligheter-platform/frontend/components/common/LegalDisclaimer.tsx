import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface LegalDisclaimerProps {
  type: 'general' | 'bank' | 'contractor' | 'insurance' | 'enduser' | 'partner';
  compact?: boolean; // Om komponenten skal vises i kompakt modus
  showCloseButton?: boolean; // Om lukkeknapp skal vises
  onClose?: () => void; // Callback når brukeren lukker komponenten
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({
  type = 'general',
  compact = false,
  showCloseButton = false,
  onClose = () => {}
}) => {
  const [expanded, setExpanded] = useState(!compact);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Disclaimer-innhold basert på type
  const getDisclaimerContent = () => {
    switch (type) {
      case 'bank':
        return (
          <>
            <h3 className="text-lg font-medium text-white mb-2">Ansvarsfraskrivelse for bankpartnere</h3>
            <div className="space-y-2 text-sm">
              <p>
                Ved å benytte pay-as-you-go-tjenesten for bankpartnere erkjenner og aksepterer du følgende vilkår:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Eiendomsmuligheter Platform er en formidlingstjeneste som genererer leads for boliglån basert på brukernes eiendomsanalyser og søkekriterier.</li>
                <li>Alle leads kjøpes på "som de er"-basis. Eiendomsmuligheter Platform garanterer ikke konverteringsraten eller kvaliteten på leads utover de definerte minimumskriteriene.</li>
                <li>Leads som ikke oppfyller minimumskriteriene kan avvises innen 24 timer fra mottak, og banken vil da ikke bli belastet for den spesifikke lead.</li>
                <li>Eiendomsmuligheter Platform gir ingen finansielle råd eller anbefalinger til sluttbrukere, og har intet ansvar for eventuelle låneavtaler som inngås mellom banken og sluttbrukeren.</li>
                <li>Banken er selv ansvarlig for all kredittvurdering, oppfyllelse av regulatoriske krav og utøvelse av god bankskikk ved behandling av leads.</li>
                <li>Eiendomsmuligheter Platform fraskriver seg ethvert ansvar for direkte eller indirekte tap som måtte oppstå som følge av bankens bruk av tjenesten.</li>
              </ol>
            </div>
          </>
        );
      
      case 'contractor':
        return (
          <>
            <h3 className="text-lg font-medium text-white mb-2">Ansvarsfraskrivelse for entreprenørpartnere</h3>
            <div className="space-y-2 text-sm">
              <p>
                Ved å benytte pay-as-you-go-tjenesten for entreprenører og håndverkere erkjenner og aksepterer du følgende vilkår:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Eiendomsmuligheter Platform er en formidlingstjeneste som genererer prosjektleads basert på brukernes eiendomsanalyser og utviklingsbehov.</li>
                <li>Alle leads kjøpes på "som de er"-basis. Eiendomsmuligheter Platform garanterer ikke konverteringsraten eller kvaliteten på leads utover de definerte minimumskriteriene.</li>
                <li>Leads som ikke oppfyller minimumskriteriene kan avvises innen 24 timer fra mottak, og entreprenøren vil da ikke bli belastet for den spesifikke lead.</li>
                <li>Eiendomsmuligheter Platform verifiserer ikke prosjektenes gjennomførbarhet, finansiering eller andre forhold, og har intet ansvar for prosjektenes faktiske gjennomføring.</li>
                <li>Entreprenøren er selv ansvarlig for all kundebehandling, kontraktsinngåelse, utførelseskvalitet og oppfyllelse av regulatoriske krav knyttet til byggeprosjekter.</li>
                <li>Eiendomsmuligheter Platform fraskriver seg ethvert ansvar for direkte eller indirekte tap som måtte oppstå som følge av entreprenørens bruk av tjenesten eller utførelse av arbeid formidlet gjennom plattformen.</li>
              </ol>
            </div>
          </>
        );
      
      case 'insurance':
        return (
          <>
            <h3 className="text-lg font-medium text-white mb-2">Ansvarsfraskrivelse for forsikringspartnere</h3>
            <div className="space-y-2 text-sm">
              <p>
                Ved å benytte pay-as-you-go-tjenesten for forsikringsselskaper erkjenner og aksepterer du følgende vilkår:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Eiendomsmuligheter Platform er en formidlingstjeneste som genererer leads for bolig- og innboforsikring basert på brukernes eiendomsanalyser.</li>
                <li>Alle leads kjøpes på "som de er"-basis. Eiendomsmuligheter Platform garanterer ikke konverteringsraten eller kvaliteten på leads utover de definerte minimumskriteriene.</li>
                <li>Leads som ikke oppfyller minimumskriteriene kan avvises innen 24 timer fra mottak, og forsikringsselskapet vil da ikke bli belastet for den spesifikke lead.</li>
                <li>Eiendomsmuligheter Platform gir ingen forsikringsråd eller anbefalinger til sluttbrukere, og har intet ansvar for eventuelle forsikringsavtaler som inngås.</li>
                <li>Forsikringsselskapet er selv ansvarlig for all risikovurdering, premiefastsettelse, oppfyllelse av regulatoriske krav og utøvelse av god forsikringspraksis.</li>
                <li>Eiendomsmuligheter Platform fraskriver seg ethvert ansvar for direkte eller indirekte tap som måtte oppstå som følge av forsikringsselskapets bruk av tjenesten.</li>
              </ol>
            </div>
          </>
        );
      
      case 'enduser':
        return (
          <>
            <h3 className="text-lg font-medium text-white mb-2">Ansvarsfraskrivelse for sluttbrukere</h3>
            <div className="space-y-2 text-sm">
              <p>
                Ved å benytte eiendomsanalysetjenestene på pay-as-you-go-basis erkjenner og aksepterer du følgende vilkår:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Eiendomsanalysene er basert på offentlig tilgjengelige data og er ment som veiledende informasjon.</li>
                <li>Analysene gir ingen garanti for faktisk bygge- eller utviklingspotensial, og lokale forhold, reguleringsbestemmelser eller andre faktorer kan påvirke mulighetene.</li>
                <li>Brukeren er selv ansvarlig for å verifisere informasjonen med relevante myndigheter før det tas viktige beslutninger om eiendomsutvikling eller -investeringer.</li>
                <li>Eiendomsmuligheter Platform kan ikke garantere nøyaktigheten, fullstendigheten eller egnetheten av analysene for spesifikke formål.</li>
                <li>Tjenesten er ikke en erstatning for profesjonell rådgivning fra arkitekter, entreprenører, eiendomsmeglere, advokater eller andre fagpersoner.</li>
                <li>Eiendomsmuligheter Platform fraskriver seg ethvert ansvar for direkte eller indirekte tap som måtte oppstå som følge av brukerens beslutninger basert på informasjon fra plattformen.</li>
              </ol>
            </div>
          </>
        );
        
      case 'partner':
        return (
          <>
            <h3 className="text-lg font-medium text-white mb-2">Generelle partnervilkår for pay-as-you-go tjenesten</h3>
            <div className="space-y-2 text-sm">
              <p>
                Dette er de generelle vilkårene som gjelder for alle partnertyper som benytter pay-as-you-go-tjenesten:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Pay-as-you-go-modellen innebærer at partneren betaler per mottatt lead, uten faste kostnader eller langsiktige forpliktelser.</li>
                <li>Partneren kan når som helst justere sine innstillinger for lead-volum, preferanser og budsjett. Endringer trer i kraft innen 24 timer.</li>
                <li>Partneren kan avvise leads som ikke oppfyller de avtalte minimumskriteriene innen 24 timer etter mottak. Avviste leads belastes ikke.</li>
                <li>Eiendomsmuligheter Platform har rett til å suspendere partnere som gjentatte ganger avviser kvalifiserte leads uten gyldig grunn.</li>
                <li>Fakturaer for leads genereres månedlig, med betalingsbetingelser på 14 dager fra fakturadato.</li>
                <li>Eiendomsmuligheter Platform forbeholder seg retten til å endre prisene for leads med 30 dagers varsel.</li>
                <li>Partnerskapet kan avsluttes av begge parter med umiddelbar virkning, uten krav om kompensasjon.</li>
              </ol>
            </div>
          </>
        );
      
      case 'general':
      default:
        return (
          <>
            <h3 className="text-lg font-medium text-white mb-2">Generell ansvarsfraskrivelse</h3>
            <div className="space-y-2 text-sm">
              <p>
                Eiendomsmuligheter Platform tilbyr transaksjonsbaserte analysetjenester på pay-as-you-go-basis. Ved å bruke tjenesten erkjenner og aksepterer du følgende:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Tjenestene er ment som veiledende informasjon og beslutningsstøtte. Plattformen og dens eiere tar ikke noe juridisk ansvar for beslutninger tatt basert på den tilbudte informasjonen.</li>
                <li>Analysene er basert på tilgjengelige offentlige data, og vi kan ikke garantere for fullstendighet, nøyaktighet eller anvendelighet for spesifikke formål.</li>
                <li>Brukeren er selv ansvarlig for å verifisere informasjonen med relevante myndigheter og eksperthjelp før de tar viktige beslutninger om eiendomskjøp, -utvikling eller investeringer.</li>
                <li>Verken Eiendomsmuligheter Platform eller dets eiere, ansatte, agenter eller partnere er ansvarlige for direkte, indirekte, tilfeldige, følgeskader eller spesielle skader som måtte oppstå som følge av bruk av plattformen eller informasjonen som tilbys.</li>
                <li>For partnere er lead-generering basert på pay-as-you-go-modell uten garanti for kvalitet eller konverteringsrate utover definerte minimumskriterier.</li>
              </ol>
            </div>
          </>
        );
    }
  };
  
  // Kompakt visning (bare lenke/knapp)
  if (compact && !expanded) {
    return (
      <button
        onClick={toggleExpanded}
        className="flex items-center text-gray-400 text-sm mt-2 hover:text-blue-400"
      >
        <AlertTriangle className="w-4 h-4 mr-1" />
        Juridisk ansvarsfraskrivelse og vilkår
      </button>
    );
  }
  
  // Utvidet visning (fullt innhold)
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-4 my-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          {!expanded && (
            <p className="text-gray-300 text-sm">
              Juridisk ansvarsfraskrivelse (klikk for å lese)
            </p>
          )}
        </div>
        <div className="flex">
          {compact && (
            <button
              onClick={toggleExpanded}
              className="text-gray-400 hover:text-white p-1"
            >
              {expanded ? 'Skjul' : 'Vis'}
            </button>
          )}
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="text-gray-300">
          {getDisclaimerContent()}
      </div>
      )}
    </div>
  );
}; 