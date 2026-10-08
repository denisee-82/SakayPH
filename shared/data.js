const ROUTES = [
 "Acacia",
 "Alambre",
 "Bago Aplaya",
 "Bangkal",
 "Baracatan",
 "Binugao",
 "Buhangin",
 "Bunawan",
 "Cabantian",
 "Catalunan Grande",
 "Calinan",
 "Camp Catitipan",
 "Catitipan",
 "Communal",
 "Ecoland",
 "El Rio Vista",
 "Elinita Heights",
 "Emily Homes",
 "Guianga",
 "Inawayan",
 "Indangan",
 "Jade Valley",
 "Juliville Subd",
 "Landmark III",
 "Lasang",
 "Ma-a",
 "Magtuod",
 "Mandug",
 "Marahan",
 "Marilog",
 "Matina",
 "Mintal",
 "Mulig",
 "Obrero",
 "Panabo",
 "Panacan",
 "Puan",
 "Rosalina 3",
 "Sasa",
 "Sirib",
 "Tagakpan",
 "Talomo",
 "Tamugan",
 "Tibungco",
 "Tigatto",
 "Toril",
 "Tugbok",
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
 "Ma-a",
 "Jade Valley",
 "Acacia",
 "Toril",
 "Cabantian"
];

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