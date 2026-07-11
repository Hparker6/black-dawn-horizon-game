export const ITEMS = {
  weapon: {
    melee: [
      { name: "Katana", desc: "One swing. Total silence.", stats: { combat: 9, stealth: 9, durability: 5 }, traits: ["Silent","Sharp","Melee","Precision"] },
      { name: "Fire Axe", desc: "Built for breaking through.", stats: { combat: 8, stealth: 2, durability: 9 }, traits: ["Heavy","Chop","Durable","Firefighter"] },
      { name: "Crowbar", desc: "Opens more than doors.", stats: { combat: 6, stealth: 5, durability: 9 }, traits: ["PryOpen","Durable","Metal","Utility"] },
      { name: "Aluminum Bat", desc: "Swing for the fences.", stats: { combat: 7, stealth: 4, durability: 7 }, traits: ["Blunt","Durable","Intimidating","Melee"] },
    ],
    ranged: [
      { name: "Hunting Rifle", desc: "Every shot must count.", stats: { combat: 9, stealth: 2, durability: 8 }, traits: ["Loud","Scoped","LongRange","Precision"] },
      { name: "Pump Shotgun", desc: "Loud solves many problems.", stats: { combat: 10, stealth: 0, durability: 7 }, traits: ["Loud","Heavy","Intimidating","CloseRange"] },
      { name: "Compound Bow", desc: "Quiet. Patient. Deadly.", stats: { combat: 7, stealth: 10, durability: 6 }, traits: ["Silent","LongRange","Precision","Reusable"] },
      { name: "Revolver", desc: "Six chances remain.", stats: { combat: 8, stealth: 3, durability: 8 }, traits: ["Loud","Reliable","Sidearm","Compact"] },
    ],
    improvised: [
      { name: "Shovel", desc: "Dig or defend.", stats: { combat: 6, stealth: 3, durability: 8 }, traits: ["Heavy","Utility","Blunt","Digging"] },
      { name: "Folding Chair", desc: "Surprisingly effective weapon.", stats: { combat: 5, stealth: 4, durability: 3 }, traits: ["Improvised","Funny","Fragile","Blunt"] },
      { name: "Hockey Stick", desc: "Slap shot, apocalypse edition.", stats: { combat: 5, stealth: 5, durability: 5 }, traits: ["Reach","Improvised","Lightweight","Blunt"] },
      { name: "Nail Bat", desc: "Splinters meet steel.", stats: { combat: 8, stealth: 2, durability: 4 }, traits: ["Brutal","Loud","Improvised","Bleed"] },
    ],
    military: [
      { name: "Assault Rifle", desc: "Standard issue survival.", stats: { combat: 9, stealth: 1, durability: 8 }, traits: ["Military","Loud","Automatic","Reliable"] },
      { name: "Combat Knife", desc: "Close. Fast. Quiet.", stats: { combat: 7, stealth: 9, durability: 7 }, traits: ["Silent","Sharp","Military","Compact"] },
      { name: "Riot Shield", desc: "Let them come.", stats: { combat: 4, stealth: 1, durability: 10 }, traits: ["Defensive","Heavy","Military","Protect"] },
      { name: "Grenade Launcher", desc: "Overkill has arrived.", stats: { combat: 10, stealth: 0, durability: 4 }, traits: ["Explosive","Military","Loud","Rare"] },
    ],
  },
  shelter: {
    urban: [
      { name: "Apartment", desc: "Home isn't home anymore.", stats: { defense: 6, resources: 7, stealth: 5 }, traits: ["Urban","MultiFloor","Loot","Repairable"] },
      { name: "Fire Station", desc: "Built for emergencies.", stats: { defense: 9, resources: 6, stealth: 2 }, traits: ["Fortified","Emergency","Garage","Firefighter"] },
      { name: "Police Station", desc: "Hold the line.", stats: { defense: 8, resources: 8, stealth: 2 }, traits: ["Fortified","Armory","Secure","Urban"] },
      { name: "Rooftop", desc: "Above the chaos.", stats: { defense: 5, resources: 3, stealth: 9 }, traits: ["HighGround","OpenAir","Hidden","EscapeRoute"] },
    ],
    rural: [
      { name: "Farmhouse", desc: "Quiet until sunset.", stats: { defense: 6, resources: 9, stealth: 6 }, traits: ["Rural","Farming","Spacious","Water"] },
      { name: "Hunting Cabin", desc: "Deep woods refuge.", stats: { defense: 5, resources: 7, stealth: 9 }, traits: ["Hidden","Rural","Hunting","Warm"] },
      { name: "Barn", desc: "Plenty of hiding places.", stats: { defense: 4, resources: 8, stealth: 5 }, traits: ["Spacious","Animals","Farming","Repairable"] },
      { name: "Ranger Tower", desc: "Watch everything below.", stats: { defense: 6, resources: 4, stealth: 8 }, traits: ["HighGround","Scout","Isolated","Forest"] },
    ],
    underground: [
      { name: "Subway Station", desc: "Darkness hides everything.", stats: { defense: 7, resources: 6, stealth: 8 }, traits: ["Underground","Transit","Echo","Hidden"] },
      { name: "Sewer Junction", desc: "Smells worse than zombies.", stats: { defense: 5, resources: 5, stealth: 10 }, traits: ["Underground","Hidden","Water","TightSpaces"] },
      { name: "Storm Shelter", desc: "Built for disasters.", stats: { defense: 10, resources: 3, stealth: 7 }, traits: ["Fortified","Underground","Secure","Emergency"] },
      { name: "Utility Tunnel", desc: "Forgotten maintenance access.", stats: { defense: 6, resources: 4, stealth: 9 }, traits: ["Underground","Maintenance","Hidden","EscapeRoute"] },
    ],
    mobile: [
      { name: "RV", desc: "Home on wheels.", stats: { defense: 4, resources: 7, stealth: 5 }, traits: ["Mobile","Storage","Vehicle","Comfortable"] },
      { name: "Box Truck", desc: "Plenty of cargo.", stats: { defense: 5, resources: 9, stealth: 3 }, traits: ["Mobile","Cargo","Vehicle","Spacious"] },
      { name: "Sailboat", desc: "Land can't follow.", stats: { defense: 6, resources: 5, stealth: 8 }, traits: ["Watercraft","Mobile","EscapeRoute","Fishing"] },
      { name: "Train Car", desc: "Tracks to nowhere.", stats: { defense: 7, resources: 6, stealth: 4 }, traits: ["Mobile","Rail","Metal","Spacious"] },
    ],
  },
  companion: {
    survivor: [
      { name: "Retired Marine", desc: "Still follows the mission.", stats: { combat: 9, survival: 8, morale: 5 }, traits: ["Brave","Leader","Veteran","Disciplined"] },
      { name: "ER Nurse", desc: "Every life still matters.", stats: { combat: 3, survival: 8, morale: 9 }, traits: ["Medic","Calm","Compassionate","Resilient"] },
      { name: "High School Teacher", desc: "Hope needs structure.", stats: { combat: 2, survival: 6, morale: 9 }, traits: ["Patient","Optimistic","Leader","Educator"] },
      { name: "Mechanic", desc: "Can fix almost anything.", stats: { combat: 5, survival: 9, morale: 6 }, traits: ["Engineer","Mechanical","Resourceful","Repair"] },
    ],
    specialist: [
      { name: "Firefighter", desc: "Runs toward danger.", stats: { combat: 8, survival: 8, morale: 7 }, traits: ["Brave","Strong","Rescue","Firefighter"] },
      { name: "Hunter", desc: "Nature teaches survival.", stats: { combat: 7, survival: 10, morale: 5 }, traits: ["Hunter","Scout","Patient","Tracker"] },
      { name: "Electrician", desc: "Power changes everything.", stats: { combat: 4, survival: 8, morale: 6 }, traits: ["Engineer","Electrical","Repair","Practical"] },
      { name: "Radio Operator", desc: "Someone's still listening.", stats: { combat: 3, survival: 7, morale: 8 }, traits: ["Communications","Calm","Observant","Military"] },
    ],
    everyday: [
      { name: "College Student", desc: "Learning the hard way.", stats: { combat: 4, survival: 5, morale: 8 }, traits: ["Curious","FastLearner","Hopeful","Agile"] },
      { name: "Prepper", desc: "Told you so.", stats: { combat: 6, survival: 10, morale: 4 }, traits: ["Prepared","Resourceful","Paranoid","Survivalist"] },
      { name: "Park Ranger", desc: "Knows every trail.", stats: { combat: 6, survival: 9, morale: 7 }, traits: ["Scout","Hunter","Calm","Navigator"] },
      { name: "Food Truck Owner", desc: "Still feeding people.", stats: { combat: 3, survival: 7, morale: 10 }, traits: ["Cook","Funny","Resourceful","Optimistic"] },
    ],
    wildcard: [
      { name: "Conspiracy Blogger", desc: "Weirdly prepared.", stats: { combat: 4, survival: 8, morale: 5 }, traits: ["Paranoid","Observant","Lucky","Resourceful"] },
      { name: "Retired Librarian", desc: "Knowledge survives forever.", stats: { combat: 2, survival: 7, morale: 9 }, traits: ["Intelligent","Calm","Research","Organized"] },
      { name: "Teenage Skateboarder", desc: "Never stops moving.", stats: { combat: 4, survival: 6, morale: 8 }, traits: ["Agile","Fearless","Fast","Loud"] },
      { name: "Golden Retriever", desc: "Everyone's best friend.", stats: { combat: 5, survival: 8, morale: 10 }, traits: ["Animal","Loyal","Scout","Fearless"] },
    ],
  },
  supply: {
    medical: [
      { name: "First Aid Kit", desc: "Better safe than sorry.", stats: { health: 10, sustain: 5, morale: 4 }, traits: ["Medical","Emergency","Reusable","Healing"] },
      { name: "Antibiotics", desc: "Invisible lifesaver.", stats: { health: 8, sustain: 4, morale: 3 }, traits: ["Medical","Rare","Infection","Pills"] },
      { name: "Painkillers", desc: "Ignore pain. For now.", stats: { health: 6, sustain: 3, morale: 7 }, traits: ["Medical","Pills","Emergency","Comfort"] },
      { name: "Trauma Bag", desc: "Ready for anything.", stats: { health: 9, sustain: 6, morale: 5 }, traits: ["Medical","Emergency","Heavy","Professional"] },
    ],
    food: [
      { name: "Canned Beans", desc: "Never expires. Almost.", stats: { health: 4, sustain: 10, morale: 3 }, traits: ["Food","LongLasting","Heavy","Reliable"] },
      { name: "MRE Pack", desc: "Military's favorite meal.", stats: { health: 5, sustain: 9, morale: 4 }, traits: ["Food","Military","LongLasting","Portable"] },
      { name: "Trail Mix", desc: "Small bag. Big energy.", stats: { health: 5, sustain: 6, morale: 6 }, traits: ["Food","Portable","Energy","Lightweight"] },
      { name: "Beef Jerky", desc: "Chew through anything.", stats: { health: 5, sustain: 7, morale: 5 }, traits: ["Food","Protein","LongLasting","Portable"] },
    ],
    tools: [
      { name: "Flashlight", desc: "Darkness hates batteries.", stats: { health: 2, sustain: 5, morale: 5 }, traits: ["Light","Exploration","Battery","Utility"] },
      { name: "Multi-tool", desc: "Tiny toolbox everywhere.", stats: { health: 3, sustain: 8, morale: 4 }, traits: ["Repair","Crafting","Utility","Portable"] },
      { name: "Bolt Cutters", desc: "Chains become suggestions.", stats: { health: 2, sustain: 7, morale: 4 }, traits: ["CutLocks","Heavy","Utility","Metal"] },
      { name: "Duct Tape", desc: "Fixes almost everything.", stats: { health: 3, sustain: 9, morale: 5 }, traits: ["Repair","Crafting","Utility","Reliable"] },
    ],
    luxury: [
      { name: "Coffee", desc: "Hope in a mug.", stats: { health: 3, sustain: 4, morale: 10 }, traits: ["Luxury","Energy","Comfort","Social"] },
      { name: "Deck of Cards", desc: "Kill boredom first.", stats: { health: 2, sustain: 3, morale: 9 }, traits: ["Luxury","Entertainment","Social","Hope"] },
      { name: "Guitar", desc: "Songs outlive civilizations.", stats: { health: 1, sustain: 2, morale: 10 }, traits: ["Luxury","Music","Loud","Inspiration"] },
      { name: "Bottle of Whiskey", desc: "Bad decisions, better nights.", stats: { health: 2, sustain: 1, morale: 9 }, traits: ["Luxury","Alcohol","Trade","Comfort"] },
    ],
  },
  wildcard: {
    vehicle: [
      { name: "Motorcycle", desc: "Speed over safety.", stats: { mobility: 10, utility: 5, wow: 8 }, traits: ["Vehicle","Fast","Loud","Escape"] },
      { name: "Pickup Truck", desc: "Hauls people and hope.", stats: { mobility: 7, utility: 9, wow: 6 }, traits: ["Vehicle","Cargo","Durable","OffRoad"] },
      { name: "Mountain Bike", desc: "Silent through the streets.", stats: { mobility: 9, utility: 6, wow: 5 }, traits: ["Vehicle","Silent","Agile","Lightweight"] },
      { name: "Inflatable Boat", desc: "Better than swimming.", stats: { mobility: 6, utility: 8, wow: 7 }, traits: ["Watercraft","Portable","Escape","River"] },
    ],
    animal: [
      { name: "German Shepherd", desc: "Your loyal warning system.", stats: { mobility: 6, utility: 8, wow: 9 }, traits: ["Animal","Loyal","Scout","Fearless"] },
      { name: "Goat", desc: "Eats literally everything.", stats: { mobility: 5, utility: 4, wow: 10 }, traits: ["Animal","Unpredictable","Loud","EatsAnything"] },
      { name: "Horse", desc: "Gallop beyond the horde.", stats: { mobility: 9, utility: 7, wow: 8 }, traits: ["Animal","Fast","Rural","Carry"] },
      { name: "Raven", desc: "Eyes in the sky.", stats: { mobility: 8, utility: 9, wow: 7 }, traits: ["Animal","Scout","Intelligent","Messenger"] },
    ],
    skill: [
      { name: "First Aid Training", desc: "Every second matters.", stats: { mobility: 3, utility: 10, wow: 6 }, traits: ["Medical","Healing","Calm","Professional"] },
      { name: "Parkour", desc: "Walls become shortcuts.", stats: { mobility: 10, utility: 6, wow: 8 }, traits: ["Agile","Escape","Urban","Athletic"] },
      { name: "Lockpicking", desc: "Every door's a maybe.", stats: { mobility: 4, utility: 10, wow: 7 }, traits: ["Lockpick","Stealth","Exploration","Precision"] },
      { name: "Mechanical Repair", desc: "Broken isn't forever.", stats: { mobility: 3, utility: 9, wow: 6 }, traits: ["Mechanical","Repair","Engineer","Resourceful"] },
    ],
    intel: [
      { name: "City Map", desc: "Knowledge beats luck.", stats: { mobility: 8, utility: 8, wow: 5 }, traits: ["Navigation","Urban","Scout","Planning"] },
      { name: "Police Scanner", desc: "Listen before moving.", stats: { mobility: 6, utility: 9, wow: 7 }, traits: ["Communications","Police","Radio","Warning"] },
      { name: "Military Radio", desc: "Someone answers back.", stats: { mobility: 2, utility: 10, wow: 10 }, traits: ["Military","Communications","Radio","Rare"] },
      { name: "Evacuation Blueprint", desc: "Escape has directions.", stats: { mobility: 7, utility: 10, wow: 8 }, traits: ["Navigation","Government","Planning","Secret"] },
    ],
  },
};
