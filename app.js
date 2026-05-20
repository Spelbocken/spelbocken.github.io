const OWNER_EMAIL = "patrik.ahlen05@gmail.com";
const STORAGE_KEY = "spel-state-v3";
const ADMIN_PASSWORD_HASH = "257878632a1acffaa80a54905df09608319866e34c63098f5dd960deedaa12bb";
const OWNER_PASSWORD_HASH = "9ed08ae94ed8cf876be0489086de7169f684cfbd3de1a3c136a4bae5aab20e5e";

const defaultState = {
  admins: ["admin@spel.se"],
  members: {},
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
  logs: []
};

let state = loadState();
let currentUser = null;

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
  },
  {
    id: "hunter",
    title: "theHunter: Call of the Wild",
    image: "assets/thehunter.svg",
    tag: "Kartor, djur och sök",
    text: "Sök på karta eller djur och se var djuren finns, class och level."
  }
];

const evidence = [
  { name: "EMF 5", text: "EMF-läsaren går upp till nivå 5 när spöket lämnar stark paranormal aktivitet." },
  { name: "Orb", text: "Ghost Orbs syns som små ljusprickar i videokamera, oftast i spökets favoritrum." },
  { name: "Spirit Box", text: "Spöket kan svara med röst när du använder Spirit Box och ställer frågor." },
  { name: "Freezing", text: "Temperaturen sjunker till frysgrader. Synlig andedräkt kan hjälpa, men termometern är säkrast." },
  { name: "Ultraviolet", text: "Fingeravtryck, handavtryck eller fotspår kan synas med UV-lampa eller glowstick." },
  { name: "Writing", text: "Spöket kan skriva i Ghost Writing Book när boken ligger i rätt område." },
  { name: "D.O.T.S", text: "D.O.T.S-projektorn kan visa spökets siluett när det passerar igenom ljuset." }
];

const ghosts = [
  ["Spirit", "EMF 5, Spirit Box, Writing", "En klassisk spöktyp utan specialbevis, men kan stoppas länge med smudge."],
  ["Wraith", "EMF 5, Spirit Box, D.O.T.S", "Kan teleportera till spelare och lämnar normalt inga UV-fotspår i salt."],
  ["Phantom", "Spirit Box, Ultraviolet, D.O.T.S", "Försvinner från foto och gör spelare mer stressade när man tittar på det."],
  ["Poltergeist", "Spirit Box, Ultraviolet, Writing", "Kastar ofta föremål och kan skapa mycket rörelse i ett rum med många saker."],
  ["Banshee", "Orb, Ultraviolet, D.O.T.S", "Fokuserar ofta på en spelare och kan göra speciella skrik i parabolic microphone."],
  ["Jinn", "EMF 5, Ultraviolet, Freezing", "Blir snabbare när strömmen är på och spelaren är långt bort."],
  ["Mare", "Spirit Box, Orb, Writing", "Trivs i mörker och kan oftare släcka lampor."],
  ["Revenant", "Orb, Freezing, Writing", "Väldigt snabb när den jagar och ser en spelare, men långsam när den inte vet var du är."],
  ["Shade", "EMF 5, Freezing, Writing", "Blyg spöktyp som ofta gör mindre aktivitet när flera spelare är nära."],
  ["Demon", "Ultraviolet, Freezing, Writing", "Kan jaga tidigt och ofta. Crucifix är extra viktigt."],
  ["Yurei", "Orb, Freezing, D.O.T.S", "Kan påverka sanity hårt och stänga dörrar på ett tydligt sätt."],
  ["Oni", "EMF 5, Freezing, D.O.T.S", "Aktiv och syns ofta tydligt under jakt, men gör inte ghost airball-event."],
  ["Yokai", "Spirit Box, Orb, D.O.T.S", "Reagerar mer på prat nära sig och hör sämre under jakt."],
  ["Hantu", "Orb, Ultraviolet, Freezing", "Snabbare i kalla rum och långsammare i varma rum."],
  ["Goryo", "EMF 5, Ultraviolet, D.O.T.S", "D.O.T.S syns bara via kamera när ingen är i rummet."],
  ["Myling", "EMF 5, Ultraviolet, Writing", "Tystare steg under jakt, men hörs tydligt i parabolic microphone."],
  ["Onryo", "Spirit Box, Orb, Freezing", "Ljus kan fungera som skydd, men släckta lågor kan också trigga jakt."],
  ["The Twins", "EMF 5, Spirit Box, Freezing", "Kan göra aktivitet på två olika platser och jaga med olika hastighet."],
  ["Raiju", "EMF 5, Orb, D.O.T.S", "Blir snabbare nära elektronisk utrustning."],
  ["Obake", "EMF 5, Ultraviolet, Orb", "Kan lämna ovanliga UV-avtryck och byta form snabbt under jakt."],
  ["The Mimic", "Spirit Box, Ultraviolet, Freezing + falsk Orb", "Härmar andra spöken och visar alltid Ghost Orb som extra falskt bevis."],
  ["Moroi", "Spirit Box, Writing, Freezing", "Blir snabbare när sanity är låg och kan förbanna spelare via ljud/bevis."],
  ["Deogen", "Spirit Box, Writing, D.O.T.S", "Vet alltid var spelare är under jakt, men blir mycket långsam nära sitt mål."],
  ["Thaye", "Orb, Writing, D.O.T.S", "Är farlig tidigt men åldras och blir långsammare över tid."]
].map(([name, proof, info]) => ({ name, proof, info }));

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
    error.textContent = "Skriv en giltig mejladress.";
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

  addLog(`${currentUser.email} loggade in som ${currentUser.role}.`);
  error.textContent = "";
  emailInput.value = "";
  passwordInput.value = "";
  showApp();
});

document.querySelector("#logout-button").addEventListener("click", () => {
  if (currentUser) {
    addLog(`${currentUser.email} loggade ut.`);
  }
  currentUser = null;
  document.querySelector("#app-shell").classList.add("hidden");
  document.querySelector("#login-screen").classList.remove("hidden");
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
  message.textContent = "Saken är tillagd.";
  renderAll();
});

document.querySelector("#add-admin-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!canAccess("owner")) return;

  const input = document.querySelector("#admin-email");
  const message = document.querySelector("#owner-message");
  const email = normalizeEmail(input.value);

  if (!email || !email.includes("@")) {
    message.textContent = "Skriv en giltig mejladress.";
    return;
  }

  if (email === OWNER_EMAIL) {
    message.textContent = "Ägaren behöver inte läggas till som admin.";
    return;
  }

  if (state.admins.includes(email)) {
    message.textContent = "Den mejlen är redan administratör.";
    return;
  }

  state.admins.push(email);
  addLog(`${currentUser.email} lade till ${email} som administratör.`);
  saveState();
  input.value = "";
  message.textContent = "Administratören är tillagd.";
  renderAll();
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(saved);
    return { ...structuredClone(defaultState), ...parsed, members: parsed.members || {} };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getRoleForEmail(email) {
  if (email === OWNER_EMAIL) return "Ägare";
  if (state.admins.includes(email)) return "Admin";
  return "Medlem";
}

async function validateLogin(email, role, password) {
  if (!password) {
    return { ok: false, message: "Skriv ett lösenord." };
  }

  const passwordHash = await hashPassword(password);

  if (role === "Ägare") {
    return passwordHash === OWNER_PASSWORD_HASH
      ? { ok: true }
      : { ok: false, message: "Fel lösenord för ägare." };
  }

  if (role === "Admin") {
    return passwordHash === ADMIN_PASSWORD_HASH
      ? { ok: true }
      : { ok: false, message: "Fel lösenord för admin." };
  }

  if (!state.members[email]) {
    if (password.length < 4) {
      return { ok: false, message: "Välj minst 4 tecken som medlemslösenord." };
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
    : { ok: false, message: "Fel medlemslösenord." };
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
      link.textContent = item.label;
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
  count.textContent = `${games.length} spel`;
  accessText.textContent = "Välj ett spelkort på Hem för att öppna guide, codex eller sök.";

  games.forEach((game) => {
    const row = document.createElement("li");
    row.className = "item-card game-card";
    row.innerHTML = `
      <img class="game-cover" src="" alt="" loading="lazy" />
      <h3></h3>
      <p></p>
      <div class="item-meta"></div>
      <button type="button">Öppna</button>
    `;
    row.querySelector("img").src = game.image;
    row.querySelector("img").alt = `${game.title} bild`;
    row.querySelector("h3").textContent = game.title;
    row.querySelector("p").textContent = game.text;
    row.querySelector(".item-meta").textContent = game.tag;
    row.querySelector("button").addEventListener("click", () => showGame(game.id));
    list.append(row);
  });

  ensureGameView();
}

function ensureGameView() {
  let view = document.querySelector("#view-game");
  if (!view) {
    view = document.createElement("section");
    view.id = "view-game";
    view.className = "view";
    view.setAttribute("aria-labelledby", "game-title");
    view.innerHTML = `
      <button id="back-to-games" class="ghost-button back-button" type="button">Tillbaka till Hem</button>
      <article id="game-detail" class="panel game-detail">
        <h2 id="game-title">Välj ett spel</h2>
        <p class="muted">Klicka på ett spelkort på Hem för att öppna mer information.</p>
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
    <div class="detail-heading">
      <div>
        <p class="eyebrow">Phasmophobia</p>
        <h2>Spöken och bevis</h2>
      </div>
      <span class="pill">${ghosts.length} spöken</span>
    </div>
    <div class="split-grid">
      <section>
        <h3>Alla spöken</h3>
        <div class="info-grid">
          ${ghosts.map((ghost) => `
            <article class="mini-card">
              <h4>${ghost.name}</h4>
              <p><strong>Bevis:</strong> ${ghost.proof}</p>
              <p>${ghost.info}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <section>
        <h3>Bevis</h3>
        <div class="info-grid evidence-grid">
          ${evidence.map((item) => `
            <article class="mini-card">
              <h4>${item.name}</h4>
              <p>${item.text}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
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
  document.querySelector("#profile-role").textContent = `Roll: ${currentUser.role}`;
  document.querySelector("#profile-avatar").textContent = currentUser.role.charAt(0);
}

function renderOwner() {
  if (!currentUser || currentUser.role !== "Ägare") return;

  const adminList = document.querySelector("#admin-list");
  const logList = document.querySelector("#activity-log");
  adminList.innerHTML = "";
  logList.innerHTML = "";
  document.querySelector("#admin-count").textContent = `${state.admins.length} admin`;
  document.querySelector("#log-count").textContent = `${state.logs.length} loggar`;

  state.admins.forEach((email) => {
    const row = document.createElement("li");
    row.className = "admin-row";

    const emailText = document.createElement("strong");
    emailText.textContent = email;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger-button";
    removeButton.textContent = "Ta bort";
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

function removeAdmin(email) {
  if (!canAccess("owner")) return;
  state.admins = state.admins.filter((adminEmail) => adminEmail !== email);
  addLog(`${currentUser.email} tog bort ${email} som administratör.`);
  saveState();
  document.querySelector("#owner-message").textContent = "Administratören är borttagen.";
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
    return "Du kan se Hem, Adminkonsolen, Ägarkanalen och Profil.";
  }

  if (currentUser.role === "Admin") {
    return "Du kan se Hem, Adminkonsolen och Profil.";
  }

  return "Du kan se Hem och Profil.";
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
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
