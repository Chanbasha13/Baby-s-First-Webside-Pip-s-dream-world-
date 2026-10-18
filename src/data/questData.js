// ==========================================================================
// Secret Dream Quest — Clues, Story Fragments & Secret Letter
// HaX.baby Hackathon: Creativity & Surprises Category
// ==========================================================================

export const QUEST_CLUE_IDS = ['star', 'lantern', 'moon'];

export const QUEST_CLUES = {
  star: {
    id: 'star',
    title: 'Attic Spark',
    clueName: 'The Rafter Star',
    glyph: '✦',
    sectionId: 'story',
    locationName: 'Chapter I · Origin Story (Scene 01)',
    locationHint: 'Resting in the high attic eaves of the Midnight Nursery rafters',
    storyFragment:
      '“Late at night, when the nursery roof groans under cold winds, I found this little star shivering between two pine rafters. It had drifted far from its cluster. I didn’t have my full toolset yet — just a brass pocket caliper and a warm woolen handkerchief. I learned something important that night: dreams don’t always need fixing with wrenches. Sometimes they just need someone to sit with them in the dark until their pulse steadies.”',
    logEntry:
      'Observation Log #01: Attic salvage confirmed. Luminance restored from 22% to a steady 84%. Woolen wrap effective against nocturnal drafts.',
    pipReaction:
      'You found the Rafter Star! Pip wrapped that one in wool on his very first midnight shift. ✦',
  },
  lantern: {
    id: 'lantern',
    title: 'Optics Seal',
    clueName: 'The Crescent Lantern Seal',
    glyph: '🏮',
    sectionId: 'projects',
    locationName: 'Chapter III · Dream Inventions (Project 02)',
    locationHint: 'Mounted on the hand-polished brass frame of the Nightlight Collection',
    storyFragment:
      '“Standard lanterns cast sharp, angular shadows that stretch across bedroom floors like spiders. Children don’t fear the dark itself; they fear the shapes that hide inside it. I ground this crescent prism by hand, three hundred circular passes with fine pumice paste. When candlelight filters through the curve, every corner turns round, soft, and quiet. Darkness isn’t an enemy anymore — it’s just the blanket before morning.”',
    logEntry:
      'Optics Inspection #12: Dispersion curvature verified at 140°. No harsh corners detected. Soft candlelight spectrum approved.',
    pipReaction:
      'The Crescent Lantern Seal unlocked! Pip spent three shifts hand-grinding that glass. ✦',
  },
  moon: {
    id: 'moon',
    title: 'Flight Token',
    clueName: 'The Silver Crescent Flight Slip',
    glyph: '🌙',
    sectionId: 'game',
    locationName: 'Chapter IV · Catch the Falling Dreams',
    locationHint: 'Tucked behind the Midnight Shift flight portal briefing',
    storyFragment:
      '“Before we load the 04:30 dawn gliders, every dream crate gets an inspection slip stamped with a tiny silver crescent. It tells the flight crew: this package has been checked for turbulence, balanced for smooth gliding, and addressed to a specific sleeping child. The child on Cloud Route 4 asked for a dream about flying over quiet lavender hills. I tucked an extra pinch of sweet clover inside just in case.”',
    logEntry:
      'Waybill Verification #07: Silver slip stamped and certified. Skiff aerodynamics balanced. Outbound flight cleared for departure.',
    pipReaction:
      'The Silver Flight Slip recovered! The dawn gliders are cleared for takeoff. ✦',
  },
};

export const SECRET_LETTER = {
  title: 'Pip’s Secret Letter to a Midnight Friend',
  shiftLabel: 'Midnight Shift · Station #07 · Private Dispatch',
  greeting: 'Dear Fellow Dream Keeper,',
  paragraphs: [
    'If you are reading this, you looked past the blueprints and the shiny dials and found the little quiet pieces I left tucked away in the nursery corners.',
    'When I was first assigned to Station #07, the older engineers told me my job was purely mechanical: keep the chime springs wound, keep the lantern wicks trimmed, and sort falling dreams into tidy pine boxes before sunrise. But dreams aren’t machine parts. They are delicate thoughts that people carry when the world gets too loud or too heavy to bear.',
    'Every star you clicked, every chime you heard, and every hidden clue you uncovered proves you understand what this nursery is really for. It’s for making sure that whoever falls asleep tonight feels safe, watched over, and never forgotten in the dark.',
    'Thank you for walking the midnight shift with me. Keep your eyes on the stars, speak gently to the quiet hours, and never let anyone tell you that gentle things are weak.',
  ],
  signoff: 'With warm starlight and gratitude,',
  signature: 'Pip',
  signatureTitle: 'Apprentice Dream Engineer · Midnight Nursery Station #07',
  waxSealText: 'STATION 07 · SEAL UNLOCKED',
};

