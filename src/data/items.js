// Rarity is a VISUAL/flavor axis, not a power axis — see the tier notes
// below. shuffleFour() draws uniformly at random from each category's full
// pool regardless of rarity, so a jackpot isn't rarer in the statistical
// sense (better odds aren't stacked against it) — it's rarer in the "there's
// only one, and it's the dream pull" sense. Concretely: rarity tiers were
// assigned to the *existing* items without changing any of their stats —
// several commons (Sledgehammer, Body Armor, Canned Rations, County Map)
// carry the highest raw stat in their category and no trait, so a
// common-only pick is never a trap. The 5 new jackpot items (one per
// category) have deliberately modest stats (2-3 points, spread across two
// stats) — at or below several existing rares — so the excitement is the
// glow/confetti/flavor, not a stat spike.
export const DRAFT = [
  { cat:'TOOLS', constraint:'One tool crosses the threshold with you. Roll for what fate hands over.', cards:[
    {id:'crowbar', name:'Steel Crowbar', desc:'Opens doors and ends arguments.', stats:{combat:2}, trait:'PryOpen', tlabel:'Pry Open', rarity:'rare'},
    {id:'axe', name:'Fire Axe', desc:'Slow to swing, but nothing stands after.', stats:{combat:3,survival:1}, trait:null, rarity:'common'},
    {id:'multi', name:'Multi-Tool', desc:'Fourteen tools folded in your palm.', stats:{wits:2}, trait:null, rarity:'ultra'},
    {id:'bolt', name:'Bolt Cutters', desc:'Chain, fence, padlock — all the same.', stats:{wits:1,combat:1}, trait:'PryOpen', tlabel:'Cut Locks', rarity:'rare'},
    {id:'sledge', name:'Sledgehammer', desc:'Nothing stays locked for long.', stats:{combat:4}, trait:null, rarity:'common'},
    {id:'screws', name:'Screwdriver Set', desc:'Slow, quiet, surprisingly versatile.', stats:{wits:1}, trait:null, rarity:'common'},
    {id:'skeleton_key', name:'The Skeleton Key', desc:'Every lock in the city was made for this, eventually.', stats:{combat:1,wits:2}, trait:'PryOpen', tlabel:'Pry Open', rarity:'jackpot'},
  ]},
  { cat:'MEDICAL', constraint:"Your body is the only shelter you can't replace.", cards:[
    {id:'firstaid', name:'First-Aid Kit', desc:'Gauze, sutures, iodine. Buys a morning.', stats:{health:3}, trait:'Heal', tlabel:'Treat Wounds', rarity:'rare'},
    {id:'antibio', name:'Antibiotics', desc:"A half bottle. Fever's worst enemy.", stats:{health:1}, trait:'Cure', tlabel:'Cure Infection', rarity:'rare'},
    {id:'adren', name:'Adrenaline Shot', desc:'One jolt. Turns fear into fuel.', stats:{combat:2}, trait:null, rarity:'common'},
    {id:'pain', name:'Painkillers', desc:'Dulls the edges so you keep moving.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'vitamin', name:'Vitamins', desc:'Not much, but it adds up.', stats:{survival:1,wits:1}, trait:null, rarity:'ultra'},
    {id:'morphine', name:'Morphine Vial', desc:'Numbs everything. Handle with care.', stats:{health:2}, trait:null, rarity:'common'},
    {id:'trauma_case', name:'Sealed Trauma Case', desc:'Still has the factory seal. Someone was saving this for a reason.', stats:{health:2,survival:1}, trait:'Heal', tlabel:'Treat Wounds', rarity:'jackpot'},
  ]},
  { cat:'SUSTENANCE', constraint:'Hunger is a slow roll you never stop making.', cards:[
    {id:'cans', name:'Canned Rations', desc:'Twelve dented tins, no labels.', stats:{survival:3}, trait:null, rarity:'common'},
    {id:'filter', name:'Water Filter', desc:'Makes staying alive routine.', stats:{survival:1}, trait:'Purify', tlabel:'Purify Water', rarity:'rare'},
    {id:'bars', name:'Energy Bars', desc:'Chalky, ancient, effective.', stats:{survival:1,wits:1}, trait:null, rarity:'ultra'},
    {id:'fish', name:'Fishing Kit', desc:'The lake keeps giving.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'rice', name:'Rice Sacks', desc:'Heavy, dull, and full of days.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'iodine', name:'Iodine Tablets', desc:'Turns anything wet into something safe.', stats:{survival:1}, trait:'Purify', tlabel:'Purify Water', rarity:'rare'},
    {id:'mre_crate', name:'Unopened MRE Crate', desc:'Government stamped, decade sealed, still good. Somehow.', stats:{survival:2,health:1}, trait:'Purify', tlabel:'Purify Water', rarity:'jackpot'},
  ]},
  { cat:'DEFENSE', constraint:'Some doors you only get to open once.', cards:[
    {id:'pistol', name:'Handgun · 6 Rounds', desc:'Loud, final, out of ammo too soon.', stats:{combat:4}, trait:'Ranged', tlabel:'Ranged', rarity:'rare'},
    {id:'machete', name:'Machete', desc:'Silent, tireless, always loaded.', stats:{combat:3}, trait:null, rarity:'common'},
    {id:'armor', name:'Body Armor', desc:"What doesn't get through can't kill you.", stats:{health:4}, trait:null, rarity:'common'},
    {id:'dog', name:'Stray Dog', desc:'Hears what you cannot.', stats:{combat:2}, trait:'Scout', tlabel:'Early Warning', rarity:'rare'},
    {id:'crossbow', name:'Crossbow', desc:'Silent range. Slow to reload.', stats:{combat:3}, trait:'Ranged', tlabel:'Ranged', rarity:'ultra'},
    {id:'shield', name:'Riot Shield', desc:'What hits you, hits it instead.', stats:{combat:1,health:2}, trait:null, rarity:'common'},
    {id:'hawk', name:"The Hawk That Won't Leave", desc:'It circled twice, then landed on your shoulder and stayed.', stats:{combat:1,wits:2}, trait:'Scout', tlabel:'Early Warning', rarity:'jackpot'},
  ]},
  { cat:'THE LAST SLOT', constraint:'One more thing. Make it count.', cards:[
    {id:'radio', name:'Two-Way Radio', desc:'Someone out there is still broadcasting.', stats:{wits:1}, trait:'Signal', tlabel:'Call Rescue', rarity:'common'},
    {id:'map', name:'County Map', desc:"Every road, marked in a dead man's hand.", stats:{wits:3}, trait:'Navigate', tlabel:'Navigate', rarity:'common'},
    {id:'zippo', name:'Lucky Zippo', desc:'Warmth, signal, small mercy.', stats:{survival:1}, trait:'Fire', tlabel:'Make Fire', rarity:'common'},
    {id:'binocs', name:'Binoculars', desc:'See the danger before it sees you.', stats:{wits:2}, trait:'Scout', tlabel:'Scout Ahead', rarity:'ultra'},
    {id:'compass', name:'Compass', desc:'Never wrong about which way is out.', stats:{wits:2}, trait:'Navigate', tlabel:'Navigate', rarity:'rare'},
    {id:'walkie', name:'Walkie Set', desc:'Short range, but somebody might be close.', stats:{wits:1}, trait:'Signal', tlabel:'Call Rescue', rarity:'rare'},
    {id:'sat_phone', name:'The Last Working Satellite Phone', desc:'One bar. One call. Somebody, somewhere, is still listening.', stats:{wits:1,survival:1}, trait:'Signal', tlabel:'Call Rescue', rarity:'jackpot'},
  ]},
];
