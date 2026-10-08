const ROUTES=["Acacia","Alambre","Bago Aplaya","Bangkal","Baracatan","Binugao","Buhangin","Bunawan","Cabantian","Catalunan Grande","Calinan","Camp Catitipan","Catitipan","Communal","Ecoland","El Rio Vista","Elinita Heights","Emily Homes","Guianga","Inawayan","Indangan","Jade Valley","Juliville Subdivision","Landmark III","Lasang","Ma-a","Magtuod","Mandug","Marahan","Marilog","Matina","Mintal","Mulig","Obrero","Panabo","Panacan","Puan","Rosalina 3","Sasa","Sirib","Tagakpan","Talomo","Tamugan","Tibungco","Tigatto","Toril","Tugbok","Ulas","Wa-an"];
const ROADS=["Roxas Avenue","CM Recto","Claveria","San Pedro St.","Magallanes","JP Laurel","Cabaguio","Ramon Magsaysay","Quezon Boulevard","Elpidio Quirino","Ilustre"];
const PILOT=["Ma-a","Jade Valley","Acacia","Toril","Cabantian"];
const REGULAR_FARE=14,STUDENT_FARE=11.2;
const HIGH=10,MODERATE=5; // searches per 10 min -> raise for real deployment
const DB={
 get(k,d){try{return JSON.parse(localStorage.getItem('sakayph_'+k))??d}catch(e){return d}},
 set(k,v){localStorage.setItem('sakayph_'+k,JSON.stringify(v))},
 log(type,route){const l=this.get('events',[]);l.push({type,route,ts:Date.now()});this.set('events',l)}
};
function level(n){return n>=HIGH?'High':n>=MODERATE?'Moderate':'Low'}
