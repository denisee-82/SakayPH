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
    "Wa-an",
    "Route 9",
    "Buhangin via Dacudao",
    "Catitipan via Dacudao",
    "Callawa",
    "Country Homes",
    "Deca Tacunan",
    "Doña Pilar",
    "Indangan - NCCC Panacan",
    "Jade Valley - Milan",
    "Calinan - Roxas Avenue",
    "Toril - Roxas Avenue",
    "Toril - Astorga/Darong",
    "Ulas - Panacan",
    "Panabo via Sasa",
    "Mahayag via Cabantian",
    "Malabog"
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

/* ==========================================================
 * ROUTE PATHS
 *
 * Each route is the ordered list of places the jeepney passes,
 * as ONE FULL LOOP (out to the city, then back). The last place
 * connects back to the first. Order matters: a route only takes
 * you from A to B if it actually passes A and later reaches B.
 *
 * Source: community route guide (davaojeep101.blogspot.com, June
 * 2024, says it follows LTFRB Region 11) cross-checked with the
 * OpenStreetMap wiki for Routes 1-5. UNOFFICIAL and about two
 * years old - verify with CTTMO / LTFRB Region XI before launch.
 * These are road/landmark level, not designated stops.
 *
 * Where ROUTES has a plain name that has several real variants,
 * the plain name is the first one listed in the guide:
 *   "Toril"       = Toril - Bankerohan
 *   "Calinan"     = Calinan - Bankerohan
 *   "Jade Valley" = Jade Valley - Bankerohan
 *   "Ulas"        = Ulas - R. Magsaysay
 *   "Panabo"      = Panabo via Buhangin
 * and the other variants have their own names (e.g. "Toril -
 * Roxas Avenue"). Routes in ROUTES with no path yet are listed
 * in the console and never come up in a search.
 * ========================================================== */

const rev = a => [...a].reverse();

// outer = from the route's far end into the city, core = the downtown
// part, back = the way home (default: the outer part reversed)
const loop = (outer, core, back = rev(outer.slice(1))) =>
    [...outer, ...core, ...back];

// shared pieces
const BAJ = ["Abreeza Mall", "Victoria Plaza", "GMall Bajada"];      // JP Laurel / Bajada, toward downtown
const TRUNK = ["Milan", "Buhangin Road", ...BAJ];                    // Milan -> Bajada
const CIT = ["Gaisano Citygate"];

const DT_P = ["Acacia (downtown)", "Ponciano", "Claveria", "Acacia (downtown)"];
const DT_B = ["Acacia (downtown)", "Ponciano", "San Pedro Street", "Bankerohan",
    "Magallanes", "San Pedro Church", "Claveria", "Acacia (downtown)"];
const JV_CORE = ["E. Quirino Avenue", "Davao Doctors Hospital", "Bankerohan",
    "Magallanes", "San Pedro Church", "Claveria", "Acacia (downtown)"];

// north corridor (Tibungco / Bunawan / Lasang / Panabo) via Buhangin
const N_OUT = ["Tibungco", "Ilang", "Panacan", "Panacan Relocation", "Landmark 3",
    "Davao International Airport", "Catitipan", "NHA Buhangin", "Milan",
    "Buhangin Road", "Dacudao Avenue"];
const BAJ_OUT = ["GMall Bajada", "Victoria Plaza", "Abreeza Mall", "Dacudao Flyover"];
const OBR_CORE = ["Obrero", "Sta. Ana Avenue", "Holy Cross of Davao College",
    "Roxas Avenue", "Claveria", "Acacia (downtown)", ...BAJ_OUT];
const TIB_CORE = ["Agdao Public Market", "Sta. Ana Avenue", "Magsaysay Park",
    "Quezon Boulevard", "Roxas Avenue", "Claveria", "Acacia (downtown)", ...BAJ_OUT];
const north = (prefix, core) => {
    const o = [...prefix, ...N_OUT];
    return loop(o, core, rev(o.slice(1, -1)));
};

// Dacudao Avenue loop
const DAC = ["Milan", "Buhangin Road", "Dacudao Avenue", "Cabaguio Avenue",
    "Agdao Flyover", "Magsaysay Park", "NCCC Uyanguren", "Sta. Ana Avenue",
    "Agdao Public Market", "Cabaguio Avenue", "Dacudao Avenue", "Dacudao Flyover",
    "Buhangin Road", "Milan"];

// Sasa / JP Laurel side
const BAJ_R = rev(BAJ);   // GMall, Victoria, Abreeza (leaving downtown)
const SC_CAB = ["Lanang", "Azuela Cove", "Damosa", "SM Lanang", "SPMC",
    "Cabaguio Avenue", "Agdao Flyover", "Magsaysay Park", "NCCC Uyanguren",
    "Roxas Avenue", "Claveria", "Acacia (downtown)", ...BAJ_R,
    "SPMC", "SM Lanang", "Damosa", "Lanang"];
const SC_RC = ["Lanang", "Azuela Cove", "R. Castillo", "Agdao Flyover",
    "Magsaysay Park", "NCCC Uyanguren", "Roxas Avenue", "Claveria",
    "Acacia (downtown)", ...BAJ_R, "SPMC", "SM Lanang", "Damosa", "Lanang"];

// south side (Toril / Ulas / Matina Crossing -> city)
const SOUTH_OUT = ["Dumoy", "Iwha", "Bago", "Puan", "Ulas", "Bangkal", "Matina Crossing"];
const TORIL_RA_CORE = ["Matina", "Bankerohan", "E. Quirino Avenue",
    "Davao Doctors Hospital", "Gaisano Ilustre", "People's Park", "Ponciano",
    "Claveria", "Roxas Avenue", "Quezon Boulevard", "Felcris Centrale",
    "Bolton Bridge", "SM Ecoland"];
const CAL_RA_CORE = ["SM Ecoland", "Ecoland Subdivision", "Bolton Bridge",
    "Felcris Centrale", "Quezon Boulevard", "Roxas Avenue", "Ponciano",
    "E. Quirino Avenue", "Bankerohan", "Matina"];
const MAG_CORE = ["SM Ecoland", "Ecoland Terminal", "Bolton Bridge", "Felcris Centrale",
    "San Pedro Street", "Claveria", "Acacia (downtown)", "NCCC Uyanguren",
    "Magsaysay Park", "NCCC Uyanguren", "Acacia (downtown)", "Ponciano",
    "San Pedro Street", "Bankerohan", "Matina"];

const ROUTE5_CURRENT = ["Bankerohan", "Magallanes", "Quezon Boulevard", "Magsaysay Park",
    "Agdao Public Market", "Magsaysay Park", "Quezon Boulevard", "San Pedro Church",
    "San Pedro Street"];

const PATHS = {
    /* ---------- numbered routes ---------- */
    "Route 1": ["Marfori Heights", "Gaisano Ilustre", "Magallanes", "San Pedro Church",
        "Claveria", "Acacia (downtown)", "Quezon Boulevard", "Magsaysay Park",
        "NCCC Uyanguren", "Sta. Ana Avenue", "GMall Bajada",
        "Holy Cross of Davao College", "Acacia (downtown)", "Ponciano",
        "San Pedro Street", "Ilustre Street", "Davao Doctors Hospital"],
    "Route 2": ["Ecoland Subdivision", "Ecoland Terminal", "Felcris Centrale",
        "Quezon Boulevard", "Magsaysay Park", "NCCC Uyanguren", "Acacia (downtown)",
        "Ponciano", "San Pedro Church", "San Pedro Street", "Bankerohan",
        "Ecoland Terminal"],
    "Route 3": ["Marfori Heights", "Gaisano Ilustre", "Magallanes", "San Pedro Church",
        "Claveria", "Acacia (downtown)", "Holy Cross of Davao College", "GMall Bajada",
        "Sta. Ana Avenue", "NCCC Uyanguren", "Magsaysay Park", "Quezon Boulevard",
        "Acacia (downtown)", "Ponciano", "San Pedro Street", "Ilustre Street",
        "Davao Doctors Hospital"],
    "Route 4": ["San Pedro Church", "Claveria", "Acacia (downtown)", ...BAJ_R, "SPMC",
        "Cabaguio Avenue", "Agdao Flyover", "Magsaysay Park", "Quezon Boulevard"],
    "Route 5": ["Bankerohan", "Magallanes", "San Pedro Church", "Claveria",
        "Acacia (downtown)", "Holy Cross of Davao College", "GMall Bajada",
        "Sta. Ana Avenue", "Agdao Public Market", "Agdao Flyover", "Magsaysay Park",
        "Quezon Boulevard", "San Pedro Church", "San Pedro Street"],
    "Route 5B": ROUTE5_CURRENT,
    "Route 6": ["Agdao Public Market", "Magsaysay Park", "NCCC Uyanguren",
        "Acacia (downtown)", "Ponciano", "San Pedro Church", "San Pedro Street",
        "Bankerohan", "Magallanes", "Quezon Boulevard", "Magsaysay Park"],
    "Route 7": ROUTE5_CURRENT,
    "Route 8": ["Davao City National High School", "Ponciano", "San Pedro Street",
        "Ilustre Street", "Gaisano Ilustre", "Davao Doctors Hospital",
        "E. Quirino Avenue"],
    "Route 9": ROUTE5_CURRENT,
    "Route 10": ["Bankerohan", "Magallanes", "San Pedro Church", "Claveria",
        "Acacia (downtown)", "NCCC Uyanguren", "Magsaysay Park", "Agdao Flyover",
        "Cabaguio Avenue", "SPMC", ...BAJ, "Acacia (downtown)", "Ponciano",
        "San Pedro Church", "San Pedro Street"],
    "Route 11": ["Agdao Public Market", "Agdao Flyover", "Magsaysay Park",
        "Quezon Boulevard", "San Pedro Church", "San Pedro Street", "Bankerohan",
        "Brokenshire Hospital", "Davao City National High School"],
    "Route 12": ["Ecoland Subdivision", "Ecoland Terminal", "Bankerohan", "Magallanes",
        "San Pedro Church", "Claveria", "Acacia (downtown)", "NCCC Uyanguren",
        "Magsaysay Park", "Quezon Boulevard", "Felcris Centrale", "Bolton Bridge",
        "Ecoland Terminal"],
    "Route 13": ["Marfori Heights", "Gaisano Ilustre", "Magallanes", "San Pedro Church",
        "Claveria", "Acacia (downtown)", "Quezon Boulevard", "Magsaysay Park",
        "NCCC Uyanguren", "Sta. Ana Avenue", "GMall Bajada",
        "Holy Cross of Davao College", "Acacia (downtown)", "Ponciano",
        "San Pedro Street", "Ilustre Street", "Davao Doctors Hospital"],

    /* ---------- Buhangin / Cabantian / Tigatto ---------- */
    "Acacia via Buhangin": loop(["Acacia/Molave", "Indangan", "Cabantian",
        "Cabantian-Indangan Road", ...CIT, ...TRUNK], DT_P),
    "Cabantian": loop(["Cabantian", "Cabantian-Indangan Road", ...CIT, ...TRUNK], DT_P),
    "Indangan via Buhangin": loop(["Indangan", "Cabantian", "Cabantian-Indangan Road",
        ...CIT, ...TRUNK], DT_P),
    "Mahayag via Cabantian": loop(["Mahayag", "Acacia/Molave", "Indangan", "Cabantian",
        "Cabantian-Indangan Road", ...CIT, ...TRUNK], DT_P),
    "Emily Homes": loop(["Emily Homes", "Deca Homes", "Cabantian-Indangan Road",
        ...CIT, ...TRUNK], DT_P),
    "Country Homes": loop(["Country Homes", "Cabantian", "Cabantian Road", ...TRUNK], DT_P),
    "Communal": loop(["Communal", "Country Homes", "Cabantian Road", ...TRUNK], DT_B),
    "Callawa": loop(["Callawa", "Mandug", "Tigatto", "Tigatto Road", "NCCC Buhangin",
        ...CIT, ...TRUNK], DT_P),
    "Mandug": loop(["Mandug", "Tigatto", "Tigatto Road", "NCCC Buhangin", ...CIT,
        ...TRUNK], DT_P),
    "Tigatto": loop(["Tigatto", "Tigatto Road", "NCCC Buhangin", ...CIT, ...TRUNK], DT_P),
    "Juliville Subd": loop(["Juliville Subd", "Tigatto", "Tigatto Road", "NCCC Buhangin",
        ...CIT, ...TRUNK], DT_P),
    "Jade Valley": loop(["Jade Valley", "Diversion Road", "C.P. Garcia Highway",
        ...TRUNK], JV_CORE),
    "Jade Valley - Milan": ["Jade Valley", "Diversion Road", "Milan", "Gaisano Citygate",
        "NCCC Buhangin", "Diversion Road"],
    "Buhangin via JP Laurel": loop(["NHA Buhangin", "C.P. Garcia Highway", ...TRUNK],
        JV_CORE),
    "Buhangin via Dacudao": ["NHA Buhangin", ...DAC],
    "Catitipan via Dacudao": ["Catitipan", "Davao International Airport", "NHA Buhangin",
        ...DAC, "NHA Buhangin"],
    "Catitipan via JP Laurel": loop(["Catitipan", "Davao International Airport",
        "NHA Buhangin", ...TRUNK], DT_P),
    "Landmark III": loop(["Landmark 3", "Panacan Relocation", "Catitipan",
        "Davao International Airport", "NHA Buhangin", ...TRUNK], DT_P),

    /* ---------- north: Tibungco / Bunawan / Lasang / Panabo ---------- */
    "Tibungco via Buhangin": north([], TIB_CORE),
    "Bunawan via Buhangin": north(["Bunawan"], OBR_CORE),
    "Lasang via Buhangin": north(["Lasang", "Bunawan"], OBR_CORE),
    "Panabo": north(["Panabo", "Lasang", "Bunawan"], OBR_CORE),
    "Malabog": north(["Malabog", "Panabo", "Lasang", "Bunawan"], OBR_CORE),
    "Panacan via Ilustre": loop(["Panacan", "Panacan Relocation", "Landmark 3",
            "Davao International Airport", "Catitipan", "NHA Buhangin", ...TRUNK],
        ["Acacia (downtown)", "Ponciano", "People's Park", "Gaisano Ilustre",
            "Ilustre Street", "E. Quirino Avenue"]),
    "Indangan - NCCC Panacan": loop(["Indangan", "Malagamot", "Panacan", "Sasa"],
        ["NCCC Panacan"]),

    /* ---------- north: Sasa / JP Laurel side ---------- */
    "Tibungco via Cabaguio": ["Tibungco", "Ilang", "Panacan", "Sasa", ...SC_CAB,
        "Sasa", "Panacan", "Ilang"],
    "Tibungco via R Castillo": ["Tibungco", "Ilang", "Panacan", "Sasa", ...SC_RC,
        "Sasa", "Panacan", "Ilang"],
    "Panacan via Cabaguio": ["Panacan", "Sasa", ...SC_CAB, "Sasa"],
    "Panacan via JP Laurel": ["Panacan", "Sasa", "Lanang", "Azuela Cove", "Damosa",
        "SM Lanang", "SPMC", ...BAJ, "Acacia (downtown)", "Ponciano", "Roxas Avenue",
        "NCCC Uyanguren", "Agdao Public Market", "Agdao Flyover", "Cabaguio Avenue",
        "SPMC", "SM Lanang", "Damosa", "Lanang", "Sasa"],
    "Panacan - SM": ["Panacan", "Sasa", "Lanang", "Azuela Cove", "Damosa", "SM Lanang",
        "SPMC", ...BAJ, "E. Quirino Avenue", "Davao Doctors Hospital", "Bankerohan",
        "SM Ecoland", "Bankerohan", "Davao Doctors Hospital", "E. Quirino Avenue",
        ...BAJ_R, "SPMC", "SM Lanang", "Damosa", "Lanang", "Sasa"],
    "Sasa via Cabaguio": ["Sasa", "Lanang", "Azuela Cove", "Damosa", "SM Lanang", "SPMC",
        "Cabaguio Avenue", "Agdao Flyover", "Magsaysay Park", "NCCC Uyanguren",
        "Acacia (downtown)", "Ponciano", "San Pedro Street", "Magallanes",
        "San Pedro Church", "Claveria", "Acacia (downtown)", ...BAJ_R, "SPMC",
        "SM Lanang", "Damosa", "Lanang"],
    "Sasa via JP Laurel": ["Sasa", "Lanang", "Azuela Cove", "Damosa", "SM Lanang", "SPMC",
        ...BAJ, "Acacia (downtown)", "Ponciano", "San Pedro Street", "Magallanes",
        "Quezon Boulevard", "Magsaysay Park", "R. Castillo", "Azuela Cove", "Lanang"],
    "Sasa via R Castillo": ["Sasa", "Lanang", "Azuela Cove", "R. Castillo", "Agdao Flyover",
        "Magsaysay Park", "Quezon Boulevard", "Claveria", "Acacia (downtown)", ...BAJ_R,
        "SPMC", "SM Lanang", "Damosa", "Lanang"],
    "Bunawan via Sasa": ["Bunawan", "Tibungco", "Ilang", "Panacan", "Sasa", "Lanang",
        "Azuela Cove", "R. Castillo", "Agdao Flyover", "Magsaysay Park",
        "Quezon Boulevard", "Roxas Avenue", "Claveria", "Acacia (downtown)", ...BAJ_R,
        "SPMC", "SM Lanang", "Damosa", "Azuela Cove", "Lanang", "Sasa", "Panacan",
        "Ilang", "Tibungco"],
    "Lasang via Sasa": ["Lasang", "Bunawan", "Tibungco", "Ilang", "Panacan", "Sasa",
        "Lanang", "Azuela Cove", "R. Castillo", "Agdao Flyover", "Magsaysay Park",
        "Quezon Boulevard", "Roxas Avenue", "Claveria", "Acacia (downtown)", ...BAJ_R,
        "SPMC", "SM Lanang", "Damosa", "Azuela Cove", "Lanang", "Sasa", "Panacan",
        "Ilang", "Tibungco", "Bunawan"],
    "Panabo via Sasa": ["Panabo", "Lasang", "Bunawan", "Tibungco", "Ilang", "Panacan",
        "Sasa", "Lanang", "Azuela Cove", "R. Castillo", "Agdao Flyover",
        "Magsaysay Park", "Quezon Boulevard", "Felcris Centrale", "Bolton Bridge",
        "Ecoland Terminal", "Bolton Bridge", "Felcris Centrale", "Quezon Boulevard",
        "Magsaysay Park", "Agdao Flyover", "R. Castillo", "Azuela Cove", "Lanang",
        "Sasa", "Panacan", "Ilang", "Tibungco", "Bunawan", "Lasang"],
    "Doña Pilar": ["Doña Pilar", "Lanang", "Damosa", "SM Lanang", "SPMC", ...BAJ,
        "E. Quirino Avenue", "Acacia (downtown)", "Roxas Avenue", "Quezon Boulevard",
        "Magsaysay Park", "Agdao Flyover", "Cabaguio Avenue", "SPMC", "SM Lanang",
        "Damosa", "Lanang"],

    /* ---------- south: Toril / Ulas / Matina ---------- */
    "Toril": loop(["Toril", ...SOUTH_OUT],
        ["SM Ecoland", "Ecoland Terminal", "Bolton Bridge", "Felcris Centrale",
            "San Pedro Street", "Claveria", "Roxas Avenue", "Ponciano",
            "Gaisano Ilustre", "E. Quirino Avenue", "Davao Doctors Hospital",
            "Bankerohan", "Matina"]),
    "Toril - Roxas Avenue": loop(["Toril", ...SOUTH_OUT], TORIL_RA_CORE),
    "Toril - Astorga/Darong": loop(["Toril", "Gaisano Grand Mall Toril", "Daliao",
            "Binugao", "Sirawan", "Inawayan", "Manambulan", "Sibulan", "Darong"],
        ["Astorga", "Sta. Cruz"]),
    "Rosalina 3": loop(["Rosalina 3", "Dumoy", "Bago", "Puan", "Ulas", "Bangkal",
        "Matina Crossing"], TORIL_RA_CORE),
    "Calinan": loop(["Calinan", "Tugbok", "Mintal", "Ulas", "Bangkal", "Matina Crossing"],
        ["Matina", "Bankerohan", "Magallanes", "San Pedro Church", "Claveria",
            "Roxas Avenue", "Ponciano", "E. Quirino Avenue", "Bankerohan", "Matina"]),
    "Calinan - Roxas Avenue": loop(["Calinan", "Tugbok", "Mintal", "Ulas", "Bangkal",
        "Matina Crossing"], CAL_RA_CORE),
    "Mintal": loop(["Mintal", "Catalunan Pequeno", "Ulas", "Bangkal", "Matina Crossing"],
        CAL_RA_CORE),
    "Tugbok via Roxas": loop(["Tugbok", "Los Amigos", "Mintal", "Ulas", "Bangkal",
        "Matina Crossing"], CAL_RA_CORE),
    "Deca Tacunan": loop(["Deca Tacunan", "Mintal", "Ulas", "Bangkal", "Matina Crossing"],
        CAL_RA_CORE),
    "Bago Aplaya": loop(["Bago Aplaya", "Puan", "Ulas", "Bangkal", "Matina Crossing"],
        ["SM Ecoland", "Ecoland Subdivision", "Bolton Bridge", "Quezon Boulevard",
            "Roxas Avenue", "Ponciano", "San Pedro Street", "Bankerohan", "Matina"]),
    "Talomo": loop(["Talomo", "Puan", "Ulas", "Bangkal", "Matina Crossing"],
        ["Matina", "Bankerohan", "Magallanes", "San Pedro Church", "Claveria",
            "Roxas Avenue", "Quezon Boulevard", "Felcris Centrale", "Bolton Bridge",
            "SM Ecoland"]),
    "Catalunan Grande": loop(["Catalunan Grande", "Bangkal", "Matina Crossing"],
        ["SM Ecoland", "Ecoland Subdivision", "Bolton Bridge", "Felcris Centrale",
            "San Pedro Street", "San Pedro Church", "Claveria", "Roxas Avenue",
            "Ponciano", "San Pedro Street", "Bankerohan", "Matina"]),
    "Bangkal": loop(["Bangkal", "Matina Crossing"], MAG_CORE),
    "Puan": loop(["Puan", "Ulas", "Bangkal", "Matina Crossing"], MAG_CORE),
    "Ulas": loop(["Ulas", "Bangkal", "Matina Crossing"],
        ["Matina", "Bankerohan", "E. Quirino Avenue", "Davao Doctors Hospital",
            "GMall Bajada", "Sta. Ana Avenue", "Magsaysay Park", "NCCC Uyanguren",
            "Acacia (downtown)", "Ponciano", "San Pedro Street", "Bankerohan", "Matina"]),
    "Ulas - Panacan": loop(["Ulas", "Bangkal", "Matina Crossing", "Matina", "NCCC Maa",
        "Maa", "Diversion Road", "NHA Buhangin", "Catitipan",
        "Davao International Airport", "Landmark 3", "Panacan Relocation"], ["Panacan"]),
    "Matina Crossing": ["Matina Crossing", "Matina", "Bankerohan", "Magallanes",
        "San Pedro Church", "Claveria", "Acacia (downtown)", "NCCC Uyanguren",
        "Agdao Public Market", "Sta. Ana Avenue", "Holy Cross of Davao College",
        "Acacia (downtown)", "Ponciano", "San Pedro Church", "San Pedro Street",
        "Bankerohan", "Matina"],
    "Matina Aplaya": ["Matina Aplaya", "Matina Crossing", "Matina", "Bankerohan",
        "Magallanes", "San Pedro Church", "Claveria", "Acacia (downtown)",
        "NCCC Uyanguren", "Magsaysay Park", "Agdao Public Market", "Magsaysay Park",
        "NCCC Uyanguren", "Acacia (downtown)", "Ponciano", "San Pedro Church",
        "San Pedro Street", "Bankerohan", "Matina", "Matina Crossing"],
    "Matina Pangi": ["Matina Pangi", "NCCC Centerpoint", "Matina Crossing", "Matina",
        "Bankerohan", "E. Quirino Avenue", "Davao Doctors Hospital", "GMall Bajada",
        "Sta. Ana Avenue", "NCCC Uyanguren", "Magsaysay Park", "Quezon Boulevard",
        "San Pedro Church", "San Pedro Street", "Bankerohan", "Matina",
        "NCCC Centerpoint"],
    "Ma-a Agdao": ["Maa", "NCCC Maa", "Matina", "Bankerohan", "Magallanes",
        "San Pedro Church", "Claveria", "Acacia (downtown)", "NCCC Uyanguren",
        "Magsaysay Park", "Agdao Flyover", "Cabaguio Avenue", "Dacudao Avenue",
        "Agdao Public Market", "Sta. Ana Avenue", "NCCC Uyanguren", "Acacia (downtown)",
        "Ponciano", "San Pedro Street", "Bankerohan", "Matina", "NCCC Maa"],
    "Ma-a Bankerohan": ["Maa", "NCCC Maa", "Matina", "Bankerohan", "Magallanes",
        "San Pedro Street", "Bankerohan", "Matina", "NCCC Maa"],

    /* ---------- city / local ---------- */
    "Ecoland - SM": ["SM Ecoland", "Ecoland Subdivision", "Ecoland Terminal", "Bankerohan",
        "Magallanes", "San Pedro Church", "Claveria", "Acacia (downtown)",
        "NCCC Uyanguren", "Magsaysay Park", "Quezon Boulevard", "Felcris Centrale",
        "Bolton Bridge", "Ecoland Terminal", "Ecoland Subdivision"],
    "El Rio Vista": ["El Rio Vista", "Bacaca", "Victoria Plaza", "GMall Bajada",
        "Acacia (downtown)", "Ponciano", "San Pedro Street", "Magallanes",
        "San Pedro Church", "Claveria", "Acacia (downtown)", "GMall Bajada",
        "Victoria Plaza", "Bacaca"],
    "Obrero": ["Obrero", "Victoria Plaza", "GMall Bajada", "E. Quirino Avenue",
        "Acacia (downtown)", "Quezon Boulevard", "San Pedro Church", "Claveria",
        "Acacia (downtown)", "GMall Bajada", "Victoria Plaza"]
};

// Places where a passenger can sensibly change jeepneys (busy
// junctions that several routes share). Transfers only happen here.
const TRANSFER_HUBS = [
    "Bankerohan", "San Pedro Church", "Claveria", "Roxas Avenue", "Magsaysay Park",
    "Ponciano", "Acacia (downtown)", "Matina Crossing", "Milan", "Agdao Public Market",
    "Ecoland Terminal", "SM Ecoland", "GMall Bajada", "SM Lanang", "Panacan",
    "Sta. Ana Avenue"
];

/* ---------- trip planner ---------- */

const POS = {};          // route -> place -> positions in its loop
const NODE_ROUTES = {};  // place -> routes that pass it

Object.entries(PATHS).forEach(([r, p]) => {
    POS[r] = {};
    p.forEach((n, i) => (POS[r][n] ||= []).push(i));
    new Set(p).forEach(n => (NODE_ROUTES[n] ||= []).push(r));
});

// how far along its loop route r goes from a to b (null if it doesn't)
function rideDist(r, a, b) {
    const pa = POS[r][a], pb = POS[r][b];

    if (!pa || !pb || a === b) return null;

    const n = PATHS[r].length;
    let best = Infinity;

    pa.forEach(i => pb.forEach(j => {
        best = Math.min(best, (j - i + n) % n);
    }));

    return best;
}

function bestRide(r, froms, tos) {
    let best = null;

    froms.forEach(a => tos.forEach(b => {
        const d = rideDist(r, a, b);

        if (d !== null && (!best || d < best.d)) {
            best = { route: r, from: a, to: b, d };
        }
    }));

    return best;
}

const routesAt = nodes =>
    [...new Set(nodes.flatMap(n => NODE_ROUTES[n] || []))];

/*
 * Plans from any of fromStops to any of toStops.
 * Direct rides first; only if there are none, one-transfer trips
 * (transfers happen at TRANSFER_HUBS). Each plan:
 *   { legs: [{ route, from, to, d }], score }
 */
function planTrip(fromStops, toStops) {
    const direct = routesAt(fromStops)
        .map(r => bestRide(r, fromStops, toStops))
        .filter(Boolean)
        .sort((a, b) => a.d - b.d);

    if (direct.length) {
        return direct.map(l => ({ legs: [l], score: l.d }));
    }

    const hubs = TRANSFER_HUBS.filter(
        h => !fromStops.includes(h) && !toStops.includes(h)
    );
    const best = {};

    routesAt(fromStops).forEach(r1 =>
        routesAt(toStops).forEach(r2 => {
            if (r1 === r2) return;

            hubs.forEach(h => {
                if (!POS[r1][h] || !POS[r2][h]) return;

                const l1 = bestRide(r1, fromStops, [h]);
                const l2 = bestRide(r2, [h], toStops);

                if (!l1 || !l2) return;

                const score = l1.d + l2.d;
                const k = r1 + "|" + r2;

                if (!best[k] || score < best[k].score) {
                    best[k] = { legs: [l1, l2], score };
                }
            });
        })
    );

    return Object.values(best)
        .sort((a, b) => a.score - b.score)
        .slice(0, 4);
}

/*
 * LANDMARKS: what commuters search for.
 *   name     shown in the search suggestions
 *   aliases  other things people type (not shown in suggestions)
 *   stops    the place names in PATHS this landmark is served at.
 *            A jeepney serves the landmark if its path passes one.
 *
 * Landmarks with no stops are searchable but have no jeepney yet -
 * fill them in once you confirm which routes pass them.
 */
const L = (name, aliases = [], stops = []) => ({ name, aliases, stops });

const LANDMARKS = [
    L("Abreeza Mall", [], ["Abreeza Mall"]),
    L("Acacia / Molave (Buhangin)", ["Acacia", "Molave"], ["Acacia/Molave"]),
    L("Agdao Public Market", ["Agdao"], ["Agdao Public Market"]),
    L("Ateneo de Davao University", ["Ateneo", "ADDU"]),
    L("Francisco Bangoy International Airport",
        ["Airport", "Davao International Airport", "Davao Airport"],
        ["Davao International Airport"]),

    L("Bankerohan Public Market", ["Bankerohan", "Bankerohan Market"], ["Bankerohan"]),
    L("Bangkal", [], ["Bangkal"]),
    L("Bago Aplaya", [], ["Bago Aplaya"]),
    L("Brokenshire Hospital", [], ["Brokenshire Hospital"]),
    L("Buhangin", [], ["Milan", "NHA Buhangin"]),
    L("Bunawan", [], ["Bunawan"]),
    L("Bolton"),

    L("Cabantian", [], ["Cabantian"]),
    L("Calinan", [], ["Calinan"]),
    L("Camp Catitipan", ["Catitipan"], ["Catitipan"]),
    L("Catalunan Grande", [], ["Catalunan Grande"]),
    L("Claveria", [], ["Claveria"]),
    L("Communal", [], ["Communal"]),
    L("Davao City Hall", ["City Hall", "Kadayawan Hall", "Kadayawan Hall / City Hall area"]),

    L("Davao City Overland Transport Terminal (Ecoland)",
        ["Overland Transport Terminal", "Ecoland Terminal", "Overland Terminal"],
        ["Ecoland Terminal"]),
    L("Davao Doctors Hospital", [], ["Davao Doctors Hospital"]),

    L("Ecoland Subdivision", ["Ecoland"], ["Ecoland Subdivision"]),
    L("El Rio Vista", [], ["El Rio Vista"]),
    L("Eden"),

    L("Felcris Centrale", [], ["Felcris Centrale"]),

    L("Gaisano Citygate", [], ["Gaisano Citygate"]),
    L("Gaisano Grand Tibungco", [], ["Tibungco"]),
    L("Gaisano Grand Toril", ["GMall Toril"], ["Gaisano Grand Mall Toril"]),
    L("Gaisano Ilustre", [], ["Gaisano Ilustre"]),
    L("Gaisano Mall of Davao", ["Gaisano Mall", "Gaisano Bajada", "GMall Bajada"],
        ["GMall Bajada"]),

    L("Holy Cross of Davao College", [], ["Holy Cross of Davao College"]),

    L("Ilustre Street", ["Ilustre"], ["Ilustre Street"]),
    L("Iglesia Ni Cristo", ["INC"]),
    L("Indangan", [], ["Indangan"]),
    L("Insular Village"),

    L("J.P. Laurel Avenue", ["JP Laurel", "JP Laurel Avenue"],
        ["Abreeza Mall", "Victoria Plaza", "GMall Bajada"]),
    L("Jade Valley", [], ["Jade Valley"]),
    L("Jollibee Puan", [], ["Puan"]),

    L("KFC Bajada"),

    L("Lanang", [], ["Lanang"]),
    L("Landmark 3", ["Landmark III"], ["Landmark 3"]),
    L("Lasang", [], ["Lasang"]),
    L("Lyceum of the Philippines University Davao", ["LPU"]),

    L("Ma-a", ["Maa"], ["Maa"]),
    L("Mandug", [], ["Mandug"]),
    L("Marfori Heights", [], ["Marfori Heights"]),
    L("Matina Crossing", [], ["Matina Crossing"]),
    L("Matina Town Square", [], ["Matina"]),
    L("Mintal", [], ["Mintal"]),
    L("Ramon Magsaysay Park", ["Magsaysay Park"], ["Magsaysay Park"]),

    L("NCCC Mall Buhangin", [], ["NCCC Buhangin"]),
    L("NCCC Mall Maa", ["NCCC Maa", "NCCC Mall Ma-a"], ["NCCC Maa"]),
    L("NCCC Uyanguren", [], ["NCCC Uyanguren"]),

    L("Obrero", [], ["Obrero"]),

    L("People's Park", [], ["People's Park"]),
    L("Puan", [], ["Puan"]),
    L("Panabo", [], ["Panabo"]),
    L("Panacan", [], ["Panacan"]),
    L("Philippine Women's College"),

    L("Quimpo Boulevard"),
    L("Quezon Boulevard", [], ["Quezon Boulevard"]),

    L("Roxas Avenue", [], ["Roxas Avenue"]),
    L("Roxas Night Market", [], ["Roxas Avenue"]),
    L("R. Castillo", ["R Castillo"], ["R. Castillo"]),

    L("SM City Davao", ["SM Ecoland", "SM Davao"], ["SM Ecoland"]),
    L("SM Lanang Premier", ["SM Lanang"], ["SM Lanang"]),
    L("San Pedro Cathedral", [], ["San Pedro Church"]),
    L("San Pedro Street", ["San Pedro St."], ["San Pedro Street"]),
    L("Sasa", [], ["Sasa"]),
    L("Sta. Ana", ["Santa Ana"], ["Sta. Ana Avenue"]),

    L("Toril", [], ["Toril"]),
    L("Tibungco", [], ["Tibungco"]),
    L("Tigatto", [], ["Tigatto"]),
    L("Talomo", [], ["Talomo"]),
    L("Tugbok", [], ["Tugbok"]),
    L("Times Beach"),

    L("Ulas", [], ["Ulas"]),
    L("University of Mindanao", ["UM"], ["Ponciano"]),
    L("USEP", [], ["Obrero"]),

    L("Victoria Plaza", ["Victoria Plaza Mall"], ["Victoria Plaza"]),

    L("Wa-an"),
    L("Waterfront Insular Hotel", ["Waterfront"]),

    L("Xavier Heights"),
    L("YMCA Davao")
];

// jeepney routes that serve a landmark
const landmarkRoutes = l => routesAt(l.stops);

/* ---------- data checks (console only) ---------- */

Object.keys(PATHS).forEach(r => {
    if (!ROUTES.includes(r)) console.warn("PATHS: unknown route", r);
});

LANDMARKS.forEach(l =>
    l.stops.forEach(s => {
        if (!NODE_ROUTES[s]) console.warn("LANDMARKS: no route passes", s, "in", l.name);
    })
);

TRANSFER_HUBS.forEach(h => {
    if (!NODE_ROUTES[h]) console.warn("TRANSFER_HUBS: no route passes", h);
});

console.info("Routes with no path yet:", ROUTES.filter(r => !PATHS[r]));
console.info(
    "Landmarks with no jeepney yet:",
    LANDMARKS.filter(l => !landmarkRoutes(l).length).map(l => l.name)
);

// per ride (a trip with a transfer pays this once per jeepney).
// TODO: confirm the current LTFRB/city fare.
const REGULAR_FARE = 14;
const STUDENT_FARE = 11.2;


const HIGH = 10;
const MODERATE = 5;



/*
 * Talks to the PHP files in /api (which talk to the MySQL database).
 * Pages in /commuter and /gov reach it at ../api/
 */
const API_BASE = "../api/";

async function api(file, body) {
    const opts = body
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }
        : {};

    const res = await fetch(API_BASE + file, {
        credentials: "same-origin",
        ...opts
    });

    let data = null;

    try {
        data = await res.json();
    } catch (e) { /* not JSON */ }

    if (!res.ok) {
        const err = new Error((data && data.error) || "Request failed");
        err.status = res.status;
        throw err;
    }

    return data;
}

const DB = {
    // record a search / boarding. Best effort: the page keeps working if it fails.
    log(type, route) {
        return api("log.php", { type, route }).catch(() => { });
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