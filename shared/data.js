const ROUTES = [
    "Route 1",
    "Route 2",
    "Route 2A",
    "Route 3",
    "Route 4",
    "Route 5",
    "Route 5A",
    "Route 5B",
    "Route 6",
    "Route 7",
    "Route 8",
    "Route 10",
    "Route 10B",
    "Route 11",
    "Route 12",
    "Route 13",
    "Route 14",
    "Acacia via Buhangin",
    "Alambre",
    "Bago Aplaya",
    "Bangkal",
    "Baracatan",
    "Binugao",
    "Buhangin via JP Laurel",
    "Bunawan via Buhangin",
    "Bunawan via Sasa",
    "Cabantian",
    "Catalunan Grande",
    "Calinan",
    "Camp Catitipan",
    "Catitipan via JP Laurel",
    "Communal",
    "Ecoland - SM",
    "El Rio Vista",
    "Elinita Heights",
    "Emily Homes",
    "Guianga",
    "Inawayan (Toril)",
    "Indangan via Buhangin",
    "Jade Valley",
    "Juliville Subd",
    "Landmark III",
    "Lasang via Buhangin",
    "Lasang via Sasa",
    "Ma-a Agdao",
    "Ma-a Bankerohan",
    "Magtuod",
    "Mandug",
    "Marahan",
    "Marilog",
    "Matina",
    "Matina Aplaya",
    "Matina Crossing",
    "Matina Pangi",
    "Mintal",
    "Mulig",
    "Obrero",
    "Panabo",
    "Panacan - SM",
    "Panacan via Cabaguio",
    "Panacan via Ilustre",
    "Panacan via JP Laurel",
    "Puan",
    "Rosalina 3",
    "Sasa via Cabaguio",
    "Sasa via JP Laurel",
    "Sasa via R Castillo",
    "Sirib",
    "Tagakpan",
    "Talomo",
    "Tamugan",
    "Tibungco via Buhangin",
    "Tibungco via Cabaguio",
    "Tibungco via R Castillo",
    "Tigatto",
    "Toril",
    "Tugbok via Roxas",
    "Ulas",
    "Wa-an"
];

const ROADS = [
    "Roxas Avenue",
    "CM Recto",
    "Claveria",
    "San Pedro St.",
    "Magallanes",
    "JP Laurel",
    "Cabaguio",
    "Ramon Magsaysay",
    "Quezon Boulevard",
    "Maa",
    "Matina",
    "Sasa",
    "Buhangin",
    "Elpidio Quirino",
    "Ilustre"
];


const NUMBERED_ROUTES = [
    "Route 1",
    "Route 2",
    "Route 2A",
    "Route 3",
    "Route 4",
    "Route 5",
    "Route 5A",
    "Route 5B",
    "Route 6",
    "Route 7",
    "Route 8",
    "Route 10",
    "Route 10B",
    "Route 11",
    "Route 12",
    "Route 13",
    "Route 14"
];

const ROUTE_VARIANTS = [
    {
        name: "Tibungco via Cabaguio",
        destination: "Tibungco",
        via: ["Cabaguio"]
    },
    {
        name: "Tibungco via JP Laurel / Buhangin",
        destination: "Tibungco",
        via: ["JP Laurel", "Buhangin"]
    },
    {
        name: "Tibungco via R. Castillo",
        destination: "Tibungco",
        via: ["R. Castillo"]
    },
    {
        name: "Route 2 via Boulevard",
        route: "Route 2",
        via: ["Boulevard"]
    },
    {
        name: "Route 2 via G.E. Torres / Bankerohan",
        route: "Route 2",
        via: ["G.E. Torres", "Bankerohan"]
    }
];

const PILOT = [
    "Ma-a Agdao",
    "Jade Valley",
    "Acacia via Buhangin",
    "Toril",
    "Cabantian"
];

/* ---------- matching helpers (shared) ---------- */

const norm = s => s.toLowerCase().replace(/\s+/g, " ").trim();

// whole-word match so "route 10" does not also match "route 1"
function hasWord(text, name) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${esc}($|[^a-z0-9])`).test(text);
}

// typed text t (already normalised) fits a known name
function fits(t, name) {
    name = norm(name);
    // typed text starts a word in the name, or the name appears in the text
    return t.length >= 3 && ((" " + name).includes(" " + t) || hasWord(t, name));
}

/*
 * LANDMARKS: what commuters search for.
 *   name     shown in the search suggestions
 *   aliases  other things people type (not shown in suggestions)
 *   keys     a route is attached if its name contains one of these
 *            words, e.g. key "Toril" -> "Toril", "Inawayan (Toril)"
 *   routes   exact route names to attach (must exist in ROUTES)
 *
 * Landmarks with no keys/routes are searchable but have no jeepney
 * yet - fill them in as you confirm which routes pass them.
 */
const L = (name, aliases = [], keys = [], routes = []) =>
    ({ name, aliases, keys, routes });

const LANDMARKS = [
    L("Abreeza Mall"),
    L("Ateneo de Davao University", ["Ateneo", "ADDU"]),
    L("Francisco Bangoy International Airport",
        ["Airport", "Davao International Airport", "Davao Airport"]),

    L("Bankerohan Public Market", ["Bankerohan", "Bankerohan Market"], ["Bankerohan"]),
    L("Bangkal", [], ["Bangkal"]),
    L("Bago Aplaya", [], ["Bago Aplaya"]),
    L("Buhangin", [], ["Buhangin"]),
    L("Bolton"),

    L("Cabantian", [], ["Cabantian"]),
    L("Calinan", [], ["Calinan"]),
    L("Camp Catitipan", [], ["Camp Catitipan"]),
    L("Davao City Hall", ["City Hall", "Kadayawan Hall", "Kadayawan Hall / City Hall area"]),

    L("Davao City Overland Transport Terminal (Ecoland)",
        ["Overland Transport Terminal", "Ecoland Terminal", "Overland Terminal"],
        ["Ecoland"]),
    L("Davao Doctors Hospital"),

    L("Ecoland Subdivision", ["Ecoland"], ["Ecoland"]),
    L("El Rio Vista", [], ["El Rio Vista"]),
    L("Eden"),

    L("Felcris Centrale"),

    L("Gaisano Mall"),
    L("Gaisano Grand Tibungco", [], ["Tibungco"]),
    L("Gaisano Mall of Davao"),

    L("Holy Cross of Davao College"),

    L("Ilustre Street", ["Ilustre"], ["Ilustre"]),
    L("Iglesia Ni Cristo", ["INC"]),
    L("Insular Village"),

    L("J.P. Laurel Avenue", ["JP Laurel", "JP Laurel Avenue"], ["JP Laurel"]),
    L("Jade Valley", [], ["Jade Valley"]),
    L("Jollibee Puan", [], ["Puan"]),

    L("KFC Bajada"),

    L("Lanang"),
    L("Landmark 3", ["Landmark III"], ["Landmark III"]),
    L("Lasang", [], ["Lasang"]),
    L("Lyceum of the Philippines University Davao", ["LPU"]),

    L("Matina Crossing", [], ["Matina Crossing"]),
    L("Matina Town Square", [], ["Matina"]),
    L("Mintal", [], ["Mintal"]),
    L("Ramon Magsaysay Park", ["Magsaysay Park"]),

    L("NCCC Mall Buhangin", [], ["Buhangin"]),
    L("NCCC Mall Maa", ["NCCC Maa", "NCCC Mall Ma-a"], ["Ma-a"]),
    L("NCCC Uyanguren"),

    L("Obrero", [], ["Obrero"]),

    L("People's Park"),
    L("Puan", [], ["Puan"]),
    L("Panacan", [], ["Panacan"]),
    L("Philippine Women's College"),

    L("Quimpo Boulevard"),
    L("Quezon Boulevard"),

    L("Roxas Avenue", [], ["Roxas"]),
    L("Roxas Night Market", [], ["Roxas"]),
    L("R. Castillo", ["R Castillo"], ["R Castillo"]),

    L("SM City Davao", ["SM Ecoland", "SM Davao"], [], ["Ecoland - SM"]),
    L("SM Lanang Premier", ["SM Lanang"], [], ["Panacan - SM"]),
    L("San Pedro Cathedral"),
    L("San Pedro Street", ["San Pedro St."]),
    L("Sasa", [], ["Sasa"]),
    L("Sta. Ana", ["Santa Ana"]),

    L("Toril", [], ["Toril"]),
    L("Tibungco", [], ["Tibungco"]),
    L("Talomo", [], ["Talomo"]),
    L("Tugbok", [], ["Tugbok"]),
    L("Times Beach"),

    L("Ulas", [], ["Ulas"]),
    L("University of Mindanao", ["UM"]),
    L("USEP"),

    L("Victoria Plaza", ["Victoria Plaza Mall"]),

    L("Wa-an", [], ["Wa-an"]),
    L("Waterfront Insular Hotel", ["Waterfront"]),

    L("Xavier Heights"),
    L("YMCA Davao")
];

// jeepney routes that serve a landmark
function landmarkRoutes(l) {
    return [
        ...new Set([
            ...l.routes,
            ...ROUTES.filter(r =>
                l.keys.some(k => hasWord(norm(r), norm(k)))
            )
        ])
    ];
}

LANDMARKS.forEach(l =>
    l.routes.forEach(r => {
        if (!ROUTES.includes(r)) {
            console.warn("LANDMARKS: unknown route", r, "in", l.name);
        }
    })
);

console.info(
    "Landmarks with no jeepney yet:",
    LANDMARKS.filter(l => !landmarkRoutes(l).length).map(l => l.name)
);

const REGULAR_FARE = 14;
const STUDENT_FARE = 11.2;


const HIGH = 10;
const MODERATE = 5;



const DB = {
    get(k, d) {
        try {
            return (
                JSON.parse(
                    localStorage.getItem("sakayph_" + k)
                ) ?? d
            );
        } catch (e) {
            return d;
        }
    },

    set(k, v) {
        localStorage.setItem(
            "sakayph_" + k,
            JSON.stringify(v)
        );
    },

    log(type, route) {
        const events = this.get("events", []);

        events.push({
            type,
            route,
            ts: Date.now()
        });

        this.set("events", events);
    }
};


/*
 * Convert a demand count into a demand level.
 */
function level(n) {
    return n >= HIGH
        ? "High"
        : n >= MODERATE
            ? "Moderate"
            : "Low";
}