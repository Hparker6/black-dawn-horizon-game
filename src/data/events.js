// Every event carries a stable `id` (snake_case, prefixed event_) separate
// from its display `title` — the engine (usedIds tracking in
// engine/events.js, analytics) keys off `id` only, so renaming a title for
// flavor can never change which events have already been drawn in a run or
// break a saved/replayed sequence.
//
// Every non-final event also carries a `type` — 'quiet' | 'discovery' |
// 'danger' | 'climax' — that engine/pacing.js uses to shape a run's tension
// curve. The final event (`final: true`) carries no type; it's exempt from
// the pacing draw entirely (see pickNextEvent in engine/events.js).
//
// A choice may also carry an optional `characterImpact: { compassion: 1 }`
// (or -1) — read by engine/character-profile.js, applied the instant the
// choice is picked, regardless of whether it's a plain/trait choice or a
// dice check that then succeeds or fails. Only choices that reveal who the
// player is being toward other people (helping, sparing, sharing, sacrifice
// vs. abandoning, robbing, taking) carry this; tactical/resource/route
// choices never do. See character-profile.js for what it becomes.
//
// SURVIVOR IDENTITY (Sprint 1) — two new layers, both additive:
//
//   requiredWeapon / requiredCompanion / requiredKeepsake on a CHOICE
//   (ids from data/survivor.js) — the choice is hidden unless the run's
//   identity matches, then appears as a no-roll unlock badged with the
//   piece's name (see classifyChoices in engine/events.js). Weapon and
//   companion unlocks are tactical routes through the event; keepsake
//   unlocks are emotional beats — small or no mechanical edge, often a
//   flag for a secret ending instead.
//
//   requiresFlags:['keepsake_<id>'] on an EVENT — the draft stamps each
//   pick as a flag, so a handful of rare events below simply can't be
//   drawn unless that keepsake is in the player's pocket. Same gating
//   machinery as the callback events, zero new plumbing.
//
// DYNAMIC EVENT IDENTITY (Sprint 2) — two more optional keys, both read by
// engine/events.js and both inert on events that don't carry them:
//
//   identityFlavor: [{ requiredWeapon|requiredCompanion|requiredKeepsake,
//   text }] on an EVENT — one line of the scene as this build perceives it
//   (the dog smells someone inside; the hunter counts them first). First
//   match wins, at most one line shows. Only major moments carry these.
//
//   identityVariants: [{ requiredWeapon|..., result?, success?, fail? }] on
//   a CHOICE — the same choice, resolved differently because of who's
//   making it (the nurse catches the bad water early; the dog hears the
//   crowd coming). Whole-object replacement of the matching outcome, so a
//   variant reads as a complete alternate ending to that beat, not a
//   number tweak. Identity-set flags here can also open hidden routes —
//   callback events gated on flags only an identity choice can set (see
//   event_holdout_caravan / event_photograph_returned below).
//
// CHECK REBALANCE: drafted identity carries no stats, so every dice check
// resolves as a bare d10 (bonus always 0). Each `needed` below was lowered
// by 3 (floor 3) from its pre-identity value — the old numbers assumed a
// typical drafted bonus of ~+3, so this keeps every check's real-world
// success odds where they were. The final gauntlet's 10 became 7: still the
// hardest roll in the game (see CLUTCH_NEEDED in engine/scoring.js).
export const EVENTS = [
  { id:'event_pharmacy', title:'The Pharmacy', type:'discovery',
    identityFlavor:[
      { requiredWeapon:'crowbar', text:"The crowbar's weight shifts in your grip. Chains are just a slower kind of open." },
    ],
    body:['A pharmacy sits untouched, doors chained shut.','Medicine lines the shelves beyond the glass.'],
    choices:[
      { text:'Pry the chains loose and clear the shelves', requiredTrait:'PryOpen', reqLabel:'Pry Open',
        result:{days:3,health:2,msg:'The chain gives with a crack. You fill your bag with bottles and gauze before the light fails.',tag:'MEDICINE SECURED'} },
      { text:'Take the hatchet to the chains', requiredWeapon:'hatchet',
        result:{days:2,health:1,msg:"Four swings and the chain drops in the street. You shop the aisles like it's a Sunday.",tag:'MEDICINE SECURED'} },
      { text:'Let the nurse read the shelves', requiredCompanion:'nurse',
        result:{days:2,health:2,msg:'She knows exactly which bottles matter and which are junk. You leave with a pharmacy in a backpack.',tag:'EXPERT HAUL'} },
      { text:'Break the glass and grab what you can', check:{stat:'combat',needed:4,label:'COMBAT'},
        success:{days:3,msg:'Glass rains down. You snatch a fistful of blister packs and vanish into the alley.'},
        fail:{days:2,health:-3,msg:'The shatter echoes for blocks. Something answers. You get out — but not clean.'},
        identityVariants:[
          { requiredCompanion:'dog', fail:{days:2,health:-1,msg:'The shatter draws them fast — but the dog hears them coming a street early and drags you out the right alley. Scratched, not bleeding.'} },
        ] },
      { text:'Leave it. Too loud, too exposed.',
        result:{days:2,msg:'You keep walking. Your stomach and your wounds will remember this street.',tag:'PASSED BY'} },
    ]},
  { id:'event_fever', title:'The Fever', type:'danger',
    body:['By the third night, your cut has gone hot and yellow.',"Your hands won't stop shaking."],
    choices:[
      { text:'Treat the wound properly', requiredTrait:'Heal', reqLabel:'Treat Wounds',
        result:{days:4,health:3,msg:'You clean it, pack it, bind it. By morning the fever breaks and the world stops swimming.',tag:'RECOVERED'} },
      { text:'Burn the infection out with antibiotics', requiredTrait:'Cure', reqLabel:'Cure Infection',
        result:{days:4,health:2,msg:'The pills hit hard. Two days lost to sleep — but you wake up whole.',tag:'RECOVERED'} },
      { text:'Ride it out and hope', check:{stat:'survival',needed:5,label:'SURVIVAL'},
        success:{days:5,msg:'You sweat through it curled in a stairwell. On the fourth dawn the fever finally lets go.'},
        fail:{days:2,health:-4,msg:"The fever wins the week. You lose days you can't count and blood you couldn't spare."} },
    ]},
  { id:'event_road_out', title:'The Road Out', type:'climax',
    body:['The only way north cuts through a stalled column of cars.','A dozen shapes move between them — slow, then not. They have seen you.'],
    choices:[
      { text:'Drop them from a distance', requiredTrait:'Ranged', reqLabel:'Ranged',
        result:{days:3,msg:'Six shots, six down. The rest scatter. You walk through the quiet you bought.',tag:'−6 ROUNDS'} },
      { text:'Take them one by one, without a sound', requiredTrait:'Silent', reqLabel:'Silent',
        result:{days:3,health:1,msg:'Bolt by bolt, the column goes still. Nothing hears. Nothing comes. You collect your arrows and walk on.',tag:'NOT A SOUND'} },
      { text:'Blast a corridor straight up the middle', requiredWeapon:'shotgun',
        result:{days:2,health:-1,msg:'Two shells clear the lane. The noise will travel, but so will you.',tag:'LOUD EXIT'} },
      { text:'Hold the choke point and thin them out', requiredWeapon:'spear',
        result:{days:3,msg:'They can only come two at a time between the cars. The spear does the rest.',tag:'HELD THE GAP'} },
      { text:'Follow the SEAL through the gap he calls', requiredCompanion:'seal',
        result:{days:2,msg:"He reads the column like a map — three hand signals and you're through without a sound.",tag:'CLEAN BREACH'} },
      { text:'Cut a path through', check:{stat:'combat',needed:6,label:'COMBAT'},
        success:{days:3,msg:'You move like weather — over hoods, through gaps, blade never stopping. Behind you, silence.'},
        fail:{days:2,health:-4,msg:'Too many hands. You break through torn and limping, leaving warmth on the asphalt.'},
        identityVariants:[
          { requiredWeapon:'machete', success:{days:3,msg:'The machete never stops moving — no jams, no reloads, no mercy. You come out the far side breathing hard and untouched.'} },
        ] },
      { text:'Backtrack and find another way', check:{stat:'wits',needed:4,label:'WITS'},
        success:{days:4,msg:"You read the town's bones and slip around the whole mess through a drainage canal."},
        fail:{days:5,health:-2,msg:'The detour costs you days and a bad fall — but you live to be lost another morning.'} },
    ]},
  { id:'event_flooded_underpass', title:'The Flooded Underpass', type:'discovery',
    body:['Black water fills the underpass, waist-deep.','Your canteen is bone dry, and this is the fastest way through.'],
    choices:[
      { text:'Refill and purify the water here', requiredTrait:'Purify', reqLabel:'Purify Water',
        result:{days:3,health:1,msg:'You draw the foul water and let the filter do its work. Clean, cold, life in a bottle.',tag:'WATER SECURED'} },
      { text:'Wade across and push on thirsty', check:{stat:'survival',needed:4,label:'SURVIVAL'},
        success:{days:3,msg:'You hold your pack high and cross without swallowing a drop. Dry ground never felt so good.'},
        fail:{days:2,health:-3,msg:'You gulp what you should not. By nightfall your gut is a clenched fist and your legs give out.'},
        identityVariants:[
          { requiredCompanion:'nurse', fail:{days:2,health:-1,msg:"You swallow what you shouldn't. The nurse has you purging and rehydrating before it takes hold — a bad night instead of a lost week."} },
        ] },
      { text:'Find high ground and wait for rain',
        result:{days:5,msg:'You wait two days for weather that comes late. Water, finally — but the calendar bled.',tag:'DELAYED'} },
    ]},
  { id:'event_fire_ahead', title:'The Fire Ahead', type:'danger',
    identityFlavor:[
      { requiredCompanion:'hunter', text:"Three of them, one rifle, bad sight lines — the hunter has it all counted before you've stopped walking." },
    ],
    body:['A fire flickers under the overpass — three figures, one rifle, food cooking.',"They've gone quiet, watching you decide."],
    choices:[
      { text:'Read them before you speak', requiredTrait:'Scout', reqLabel:'Scout Ahead',
        result:{days:3,health:1,msg:"You'd already counted the rifle's empty magazine. You approach easy, eat well, and leave richer.",tag:'TRADED UP'} },
      { text:'Let the journalist do the talking', requiredCompanion:'journalist', characterImpact:{compassion:1},
        result:{days:3,health:2,msg:'She trades news of the road north for stew and a spot by the fire. Stories are currency again.',tag:'TALKED IN'} },
      { text:"Trust the dog's read on them", requiredCompanion:'dog',
        result:{days:3,health:1,msg:'His tail never drops. You walk in easy, and the fire is exactly what it looks like.',tag:'READ THEM RIGHT'} },
      { text:'Offer to trade and share the fire', characterImpact:{compassion:1}, check:{stat:'wits',needed:5,label:'WITS'},
        success:{days:4,health:2,msg:"You talk slow and honest. By dawn you've eaten, slept warm, and swapped stories worth more than the stew."},
        fail:{days:2,health:-3,msg:'They take your kindness for weakness. You leave the fire lighter than you came, and bleeding.'} },
      { text:'Slip past in the dark', check:{stat:'survival',needed:3,label:'SURVIVAL'},
        success:{days:3,msg:'You melt into the black and circle wide. They never knew you were there.'},
        fail:{days:2,health:-2,msg:'A can rolls. A shot cracks the dark. You run, and keep running, and pay for the noise.'} },
    ]},
  { id:'event_dead_highway', title:'The Dead Highway', type:'discovery',
    identityFlavor:[
      { requiredKeepsake:'map', text:"His handwriting marks a county service road just south of here. It should still be there." },
    ],
    body:['The overpass has collapsed — a mountain of concrete and rebar blocking the interstate.','Past it, they say, the coast still has boats.'],
    choices:[
      { text:'Route around it from memory of the map', requiredTrait:'Navigate', reqLabel:'Navigate',
        result:{days:3,msg:"You trace the county's old service roads in your head and thread the wreck without breaking stride.",tag:'FAST PATH'} },
      { text:'Force a gap through the rebar', requiredTrait:'PryOpen', reqLabel:'Pry Open',
        result:{days:4,health:-1,msg:'You bend and break a path through the steel. Slow, ugly work — but the coast pulls closer.',tag:'THROUGH THE WRECK'} },
      { text:'Hack through the brush of the old service road', requiredWeapon:'machete',
        result:{days:3,msg:'The county cut a service road here once. The machete finds it again, one swing at a time.',tag:'THROUGH THE GREEN'} },
      { text:'Climb over the top', check:{stat:'survival',needed:5,label:'SURVIVAL'},
        success:{days:4,msg:'You climb the mountain of concrete hand over hand and drop down the far side, coast wind in your teeth.'},
        fail:{days:3,health:-4,msg:'Halfway up the rebar shifts. You fall hard and crawl the day out, the coast still beyond reach.'} },
    ]},
  { id:'event_long_night', title:'The Long Night', type:'climax',
    identityFlavor:[
      { requiredKeepsake:'wedding_ring', text:"You turn the ring with your thumb, the way you always do when the dark gets loud." },
    ],
    body:['The temperature drops with the sun — no shelter, no walls, just open road and a cutting wind.',"You won't last the night out here."],
    choices:[
      { text:'Build a fire and hold the dark back', requiredTrait:'Fire', reqLabel:'Make Fire',
        result:{days:3,health:2,msg:'The kindling catches on the first strike. You sit in a small gold circle of warmth and, for one night, you are safe.',tag:'WARM'} },
      { text:'Curl up back-to-back with the dog', requiredCompanion:'dog',
        result:{days:2,health:1,msg:"He's a furnace with a heartbeat. You sleep in shifts neither of you agreed to.",tag:'SHARED WARMTH'} },
      { text:'Read out loud by what light is left', requiredKeepsake:'bible',
        result:{days:2,health:1,msg:'The words hold steadier than your hands. Somewhere in the second psalm, the night stops winning.',tag:'HELD ON',setFlags:['read_the_verse']} },
      { text:'Wind the watch and count the hours down', requiredKeepsake:'pocket_watch',
        result:{days:2,msg:"Every hour you wind it. Every hour it answers. At the fifth winding the sky goes grey, and you're still here.",tag:'COUNTED THROUGH'} },
      { text:'Keep moving to stay warm', check:{stat:'survival',needed:6,label:'SURVIVAL'},
        success:{days:3,msg:'You walk the whole night, one foot in front of the other, and greet the sun still breathing.'},
        fail:{days:2,health:-4,msg:"The cold gets into your bones and won't leave. You wake shivering, weaker, hours gone."},
        identityVariants:[
          { requiredCompanion:'dog', fail:{days:2,health:-2,msg:'The cold takes the night anyway — but every time you stop, the dog leans into you until you start walking again. You lose warmth, not toes.'} },
        ] },
      { text:'Take shelter in a wrecked car', check:{stat:'wits',needed:4,label:'WITS'},
        success:{days:2,msg:'You wedge the doors, stuff the gaps, and steal a few hours of shivering sleep.'},
        fail:{days:2,health:-2,msg:'The car is a metal icebox. You survive it, barely, and pay in warmth you did not have to give.'} },
    ]},
  { id:'event_feral_pack', title:'The Feral Pack', type:'danger',
    identityFlavor:[
      { requiredCompanion:'dog', text:'Your dog answers their howling with something lower and older, and for a moment the whole pack hesitates.' },
    ],
    body:['A pack of dogs breaks from the tree line, low and fast.',"They have your scent, and they're not slowing."],
    choices:[
      { text:'Drop the lead dog from range', requiredTrait:'Ranged', reqLabel:'Ranged',
        result:{days:2,msg:"One shot. The pack scatters at the sound and doesn't come back.",tag:'PACK BROKEN'} },
      { text:'Put the leader down before the pack commits', requiredTrait:'Silent', reqLabel:'Silent',
        result:{days:2,health:1,msg:'The bolt takes the leader mid-stride, and the pack loses its nerve before it finds its voice. The woods never learn you were there.',tag:'NEVER SEEN'} },
      { text:'Let the hunter turn the chase around', requiredCompanion:'hunter',
        result:{days:2,health:1,msg:"By dusk the pack is down two and you're carrying dinner. Hunted, hunter — the word order matters.",tag:'TABLES TURNED'} },
      { text:'Kneel, hold out the old collar, and speak low', requiredKeepsake:'dog_collar',
        result:{days:1,msg:'The lead dog stops at the smell of it — another life, another hand. It huffs once and takes the pack elsewhere.',tag:'REMEMBERED',setFlags:['calmed_the_pack']} },
      { text:'Stand and fight', check:{stat:'combat',needed:5,label:'COMBAT'},
        success:{days:2,msg:'You put your back to a wall and make every swing count. They break off, bleeding.'},
        fail:{days:1,health:-5,msg:'They get in close before you can set your feet. You crawl out of the scrum alive — barely.'},
        identityVariants:[
          { requiredWeapon:'spear', success:{days:2,msg:"Reach wins. The spear keeps every set of teeth a body-length away until the pack decides you're not worth it."} },
        ] },
      { text:"Climb whatever's nearest",
        result:{days:1,msg:'You haul yourself onto a rusted truck bed and wait them out.',tag:'WAITED OUT'} },
    ]},
  { id:'event_broken_ice', title:'The Broken Ice', type:'discovery',
    body:['The reservoir is frozen edge to edge — the far shore saves two days on foot.','Somewhere under the white, a road used to hold.'],
    choices:[
      { text:'Follow the old boat channel markers', requiredTrait:'Navigate', reqLabel:'Navigate',
        result:{days:1,health:1,msg:'You remember the channel runs deeper — the ice there is thick enough. You cross without a crack.',tag:'FAST CROSSING'} },
      { text:'Sound the ice ahead with the spear haft', requiredWeapon:'spear',
        result:{days:2,msg:'Tap, listen, step. The haft finds the hollow spots before your boots do.',tag:'SOUNDED OUT'} },
      { text:'Test each step and hope', check:{stat:'survival',needed:4,label:'SURVIVAL'},
        success:{days:2,msg:'You go slow, spread your weight, and make the far bank with dry boots.'},
        fail:{days:2,health:-3,msg:'The ice gives once. You go in to the waist before you claw back out, soaked and shaking.'} },
      { text:'Walk the long way around',
        result:{days:4,msg:'You add two days to the map rather than trust the ice.',tag:'LONG WAY'} },
    ]},
  { id:'event_gas_main', title:'The Gas Main', type:'discovery',
    body:['A ruptured gas line hisses behind a locked door.',"Whatever's inside hasn't burned yet. That's luck, not safety."],
    choices:[
      { text:'Force the shutoff valve casing', requiredTrait:'PryOpen', reqLabel:'Pry Open',
        result:{days:2,health:1,msg:'You crack the casing and choke the line by hand. The hiss dies. So does the risk.',tag:'LEAK STOPPED'} },
      { text:'Let the mechanic choke the line properly', requiredCompanion:'mechanic',
        result:{days:1,health:1,msg:'She finds the shutoff by feel, swearing gently at the fittings. The hiss dies mid-breath.',tag:'LEAK STOPPED'} },
      { text:"Hold your breath and grab what's close", check:{stat:'survival',needed:5,label:'SURVIVAL'},
        success:{days:1,msg:"You're in and out before your lungs give out, arms full."},
        fail:{days:2,health:-3,msg:'You breathe wrong once. The fumes drop you to your knees before you make the door.'} },
      { text:"Not worth it. Walk away.",
        result:{days:1,msg:'Some doors stay shut for a reason.',tag:'LEFT SEALED'} },
    ]},
  { id:'event_riverbank_ambush', title:'The Riverbank Ambush', type:'danger',
    identityFlavor:[
      { requiredWeapon:'crossbow', text:"Your thumb finds the crossbow's stirrup on its own. Quiet problems have quiet answers." },
    ],
    body:['Two figures wait at the only crossing for miles, half-hidden in the reeds.',"They haven't seen you. Yet."],
    choices:[
      { text:'Read their positions before you move', requiredTrait:'Scout', reqLabel:'Scout Ahead',
        result:{days:2,msg:'You clock both of them from the ridge and cross a half-mile upstream, unseen.',tag:'AVOIDED'} },
      { text:'Take the silent shot', requiredWeapon:'crossbow',
        result:{days:1,msg:'The bolt takes the far one without a sound. The other stares at the reeds for a long minute, then runs.',tag:'SILENT WORK'} },
      { text:'The dog catches their scent before the bend', requiredCompanion:'dog',
        result:{days:2,msg:'A low growl at nothing you can see. You trust it, swing wide upstream, and never learn what it saved you from.',tag:'EARLY WARNING'} },
      { text:'Rush the crossing before they react', check:{stat:'combat',needed:5,label:'COMBAT'},
        success:{days:1,msg:"You're through the water and past them before they get a shot off."},
        fail:{days:2,health:-4,msg:'They\'re faster than they looked. You make the far bank bleeding and short one canteen.'} },
      { text:'Wait for dark and try again',
        result:{days:3,msg:'You lose the daylight but not the blood. Patience, for once, costs only time.',tag:'WAITED'} },
    ]},
  { id:'event_sinking_overpass', title:'The Sinking Overpass', type:'climax',
    body:['Half the overpass has already dropped into the river.','The rest groans with every gust — the only way across before dark.'],
    choices:[
      { text:'Cross along the load-bearing line', requiredTrait:'Navigate', reqLabel:'Navigate',
        result:{days:2,msg:'You trace the one section still tied to bedrock and make it across without a wobble.',tag:'STEADY CROSSING'} },
      { text:'Send the kid across with the rope', requiredCompanion:'teenager',
        result:{days:1,msg:"She's across the groaning span in forty seconds like it's a playground railing, and the line she rigs holds you both.",tag:'ROPED ACROSS'} },
      { text:'Sprint the weak span before it goes', check:{stat:'survival',needed:6,label:'SURVIVAL'},
        success:{days:1,msg:"Concrete crumbles behind your last step. You don't look back."},
        fail:{days:1,health:-6,msg:"The span drops out from under you. You catch rebar on the way down and haul yourself out, half-drowned."} },
      { text:'Find a way around',
        result:{days:4,msg:'You lose the better part of a week finding solid ground instead.',tag:'DETOUR'} },
    ]},
  { id:'event_quarantine_ward', title:'The Quarantine Ward', type:'climax',
    identityFlavor:[
      { requiredCompanion:'nurse', text:'The nurse reads the triage tags zip-tied to the door handle and goes very quiet.' },
    ],
    body:["A clinic's quarantine ward is sealed, biohazard tape peeling.",'Something inside is coughing. Something else has stopped.'],
    choices:[
      { text:'Move through with proper precautions', requiredTrait:'Cure', reqLabel:'Cure Infection',
        result:{days:2,health:1,msg:"You know what not to touch. You clear the ward's usable stock without catching whatever's in the air.",tag:'CLEAN RUN'} },
      { text:'Cut through the tarp walls and skip the corridors', requiredWeapon:'machete',
        result:{days:1,msg:'Straight line through three plastic walls. You never breathe the hallway air at all.',tag:'SHORTCUT'} },
      { text:'Hold your breath and search fast', check:{stat:'survival',needed:6,label:'SURVIVAL'},
        success:{days:2,msg:"You're out before the ward's air catches up to you, pockets full."},
        fail:{days:2,health:-6,msg:'Whatever\'s in there gets in your lungs anyway. You spend the next two days flat on your back, worse for it.'},
        identityVariants:[
          { requiredCompanion:'nurse', fail:{days:2,health:-3,msg:'You breathe wrong once. The nurse recognizes the cough by nightfall and burns through half her kit stopping it early.'} },
        ] },
      { text:'Seal the doors again and go',
        result:{days:1,msg:'Some wards stay quarantined for a reason. You leave it be.',tag:'LEFT SEALED'} },
    ]},
  { id:'event_last_transmission', title:"The Last Transmission", type:'quiet',
    body:["A dead man's radio loops the same distress call, batteries still holding.",'His notebook lies open — half a frequency, written down.'],
    choices:[
      { text:'Finish decoding his last transmission', requiredTrait:'Signal', reqLabel:'Call Rescue', characterImpact:{compassion:1},
        result:{days:2,health:1,msg:'You know the protocol. The rest of the frequency clicks into place — a working relay, still listening.',tag:'RELAY FOUND'} },
      { text:'Let the journalist work the story', requiredCompanion:'journalist',
        result:{days:2,msg:'She cross-references his notebook like a source — call signs, schedules, a relay window. The dead man gets a byline; you get a bearing.',tag:'STORY FILED'} },
      { text:'Time the loop against your watch and find the gap', requiredKeepsake:'pocket_watch',
        result:{days:2,msg:'The loop repeats every four minutes ten. In the silence between, a second signal — fainter, alive. You mark its bearing.',tag:'GAP FOUND'} },
      { text:'Piece together the frequency yourself', check:{stat:'wits',needed:4,label:'WITS'},
        success:{days:3,msg:'It takes longer without training, but you get there. The relay answers back.'},
        fail:{days:2,msg:'The math doesn\'t add up in time. You take his radio anyway and move on.'} },
      { text:'Take the gear, leave the mystery',
        result:{days:1,msg:'You strip the pack for parts and leave the rest to whoever finds him next.',tag:'STRIPPED'} },
    ]},
  { id:'event_field_medics_cache', title:"The Field Medic's Cache", type:'quiet',
    body:["A medic's rucksack hangs from a shattered ambulance door.","Whoever left it didn't leave on their own terms."],
    choices:[
      { text:"Sort the cache like you know what you're doing", requiredTrait:'Heal', reqLabel:'Treat Wounds', characterImpact:{compassion:1},
        result:{days:1,health:3,msg:"You know exactly what's worth the weight. The rest you leave for whoever's luckier than the medic was.",tag:'KIT SECURED'} },
      { text:'Read the tags on the strap before anything else', requiredKeepsake:'military_tags', characterImpact:{compassion:1},
        result:{days:1,health:1,msg:'You know how this works. You take the kit, loop the tags on the mirror, and say the name out loud once, properly.',tag:'HONORED',setFlags:['honored_the_fallen']} },
      { text:"Guess at what's useful", check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,health:1,msg:'You grab everything that looks intact and sort it out later. Some of it\'s even useful.'},
        fail:{days:1,msg:"Half of it's expired, and you waste an hour figuring out which half."} },
      { text:"Take the bag and don't look inside",
        result:{days:1,msg:"You'll sort it later, if later comes.",tag:'GRABBED'} },
    ]},
  { id:'event_furnace_room', title:'The Furnace Room', type:'discovery',
    body:['A basement furnace room sits cold behind a rusted grate.','Something back there has been kept warm, and hidden, a long time.'],
    choices:[
      { text:'Relight the furnace to see by', requiredTrait:'Fire', reqLabel:'Make Fire',
        result:{days:2,health:1,msg:'The old furnace catches on the second try. In the light you find a stash someone meant to come back for.',tag:'STASH FOUND'} },
      { text:'Search by feel in the dark', check:{stat:'wits',needed:4,label:'WITS'},
        success:{days:2,msg:'You work the shelves blind and come up with more than you expected.'},
        fail:{days:1,health:-2,msg:"You put your hand through something sharp in the dark before you find anything worth taking."} },
      { text:'Not worth the risk without light',
        result:{days:1,msg:'You leave the grate shut and the basement dark.',tag:'SKIPPED'} },
    ]},
  { id:'event_overturned_armored_truck', title:'The Overturned Armored Truck', type:'discovery',
    body:['An armored truck lies on its side, back doors sealed tight.',"Nobody's touched it. That's worth noting."],
    choices:[
      { text:'Force the rear doors', requiredTrait:'PryOpen', reqLabel:'Pry Open',
        result:{days:2,health:-1,msg:"It takes everything you've got, but the doors give. Whatever's inside was worth guarding.",tag:'DOORS FORCED'} },
      { text:'Give the mechanic an hour at the hinges', requiredCompanion:'mechanic',
        result:{days:2,msg:'She walks the truck once, taps twice, and pulls the pins out of the doors from the outside. Locksmiths would weep.',tag:'DOORS OPENED'} },
      { text:'Break the hinge with brute force', check:{stat:'combat',needed:4,label:'COMBAT'},
        success:{days:2,msg:'You cave the hinge in with repeated blows and haul the door open.'},
        fail:{days:1,health:-2,msg:"The hinge doesn't move. You bruise a shoulder for nothing."} },
      { text:'Leave it. Too heavy, too slow.',
        result:{days:1,msg:'Whatever\'s inside stays inside.',tag:'PASSED BY'} },
    ]},
  { id:'event_treatment_annex', title:'The Treatment Annex', type:'discovery',
    body:['A water treatment annex hums on backup power, tanks half-full.','The filtration readout is red across the board.'],
    choices:[
      { text:'Run the system through a manual cycle', requiredTrait:'Purify', reqLabel:'Purify Water',
        result:{days:2,health:2,msg:'You know the manual override. Clean water, more than you can carry, for the first time in weeks.',tag:'CLEAN WATER'} },
      { text:'Test small batches yourself', check:{stat:'survival',needed:4,label:'SURVIVAL'},
        success:{days:3,msg:"You go slow, testing as you go, and end up with a few days' worth of water you trust."},
        fail:{days:2,health:-3,msg:'You trust a batch you shouldn\'t have. Your stomach spends the next two days reminding you.'} },
      { text:"Not worth the gamble",
        result:{days:1,msg:'You bypass the annex and keep your canteen dry.',tag:'SKIPPED'} },
    ]},
  { id:'event_nursery_window', title:'The Nursery Window', type:'quiet',
    identityFlavor:[
      { requiredKeepsake:'photograph', text:"You know exactly which photo would be taped to their fridge. You're carrying your own." },
    ],
    body:["A hand-lettered sign in a daycare window reads 'THREE KIDS, NO FOOD, PLEASE.'",'It looks empty. It probably isn\'t.'],
    choices:[
      { text:'Leave what food you can spare', characterImpact:{compassion:1},
        result:{days:1,health:-1,msg:'You leave half your rations on the sill and walk away without knocking. You never find out if it mattered.',tag:'GAVE WHAT YOU HAD',setFlags:['helped_nursery_kids']} },
      { text:'Send the nurse to the door', requiredCompanion:'nurse', characterImpact:{compassion:1},
        result:{days:2,msg:"Scrubs still mean something. The door opens a hand's width, and for an hour she's a nurse again.",tag:'TRUSTED',setFlags:['helped_nursery_kids']} },
      { text:'Slip your photograph under the door with the food', requiredKeepsake:'photograph', characterImpact:{compassion:1},
        result:{days:1,health:-1,msg:"Proof you were somebody's, once. You leave it with half your rations, so they know the food isn't a trick.",tag:'PROOF OF KINDNESS',setFlags:['helped_nursery_kids','gave_the_photograph']} },
      { text:'Knock and offer to help', characterImpact:{compassion:1}, check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:3,msg:'A woman opens the door an inch, takes what you offer, and shuts it again. It\'s enough.',setFlags:['helped_nursery_kids']},
        fail:{days:2,health:-2,msg:"Whoever's inside doesn't trust strangers at the door. You leave the way you came, faster.",setFlags:['spooked_nursery']} },
      { text:"Keep walking. You can't save everyone.", characterImpact:{compassion:-1},
        result:{days:1,msg:'The sign stays in the window behind you.',tag:'KEPT WALKING',setFlags:['ignored_nursery_kids']} },
    ]},
  { id:'event_toll_bridge', title:'The Toll Bridge', type:'danger',
    identityFlavor:[
      { requiredCompanion:'officer', text:'The officer reads their stances like a rap sheet: scared, hungry, bluffing — in that order.' },
    ],
    body:['Three survivors have chained the bridge and want a toll.',"They're armed, and thin. This isn't going well for them either."],
    choices:[
      { text:"Pay what they're asking", characterImpact:{compassion:1},
        result:{days:1,health:-1,msg:'You hand over a share of your supplies. They lift the chain without a word.',tag:'PAID TOLL',setFlags:['paid_toll']},
        identityVariants:[
          { requiredKeepsake:'military_tags', result:{days:1,msg:'One of them clocks the tags at your neck and pushes half your payment back across the chain. "My brother served." The bridge opens.',tag:'HALF TOLL',setFlags:['paid_toll']} },
        ] },
      { text:'Fire a warning shot into the girders', requiredWeapon:'revolver',
        result:{days:1,msg:'One round off the steel says everything about the other five. They lift the chain and keep their eyes down.',tag:'WARNING FIRED'} },
      { text:'Let the officer talk the standoff down', requiredCompanion:'officer',
        result:{days:1,msg:"Twenty years of doorway de-escalation in his voice. Everyone's hands come down slow, and the chain follows.",tag:'DE-ESCALATED'} },
      { text:'Push through the chain point', characterImpact:{compassion:-1}, check:{stat:'combat',needed:5,label:'COMBAT'},
        success:{days:1,msg:"You put one down before the other two decide the toll isn't worth dying for.",setFlags:['robbed_toll']},
        fail:{days:2,health:-3,msg:"Three against one is worse math than you thought. You pay double to walk away.",setFlags:['robbed_toll']} },
      { text:'Turn back and find another crossing',
        result:{days:3,msg:"You give up the bridge and the days it would've saved you.",tag:'REROUTED'} },
    ]},
  { id:'event_injured_stranger', title:'The Injured Stranger', type:'quiet',
    body:['A man is propped against a mile marker, leg bent wrong.','He has nothing to offer but his name.'],
    choices:[
      { text:'Set the leg properly', requiredTrait:'Heal', reqLabel:'Treat Wounds', characterImpact:{compassion:1},
        result:{days:2,health:-1,msg:"You splint it right. He won't walk well for a month, but he'll walk. He gives you what little he's carrying, gratefully.",tag:'SET RIGHT'} },
      { text:'Sit with him. Show him the ring. Say who it was for.', requiredKeepsake:'wedding_ring', characterImpact:{compassion:1},
        result:{days:2,msg:"You trade the stories that matter — who you both left the porch light on for. When you go, he's still hurt, but he's not alone in it.",tag:'NOT ALONE',setFlags:['spoke_the_name']} },
      { text:'Leave him water and move on', characterImpact:{compassion:1},
        result:{days:1,health:-1,msg:'You leave what you can spare and don\'t look back. It\'s not nothing.',tag:'LEFT SUPPLIES'} },
      { text:'Keep walking', characterImpact:{compassion:-1},
        result:{days:1,msg:'His voice follows you for a while. Then it doesn\'t.',tag:'KEPT WALKING'} },
    ]},
  { id:'event_dead_mans_locker', title:"The Dead Man's Locker", type:'quiet',
    body:['A storage locker has a name taped to it, a combination scratched below.',"Whoever left the hint never came back."],
    choices:[
      { text:'Take everything of value', characterImpact:{compassion:-1},
        result:{days:1,health:1,msg:"You clear it out. It's someone's whole life in a metal box, and now it's supplies.",tag:'CLEARED OUT'} },
      { text:'Let the officer run the name', requiredCompanion:'officer', characterImpact:{compassion:1},
        result:{days:1,health:1,msg:'He reads the locker like a case file and finds the letter meant for family. You take the food; the letter goes back on top, addressed for whoever comes next.',tag:'BY THE BOOK'} },
      { text:'Read over the locker before you decide', requiredKeepsake:'bible', characterImpact:{compassion:1},
        result:{days:1,msg:"You say the short version over a stranger's boxed-up life, take only the food, and close it gentle.",tag:'LAST RITES',setFlags:['read_the_verse']} },
      { text:'Take only what you need', characterImpact:{compassion:1}, check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,health:1,msg:'You leave the photos and the letters. You take the food and the batteries. It feels like the right split.'},
        fail:{days:1,msg:'You second-guess every item and end up taking almost nothing.'} },
      { text:'Leave it sealed',
        result:{days:1,msg:'Not every locker needs opening.',tag:'LEFT SEALED'} },
    ]},
  { id:'event_rival_scavenger', title:'The Rival Scavenger', type:'danger',
    body:['Another scavenger reaches the same pharmacy at the same moment.',"Neither got here first. Both need what's inside."],
    choices:[
      { text:'Split the haul evenly', characterImpact:{compassion:1},
        result:{days:1,msg:'You divide what\'s left down the middle and go your separate ways. Nobody draws a weapon.',tag:'SPLIT EVEN',setFlags:['spared_scavenger']} },
      { text:'Let the journalist broker the split', requiredCompanion:'journalist', characterImpact:{compassion:1},
        result:{days:1,msg:'She talks the standoff into a trade agreement with clauses. You leave with more than half and a handshake.',tag:'BROKERED',setFlags:['spared_scavenger']} },
      { text:'Rack the shotgun once', requiredWeapon:'shotgun', characterImpact:{compassion:-1},
        result:{days:1,msg:'The sound does the arguing. They back out with empty hands and a long memory.',tag:'CLAIMED',setFlags:['robbed_scavenger']} },
      { text:'Push them off the site', characterImpact:{compassion:-1}, check:{stat:'combat',needed:4,label:'COMBAT'},
        success:{days:1,health:-1,msg:'You make it clear this find is yours. They leave cursing, but they leave.',setFlags:['robbed_scavenger']},
        fail:{days:2,health:-3,msg:"They're not backing down. You leave with less than you'd have gotten by sharing."} },
      { text:'Walk away and find somewhere else',
        result:{days:2,msg:'It\'s not worth the fight. You leave them the whole pharmacy.',tag:'CONCEDED'} },
    ]},
  { id:'event_stampede', title:'The Stampede', type:'danger',
    identityFlavor:[
      { requiredCompanion:'hunter', text:'"Range cattle," the hunter says, already moving. "Something back there spooked them worse than we could."' },
    ],
    body:['A spooked herd thunders down the highway median.',"They don't care that you're in the way."],
    choices:[
      { text:'Let the hunter cut the straggler from the herd', requiredCompanion:'hunter',
        result:{days:2,health:2,msg:"He picks the lame one from three hundred yards of dust and takes it clean. You eat like the world didn't end.",tag:'FRESH MEAT'} },
      { text:'Drop one from well clear of the dust', requiredWeapon:'rifle',
        result:{days:2,health:2,msg:'You let the herd pass and take the straggler at range. Meat without the trampling.',tag:'FRESH MEAT'} },
      { text:'Dive clear and let them pass', check:{stat:'survival',needed:4,label:'SURVIVAL'},
        success:{days:1,msg:"You hit the ditch a half-second before they'd have hit you. The ground shakes for a while after."},
        fail:{days:1,health:-3,msg:"You don't clear the ditch in time. A hoof catches your leg on the way past."},
        identityVariants:[
          { requiredCompanion:'teenager', fail:{days:1,health:-1,msg:"You don't clear the ditch — but the kid's hand closes on your collar and yanks you the last two feet. A bruise instead of a break."} },
        ] },
      { text:'Drop one for the meat', check:{stat:'combat',needed:4,label:'COMBAT'},
        success:{days:2,health:2,msg:'You put one down at the edge of the herd and butcher fast before the smell draws worse company.'},
        fail:{days:1,health:-2,msg:"You get too close. The herd doesn't so much trample you as sweep you along for thirty feet."} },
      { text:"Climb whatever's nearest",
        result:{days:1,msg:'You wait it out from the top of a stalled bus. The herd passes like weather.',tag:'WAITED OUT'} },
    ]},
  { id:'event_speaker_loop', title:'The Speaker Loop', type:'danger',
    identityFlavor:[
      { requiredCompanion:'teenager', text:'The kid mouths every word of the jingle without noticing. Everyone her age knows it cold.' },
    ],
    body:['A speaker in a gutted store loops the same jingle, hour after hour.',"It's drawing a crowd. Not the kind you want."],
    choices:[
      { text:'Cut through the fence behind the loading dock', requiredWeapon:'hatchet',
        result:{days:1,msg:"Chain-link parts like paper. You're two blocks gone before the crowd rounds the corner.",tag:'THROUGH THE FENCE'} },
      { text:'Send the kid over the roofs to kill the speaker', requiredCompanion:'teenager',
        result:{days:1,msg:"She's up a drainpipe before you finish objecting. The jingle dies mid-chorus.",tag:'SILENCED'} },
      { text:'Find and kill the power source', check:{stat:'wits',needed:4,label:'WITS'},
        success:{days:1,msg:'You trace the wire to a cracked solar panel and rip it loose. Silence, finally.'},
        fail:{days:1,health:-2,msg:"You can't find the source before the crowd finds you. You run instead."} },
      { text:'Clear a path through', check:{stat:'combat',needed:5,label:'COMBAT'},
        success:{days:2,msg:'You put down what\'s between you and the exit and keep moving.'},
        fail:{days:2,health:-4,msg:'There are more of them than you accounted for. You get clear, but not clean.'} },
      { text:'Go around, far around',
        result:{days:2,msg:'You add half a day to your route rather than go anywhere near that jingle again.',tag:'AVOIDED'} },
    ]},
  { id:'event_derailment', title:'The Derailment', type:'danger',
    identityFlavor:[
      { requiredCompanion:'mechanic', text:'The mechanic winces at every settling car, cataloguing the sounds of metal giving up.' },
    ],
    body:['A runaway freight train derails a quarter mile ahead.','The wreck is still settling. So is the dust.'],
    choices:[
      { text:'Let the SEAL clear the wreck like a structure', requiredCompanion:'seal',
        result:{days:2,health:1,msg:"Car by car, hand signals only — he moves through the wreck like it's a drill. You leave with the cargo worth having.",tag:'SWEPT CLEAN'} },
      { text:'Get clear before the cars finish tipping', check:{stat:'survival',needed:5,label:'SURVIVAL'},
        success:{days:1,msg:"You're already moving when the last car goes over. Debris lands where you stood a second ago."},
        fail:{days:1,health:-4,msg:'A piece of the wreck catches you on the way down. You limp clear of the rest.'} },
      { text:'Search the wreck once it settles', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,health:1,msg:"Cargo's scattered everywhere. You find a sealed container that survived the fall intact."},
        fail:{days:2,msg:'You search too long. Whatever was worth finding, someone else got to first.'} },
      { text:'Keep well clear of it',
        result:{days:1,msg:'You watch from a safe distance and let the dust settle without you in it.',tag:'KEPT CLEAR'} },
    ]},
  { id:'event_costume_party', title:'The Costume Party', type:'quiet',
    identityFlavor:[
      { requiredKeepsake:'cassette_tape', text:"Your thumb finds the cassette in your pocket before you've decided anything at all." },
    ],
    body:["A dozen survivors in cracked masks dance around a bonfire, like the world didn't end.","Safest place you've seen in weeks, or the least."],
    choices:[
      { text:'Watch the tree line while they party', requiredTrait:'Ranged', reqLabel:'Ranged',
        result:{days:2,health:2,msg:'You cover their blind side from a distance and they notice. In return, you eat well and sleep warm.',tag:'EARNED TRUST'} },
      { text:'Hand over the cassette — one more song before the end', requiredKeepsake:'cassette_tape', characterImpact:{compassion:1},
        result:{days:2,health:2,msg:"Someone has a deck with batteries. For three and a half minutes, everyone is who they used to be. They won't forget who brought the music.",tag:'ONE MORE SONG',setFlags:['played_the_tape']} },
      { text:'Join and read the room', check:{stat:'wits',needed:4,label:'WITS'},
        success:{days:2,health:1,msg:"They're exactly what they look like — tired people pretending, for one night, that things are fine. You're glad you stayed."},
        fail:{days:1,health:-2,msg:'Something about the group sours fast. You leave before it gets worse.'} },
      { text:'Keep your distance',
        result:{days:1,msg:'You watch the fire from the dark a while, then keep moving.',tag:'KEPT DISTANCE'} },
    ]},

  // The Sprint 2 showcase moment: one location, five different stories
  // depending on who's standing in front of it. The dog build even changes
  // what the scene IS (someone's inside) before any choice is made.
  { id:'event_boarded_storefront', title:'The Boarded Storefront', type:'discovery',
    identityFlavor:[
      { requiredCompanion:'dog', text:"The dog stops dead at the doorway, nose working the gap in the boards. Someone's in there. Alive." },
    ],
    body:['A general store, windows boarded from the inside, door padlocked from the outside.',"Someone wanted this place left alone. The question is which side of the boards they're on."],
    choices:[
      { text:'Shoot the padlock loose, quietly', requiredWeapon:'crossbow',
        result:{days:1,health:1,msg:'One bolt through the hasp at ten paces. The lock drops into the dirt without waking the street, and the shelves inside are worth the walk.',tag:'QUIET ENTRY'} },
      { text:"Let the mechanic's bolt cutters do the talking", requiredCompanion:'mechanic',
        result:{days:1,health:1,msg:'Two squeezes and the padlock is scrap. She pockets the hasp screws too — "good screws," apparently.',tag:'CUT THROUGH'} },
      { text:'Trust the dog — knock, and call out to whoever\'s inside', requiredCompanion:'dog', characterImpact:{compassion:1},
        result:{days:2,health:1,msg:"A long silence, then boards shifting. An old man who's held this store since the start trades you canned goods for news of the road, and doesn't stop talking till dawn.",tag:'SOMEONE INSIDE',setFlags:['befriended_holdout']} },
      { text:'The family photo taped inside the glass looks like one of yours', requiredKeepsake:'photograph', characterImpact:{compassion:1},
        result:{days:1,msg:"Whoever's in there still keeps people on a wall. You leave a share of what you carry on the step, knock twice, and walk on without waiting.",tag:'LEFT IN PEACE',setFlags:['befriended_holdout']} },
      { text:'Force the door', check:{stat:'combat',needed:4,label:'COMBAT'},
        success:{days:1,msg:'The hasp tears free. Inside: dust, shelves picked thin, and a back room somebody left in a hurry.'},
        fail:{days:1,health:-2,msg:'The door fights you, and the noise it makes fights you worse. You grab little and go.'} },
      { text:'Leave it boarded',
        result:{days:1,msg:'Boarded twice over means somebody meant it. You keep walking.',tag:'PASSED BY'} },
    ]},

  // ---- Keepsake rare events: gated on the draft's keepsake flag
  // (keepsake_<id>, stamped by App.jsx the moment the piece is chosen), so
  // each can only ever be drawn into a run carrying that keepsake — the
  // same requiresFlags machinery as the callback chains below, no special
  // casing. All 'quiet' on purpose: a keepsake's job is reflection, not
  // tactics, and the pacing curve draws quiet beats as breathers.
  { id:'event_roadside_chapel', title:'The Roadside Chapel', type:'quiet', requiresFlags:['keepsake_bible'],
    body:['A clapboard chapel leans at the edge of a burned field, door open, pews full of dust.','Someone swept the front step not long ago.'],
    choices:[
      { text:'Sit in the front pew a while', characterImpact:{compassion:1},
        result:{days:2,health:2,msg:'You read where the ribbon marks. The roof holds, the words hold, and for one night that\'s the whole world.',tag:'SANCTUARY',setFlags:['read_the_verse']} },
      { text:'Search the vestry for supplies', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:1,health:1,msg:'Candles, matches, a tin of crackers behind the hymnals. Whoever swept the step left them on purpose.'},
        fail:{days:1,msg:'Nothing but dust and hymnals. Still, the quiet was worth the stop.'} },
      { text:'Keep moving — churches draw people',
        result:{days:1,msg:'You leave the door open the way you found it.',tag:'MOVED ON'} },
    ]},
  { id:'event_tape_deck', title:'The Tape Deck', type:'quiet', requiresFlags:['keepsake_cassette_tape'],
    body:['A music shop, looted of everything but the things nobody needed.','On the counter: a boombox, and next to it, batteries still in their packaging.'],
    choices:[
      { text:'Play the tape, volume low',
        result:{days:1,health:2,msg:'The song is exactly as you remember, which is the entire point of it. You let it play through twice.',tag:'ONE MORE SONG',setFlags:['played_the_tape']} },
      { text:'Take the batteries and go',
        result:{days:1,msg:'Batteries are batteries. The tape stays in your pocket, unplayed — which is its own kind of saving.',tag:'SAVED IT'} },
      { text:'Leave it all for someone else', characterImpact:{compassion:1},
        result:{days:1,msg:"Somebody's going to walk in here someday and need a song more than you do today.",tag:'LEFT THE MUSIC'} },
    ]},
  { id:'event_grave_marker', title:'The Grave Marker', type:'quiet', requiresFlags:['keepsake_dog_collar'],
    body:['Behind a farmhouse, a small grave with a plank marker: "GOOD BOY."','The grass on it is newer than everything else here.'],
    choices:[
      { text:'Bury the collar with him', characterImpact:{compassion:1},
        result:{days:1,health:1,msg:"You dig a hand's depth and lay the collar in. Two good dogs, wherever they are, know each other now.",tag:'LAID TO REST',setFlags:['buried_the_collar']} },
      { text:'Sit with the grave a while. Keep the collar.',
        result:{days:1,msg:'You read the plank three times and hold the collar until the tag stops being cold. Not yet. Not this one.',tag:'NOT YET'} },
      { text:"Move on — it's just a grave",
        result:{days:1,msg:"It's not just a grave, and you know it, and you keep walking anyway.",tag:'WALKED ON'} },
    ]},
  { id:'event_overlook', title:'The Overlook', type:'quiet', requiresFlags:['keepsake_wedding_ring'],
    body:['A scenic overlook above the valley — the kind with initials carved into the rail a hundred deep.','You know this place. You\'ve stood here before, in the world that was.'],
    choices:[
      { text:'Carve both your initials, one more time', characterImpact:{compassion:1},
        result:{days:1,health:1,msg:'The knife work is slow and you do it right. Whatever happens on the road ahead, the rail remembers you both now.',tag:'CARVED',setFlags:['carved_initials']} },
      { text:'Stand a while, then go',
        result:{days:1,msg:'The valley looks almost untouched from up here. Almost is a good word. You keep it.',tag:'STOOD WATCH'} },
      { text:"Don't stop. Some places cost too much.",
        result:{days:1,msg:'You pass the turnoff without slowing. Grief is heavy enough without souvenirs.',tag:'PASSED BY'} },
    ]},

  // ---- Hidden routes (Sprint 2): callback events whose triggering flag can
  // ONLY be set by an identity choice — a whole later beat that exists
  // because of who this run is, not just what it rolled. Same requiresFlags
  // machinery as the reputation callbacks below.
  { id:'event_holdout_caravan', title:'The Caravan', type:'quiet', requiresFlags:['befriended_holdout'],
    body:['A trade caravan is drawn up across the road ahead — wary faces, rifles low but present.','Then a familiar voice: the holdout from the boarded store, riding shotgun on the lead wagon.'],
    choices:[
      { text:'Let him vouch for you',
        result:{days:1,health:2,msg:'"This one knocks," he tells them, and apparently that means something out here. You trade fair, eat hot, and leave with the road ahead mapped.',tag:'VOUCHED FOR'} },
      { text:'Trade news of the road behind you', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,msg:'Your account of the road south buys passage and a warning about the road north. Fair exchange.'},
        fail:{days:1,msg:'Your news is older than theirs. They let you pass anyway — for his sake, not yours.'} },
      { text:'Nod and keep your distance',
        result:{days:1,msg:'You pass wide of the wagons. He raises two fingers off the rail as you go, and that\'s enough.',tag:'MOVED ON'} },
    ]},
  { id:'event_photograph_returned', title:'The Photograph, Returned', type:'quiet', requiresFlags:['gave_the_photograph'],
    body:['A kid runs you down on the open road — ten, maybe eleven, breathless, holding something flat and creased.',"It's your photograph. The one you slipped under the daycare door."],
    choices:[
      { text:'Take it back, and hear what happened', characterImpact:{compassion:1},
        result:{days:1,health:2,msg:'They made it out — all three kids, the woman, everyone. She kept the photo so they\'d remember the stranger who fed them. You carry it differently now.',tag:'RETURNED'} },
      { text:'Tell the kid to keep it', characterImpact:{compassion:1},
        result:{days:1,health:1,msg:'"Somebody should be on somebody\'s wall," you tell him. He runs it home like it\'s worth more than food. Maybe it is.',tag:'ON SOMEBODY\'S WALL'} },
      { text:'Take it with a nod and keep moving',
        result:{days:1,msg:"You don't trust your voice with more than thanks. The kid seems to understand.",tag:'NO WORDS'} },
    ]},

  // ---- Callback events: gated by requiresFlags, so they can't be drawn into
  // a run's initial sequence (flags start empty) and only enter play once
  // pickNextEvent() re-evaluates eligibility against the run's current flags
  // and finds the triggering flag now satisfied. Each pair is mutually
  // exclusive via excludeFlags on the other branch's flag.
  { id:'event_bridge_toll_repaid', title:'The Bridge Toll, Repaid', type:'quiet', requiresFlags:['paid_toll'], excludeFlags:['robbed_toll'],
    body:['The three from the toll bridge are camped just off the road.','They wave you over before you can decide to avoid them.'],
    choices:[
      { text:'Sit by their fire a while',
        result:{days:2,health:2,msg:'They remember the toll you paid without a fight. You eat well and leave with a few rounds they can spare.',tag:'REPAID'} },
      { text:'Trade stories, learn what they know', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,msg:'They point you toward a safer stretch of road ahead — payment for a toll you never had to pay.'},
        fail:{days:1,msg:"Small talk goes nowhere. Still, no one's reaching for a weapon."} },
      { text:'Take the offer and keep moving',
        result:{days:1,health:1,msg:'You take what they offer — dry socks, a half-full canteen — and nod your thanks.',tag:'KEPT MOVING'} },
    ]},
  { id:'event_bridge_toll_remembered', title:'The Bridge Toll, Remembered', type:'climax', requiresFlags:['robbed_toll'], excludeFlags:['paid_toll'],
    body:['The toll bridge survivors block the road again.',"They've had time to plan a rematch."],
    choices:[
      { text:"Point to what you did at the nursery — you're not what they think", requiresFlags:['helped_nursery_kids'], flagLabel:'a reputation for mercy',
        result:{days:1,msg:'Word travels. One of them lowers their weapon first. The rest follow, uneasy but not fighting.',tag:'REPUTATION HELD'} },
      { text:'Fight through again', characterImpact:{compassion:-1}, check:{stat:'combat',needed:6,label:'COMBAT'},
        success:{days:2,health:-2,msg:'You break through a second time, but it costs more than the first.'},
        fail:{days:1,health:-5,msg:'Three against one, twice now. You barely crawl clear of the ambush.'} },
      { text:'Try to talk your way out',
        result:{days:1,health:-1,msg:"They're not interested in talking this time. You back away slowly, giving ground.",tag:'BACKED OFF'} },
    ]},
  { id:'event_scavengers_debt', title:"The Scavenger's Debt", type:'quiet', requiresFlags:['spared_scavenger'], excludeFlags:['robbed_scavenger'],
    body:['The scavenger from the pharmacy split waves you down.',"You didn't have to share. You did anyway."],
    choices:[
      { text:'Hear them out',
        result:{days:1,health:2,msg:"They point you to a cache they found but couldn't carry alone. Fair's fair.",tag:'CACHE SHARED'} },
      { text:'Ask what else they know', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,msg:'They mark a safer route on your map, one they paid for in blood to learn.',tag:'ROUTE MARKED'},
        fail:{days:1,msg:"They don't have much else to offer. Still, they meant it."} },
      { text:'Thank them and move on',
        result:{days:1,msg:"You don't need the favor spelled out. A nod is enough between people who split things evenly.",tag:'MOVED ON'} },
    ]},
  { id:'event_scavengers_grudge', title:"The Scavenger's Grudge", type:'climax', requiresFlags:['robbed_scavenger'], excludeFlags:['spared_scavenger'],
    body:['The scavenger you pushed off the pharmacy find is back, not alone.',"They've been talking about you."],
    choices:[
      { text:"Point to what you did at the nursery — you're not a monster", requiresFlags:['helped_nursery_kids'], flagLabel:'a reputation for mercy',
        result:{days:1,health:-1,msg:"They hesitate. Whatever they heard about you, it doesn't fully match what they're hearing now. They let you pass, watching.",tag:'HESITATED'} },
      { text:'Stand your ground', characterImpact:{compassion:-1}, check:{stat:'combat',needed:6,label:'COMBAT'},
        success:{days:1,health:-2,msg:'Numbers or not, you make it clear this ends the same way it started.'},
        fail:{days:1,health:-5,msg:'This time they came prepared. You barely get away.'} },
      { text:'Give up what you took and go', characterImpact:{compassion:1},
        result:{days:1,msg:'You hand back more than you took, just to end it. They let you leave.',tag:'PAID BACK'} },
    ]},
  { id:'event_nursery_repaid', title:'The Nursery, Repaid', type:'quiet', requiresFlags:['helped_nursery_kids'], excludeFlags:['ignored_nursery_kids'],
    body:['The daycare window is empty now, the sign gone.','A note hangs in its place, and a bag of supplies waits below.'],
    choices:[
      { text:'Take it. They wanted you to have it.',
        result:{days:1,health:2,msg:'The bag holds more than they could afford to give. You carry it like it means something, because it does.',tag:'PAID FORWARD'} },
      { text:'Look for where they went', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,health:1,msg:'A chalked arrow on the curb leads to a safer block. They made it out, and left you a map.',tag:'FOUND THE ARROW'},
        fail:{days:1,msg:"Whatever trail they left, you can't read it. You take the bag and move on."} },
      { text:'Leave it for the next person who needs it more', characterImpact:{compassion:1},
        result:{days:1,msg:"You leave the bag exactly where it sat. Someone else's turn.",tag:'LEFT IT'} },
    ]},
  { id:'event_locked_door_still_locked', title:'The Locked Door, Still Locked', type:'quiet', requiresFlags:['ignored_nursery_kids'], excludeFlags:['helped_nursery_kids'],
    body:['You pass the daycare again — the road just bends back this way.',"The sign's still in the window. Nothing else has changed."],
    choices:[
      { text:'Knock this time', characterImpact:{compassion:1},
        result:{days:1,health:-1,msg:'No one answers. No one was ever going to, not anymore. You should have known that before you knocked.',tag:'TOO LATE'} },
      { text:'Search the building anyway', check:{stat:'wits',needed:3,label:'WITS'},
        success:{days:2,msg:"Whoever was inside is long gone. You find a little of what they couldn't carry.",tag:'SEARCHED'},
        fail:{days:1,health:-1,msg:'The building gives you nothing back. Some doors stay closed even after you open them.'} },
      { text:'Keep walking. Same as before.', characterImpact:{compassion:-1},
        result:{days:1,msg:"You don't slow down this time either. It's easier the second time. That's the part that stays with you.",tag:'KEPT WALKING'} },
    ]},

  { id:'event_signal', title:'The Signal', final:true,
    body:['From the bluff: the coast guard station, lights burning, a helicopter on the pad.','The beach between here and there is never empty.'],
    choices:[
      { text:'Raise them on the radio and call in the pad', requiredTrait:'Signal', reqLabel:'Call Rescue',
        result:{days:2,msg:'You key the mic. A voice answers — real, human, alive. "Hold position. We see you. We are coming."',endingId:'military_rescue',win:true,tag:'RESCUE INBOUND'} },
      { text:'Signal the pad with fire and light', requiredTrait:'Fire', reqLabel:'Make Fire',
        result:{days:2,msg:'You build the fire high on the bluff. A searchlight swings, finds you, holds. They come.',endingId:'signal_fire_rescue',win:true,tag:'SEEN'} },
      { text:"Cross the beach on the SEAL's count", requiredCompanion:'seal',
        result:{days:2,msg:'"Move when I move." The beach is a training exercise to him, and you\'re a package to be delivered. You board without firing a shot.',endingId:'ran_the_gauntlet',win:true,tag:'DELIVERED'} },
      { text:'Make the run for the pad yourself', check:{stat:'combat',needed:7,label:'COMBAT'},
        success:{days:2,msg:'You cross the beach like the last man alive and haul yourself onto the pad as the rotors spin up.',endingId:'ran_the_gauntlet',win:true},
        fail:{days:1,health:-6,msg:'The beach is longer and fuller than it looked. You reach the pad — but the horizon nearly kept you.',endingId:'barely_made_it',winIfAlive:true,deathEndingId:'lost_on_the_sand'} },
    ]},
];
