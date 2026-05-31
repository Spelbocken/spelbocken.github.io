const OWNER_EMAIL = "patrik.ahlen05@gmail.com";
const STORAGE_KEY = "spel-state-v3";
const SESSION_KEY = "spel-session-v1";
const LANGUAGE_KEY = "spel-language-v1";
const DEFAULT_ADMINS = ["admin@spel.se", "jjarl655@gmail.com"];
const GITHUB_REPO_COMMITS_URL = "https://api.github.com/repos/Spelbocken/spelbocken.github.io/commits?per_page=1";
const ADMIN_PASSWORD_HASH = "257878632a1acffaa80a54905df09608319866e34c63098f5dd960deedaa12bb";
const OWNER_PASSWORD_HASH = "9ed08ae94ed8cf876be0489086de7169f684cfbd3de1a3c136a4bae5aab20e5e";

const defaultState = {
  admins: DEFAULT_ADMINS,
  members: {},
  users: {},
  items: [
    {
      title: "Phasmophobia",
      text: "Spela tillsammans och undersök hemsökta platser med utrustning, ledtrådar och nerviga uppdrag.",
      author: "system",
      createdAt: new Date().toISOString()
    },
    {
      title: "Satisfactory",
      text: "Bygg fabriker, samla resurser och automatisera produktionen på en stor öppen planet.",
      author: "system",
      createdAt: new Date().toISOString()
    },
    {
      title: "theHunter: Call of the Wild",
      text: "Utforska stora jaktmarker, spåra djur och spela i en lugn naturmiljö med realistisk känsla.",
      author: "system",
      createdAt: new Date().toISOString()
    }
  ],
  logs: [],
  updatedAt: new Date().toISOString()
};

let state = loadState();
let currentUser = null;
let lastKnownUpdate = state.updatedAt;
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "sv";
let githubUpdate = null;
const liveChannel = "BroadcastChannel" in window ? new BroadcastChannel("spel-live-updates") : null;

const translations = {
  sv: {
    loginTitle: "Logga in",
    loginIntro: "Skriv mejl och lösenord. Nya medlemmar väljer sitt lösenord första gången.",
    email: "Mejl",
    password: "Lösenord",
    emailPlaceholder: "namn@example.com",
    passwordPlaceholder: "Skriv lösenord",
    loginButton: "Logga in",
    logout: "Logga ut",
    nav: { hem: "Hem", admin: "Adminkonsolen", owner: "Ägarkanalen", profil: "Profil" },
    homeTitle: "SPEL",
    homeIntro: "Din ultimata guide till dina favoritspel",
    explore: "Utforska",
    updatesTitle: "Nya uppdateringar",
    emptyUpdates: "Inga nya uppdateringar ännu.",
    updatesCount: (count) => `${count} nya`,
    adminTitle: "Lägg till saker",
    adminIntro: "Admin kan lägga till innehåll på hemsidan. Inget kan tas bort här.",
    title: "Titel",
    itemTitlePlaceholder: "Exempel: Ny server öppnad",
    text: "Text",
    itemTextPlaceholder: "Skriv vad som ska synas på Hem",
    add: "Lägg till",
    added: "Saken är tillagd.",
    ownerTitle: "Ägarkanalen",
    ownerIntro: "Ägaren kan hantera administratörer och se vad som händer på hemsidan.",
    admins: "Administratörer",
    events: "Händelser",
    users: "Användare",
    usersNote: "Här kan ägaren ändra roll på användare som finns i appens data.",
    usersCount: (count) => `${count} användare`,
    lastSeen: "Senast inne",
    setRole: "Sätt roll",
    onlineNow: "Inloggad nu",
    profile: "Din profil",
    loggedInAs: "Inloggad som",
    role: "Roll",
    backHome: "Tillbaka till Hem",
    chooseGame: "Välj ett spel",
    chooseGameIntro: "Klicka på ett spelkort på Hem för att öppna mer information.",
    liveUpdated: "Sidan uppdaterades med nytt innehåll.",
    accessText: "Välj ett spelkort på Hem för att öppna guide, codex eller sök.",
    invalidEmail: "Skriv en giltig mejladress.",
    writePassword: "Skriv ett lösenord.",
    ownerWrong: "Fel lösenord för ägare.",
    adminWrong: "Fel lösenord för admin.",
    memberShort: "Välj minst 4 tecken som medlemslösenord.",
    memberWrong: "Fel medlemslösenord.",
    adminAdded: "Administratören är tillagd.",
    adminRemoved: "Administratören är borttagen.",
    adminExists: "Den mejlen är redan administratör.",
    ownerNoAdmin: "Ägaren behöver inte läggas till som admin.",
    adminPasswordNote: "Alla adminmejlar loggar in med Admin//123.",
    remove: "Ta bort",
    roles: { "Medlem": "Medlem", "Admin": "Admin", "Ägare": "Ägare" }
  },
  en: {
    loginTitle: "Log in",
    loginIntro: "Enter email and password. New members choose their password the first time.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "name@example.com",
    passwordPlaceholder: "Enter password",
    loginButton: "Log in",
    logout: "Log out",
    nav: { hem: "Home", admin: "Admin Console", owner: "Owner Channel", profil: "Profile" },
    homeTitle: "GAMES",
    homeIntro: "Your ultimate guide to your favorite games",
    explore: "Explore",
    updatesTitle: "New updates",
    emptyUpdates: "No new updates yet.",
    updatesCount: (count) => `${count} new`,
    adminTitle: "Add updates",
    adminIntro: "Admins can add content to the website. Nothing can be deleted here.",
    title: "Title",
    itemTitlePlaceholder: "Example: New server opened",
    text: "Text",
    itemTextPlaceholder: "Write what should appear on Home",
    add: "Add",
    added: "Update added.",
    ownerTitle: "Owner Channel",
    ownerIntro: "The owner can manage administrators and see what happens on the website.",
    admins: "Administrators",
    events: "Events",
    users: "Users",
    usersNote: "Here the owner can change roles for users stored in the app data.",
    usersCount: (count) => `${count} users`,
    lastSeen: "Last seen",
    setRole: "Set role",
    onlineNow: "Logged in now",
    profile: "Your profile",
    loggedInAs: "Logged in as",
    role: "Role",
    backHome: "Back to Home",
    chooseGame: "Choose a game",
    chooseGameIntro: "Click a game card on Home to open more information.",
    liveUpdated: "The page was updated with new content.",
    accessText: "Choose a game card on Home to open a guide, codex, or search.",
    invalidEmail: "Enter a valid email address.",
    writePassword: "Enter a password.",
    ownerWrong: "Wrong owner password.",
    adminWrong: "Wrong admin password.",
    memberShort: "Choose at least 4 characters as member password.",
    memberWrong: "Wrong member password.",
    adminAdded: "Administrator added.",
    adminRemoved: "Administrator removed.",
    adminExists: "That email is already an administrator.",
    ownerNoAdmin: "The owner does not need to be added as admin.",
    adminPasswordNote: "All admin emails log in with Admin//123.",
    remove: "Remove",
    roles: { "Medlem": "Member", "Admin": "Admin", "Ägare": "Owner" }
  }
};

const views = {
  hem: document.querySelector("#view-hem"),
  game: null,
  admin: document.querySelector("#view-admin"),
  owner: document.querySelector("#view-owner"),
  profil: document.querySelector("#view-profil")
};

const navItems = [
  { id: "hem", label: "Hem", roles: ["Medlem", "Admin", "Ägare"] },
  { id: "admin", label: "Adminkonsolen", roles: ["Admin", "Ägare"] },
  { id: "owner", label: "Ägarkanalen", roles: ["Ägare"] },
  { id: "profil", label: "Profil", roles: ["Medlem", "Admin", "Ägare"] }
];

const games = [
  {
    id: "hunter",
    title: "theHunter: Call of the Wild",
    image: "assets/thehunter.svg",
    tag: "Kartor, djur och sök",
    text: "Sök på karta eller djur och se var djuren finns, class och level."
  },
  {
    id: "phasmophobia",
    title: "Phasmophobia",
    image: "assets/phasmophobia.svg",
    tag: "Spöken, bevis och snabbguide",
    text: "Läs om spöken, vilka bevis de kan ha och vad varje bevis betyder."
  },
  {
    id: "satisfactory",
    title: "Satisfactory",
    image: "assets/satisfactory.svg",
    tag: "Codex och Calculator",
    text: "Bläddra bland Items, Buildings, Schematics och planera enkel produktion."
  }
];

const evidence = [
  { name: "EMF Level 5", text: "EMF-läsaren går upp till nivå 5 när spöket lämnar stark paranormal aktivitet." },
  { name: "Ghost Orb", text: "Ghost Orbs syns som små ljusprickar i videokamera, oftast i spökets favoritrum." },
  { name: "Spirit Box", text: "Spöket kan svara med röst när du använder Spirit Box och ställer frågor." },
  { name: "Freezing Temperatures", text: "Temperaturen sjunker till frysgrader. Synlig andedräkt kan hjälpa, men termometern är säkrast." },
  { name: "Ultraviolet", text: "Fingeravtryck, handavtryck eller fotspår kan synas med UV-lampa eller glowstick." },
  { name: "Ghost Writing", text: "Spöket kan skriva i Ghost Writing Book när boken ligger i rätt område." },
  { name: "D.O.T.S Projector", text: "D.O.T.S-projektorn kan visa spökets siluett när det passerar igenom ljuset." }
];

const ghosts = [
  ["Spirit", ["EMF Level 5", "Spirit Box", "Ghost Writing"], "En av de vanligaste spökena. Inget särskilt speciellt med dem, men de kan vara svåra att identifiera.", "Inga speciella styrkor.", "Rökelse stoppar Spirit från att jaga längre tid än vanliga spöken.", "Normal (1.7 m/s)", "50%", "Inga unika förmågor.", "Om rökelse verkar hålla den lugn ovanligt länge är det troligen en Spirit."],
  ["Wraith", ["EMF Level 5", "Spirit Box", "D.O.T.S Projector"], "Ett spöke som kan teleportera till spelare och är knepigt att spåra.", "Kan teleportera till en spelare och ge EMF vid platsen.", "Lämnar inte UV-fotspår efter salt.", "Normal (1.7 m/s)", "50%", "Teleport till spelare.", "Lägg salt. Om spöket trampar men inte lämnar fotspår är Wraith stark kandidat."],
  ["Phantom", ["Spirit Box", "Ultraviolet", "D.O.T.S Projector"], "Ett spöke som påverkar sanity när man tittar på det och kan vara svårt att se under jakt.", "Sänker sanity snabbare när du tittar på det.", "Försvinner från ghost photo.", "Normal (1.7 m/s)", "50%", "Blinkar långsammare under jakt.", "Ta foto vid event. Försvinner spöket men fotot räknas kan det vara Phantom."],
  ["Poltergeist", ["Spirit Box", "Ultraviolet", "Ghost Writing"], "Ett högljutt spöke som älskar att kasta saker.", "Kan kasta många föremål på en gång.", "Svagare i rum utan föremål.", "Normal (1.7 m/s)", "50%", "Masskast av föremål.", "Samla saker i rummet och se om flera kastas samtidigt."],
  ["Banshee", ["Ultraviolet", "Ghost Orb", "D.O.T.S Projector"], "Ett spöke som riktar in sig på en spelare åt gången.", "Fokuserar på ett mål.", "Kan ge särskilt skrik i parabolic microphone.", "Normal (1.7 m/s)", "50%", "Jagar sitt mål om målet är inne.", "Lyssna med parabolic microphone och testa om samma spelare alltid blir jagad."],
  ["Jinn", ["EMF Level 5", "Ultraviolet", "Freezing Temperatures"], "Ett territoriellt spöke som blir farligare när säkringen är på.", "Kan bli snabbare långt från spelare när strömmen är på.", "Kan inte använda styrkan om säkringen är av.", "Normal, snabbare med förmåga", "50%", "Dränerar sanity vid säkringen.", "Stäng av säkringen om du misstänker Jinn."],
  ["Mare", ["Spirit Box", "Ghost Orb", "Ghost Writing"], "Ett spöke som trivs i mörker.", "Kan jaga tidigare i mörker.", "Jagar senare när lamporna är tända.", "Normal (1.7 m/s)", "60% i mörker, 40% med ljus", "Kan släcka lampor ofta.", "Om den ofta släcker lampor och vägrar tända dem kan det vara Mare."],
  ["Revenant", ["Ghost Orb", "Ghost Writing", "Freezing Temperatures"], "Ett långsamt spöke tills det ser en spelare.", "Extremt snabb när den jagar ett synligt mål.", "Mycket långsam när den inte vet var spelare är.", "Långsam utan mål, mycket snabb med mål", "50%", "Stor hastighetsskillnad under jakt.", "Göm dig och lyssna på stegen. Revenant blir tydligt långsam utan synkontakt."],
  ["Shade", ["EMF Level 5", "Ghost Writing", "Freezing Temperatures"], "Ett blygt spöke som ofta gör lite aktivitet.", "Svårt att få aktivitet när spelare är nära.", "Kan inte jaga om en spelare är i samma rum.", "Normal (1.7 m/s)", "35%", "Låg aktivitet nära gruppen.", "Om den är ovanligt blyg och jagar sent kan det vara Shade."],
  ["Demon", ["Ultraviolet", "Ghost Writing", "Freezing Temperatures"], "Ett aggressivt spöke som kan jaga väldigt tidigt.", "Kan starta jakt vid hög sanity.", "Crucifix fungerar på längre avstånd.", "Normal (1.7 m/s)", "70%, kan jaga tidigare med förmåga", "Kortare väntetid mellan jakter.", "Placera crucifix tidigt. Tidiga jakter pekar ofta mot Demon."],
  ["Yurei", ["Ghost Orb", "Freezing Temperatures", "D.O.T.S Projector"], "Ett spöke som påverkar sanity och dörrar.", "Kan dränera sanity med dörrförmåga.", "Rökelse kan låsa den i rummet en stund.", "Normal (1.7 m/s)", "50%", "Stänger dörrar hårt och kan sänka sanity.", "Lyssna efter tydliga dörrslag och följ sanity."],
  ["Oni", ["EMF Level 5", "Freezing Temperatures", "D.O.T.S Projector"], "Ett aktivt och tydligt spöke.", "Mer aktivt när spelare är nära och syns mer under jakt.", "Gör inte ghost mist/airball-event.", "Normal (1.7 m/s)", "50%", "Blinkar synligare under jakt.", "Mycket aktivitet och tydlig synlighet under jakt pekar mot Oni."],
  ["Yokai", ["Spirit Box", "Ghost Orb", "D.O.T.S Projector"], "Ett spöke som reagerar på prat.", "Kan jaga tidigare när spelare pratar nära.", "Hör sämre under jakt.", "Normal (1.7 m/s)", "50%, 80% vid prat nära", "Triggad av röster.", "Testa ljud/röst nära rummet och om den tappar bort spelare lätt under jakt."],
  ["Hantu", ["Ultraviolet", "Ghost Orb", "Freezing Temperatures"], "Ett kölddrivet spöke.", "Snabbare i kalla rum.", "Långsammare i varma rum och accelererar inte med synkontakt.", "1.4 m/s varmt till 2.7 m/s kallt", "50%", "Andedräkt syns under jakt om säkringen är av.", "Stäng av säkringen och jämför hastigheten i kalla/varma områden."],
  ["Goryo", ["EMF Level 5", "Ultraviolet", "D.O.T.S Projector"], "Ett spöke som ofta håller sig nära sitt rum.", "D.O.T.S syns bara via kamera när ingen är i rummet.", "Vandrar mindre långt från favoritrum.", "Normal (1.7 m/s)", "50%", "Kamerabunden D.O.T.S.", "Ställ kamera på D.O.T.S och lämna rummet."],
  ["Myling", ["EMF Level 5", "Ultraviolet", "Ghost Writing"], "Ett tystare spöke under jakt.", "Gör mer ljud i parabolic microphone.", "Steg hörs på kortare avstånd under jakt.", "Normal (1.7 m/s)", "50%", "Tystare jaktsteg.", "Om elektroniken stör innan du hör steg kan det vara Myling."],
  ["Onryo", ["Spirit Box", "Ghost Orb", "Freezing Temperatures"], "Ett spöke kopplat till eld och lågor.", "Kan jaga efter att lågor slocknar.", "Tända lågor kan fungera som skydd.", "Normal (1.7 m/s)", "60%", "Tredje släckta lågan kan trigga jakt.", "Testa ljus försiktigt och ha crucifix redo."],
  ["The Twins", ["EMF Level 5", "Spirit Box", "Freezing Temperatures"], "Två-liknande aktivitet från olika platser.", "Kan interagera långt ifrån huvudspöket.", "Olika jaktstarter kan ge olika hastighet.", "Lite långsammare eller snabbare variant", "50%", "Två aktivitetsplatser.", "Om aktivitet sker i två områden nära samtidigt kan det vara Twins."],
  ["Raiju", ["EMF Level 5", "Ghost Orb", "D.O.T.S Projector"], "Ett spöke som använder elektronik för hastighet.", "Blir snabbare nära aktiv elektronik.", "Stör elektronik på längre avstånd under jakt.", "Normal, 2.5 m/s nära elektronik", "50%, 65% nära elektronik", "Elektronikboost.", "Stäng av utrustning i jaktvägar och lyssna på hastigheten."],
  ["Obake", ["EMF Level 5", "Ultraviolet", "Ghost Orb"], "Ett spöke som kan lämna ovanliga avtryck.", "Kan lämna special-UV, till exempel sex fingrar.", "Kan ibland inte lämna UV trots interaktion.", "Normal (1.7 m/s)", "50%", "Kan byta modell kort under jakt.", "Kolla UV-avtryck noga. Sex fingrar är starkt Obake-tecken."],
  ["The Mimic", ["Spirit Box", "Ultraviolet", "Freezing Temperatures"], "Ett spöke som härmar andra spöken.", "Kan härma nästan alla andra spökens beteenden.", "Visar alltid falsk Ghost Orb utöver sina riktiga bevis.", "Beror på vad den härmar", "Beror på vad den härmar", "Fake Ghost Orb.", "Om du får Orb plus Spirit Box, UV och Freezing är The Mimic mycket troligt."],
  ["Moroi", ["Spirit Box", "Ghost Writing", "Freezing Temperatures"], "Ett spöke som blir farligare vid låg sanity.", "Blir snabbare ju lägre sanity laget har.", "Rökelse stoppar den längre under jakt.", "1.5 till 2.25 m/s beroende på sanity", "50%", "Kan förbanna spelare via Spirit Box/parabolic.", "Om hastigheten ökar kraftigt sent i rundan, misstänk Moroi."],
  ["Deogen", ["Spirit Box", "Ghost Writing", "D.O.T.S Projector"], "Ett spöke som alltid vet var du är.", "Hittar alltid spelare under jakt.", "Blir extremt långsam nära spelaren.", "3.0 m/s långt bort, 0.4 m/s nära", "40%", "Särskild Spirit Box-andning på nära håll.", "Göm dig inte. Loopa den försiktigt när du vet att det är Deogen."],
  ["Thaye", ["Ghost Orb", "Ghost Writing", "D.O.T.S Projector"], "Ett spöke som börjar starkt men åldras över tid.", "Mycket aggressiv och snabb i början.", "Blir långsammare och jagar senare när den åldras.", "2.75 m/s ung till 1.0 m/s gammal", "75% ung till 15% gammal", "Åldras när spelare är nära.", "Tidiga snabba jakter som blir lugnare över tid pekar mot Thaye."]
].map(([name, evidenceList, description, strength, weakness, speed, sanity, ability, tips]) => ({
  name,
  evidence: evidenceList,
  description,
  strength,
  weakness,
  speed,
  sanity,
  ability,
  tips
}));

const satisfactoryItems = `Adaptive Control Unit
AI Expansion Server
AI Limiter
Alclad Aluminum Sheet
Alien DNA Capsule
Alien Power Matrix
Alien Protein
Alumina Solution
Aluminum Casing
Aluminum Ingot
Aluminum Scrap
Assembly Director System
Automated Wiring
Bacon Agaric
Ballistic Warp Drive
Battery
Bauxite
Beryl Nut
Biochemical Sculptor
Biomass
Black Powder
Blade Runners
Blue Power Slug
Cable
Caterium Ingot
Caterium Ore
Chainsaw
Circuit Board
Cluster Nobelisk
Coal
Compacted Coal
Computer
Concrete
Cooling System
Copper Ingot
Copper Ore
Copper Powder
Copper Sheet
Crude Oil
Crystal Oscillator
Dark Matter Crystal
Dark Matter Residue
Diamonds
Dissolved Silica
Electromagnetic Control Rod
Empty Canister
Empty Fluid Tank
Encased Industrial Beam
Encased Plutonium Cell
Encased Uranium Cell
Excited Photonic Matter
Explosive Rebar
Fabric
Factory Cart
FICSIT Coupon
Ficsite Ingot
Ficsite Trigon
Ficsonium
Ficsonium Fuel Rod
Fuel
Fused Modular Frame
Gas Filter
Gas Mask
Gas Nobelisk
Golden Factory Cart
Hatcher Remains
Hazmat Suit
Heat Sink
Heavy Modular Frame
Heavy Oil Residue
High-Speed Connector
Hog Remains
Homing Rifle Ammo
Hoverpack
Iodine-Infused Filter
Ionized Fuel
Iron Ingot
Iron Ore
Iron Plate
Iron Rebar
Iron Rod
Jetpack
Leaves
Limestone
Liquid Biofuel
Magnetic Field Generator
Medicinal Inhaler
Mercer Sphere
Modular Engine
Modular Frame
Motor
Mycelia
Neural-Quantum Processor
Nitric Acid
Nitrogen Gas
Nobelisk
Nobelisk Detonator
Non-Fissile Uranium
Nuclear Pasta
Nuke Nobelisk
Object Scanner
Packaged Alumina Solution
Packaged Fuel
Packaged Heavy Oil Residue
Packaged Ionized Fuel
Packaged Liquid Biofuel
Packaged Nitric Acid
Packaged Nitrogen Gas
Packaged Oil
Packaged Rocket Fuel
Packaged Sulfuric Acid
Packaged Turbofuel
Packaged Water
Paleberry
Parachute
Petroleum Coke
Plastic
Plutonium Fuel Rod
Plutonium Pellet
Plutonium Waste
Polymer Resin
Portable Miner
Power Shard
Pressure Conversion Cube
Pulse Nobelisk
Purple Power Slug
Quartz Crystal
Quickwire
Radio Control Unit
Raw Quartz
Reanimated SAM
Rebar Gun
Reinforced Iron Plate
Rifle
Rifle Ammo
Rocket Fuel
Rotor
Rubber
SAM
SAM Fluctuator
Screw
Shatter Rebar
Silica
Singularity Cell
Smart Plating
Smokeless Powder
Solid Biofuel
Somersloop
Spitter Remains
Stator
Steel Beam
Steel Ingot
Steel Pipe
Stinger Remains
Stun Rebar
Sulfur
Sulfuric Acid
Supercomputer
Superposition Oscillator
Thermal Propulsion Rocket
Time Crystal
Turbo Motor
Turbo Rifle Ammo
Turbofuel
Uranium
Uranium Fuel Rod
Uranium Waste
Versatile Framework
Water
Wire
Wood
Xeno-Basher
Xeno-Zapper
Yellow Power Slug
Zipline`.split("\n");

const satisfactoryBuildings = `Alien Power Augmenter
Assembler
AWESOME Shop
AWESOME Sink
Biomass Burner
Blender
Blueprint Designer Mk.1
Blueprint Designer Mk.2
Blueprint Designer Mk.3
Coal-Powered Generator
Constructor
Converter
Conveyor Belt Mk.1
Conveyor Belt Mk.2
Conveyor Belt Mk.3
Conveyor Belt Mk.4
Conveyor Belt Mk.5
Conveyor Belt Mk.6
Conveyor Lift Mk.1
Conveyor Lift Mk.2
Conveyor Lift Mk.3
Conveyor Lift Mk.4
Conveyor Lift Mk.5
Conveyor Lift Mk.6
Conveyor Merger
Conveyor Splitter
Crafting Bench
Dimensional Depot Uploader
Drone
Drone Port
Electric Locomotive
Equipment Workshop
Explorer
Fluid Buffer
Foundry
Freight Platform
Fuel-Powered Generator
Geothermal Generator
Hypertube
Industrial Fluid Buffer
Industrial Storage Container
Jump Pad
Manufacturer
Miner Mk.1
Miner Mk.2
Miner Mk.3
Nuclear Power Plant
Oil Extractor
Packager
Particle Accelerator
Pipeline Mk.1
Pipeline Mk.2
Pipeline Pump Mk.1
Pipeline Pump Mk.2
Power Pole Mk.1
Power Pole Mk.2
Power Pole Mk.3
Power Storage
Power Switch
Quantum Encoder
Radar Tower
Railway
Refinery
Resource Well Extractor
Resource Well Pressurizer
Smelter
Space Elevator
Storage Container
The HUB
Tractor
Train Station
Truck
Truck Station
Water Extractor`.split("\n");

const satisfactorySchematics = `AWESOME Sink
Advanced Aluminum Production
Advanced Steel Production
Aeronautical Engineering
AI Limiter
Alien Energy Harnessing
Alien Power Matrix
Alternate: Adhered Iron Plate
Alternate: Alclad Casing
Alternate: Automated Speed Wiring
Alternate: Basic Iron Ingot
Alternate: Bolted Frame
Alternate: Bolted Iron Plate
Alternate: Cast Screw
Alternate: Caterium Circuit Board
Alternate: Caterium Computer
Alternate: Caterium Wire
Alternate: Charcoal
Alternate: Cheap Silica
Alternate: Coated Cable
Alternate: Coated Iron Plate
Alternate: Coke Steel Ingot
Alternate: Compacted Steel Ingot
Alternate: Copper Alloy Ingot
Alternate: Copper Rotor
Alternate: Crystal Computer
Alternate: Diluted Fuel
Alternate: Electric Motor
Alternate: Encased Industrial Pipe
Alternate: Fine Concrete
Alternate: Heavy Encased Frame
Alternate: Heavy Flexible Frame
Alternate: Heavy Oil Residue
Alternate: Insulated Cable
Alternate: Iron Alloy Ingot
Alternate: Iron Pipe
Alternate: Iron Wire
Alternate: Pure Aluminum Ingot
Alternate: Pure Caterium Ingot
Alternate: Pure Copper Ingot
Alternate: Pure Iron Ingot
Alternate: Quickwire Cable
Alternate: Recycled Plastic
Alternate: Recycled Rubber
Alternate: Solid Steel Ingot
Base Building
Basic Steel Production
Bauxite Refinement
Bio-Organic Properties
Blade Runners
Coal Power
Control System Development
Crystal Oscillator
Expanded Power Infrastructure
Fabric
Field Research
Fluid Packaging
FICSIT Blueprints
FICSIT Blueprints Mk.2
FICSIT Blueprints Mk.3
Gas Mask
Geothermal Generator
Hazmat Suit
Hoverpack
Hypertubes
Industrial Manufacturing
Jetpack
Jump Pads
Logistics
Logistics Mk.2
Logistics Mk.3
Logistics Mk.4
Logistics Mk.5
Matter Conversion
Monorail Train Technology
Nuclear Power
Oil Processing
Overclock Production
Particle Enrichment
Pipeline Engineering Mk.2
Power Augmenter
Quantum Encoding
Resource Sink Bonus Program
Smart Splitter
Synthetic Power Shards
Vehicular Transport
Zipline`.split("\n");

const animalStats = {
  "Whitetail Deer": ["4", "3 / 10 (GREAT ONE)"], "Siberian Musk Deer": ["2", "3"], "Roe Deer": ["3", "3"],
  "Antelope Jackrabbit": ["1", "3"], "White-tailed Jackrabbit": ["1", "3"], "Scrub Hare": ["1", "3"],
  "Mountain Hare": ["1", "3"], "European Hare": ["1", "3"], "European Rabbit": ["1", "3"],
  "Eastern Cottontail Rabbit": ["1", "3"], "Mallard": ["1", "3"], "Cinnamon Teal": ["1", "3"],
  "Green Winged Teal": ["1", "3"], "Eurasian Teal": ["1", "3"], "Eurasian Wigeon": ["1", "3"],
  "Harlequin Duck": ["1", "3"], "Goldeneye": ["1", "3"], "Tufted Duck": ["1", "3"],
  "Rio Grande Turkey": ["1", "3"], "Eastern Wild Turkey": ["1", "3"], "Merriam Turkey": ["1", "3"],
  "Black Grouse": ["1", "3"], "Hazel Grouse": ["1", "3"], "Bobwhite Quail": ["1", "3"],
  "Stubble Quail": ["1", "3"], "Ring-Necked Pheasant": ["1", "3 / 10 (GREAT ONE)"],
  "Rock Ptarmigan": ["1", "3"], "Willow Ptarmigan": ["1", "3"], "Western Capercaillie": ["1", "3"],
  "Axis Deer": ["3", "5"], "Blacktail Deer": ["4", "5"], "Fallow Deer": ["4", "5 / 10 (GREAT ONE)"],
  "Hog Deer": ["3", "5"], "Mule Deer": ["5", "5"], "Sika Deer": ["4", "5"], "Sambar": ["7", "5"],
  "Javan Rusa": ["5", "5"], "Moose": ["8", "5 / 10 (GREAT ONE)"], "Mountain Reindeer": ["6", "5"],
  "Grant Caribou": ["6", "5"], "Blue Wildebeest": ["6", "5"], "Gemsbok": ["6", "5"],
  "Lesser Kudu": ["4", "5"], "Springbok": ["3", "5"], "Blackbuck": ["3", "5"], "Pronghorn": ["3", "5"],
  "Chamois": ["3", "5"], "Roosevelt Elk": ["7", "5"], "Rocky Mountain Elk": ["7", "5"],
  "Warthog": ["4", "5"], "Wild Boar": ["5", "5"], "Collared Peccary": ["3", "5"],
  "Feral Pig": ["5", "5"], "Canada Goose": ["1", "5"], "Greylag Goose": ["1", "5"],
  "Tundra Bean Goose": ["1", "5"], "Magpie Goose": ["1", "5"], "European Bison": ["9", "5"],
  "Plains Bison": ["9", "5"], "Iberian Mouflon": ["4", "5"], "Beceite Ibex": ["4", "5"],
  "Gredos Ibex": ["4", "5"], "Ronda Ibex": ["4", "5"], "Southeastern Spanish Ibex": ["4", "5"],
  "Rocky Mountain Bighorn Sheep": ["5", "5"], "Desert Bighorn Sheep": ["5", "5"], "Mountain Goat": ["4", "5"],
  "Feral Goat": ["3", "5"], "Common Raccoon": ["2", "5"], "Red Deer": ["6", "9 / 10 (GREAT ONE)"],
  "Eastern Gray Kangaroo": ["4", "9"], "Coyote": ["2", "9"], "Side-Striped Jackal": ["2", "9"],
  "Red Fox": ["2", "9 / 10 (GREAT ONE)"], "Gray Fox": ["2", "9"], "Eurasian Lynx": ["3", "9"],
  "Bobcat": ["2", "9"], "Mexican Bobcat": ["2", "9"], "Raccoon Dog": ["2", "9"],
  "Iberian Wolf": ["6", "9"], "Gray Wolf": ["6", "9"], "Puma": ["5", "9"], "Mountain Lion": ["5", "9"],
  "Lion": ["9", "9"], "Cape Buffalo": ["9", "9"], "Water Buffalo": ["9", "9"], "Banteng": ["9", "9"],
  "Eurasian Brown Bear": ["7", "9"], "Black Bear": ["7", "9 / 10 (GREAT ONE)"], "Grizzly Bear": ["8", "9"],
  "American Alligator": ["7", "9"], "Saltwater Crocodile": ["8", "9"], "Tahr": ["?", "10"],
  "Bengal Tiger": ["9", "9"], "Snow Leopard": ["3", "9"], "Wild Yak": ["9", "9"]
  , "Red Grouse": ["1", "3"], "Eurasian Woodcock": ["1", "3"], "American Mink": ["1", "5"],
  "Eurasian Pine Marten": ["1", "5"], "European Badger": ["2", "5"], "Woolly Hare": ["1", "3"],
  "Northern Red Muntjac": ["2", "3"], "Tibetan Fox": ["2", "9"], "Blue Sheep": ["4", "5"],
  "Barasingha": ["6", "5"], "Nilgai": ["6", "5"], "Ferruginous Duck": ["1", "3"],
  "Gadwall": ["1", "3"], "Snow Goose": ["1", "5"], "Dusky Grouse": ["1", "3"],
  "Wood Duck": ["1", "3"], "Northern Pintail": ["1", "3"], "North American Beaver": ["2", "5"],
  "Woodland Caribou": ["6", "5"], "Manitoban Elk": ["7", "5"], "Wood Bison": ["9", "5"],
  "Wild Hog": ["5", "5"]
};

const reserves = [
  ["Hirschfelden Hunting Reserve", "Canada Goose, Ring-Necked Pheasant, European Rabbit, Red Fox, Roe Deer, Fallow Deer, Wild Boar, Red Deer, European Bison"],
  ["Layton Lake District", "Mallard, Merriam Turkey, White-tailed Jackrabbit, Coyote, Blacktail Deer, Whitetail Deer, Black Bear, Roosevelt Elk, Moose"],
  ["Medved-Taiga National Park", "Western Capercaillie, Siberian Musk Deer, Eurasian Lynx, Wild Boar, Gray Wolf, Mountain Reindeer, Eurasian Brown Bear, Moose"],
  ["Vurhonga Savanna", "Eurasian Wigeon, Scrub Hare, Side-Striped Jackal, Springbok, Warthog, Lesser Kudu, Blue Wildebeest, Gemsbok, Cape Buffalo, Lion"],
  ["Parque Fernando", "Cinnamon Teal, Blackbuck, Axis Deer, Collared Peccary, Puma, Mule Deer, Red Deer, Water Buffalo"],
  ["Yukon Valley", "Harlequin Duck, Canada Goose, Red Fox, Gray Wolf, Grant Caribou, Moose, Grizzly Bear, Plains Bison"],
  ["Cuatro Colinas Game Reserve", "Ring-Necked Pheasant, European Hare, Roe Deer, Ronda Ibex, Beceite Ibex, Gredos Ibex, Southeastern Spanish Ibex, Iberian Mouflon, Wild Boar, Iberian Wolf, Red Deer"],
  ["Silver Ridge Peaks", "Merriam Turkey, Pronghorn, Mountain Goat, Rocky Mountain Bighorn Sheep, Mountain Lion, Mule Deer, Black Bear, Rocky Mountain Elk, Plains Bison"],
  ["Te Awaroa National Park", "Merriam Turkey, Mallard, European Rabbit, Chamois, Feral Goat, Sika Deer, Fallow Deer, Tahr, Feral Pig, Red Deer"],
  ["Rancho del Arroyo", "Rio Grande Turkey, Ring-Necked Pheasant, Antelope Jackrabbit, Coyote, Mexican Bobcat, Collared Peccary, Pronghorn, Whitetail Deer, Mule Deer, Desert Bighorn Sheep"],
  ["Mississippi Acres Preserve", "Bobwhite Quail, Eastern Wild Turkey, Green Winged Teal, Eastern Cottontail Rabbit, Gray Fox, Common Raccoon, Whitetail Deer, Wild Hog, American Alligator, Black Bear"],
  ["Revontuli Coast", "Eurasian Wigeon, Eurasian Teal, Black Grouse, Goldeneye, Hazel Grouse, Mallard, Western Capercaillie, Tufted Duck, Rock Ptarmigan, Canada Goose, Willow Ptarmigan, Tundra Bean Goose, Mountain Hare, Greylag Goose, Raccoon Dog, Eurasian Lynx, Whitetail Deer, Eurasian Brown Bear, Moose"],
  ["New England Mountains", "Ring-Necked Pheasant, Bobwhite Quail, Eastern Wild Turkey, Goldeneye, Mallard, Green Winged Teal, Eastern Cottontail Rabbit, Red Fox, Gray Fox, Coyote, Common Raccoon, Bobcat, Whitetail Deer, Black Bear, Moose"],
  ["Emerald Coast", "Magpie Goose, Stubble Quail, Red Fox, Hog Deer, Axis Deer, Feral Goat, Eastern Gray Kangaroo, Fallow Deer, Feral Pig, Javan Rusa, Red Deer, Sambar, Saltwater Crocodile, Banteng"],
  ["Sundarpatan", "Greylag Goose, Woolly Hare, Northern Red Muntjac, Tibetan Fox, Blackbuck, Blue Sheep, Snow Leopard, Tahr, Barasingha, Nilgai, Bengal Tiger, Water Buffalo, Wild Yak"],
  ["Salzwiesen Park", "Eurasian Teal, Eurasian Wigeon, Tundra Bean Goose, Ferruginous Duck, Greylag Goose, Gadwall, European Rabbit, Goldeneye, Ring-Necked Pheasant, Mallard, Black Grouse, Tufted Duck, Common Raccoon, Raccoon Dog, Red Fox"],
  ["Askiy Ridge Hunting Preserve", "Ring-Necked Pheasant, Canada Goose, Snow Goose, Dusky Grouse, Mallard, Wood Duck, Northern Pintail, North American Beaver, Pronghorn, Mountain Goat, Whitetail Deer, Rocky Mountain Bighorn Sheep, Mule Deer, Gray Wolf, Woodland Caribou, Black Bear, Manitoban Elk, Moose, Wood Bison"],
  ["Tòrr nan Sithean", "Black Grouse, Red Grouse, Eurasian Wigeon, Eurasian Woodcock, Ring-Necked Pheasant, Western Capercaillie, Mountain Hare, American Mink, Eurasian Pine Marten, European Badger, Red Fox, Feral Goat, Roe Deer, Fallow Deer, Sika Deer, Wild Boar, Red Deer"]
].map(([name, animals]) => ({ name, animals: animals.split(", ") }));

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const error = document.querySelector("#login-error");
  const email = normalizeEmail(emailInput.value);
  const password = passwordInput.value;

  if (!email || !email.includes("@")) {
    error.textContent = t("invalidEmail");
    return;
  }

  const role = getRoleForEmail(email);
  const loginResult = await validateLogin(email, role, password);
  if (!loginResult.ok) {
    error.textContent = loginResult.message;
    return;
  }

  currentUser = {
    email,
    role
  };
  registerUser(email, { isLoggedIn: true });
  saveSession();

  addLog(`${currentUser.email} loggade in som ${currentUser.role}.`);
  error.textContent = "";
  emailInput.value = "";
  passwordInput.value = "";
  showApp();
});

document.querySelector("#logout-button").addEventListener("click", () => {
  if (currentUser) {
    registerUser(currentUser.email, { isLoggedIn: false });
    addLog(`${currentUser.email} loggade ut.`);
  }
  currentUser = null;
  clearSession();
  document.querySelector("#app-shell").classList.add("hidden");
  document.querySelector("#login-screen").classList.remove("hidden");
  applyLanguage();
});

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

document.querySelector("#add-item-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!canAccess("admin")) return;

  const title = document.querySelector("#item-title");
  const text = document.querySelector("#item-text");
  const message = document.querySelector("#admin-message");

  state.items.unshift({
    title: title.value.trim(),
    text: text.value.trim(),
    author: currentUser.email,
    createdAt: new Date().toISOString()
  });

  addLog(`${currentUser.email} lade till "${title.value.trim()}" på Hem.`);
  saveState();
  title.value = "";
  text.value = "";
  message.textContent = t("added");
  renderAll();
});

document.querySelector("#add-admin-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!canAccess("owner")) return;

  const input = document.querySelector("#admin-email");
  const message = document.querySelector("#owner-message");
  const email = normalizeEmail(input.value);

  if (!email || !email.includes("@")) {
    message.textContent = t("invalidEmail");
    return;
  }

  if (email === OWNER_EMAIL) {
    message.textContent = t("ownerNoAdmin");
    return;
  }

  state.admins = normalizeEmailList([...state.admins, ...DEFAULT_ADMINS]);

  if (isAdminEmail(email)) {
    message.textContent = t("adminExists");
    return;
  }

  state.admins = normalizeEmailList([...state.admins, email]);
  addLog(`${currentUser.email} lade till ${email} som administratör.`);
  saveState();
  input.value = "";
  message.textContent = t("adminAdded");
  renderAll();
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  applyIncomingState(JSON.parse(event.newValue));
});

window.addEventListener("beforeunload", () => {
  if (currentUser) {
    registerUser(currentUser.email, { isLoggedIn: false, broadcast: false });
  }
});

if (liveChannel) {
  liveChannel.addEventListener("message", (event) => {
    if (event.data && event.data.type === "state-updated") {
      applyIncomingState(loadState());
    }
  });
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      admins: normalizeEmailList([...(parsed.admins || []), ...DEFAULT_ADMINS]),
      members: parsed.members || {},
      users: parsed.users || {},
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(options = {}) {
  const shouldBroadcast = options.broadcast !== false;
  state.updatedAt = new Date().toISOString();
  lastKnownUpdate = state.updatedAt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (shouldBroadcast && liveChannel) {
    liveChannel.postMessage({ type: "state-updated", updatedAt: state.updatedAt });
  }
}

function applyIncomingState(nextState) {
  if (!nextState || nextState.updatedAt === lastKnownUpdate) return;
  state = {
    ...structuredClone(defaultState),
    ...nextState,
    admins: normalizeEmailList([...(nextState.admins || []), ...DEFAULT_ADMINS]),
    members: nextState.members || {},
    users: nextState.users || {}
  };
  lastKnownUpdate = state.updatedAt;
  if (currentUser) {
    currentUser.role = getRoleForEmail(currentUser.email);
    saveSession();
    renderAll();
    showLiveNotice(t("liveUpdated"));
  }
}

function showLiveNotice(text) {
  let notice = document.querySelector("#live-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "live-notice";
    notice.className = "live-notice";
    document.querySelector("#app-shell").append(notice);
  }
  notice.textContent = text;
  notice.classList.add("visible");
  window.clearTimeout(showLiveNotice.timer);
  showLiveNotice.timer = window.setTimeout(() => notice.classList.remove("visible"), 3200);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function t(key) {
  return translations[currentLanguage][key] || translations.sv[key] || key;
}

function setLanguage(language) {
  currentLanguage = language === "en" ? "en" : "sv";
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  if (githubUpdate) {
    githubUpdate.title = currentLanguage === "en" ? "Website updated on GitHub" : "Hemsidan uppdaterad på GitHub";
  }
  applyLanguage();
  if (currentUser) {
    renderAll();
  }
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === currentLanguage);
  });

  document.querySelector(".login-panel .eyebrow").textContent = "Spel";
  document.querySelector("#login-title").textContent = t("loginTitle");
  document.querySelector(".intro").textContent = t("loginIntro");
  document.querySelector('label[for="email"]').textContent = t("email");
  document.querySelector("#email").placeholder = t("emailPlaceholder");
  document.querySelector('label[for="password"]').textContent = t("password");
  document.querySelector("#password").placeholder = t("passwordPlaceholder");
  document.querySelector("#login-form button").textContent = t("loginButton");
  document.querySelector("#logout-button").textContent = t("logout");

  const homeTitle = document.querySelector("#home-title");
  if (homeTitle) homeTitle.textContent = t("homeTitle");
  const homeIntro = document.querySelector(".home-hero p");
  if (homeIntro) homeIntro.textContent = t("homeIntro");
  const updatesTitle = document.querySelector("#updates-title");
  if (updatesTitle) updatesTitle.textContent = t("updatesTitle");
  const adminTitle = document.querySelector("#admin-title");
  if (adminTitle) adminTitle.textContent = t("adminTitle");
  const adminIntro = document.querySelector("#view-admin .page-heading p:last-child");
  if (adminIntro) adminIntro.textContent = t("adminIntro");
  const ownerTitle = document.querySelector("#owner-title");
  if (ownerTitle) ownerTitle.textContent = t("ownerTitle");
  const ownerEyebrow = document.querySelector("#view-owner .eyebrow");
  if (ownerEyebrow) ownerEyebrow.textContent = t("ownerTitle");
  const ownerIntro = document.querySelector("#view-owner .page-heading p:last-child");
  if (ownerIntro) ownerIntro.textContent = t("ownerIntro");
  const profileTitle = document.querySelector("#profile-title");
  if (profileTitle) profileTitle.textContent = t("profile");
  const profileEyebrow = document.querySelector("#view-profil .eyebrow");
  if (profileEyebrow) profileEyebrow.textContent = t("nav").profil;

  const itemTitleLabel = document.querySelector('label[for="item-title"]');
  if (itemTitleLabel) itemTitleLabel.textContent = t("title");
  const itemTitle = document.querySelector("#item-title");
  if (itemTitle) itemTitle.placeholder = t("itemTitlePlaceholder");
  const itemTextLabel = document.querySelector('label[for="item-text"]');
  if (itemTextLabel) itemTextLabel.textContent = t("text");
  const itemText = document.querySelector("#item-text");
  if (itemText) itemText.placeholder = t("itemTextPlaceholder");
  const addItemButton = document.querySelector("#add-item-form button");
  if (addItemButton) addItemButton.textContent = t("add");
  const addAdminButton = document.querySelector("#add-admin-form button");
  if (addAdminButton) addAdminButton.textContent = t("add");
  const adminPasswordNote = document.querySelector("#admin-password-note");
  if (adminPasswordNote) adminPasswordNote.textContent = t("adminPasswordNote");

  const adminHeading = document.querySelector("#view-owner .panel:first-child h2");
  if (adminHeading) adminHeading.textContent = t("admins");
  const eventHeading = document.querySelector("#activity-log")?.closest(".panel")?.querySelector("h2");
  if (eventHeading) eventHeading.textContent = t("events");
  const usersTitle = document.querySelector("#users-title");
  if (usersTitle) usersTitle.textContent = t("users");
  const usersNote = document.querySelector("#users-note");
  if (usersNote) usersNote.textContent = t("usersNote");
  const loggedInAs = document.querySelector(".profile-card .muted");
  if (loggedInAs) loggedInAs.textContent = t("loggedInAs");
}

function saveSession() {
  if (!currentUser) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email: currentUser.email,
    savedAt: new Date().toISOString()
  }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function restoreSession() {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return false;

  try {
    const session = JSON.parse(saved);
    if (!session.email) return false;
    currentUser = {
      email: normalizeEmail(session.email),
      role: getRoleForEmail(normalizeEmail(session.email))
    };
    registerUser(currentUser.email, { isLoggedIn: true });
    showApp();
    return true;
  } catch {
    clearSession();
    return false;
  }
}

function registerUser(email, options = {}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;
  const existing = state.users[normalizedEmail] || {};
  state.users[normalizedEmail] = {
    email: normalizedEmail,
    firstSeen: existing.firstSeen || new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    isLoggedIn: Boolean(options.isLoggedIn),
    role: getRoleForEmail(normalizedEmail)
  };
  saveState({ broadcast: options.broadcast !== false });
}

function getRoleForEmail(email) {
  if (email === OWNER_EMAIL) return "Ägare";
  if (isAdminEmail(email)) return "Admin";
  return "Medlem";
}

function isAdminEmail(email) {
  const admins = normalizeEmailList([...(state.admins || []), ...DEFAULT_ADMINS]);
  return admins.includes(normalizeEmail(email));
}

function normalizeEmailList(list) {
  return [...new Set((list || []).map((email) => normalizeEmail(String(email))).filter(Boolean))];
}

async function validateLogin(email, role, password) {
  if (!password) {
    return { ok: false, message: t("writePassword") };
  }

  const passwordHash = await hashPassword(password);

  if (role === "Ägare") {
    return passwordHash === OWNER_PASSWORD_HASH
      ? { ok: true }
      : { ok: false, message: t("ownerWrong") };
  }

  if (role === "Admin") {
    return passwordHash === ADMIN_PASSWORD_HASH
      ? { ok: true }
      : { ok: false, message: t("adminWrong") };
  }

  if (!state.members[email]) {
    if (password.length < 4) {
      return { ok: false, message: t("memberShort") };
    }
    state.members[email] = { passwordHash, createdAt: new Date().toISOString() };
    addLog(`${email} skapade ett medlemskonto.`);
    saveState();
    return { ok: true };
  }

  if (state.members[email].password && state.members[email].password === password) {
    state.members[email] = { passwordHash, createdAt: state.members[email].createdAt || new Date().toISOString() };
    saveState();
    return { ok: true };
  }

  return state.members[email].passwordHash === passwordHash
    ? { ok: true }
    : { ok: false, message: t("memberWrong") };
}

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  if (window.crypto && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  const digest = sha256Bytes(encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sha256Bytes(bytes) {
  const constants = [];
  const hash = [];
  let primeCounter = 0;

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (Math.pow(candidate, 1 / 2) % 1) * 0x100000000 | 0;
      }
      constants[primeCounter] = (Math.pow(candidate, 1 / 3) % 1) * 0x100000000 | 0;
      primeCounter += 1;
    }
  }

  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength, false);

  const words = new Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      words[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotateRight(words[i - 15], 7) ^ rotateRight(words[i - 15], 18) ^ (words[i - 15] >>> 3);
      const s1 = rotateRight(words[i - 2], 17) ^ rotateRight(words[i - 2], 19) ^ (words[i - 2] >>> 10);
      words[i] = (words[i - 16] + s0 + words[i - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let i = 0; i < 64; i += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + constants[i] + words[i]) | 0;
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  const output = new Uint8Array(32);
  const outputView = new DataView(output.buffer);
  hash.forEach((value, index) => outputView.setUint32(index * 4, value, false));
  return output;
}

function rotateRight(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}

function isPrime(value) {
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % factor === 0) return false;
  }
  return true;
}

function showApp() {
  document.querySelector("#login-screen").classList.add("hidden");
  document.querySelector("#app-shell").classList.remove("hidden");
  applyLanguage();
  renderAll();
  navigate("hem");
}

function renderAll() {
  if (!currentUser) return;
  currentUser.role = getRoleForEmail(currentUser.email);
  renderNav();
  renderHome();
  renderProfile();
  renderOwner();
}

function renderNav() {
  const nav = document.querySelector("#main-nav");
  nav.innerHTML = "";

  navItems
    .filter((item) => item.roles.includes(currentUser.role))
    .forEach((item) => {
      const link = document.createElement("a");
      link.href = `#${item.id}`;
      link.className = "nav-link";
      link.dataset.nav = item.id;
      link.textContent = t("nav")[item.id] || item.label;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigate(item.id);
      });
      nav.append(link);
    });
}

function renderHome() {
  const list = document.querySelector("#public-items");
  const count = document.querySelector("#item-count");
  const accessText = document.querySelector("#access-text");
  list.innerHTML = "";
  if (count) count.textContent = `${games.length} spel`;
  if (accessText) accessText.textContent = t("accessText");

  games.forEach((game) => {
    const row = document.createElement("li");
    row.className = `game-card game-card-${game.id}`;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Öppna ${game.title}`);
    row.innerHTML = `
      <img class="game-cover" src="" alt="" loading="lazy" />
      <div class="game-overlay"></div>
      <div class="game-card-content">
        <span class="game-symbol" aria-hidden="true"></span>
        <h3></h3>
        <p></p>
        <span class="game-link"></span>
      </div>
    `;
    row.querySelector("img").src = game.image;
    row.querySelector("img").alt = `${game.title} bild`;
    row.querySelector("h3").textContent = game.title;
    row.querySelector("p").textContent = game.text;
    row.querySelector(".game-link").textContent = t("explore");
    row.querySelector(".game-symbol").textContent = getGameSymbol(game.id);
    row.addEventListener("click", () => showGame(game.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showGame(game.id);
      }
    });
    list.append(row);
  });

  renderUpdates();
  ensureGameView();
}

function renderUpdates() {
  const updatesList = document.querySelector("#updates-list");
  const updatesCount = document.querySelector("#updates-count");
  const updatesSection = document.querySelector("#updates-section");
  if (!updatesList || !updatesCount || !updatesSection) return;

  const githubUpdates = githubUpdate ? [githubUpdate] : [];
  const adminUpdates = state.items
    .filter((item) => item.author && item.author !== "system")
    .slice(0, 8);
  const updates = [...githubUpdates, ...adminUpdates].slice(0, 8);

  updatesList.innerHTML = "";
  updatesCount.textContent = t("updatesCount")(updates.length);
  updatesSection.classList.toggle("is-empty", updates.length === 0);

  if (updates.length === 0) {
    updatesList.innerHTML = `<li class="empty-update">${t("emptyUpdates")}</li>`;
    return;
  }

  updates.forEach((item) => {
    const row = document.createElement("li");
    row.className = "update-card";
    row.innerHTML = `
      <div>
        <h3></h3>
        <p></p>
      </div>
      <span></span>
    `;
    row.querySelector("h3").textContent = item.title;
    row.querySelector("p").textContent = item.text;
    row.querySelector("span").textContent = `${currentLanguage === "en" ? "By" : "Av"} ${item.author} • ${formatDate(item.createdAt)}`;
    updatesList.append(row);
  });
}

function getGameSymbol(id) {
  if (id === "hunter") return "⌁";
  if (id === "phasmophobia") return "♟";
  return "⌬";
}

async function loadGithubUpdate() {
  try {
    const response = await fetch(GITHUB_REPO_COMMITS_URL, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) return;
    const commits = await response.json();
    const latest = commits[0];
    if (!latest || !latest.commit) return;
    const message = latest.commit.message.split("\n")[0] || "Uppdaterad hemsida";
    githubUpdate = {
      title: currentLanguage === "en" ? "Website updated on GitHub" : "Hemsidan uppdaterad på GitHub",
      text: message,
      author: "GitHub",
      createdAt: latest.commit.committer?.date || new Date().toISOString()
    };
    if (currentUser) renderUpdates();
  } catch {
    githubUpdate = null;
  }
}

function ensureGameView() {
  let view = document.querySelector("#view-game");
  if (!view) {
    view = document.createElement("section");
    view.id = "view-game";
    view.className = "view";
    view.setAttribute("aria-labelledby", "game-title");
    view.innerHTML = `
      <button id="back-to-games" class="ghost-button back-button" type="button">${t("backHome")}</button>
      <article id="game-detail" class="panel game-detail">
        <h2 id="game-title">${t("chooseGame")}</h2>
        <p class="muted">${t("chooseGameIntro")}</p>
      </article>
    `;
    document.querySelector(".content-shell").append(view);
    views.game = view;
    document.querySelector("#back-to-games").addEventListener("click", () => navigate("hem"));
  }
  views.game = view;
  return document.querySelector("#game-detail");
}

function showGame(id) {
  const detail = ensureGameView();
  if (id === "phasmophobia") detail.innerHTML = renderPhasmophobia();
  if (id === "satisfactory") detail.innerHTML = renderSatisfactory();
  if (id === "hunter") detail.innerHTML = renderHunter();

  if (id === "phasmophobia") {
    attachPhasmophobiaHandlers();
  }

  const hunterSearch = document.querySelector("#hunter-search");
  if (hunterSearch) {
    hunterSearch.addEventListener("input", renderHunterSearch);
    renderHunterSearch();
  }

  const calcForm = document.querySelector("#calc-form");
  if (calcForm) {
    calcForm.addEventListener("submit", renderCalculator);
  }

  navigate("game");
}

function renderPhasmophobia() {
  return `
    <div class="phasmo-shell">
    <div class="detail-heading phasmo-heading">
      <div>
        <p class="eyebrow">Phasmophobia</p>
        <h2>Alla spöken</h2>
        <p class="muted">Tryck på ett spöke för att läsa bevis, styrkor, svagheter, hastighet och tips.</p>
      </div>
      <span class="pill">${ghosts.length} spöken</span>
    </div>
    <div class="split-grid phasmo-overview">
      <section class="phasmo-section">
        <h3>Spöken</h3>
        <div class="ghost-grid">
          ${ghosts.map((ghost) => `
            <button class="ghost-list-card" type="button" data-ghost="${ghost.name}">
              <span class="ghost-icon">♟</span>
              <h4>${ghost.name}</h4>
              <span>${ghost.evidence.join(" • ")}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="phasmo-section">
        <h3>Bevis</h3>
        <div class="evidence-grid">
          ${evidence.map((item) => `
            <button class="evidence-card" type="button" data-evidence="${item.name}">
              <h4>${item.name}</h4>
              <p>${item.text}</p>
            </button>
          `).join("")}
        </div>
      </section>
    </div>
    </div>
  `;
}

function attachPhasmophobiaHandlers() {
  document.querySelectorAll(".ghost-list-card").forEach((button) => {
    button.addEventListener("click", () => showGhostDetail(button.dataset.ghost));
  });

  document.querySelectorAll(".evidence-card").forEach((button) => {
    button.addEventListener("click", () => showEvidenceDetail(button.dataset.evidence));
  });
}

function showGhostDetail(name) {
  const ghost = ghosts.find((item) => item.name === name);
  if (!ghost) return;
  const detail = document.querySelector("#game-detail");
  detail.innerHTML = renderGhostDetail(ghost);
  document.querySelector("#back-to-ghosts").addEventListener("click", () => {
    detail.innerHTML = renderPhasmophobia();
    attachPhasmophobiaHandlers();
  });
  attachEvidencePillHandlers();
}

function showEvidenceDetail(name) {
  const item = evidence.find((entry) => entry.name === name);
  if (!item) return;
  const detail = document.querySelector("#game-detail");
  detail.innerHTML = renderEvidenceDetail(item);
  document.querySelector("#back-to-ghosts").addEventListener("click", () => {
    detail.innerHTML = renderPhasmophobia();
    attachPhasmophobiaHandlers();
  });
  document.querySelectorAll(".ghost-list-card").forEach((button) => {
    button.addEventListener("click", () => showGhostDetail(button.dataset.ghost));
  });
}

function renderGhostDetail(ghost) {
  return `
    <div class="ghost-detail-page">
      <button id="back-to-ghosts" class="text-back" type="button">← Tillbaka till spöken</button>
      <div class="ghost-title-row">
        <div class="ghost-big-icon">♟</div>
        <div>
          <h2 id="game-title">${ghost.name}</h2>
          <p class="muted">${ghost.description}</p>
        </div>
      </div>

      <section class="ghost-evidence-row" aria-label="Bevis">
        <h3>Bevis</h3>
        <div class="evidence-pills">
          ${ghost.evidence.map((item) => `<button type="button" class="evidence-pill" data-evidence="${item}">${item}</button>`).join("")}
          ${ghost.name === "The Mimic" ? `<span class="evidence-pill fake-evidence">Fake Ghost Orb</span>` : ""}
        </div>
      </section>

      <div class="ghost-info-grid">
        ${renderGhostInfoCard("↯", "Styrkor", ghost.strength, "red")}
        ${renderGhostInfoCard("▢", "Svagheter", ghost.weakness, "green")}
        ${renderGhostInfoCard("◜", "Jakthastighet", ghost.speed, "blue")}
        ${renderGhostInfoCard("☯", "Sanity-tröskel", ghost.sanity, "purple")}
        ${renderGhostInfoCard("✦", "Unika förmågor", ghost.ability, "gold")}
        ${renderGhostInfoCard("ⓘ", "Tips", ghost.tips, "cyan")}
      </div>
    </div>
  `;
}

function renderGhostInfoCard(icon, title, text, tone) {
  return `
    <article class="ghost-info-card">
      <h3 class="tone-${tone}"><span>${icon}</span>${title}</h3>
      <p>${text}</p>
    </article>
  `;
}

function renderEvidenceDetail(item) {
  const matchingGhosts = ghosts.filter((ghost) => ghost.evidence.includes(item.name));
  return `
    <div class="ghost-detail-page">
      <button id="back-to-ghosts" class="text-back" type="button">← Tillbaka till spöken</button>
      <div class="ghost-title-row">
        <div class="ghost-big-icon">?</div>
        <div>
          <h2 id="game-title">${item.name}</h2>
          <p class="muted">${item.text}</p>
        </div>
      </div>
      <section class="phasmo-section">
        <h3>Spöken med detta bevis</h3>
        <div class="ghost-grid compact-ghost-grid">
          ${matchingGhosts.map((ghost) => `
            <button class="ghost-list-card" type="button" data-ghost="${ghost.name}">
              <span class="ghost-icon">♟</span>
              <h4>${ghost.name}</h4>
              <span>${ghost.evidence.join(" • ")}</span>
            </button>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function attachEvidencePillHandlers() {
  document.querySelectorAll(".evidence-pill[data-evidence]").forEach((button) => {
    button.addEventListener("click", () => showEvidenceDetail(button.dataset.evidence));
  });
}

function renderSatisfactory() {
  return `
    <div class="detail-heading">
      <div>
        <p class="eyebrow">Satisfactory</p>
        <h2>Codex och Calculator</h2>
      </div>
      <span class="pill">${satisfactoryItems.length} items</span>
    </div>
    <div class="satisfactory-grid">
      <section class="mini-card">
        <h3>Codex</h3>
        ${renderListBlock("Items", satisfactoryItems)}
        ${renderListBlock("Buildings", satisfactoryBuildings)}
        ${renderListBlock("Schematics", satisfactorySchematics)}
      </section>
      <section class="mini-card">
        <h3>Calculator</h3>
        <form id="calc-form" class="calc-form">
          <label for="calc-item">Item</label>
          <select id="calc-item">${satisfactoryItems.map((item) => `<option>${item}</option>`).join("")}</select>
          <label for="calc-rate">Mål per minut</label>
          <input id="calc-rate" type="number" min="1" value="60" />
          <button type="submit">Räkna</button>
        </form>
        <div id="calc-result" class="calc-result">
          Välj item och mål per minut. Kalkylatorn gör en enkel planeringsruta lokalt.
        </div>
        <a class="external-link" href="https://www.satisfactorytools.com/1.0/production" target="_blank" rel="noreferrer">Öppna Satisfactory Tools</a>
      </section>
    </div>
  `;
}

function renderListBlock(title, items) {
  return `
    <details class="codex-block">
      <summary>${title} <span>${items.length}</span></summary>
      <div class="chip-list">
        ${items.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </details>
  `;
}

function renderCalculator(event) {
  event.preventDefault();
  const item = document.querySelector("#calc-item").value;
  const rate = Number(document.querySelector("#calc-rate").value || 0);
  const constructors = Math.max(1, Math.ceil(rate / 30));
  document.querySelector("#calc-result").innerHTML = `
    <strong>${item}</strong>
    <p>Mål: ${rate} per minut.</p>
    <p>Startplan: bygg ungefär ${constructors} produktionssteg och justera recept efter dina alternate recipes.</p>
  `;
}

function renderHunter() {
  return `
    <div class="detail-heading">
      <div>
        <p class="eyebrow">theHunter: Call of the Wild</p>
        <h2>Kartor och djur</h2>
      </div>
      <span class="pill">${reserves.length} kartor</span>
    </div>
    <label for="hunter-search">Sök karta eller djur</label>
    <input id="hunter-search" class="search-input" type="search" placeholder="Exempel: Layton, Moose, Red Fox" />
    <div id="hunter-results" class="hunter-results"></div>
  `;
}

function renderHunterSearch() {
  const query = normalizeText(document.querySelector("#hunter-search").value);
  const results = document.querySelector("#hunter-results");
  const matchingReserves = reserves.filter((reserve) => {
    return !query || normalizeText(reserve.name).includes(query) || reserve.animals.some((animal) => normalizeText(animal).includes(query));
  });
  const matchingAnimals = getAnimalNames().filter((animal) => query && normalizeText(animal).includes(query));

  results.innerHTML = `
    ${matchingAnimals.length ? `
      <section>
        <h3>Djur hittade</h3>
        <div class="info-grid">
          ${matchingAnimals.map(renderAnimalCard).join("")}
        </div>
      </section>
    ` : ""}
    <section>
      <h3>${query ? "Kartor som matchar" : "Alla kartor"}</h3>
      <div class="info-grid">
        ${matchingReserves.map(renderReserveCard).join("")}
      </div>
    </section>
  `;
}

function renderAnimalCard(animal) {
  const maps = reserves.filter((reserve) => reserve.animals.includes(animal)).map((reserve) => reserve.name);
  const [animalClass = "?", level = "?"] = animalStats[animal] || [];
  return `
    <article class="mini-card">
      <h4>${animal}</h4>
      <p><strong>Class:</strong> ${animalClass} <strong>Level:</strong> ${level}</p>
      <p><strong>Kartor:</strong> ${maps.join(", ") || "Ingen karta hittad i listan."}</p>
    </article>
  `;
}

function renderReserveCard(reserve) {
  return `
    <article class="mini-card reserve-card">
      <h4>${reserve.name}</h4>
      <div class="animal-table">
        ${reserve.animals.map((animal) => {
          const [animalClass = "?", level = "?"] = animalStats[animal] || [];
          return `<div><span>${animal}</span><span>Class ${animalClass}</span><span>Level ${level}</span></div>`;
        }).join("")}
      </div>
    </article>
  `;
}

function getAnimalNames() {
  return [...new Set(reserves.flatMap((reserve) => reserve.animals))].sort();
}

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9åäöé -]/gi, "");
}

function renderProfile() {
  document.querySelector("#profile-email").textContent = currentUser.email;
  document.querySelector("#profile-role").textContent = `${t("role")}: ${t("roles")[currentUser.role] || currentUser.role}`;
  document.querySelector("#profile-avatar").textContent = currentUser.role.charAt(0);
}

function renderOwner() {
  if (!currentUser || currentUser.role !== "Ägare") return;

  state.admins = normalizeEmailList([...state.admins, ...DEFAULT_ADMINS]);

  const adminList = document.querySelector("#admin-list");
  const logList = document.querySelector("#activity-log");
  const userRoleList = document.querySelector("#user-role-list");
  adminList.innerHTML = "";
  logList.innerHTML = "";
  if (userRoleList) userRoleList.innerHTML = "";
  document.querySelector("#admin-count").textContent = `${state.admins.length} admin`;
  document.querySelector("#log-count").textContent = `${state.logs.length} loggar`;
  renderUserRoleList();

  state.admins.forEach((email) => {
    const row = document.createElement("li");
    row.className = "admin-row";

    const emailText = document.createElement("strong");
    emailText.textContent = email;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger-button";
    removeButton.textContent = t("remove");
    removeButton.addEventListener("click", () => removeAdmin(email));

    row.append(emailText, removeButton);
    adminList.append(row);
  });

  state.logs.slice(0, 20).forEach((log) => {
    const row = document.createElement("li");
    row.className = "log-row";
    row.innerHTML = `<p></p><div class="item-meta"></div>`;
    row.querySelector("p").textContent = log.text;
    row.querySelector(".item-meta").textContent = formatDate(log.createdAt);
    logList.append(row);
  });
}

function renderUserRoleList() {
  const list = document.querySelector("#user-role-list");
  const count = document.querySelector("#users-count");
  if (!list || !count) return;

  const users = getKnownUsers();
  count.textContent = t("usersCount")(users.length);
  list.innerHTML = "";

  if (users.length === 0) {
    list.innerHTML = `<li class="empty-update">${currentLanguage === "en" ? "No users yet." : "Inga användare ännu."}</li>`;
    return;
  }

  users.forEach((user) => {
    const role = getRoleForEmail(user.email);
    const row = document.createElement("li");
    row.className = "user-role-row";
    row.innerHTML = `
      <div>
        <strong></strong>
        <p></p>
      </div>
      <label>
        <span></span>
        <select></select>
      </label>
    `;
    row.querySelector("strong").textContent = user.email;
    row.querySelector("p").textContent = `${user.isLoggedIn ? t("onlineNow") + " • " : ""}${t("lastSeen")}: ${formatDate(user.lastSeen || user.firstSeen || new Date().toISOString())}`;
    row.querySelector("label span").textContent = t("setRole");

    const select = row.querySelector("select");
    select.innerHTML = `
      <option value="Medlem">${t("roles").Medlem}</option>
      <option value="Admin">${t("roles").Admin}</option>
      ${user.email === OWNER_EMAIL ? `<option value="Ägare">${t("roles").Ägare}</option>` : ""}
    `;
    select.value = role;
    select.disabled = user.email === OWNER_EMAIL;
    select.addEventListener("change", () => setUserRole(user.email, select.value));
    list.append(row);
  });
}

function getKnownUsers() {
  const users = new Map();
  Object.values(state.users || {}).forEach((user) => {
    if (user && user.email) users.set(normalizeEmail(user.email), user);
  });
  Object.keys(state.members || {}).forEach((email) => {
    const normalized = normalizeEmail(email);
    users.set(normalized, {
      ...(users.get(normalized) || {}),
      email: normalized,
      firstSeen: state.members[email].createdAt
    });
  });
  state.admins.forEach((email) => {
    const normalized = normalizeEmail(email);
    users.set(normalized, {
      ...(users.get(normalized) || {}),
      email: normalized
    });
  });
  users.set(OWNER_EMAIL, {
    ...(users.get(OWNER_EMAIL) || {}),
    email: OWNER_EMAIL
  });
  return [...users.values()].sort((a, b) => {
    const aLogged = a.isLoggedIn ? 1 : 0;
    const bLogged = b.isLoggedIn ? 1 : 0;
    if (aLogged !== bLogged) return bLogged - aLogged;
    return a.email.localeCompare(b.email);
  });
}

function setUserRole(email, role) {
  if (!canAccess("owner")) return;
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail === OWNER_EMAIL) return;

  if (role === "Admin") {
    state.admins = normalizeEmailList([...state.admins, normalizedEmail]);
    addLog(`${currentUser.email} gav ${normalizedEmail} rollen Admin.`);
  } else {
    state.admins = normalizeEmailList(state.admins.filter((adminEmail) => normalizeEmail(adminEmail) !== normalizedEmail));
    addLog(`${currentUser.email} gav ${normalizedEmail} rollen Medlem.`);
  }

  registerUser(normalizedEmail, { isLoggedIn: Boolean(state.users[normalizedEmail]?.isLoggedIn), broadcast: false });
  saveState();
  renderAll();
}

function removeAdmin(email) {
  if (!canAccess("owner")) return;
  state.admins = state.admins.filter((adminEmail) => adminEmail !== email);
  addLog(`${currentUser.email} tog bort ${email} som administratör.`);
  saveState();
  document.querySelector("#owner-message").textContent = t("adminRemoved");
  renderAll();
}

function navigate(id) {
  if (!canAccess(id)) {
    id = "hem";
  }

  Object.entries(views).forEach(([viewId, element]) => {
    element.classList.toggle("active", viewId === id);
  });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === id);
  });
}

function canAccess(id) {
  if (id === "game") return Boolean(currentUser);
  const item = navItems.find((navItem) => navItem.id === id);
  return Boolean(item && currentUser && item.roles.includes(currentUser.role));
}

function getAccessText() {
  if (currentUser.role === "Ägare") {
    return currentLanguage === "en"
      ? "You can see Home, Admin Console, Owner Channel, and Profile."
      : "Du kan se Hem, Adminkonsolen, Ägarkanalen och Profil.";
  }

  if (currentUser.role === "Admin") {
    return currentLanguage === "en"
      ? "You can see Home, Admin Console, and Profile."
      : "Du kan se Hem, Adminkonsolen och Profil.";
  }

  return currentLanguage === "en"
    ? "You can see Home and Profile."
    : "Du kan se Hem och Profil.";
}

function addLog(text) {
  state.logs.unshift({
    text,
    createdAt: new Date().toISOString()
  });
  state.logs = state.logs.slice(0, 60);
  saveState();
}

function formatDate(value) {
  return new Intl.DateTimeFormat(currentLanguage === "en" ? "en-US" : "sv-SE", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

applyLanguage();
restoreSession();
loadGithubUpdate();
