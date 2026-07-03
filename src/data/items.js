// Rarity is a VISUAL/flavor axis, not a power axis — see the tier notes
// below. shuffleFour() draws uniformly at random from each category's full
// pool regardless of rarity, so a jackpot isn't rarer in the statistical
// sense (better odds aren't stacked against it) — it's rarer in the "there's
// only one, and it's the dream pull" sense. Concretely: rarity tiers were
// assigned to the *existing* items without changing any of their stats —
// several commons (Sledgehammer, Body Armor, Canned Rations, County Map)
// carry the highest raw stat in their category and no trait, so a
// common-only pick is never a trap. The 5 jackpot items (one per category)
// have deliberately modest stats (2-3 points, spread across two stats) — at
// or below several existing rares — so the excitement is the
// glow/confetti/flavor, not a stat spike.
//
// Pool composition matters as much as the stats: each category originally
// shipped with only 3 commons against 4 non-common cards (2 rare + 1 ultra
// + 1 jackpot) in a 7-card pool. Drawing 4 of 7 uniformly at random means
// you need at least 4 commons available to ever see an all-common hand —
// with only 3, it was mathematically impossible to draw fewer than one
// rare-or-better card. Every single roll guaranteed a "rare" glow, which is
// the opposite of rare. Each category now carries 6 additional commons (9
// total against the same 4 non-common cards), so an all-common draw is a
// real (if uncommon) outcome and rare+ cards read as an actual event again
// instead of the default.
export const DRAFT = [
  { cat:'TOOLS', constraint:'One tool crosses the threshold with you. Roll for what fate hands over.', cards:[
    {id:'crowbar', name:'Steel Crowbar', desc:'Opens doors and ends arguments.', stats:{combat:2}, trait:'PryOpen', tlabel:'Pry Open', rarity:'rare'},
    {id:'axe', name:'Fire Axe', desc:'Slow to swing, but nothing stands after.', stats:{combat:3,survival:1}, trait:null, rarity:'common'},
    {id:'multi', name:'Multi-Tool', desc:'Fourteen tools folded in your palm.', stats:{wits:2}, trait:null, rarity:'ultra'},
    {id:'bolt', name:'Bolt Cutters', desc:'Chain, fence, padlock — all the same.', stats:{wits:1,combat:1}, trait:'PryOpen', tlabel:'Cut Locks', rarity:'rare'},
    {id:'sledge', name:'Sledgehammer', desc:'Nothing stays locked for long.', stats:{combat:4}, trait:null, rarity:'common'},
    {id:'screws', name:'Screwdriver Set', desc:'Slow, quiet, surprisingly versatile.', stats:{wits:1}, trait:null, rarity:'common'},
    {id:'wrench', name:'Adjustable Wrench', desc:'Fits every bolt that still matters.', stats:{combat:2}, trait:null, rarity:'common'},
    {id:'drill', name:'Hand Drill', desc:'No batteries. No excuses.', stats:{wits:2}, trait:null, rarity:'common'},
    {id:'hacksaw', name:'Hacksaw', desc:'Slow, but it never jams.', stats:{combat:2,wits:1}, trait:null, rarity:'common'},
    {id:'pickaxe', name:'Pickaxe', desc:'One tool, two very different jobs.', stats:{combat:4}, trait:null, rarity:'common'},
    {id:'utilityknife', name:'Utility Knife', desc:'Small blade. Big list of uses.', stats:{wits:1,survival:1}, trait:null, rarity:'common'},
    {id:'pliers', name:'Locking Pliers', desc:"Grips harder the more it's needed to.", stats:{combat:1,wits:1}, trait:null, rarity:'common'},
    {id:'skeleton_key', name:'The Skeleton Key', desc:'Every lock in the city was made for this, eventually.', stats:{combat:1,wits:2}, trait:'PryOpen', tlabel:'Pry Open', rarity:'jackpot'},
  ]},
  { cat:'MEDICAL', constraint:"Your body is the only shelter you can't replace.", cards:[
    {id:'firstaid', name:'First-Aid Kit', desc:'Gauze, sutures, iodine. Buys a morning.', stats:{health:3}, trait:'Heal', tlabel:'Treat Wounds', rarity:'rare'},
    {id:'antibio', name:'Antibiotics', desc:"A half bottle. Fever's worst enemy.", stats:{health:1}, trait:'Cure', tlabel:'Cure Infection', rarity:'rare'},
    {id:'adren', name:'Adrenaline Shot', desc:'One jolt. Turns fear into fuel.', stats:{combat:2}, trait:null, rarity:'common'},
    {id:'pain', name:'Painkillers', desc:'Dulls the edges so you keep moving.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'vitamin', name:'Vitamins', desc:'Not much, but it adds up.', stats:{survival:1,wits:1}, trait:null, rarity:'ultra'},
    {id:'morphine', name:'Morphine Vial', desc:'Numbs everything. Handle with care.', stats:{health:2}, trait:null, rarity:'common'},
    {id:'gauze', name:'Roll of Gauze', desc:'Not much, but it stops the bleeding.', stats:{health:1}, trait:null, rarity:'common'},
    {id:'aspirin', name:'Aspirin Bottle', desc:'Half-expired. Still works.', stats:{survival:1}, trait:null, rarity:'common'},
    {id:'iodinewipes', name:'Iodine Wipes', desc:'Clean enough. Good enough.', stats:{health:1,survival:1}, trait:null, rarity:'common'},
    {id:'splint', name:'Field Splint', desc:'Keeps a bad break from getting worse.', stats:{health:2}, trait:null, rarity:'common'},
    {id:'saline', name:'Saline Bag', desc:'Not glamorous. Keeps you upright.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'burncream', name:'Burn Cream', desc:'For the days that go wrong fast.', stats:{health:1,combat:1}, trait:null, rarity:'common'},
    {id:'trauma_case', name:'Sealed Trauma Case', desc:'Still has the factory seal. Someone was saving this for a reason.', stats:{health:2,survival:1}, trait:'Heal', tlabel:'Treat Wounds', rarity:'jackpot'},
  ]},
  { cat:'SUSTENANCE', constraint:'Hunger is a slow roll you never stop making.', cards:[
    {id:'cans', name:'Canned Rations', desc:'Twelve dented tins, no labels.', stats:{survival:3}, trait:null, rarity:'common'},
    {id:'filter', name:'Water Filter', desc:'Makes staying alive routine.', stats:{survival:1}, trait:'Purify', tlabel:'Purify Water', rarity:'rare'},
    {id:'bars', name:'Energy Bars', desc:'Chalky, ancient, effective.', stats:{survival:1,wits:1}, trait:null, rarity:'ultra'},
    {id:'fish', name:'Fishing Kit', desc:'The lake keeps giving.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'rice', name:'Rice Sacks', desc:'Heavy, dull, and full of days.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'iodine', name:'Iodine Tablets', desc:'Turns anything wet into something safe.', stats:{survival:1}, trait:'Purify', tlabel:'Purify Water', rarity:'rare'},
    {id:'crackers', name:'Sleeve of Crackers', desc:'Stale. Still counts as food.', stats:{survival:1}, trait:null, rarity:'common'},
    {id:'jerky', name:'Beef Jerky', desc:'Chews forever. Lasts longer.', stats:{survival:2}, trait:null, rarity:'common'},
    {id:'powderedmilk', name:'Powdered Milk', desc:"Add water you probably shouldn't trust.", stats:{survival:1,health:1}, trait:null, rarity:'common'},
    {id:'saltpacks', name:'Salt Packets', desc:"A whole drawer of them, from a diner that isn't there anymore.", stats:{wits:1}, trait:null, rarity:'common'},
    {id:'granola', name:'Granola Bars', desc:"Crushed, but the calories don't care.", stats:{survival:2}, trait:null, rarity:'common'},
    {id:'cannedfish', name:'Tin of Sardines', desc:'Oily, salty, exactly what the body wants.', stats:{survival:1,combat:1}, trait:null, rarity:'common'},
    {id:'mre_crate', name:'Unopened MRE Crate', desc:'Government stamped, decade sealed, still good. Somehow.', stats:{survival:2,health:1}, trait:'Purify', tlabel:'Purify Water', rarity:'jackpot'},
  ]},
  { cat:'DEFENSE', constraint:'Some doors you only get to open once.', cards:[
    {id:'pistol', name:'Handgun · 6 Rounds', desc:'Loud, final, out of ammo too soon.', stats:{combat:4}, trait:'Ranged', tlabel:'Ranged', rarity:'rare'},
    {id:'machete', name:'Machete', desc:'Silent, tireless, always loaded.', stats:{combat:3}, trait:null, rarity:'common'},
    {id:'armor', name:'Body Armor', desc:"What doesn't get through can't kill you.", stats:{health:4}, trait:null, rarity:'common'},
    {id:'dog', name:'Stray Dog', desc:'Hears what you cannot.', stats:{combat:2}, trait:'Scout', tlabel:'Early Warning', rarity:'rare'},
    {id:'crossbow', name:'Crossbow', desc:'Silent range. Slow to reload.', stats:{combat:3}, trait:'Ranged', tlabel:'Ranged', rarity:'ultra'},
    {id:'shield', name:'Riot Shield', desc:'What hits you, hits it instead.', stats:{combat:1,health:2}, trait:null, rarity:'common'},
    {id:'batoncommon', name:'Aluminum Baton', desc:'Extends with a flick. Convincing enough.', stats:{combat:2}, trait:null, rarity:'common'},
    {id:'kneepads', name:'Reinforced Knee Pads', desc:"For all the running you'll be doing.", stats:{health:1}, trait:null, rarity:'common'},
    {id:'brassknux', name:'Brass Knuckles', desc:"Ugly. Effective. Doesn't need reloading.", stats:{combat:2}, trait:null, rarity:'common'},
    {id:'leatherjacket', name:'Leather Jacket', desc:'Not bulletproof. Bite-resistant, mostly.', stats:{health:3}, trait:null, rarity:'common'},
    {id:'slingshot', name:'Slingshot', desc:'Quiet. Underestimated.', stats:{combat:1,wits:1}, trait:null, rarity:'common'},
    {id:'pepper', name:'Pepper Spray', desc:'One good spray buys you a head start.', stats:{combat:1,survival:1}, trait:null, rarity:'common'},
    {id:'hawk', name:"The Hawk That Won't Leave", desc:'It circled twice, then landed on your shoulder and stayed.', stats:{combat:1,wits:2}, trait:'Scout', tlabel:'Early Warning', rarity:'jackpot'},
  ]},
  { cat:'THE LAST SLOT', constraint:'One more thing. Make it count.', cards:[
    {id:'radio', name:'Two-Way Radio', desc:'Someone out there is still broadcasting.', stats:{wits:1}, trait:'Signal', tlabel:'Call Rescue', rarity:'common'},
    {id:'map', name:'County Map', desc:"Every road, marked in a dead man's hand.", stats:{wits:3}, trait:'Navigate', tlabel:'Navigate', rarity:'common'},
    {id:'zippo', name:'Lucky Zippo', desc:'Warmth, signal, small mercy.', stats:{survival:1}, trait:'Fire', tlabel:'Make Fire', rarity:'common'},
    {id:'binocs', name:'Binoculars', desc:'See the danger before it sees you.', stats:{wits:2}, trait:'Scout', tlabel:'Scout Ahead', rarity:'ultra'},
    {id:'compass', name:'Compass', desc:'Never wrong about which way is out.', stats:{wits:2}, trait:'Navigate', tlabel:'Navigate', rarity:'rare'},
    {id:'walkie', name:'Walkie Set', desc:'Short range, but somebody might be close.', stats:{wits:1}, trait:'Signal', tlabel:'Call Rescue', rarity:'rare'},
    {id:'notebook', name:'Waterproof Notebook', desc:"Everything you've learned, written down before you forget it.", stats:{wits:2}, trait:null, rarity:'common'},
    {id:'paracord', name:'Paracord Spool', desc:'A hundred uses, all of them small.', stats:{survival:1}, trait:null, rarity:'common'},
    {id:'photograph', name:'Photograph', desc:'Not useful. Carried anyway.', stats:{survival:1}, trait:null, rarity:'common'},
    {id:'batteries', name:'Spare Batteries', desc:'Half-charged. Might matter later.', stats:{wits:1}, trait:null, rarity:'common'},
    {id:'pocketknife', name:'Pocket Knife', desc:"Small enough to forget you're carrying it.", stats:{combat:1,wits:1}, trait:null, rarity:'common'},
    {id:'gloves', name:'Work Gloves', desc:'Whatever you touch next, touch it with these.', stats:{survival:1,combat:1}, trait:null, rarity:'common'},
    {id:'sat_phone', name:'The Last Working Satellite Phone', desc:'One bar. One call. Somebody, somewhere, is still listening.', stats:{wits:1,survival:1}, trait:'Signal', tlabel:'Call Rescue', rarity:'jackpot'},
  ]},
];
