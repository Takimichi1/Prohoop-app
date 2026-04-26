export const schedule = [
  {
    day: "Monday", label: "Strength + Core", tag: "STRENGTH", color: "#FF6B35",
    workouts: [
      { category: "Warm-Up", exercises: [
        { name: "Hip circles", sets: 2, reps: "10 each", note: "Standing, loosen hips", trackerType: "reps", targetReps: 10 },
        { name: "Arm swings", sets: 2, reps: "15", note: "Cross-body + overhead", trackerType: "reps", targetReps: 15 },
        { name: "Slow bodyweight squat", sets: 2, reps: "10", note: "3-second descent, silent", trackerType: "reps", targetReps: 10 },
        { name: "Thoracic rotations", sets: 2, reps: "8 each", note: "On all fours", trackerType: "reps", targetReps: 8 },
      ]},
      { category: "Lower Body", exercises: [
        { name: "Bulgarian split squat", sets: 4, reps: "10 each", note: "Rear foot elevated — single-leg power, no impact", trackerType: "reps", targetReps: 10 },
        { name: "Romanian deadlift", sets: 4, reps: "12", note: "Slow eccentric — hamstring strength, injury prevention", trackerType: "reps", targetReps: 12 },
        { name: "Wall sit", sets: 3, reps: "60 sec", note: "Quad endurance for late-game stability", trackerType: "time", targetReps: 60 },
        { name: "Calf raises (slow)", sets: 4, reps: "20", note: "On step edge, lower silently — ankle stability", trackerType: "reps", targetReps: 20 },
      ]},
      { category: "Upper Body", exercises: [
        { name: "Push-up variations", sets: 4, reps: "15", note: "Wide → close-grip → archer", trackerType: "reps", targetReps: 15 },
        { name: "Towel row (door anchor)", sets: 4, reps: "12", note: "Back strength for post play", trackerType: "reps", targetReps: 12 },
        { name: "Pike push-up", sets: 3, reps: "10", note: "Shoulder development for shooting arc", trackerType: "reps", targetReps: 10 },
        { name: "Chair dip", sets: 3, reps: "12", note: "Tricep + chest — carpet, quiet", trackerType: "reps", targetReps: 12 },
      ]},
      { category: "Core", exercises: [
        { name: "Dead bug", sets: 3, reps: "10 each", note: "Pro-level core stability", trackerType: "reps", targetReps: 10 },
        { name: "Plank → side plank", sets: 3, reps: "45 sec", note: "Full core + obliques", trackerType: "time", targetReps: 45 },
        { name: "Hollow body hold", sets: 3, reps: "30 sec", note: "Body control — gymnast staple", trackerType: "time", targetReps: 30 },
        { name: "Pallof press (band)", sets: 3, reps: "12 each", note: "Anti-rotation — protects spine in contact", trackerType: "reps", targetReps: 12 },
      ]},
    ]
  },
  {
    day: "Tuesday", label: "Ball Handling + Footwork", tag: "SKILL", color: "#00B4D8",
    workouts: [
      { category: "Warm-Up", exercises: [
        { name: "Wrist rolls", sets: 2, reps: "30 sec", note: "Ball control prep", trackerType: "check" },
        { name: "Finger taps (ball on floor)", sets: 2, reps: "30 sec", note: "Dribble sensitivity", trackerType: "check" },
        { name: "Lateral shuffle (slow)", sets: 2, reps: "30 sec", note: "Soft feet — no stomping", trackerType: "check" },
      ]},
      { category: "Ball Handling", exercises: [
        { name: "Two-ball dribble", sets: 5, reps: "60 sec", note: "Alternating, same-time, crossover", trackerType: "time", targetReps: 60 },
        { name: "Figure-8 dribble", sets: 3, reps: "60 sec", note: "Low, fast, controlled", trackerType: "time", targetReps: 60 },
        { name: "Pound dribble series", sets: 3, reps: "60 sec", note: "Right → left → alternating", trackerType: "time", targetReps: 60 },
        { name: "Spider dribble", sets: 3, reps: "45 sec", note: "4-touch sequence", trackerType: "time", targetReps: 45 },
      ]},
      { category: "Shooting Mechanics", exercises: [
        { name: "Shot form mirror work", sets: 5, reps: "10", note: "BEEF — Balance, Eyes, Elbow, Follow-through", trackerType: "reps", targetReps: 10 },
        { name: "Chair shooting simulation", sets: 3, reps: "10", note: "Sit → stand → release", trackerType: "reps", targetReps: 10 },
        { name: "Wrist snap backspin drill", sets: 3, reps: "20", note: "Snap ball upward, catch — feel the rotation", trackerType: "reps", targetReps: 20 },
      ]},
      { category: "Footwork", exercises: [
        { name: "Jab step series", sets: 3, reps: "8 each", note: "Slow, deliberate — plant and shift", trackerType: "reps", targetReps: 8 },
        { name: "Pivot sequences", sets: 3, reps: "10", note: "Front + back pivot with simulated pass", trackerType: "reps", targetReps: 10 },
        { name: "Drop-step footwork", sets: 3, reps: "10 each", note: "Post move essential — soft landings", trackerType: "reps", targetReps: 10 },
        { name: "Seal-and-catch positioning", sets: 3, reps: "10", note: "Back-to-basket receiving stance", trackerType: "reps", targetReps: 10 },
      ]},
    ]
  },
  {
    day: "Wednesday", label: "Mobility + Recovery", tag: "RECOVER", color: "#4CAF50",
    workouts: [
      { category: "Active Recovery", exercises: [
        { name: "90/90 hip stretch", sets: 3, reps: "60 sec each", note: "Most neglected area in tall players", trackerType: "time", targetReps: 60 },
        { name: "Pigeon pose", sets: 3, reps: "90 sec each", note: "Glute + hip flexor release", trackerType: "time", targetReps: 90 },
        { name: "Thoracic extension (foam roller)", sets: 3, reps: "10", note: "Counteracts hunching from height", trackerType: "reps", targetReps: 10 },
        { name: "World's greatest stretch", sets: 3, reps: "5 each", note: "Full-body mobility in one move", trackerType: "reps", targetReps: 5 },
        { name: "Doorway pec stretch", sets: 3, reps: "30 sec", note: "Open chest for shooting mechanics", trackerType: "time", targetReps: 30 },
        { name: "Lying hamstring stretch", sets: 3, reps: "60 sec each", note: "Towel around foot, door frame assist", trackerType: "time", targetReps: 60 },
        { name: "Ankle circles + dorsiflexion", sets: 3, reps: "30 sec", note: "Ankle mobility = lateral quickness", trackerType: "time", targetReps: 30 },
        { name: "Cat-cow spinal flow", sets: 3, reps: "10", note: "Spinal health — crucial for longevity", trackerType: "reps", targetReps: 10 },
      ]},
      { category: "Mental Game", exercises: [
        { name: "Game film study", sets: 1, reps: "30–45 min", note: "Wemby, Giannis, KD — study movement patterns", trackerType: "check" },
        { name: "Visualization", sets: 1, reps: "10 min", note: "Eyes closed — walk 5 possessions in full detail", trackerType: "check" },
        { name: "Journaling", sets: 1, reps: "10 min", note: "What improved? What's weak? Goal tracking", trackerType: "check" },
      ]},
    ]
  },
  {
    day: "Thursday", label: "Explosive Power + Agility", tag: "POWER", color: "#9B59B6",
    workouts: [
      { category: "Warm-Up", exercises: [
        { name: "Hip flexor march", sets: 2, reps: "15 each", note: "Driving knees up slowly", trackerType: "reps", targetReps: 15 },
        { name: "Lateral band walk", sets: 2, reps: "15 each", note: "Hip abductor activation", trackerType: "reps", targetReps: 15 },
        { name: "Glute bridge", sets: 2, reps: "15", note: "Posterior chain prep", trackerType: "reps", targetReps: 15 },
      ]},
      { category: "Plyometrics (Low-Impact)", exercises: [
        { name: "Slow-motion squat jump", sets: 4, reps: "10", note: "Explode up, land SLOWLY — trains fast-twitch silently", trackerType: "reps", targetReps: 10 },
        { name: "Standing broad jump → stick", sets: 4, reps: "6", note: "Jump forward, absorb landing quietly", trackerType: "reps", targetReps: 6 },
        { name: "Lateral bound → hold", sets: 3, reps: "8 each", note: "Land and balance 2 sec — defensive slide power", trackerType: "reps", targetReps: 8 },
        { name: "Depth drop (low step)", sets: 3, reps: "8", note: "Step off book, land softly — teaches deceleration", trackerType: "reps", targetReps: 8 },
      ]},
      { category: "Agility", exercises: [
        { name: "Tape ladder drills", sets: 5, reps: "4 lengths", note: "Tape on carpet — 2-in-2-out, lateral icky shuffle", trackerType: "reps", targetReps: 4 },
        { name: "Slow-motion defensive slide", sets: 4, reps: "30 sec", note: "Full-speed mechanics, half-speed execution", trackerType: "time", targetReps: 30 },
        { name: "Cone change-of-direction", sets: 3, reps: "8 each", note: "Water bottles as cones — plant and drive", trackerType: "reps", targetReps: 8 },
        { name: "Reaction step drill", sets: 3, reps: "60 sec", note: "On buzz, quick shuffle direction change", trackerType: "time", targetReps: 60 },
      ]},
      { category: "Posterior Chain", exercises: [
        { name: "Single-leg glute bridge", sets: 4, reps: "15 each", note: "Hamstring + glute balance — prevents ACL", trackerType: "reps", targetReps: 15 },
        { name: "Nordic curl (couch)", sets: 3, reps: "6", note: "#1 hamstring injury prevention exercise", trackerType: "reps", targetReps: 6 },
        { name: "Hip thrust (floor)", sets: 4, reps: "15", note: "Shoulders on couch, explosive hip extension", trackerType: "reps", targetReps: 15 },
      ]},
    ]
  },
  {
    day: "Friday", label: "Basketball Skills Lab", tag: "SKILLS", color: "#F7DC6F",
    workouts: [
      { category: "🏀 Shooting Mechanics", exercises: [
        { name: "Form shooting (mini hoop)", sets: 10, reps: "10 makes", note: "Close range, perfect form — track makes", trackerType: "shot", targetReps: 100 },
        { name: "Off-the-dribble pull-up", sets: 5, reps: "10", note: "One dribble into shot — simulate game pull-up", trackerType: "shot", targetReps: 50 },
        { name: "Catch-and-shoot footwork", sets: 5, reps: "10 each", note: "Step into imaginary catch, load, release", trackerType: "shot", targetReps: 50 },
        { name: "Wrist snap backspin", sets: 3, reps: "20", note: "Snap ball up, catch — feel the rotation", trackerType: "reps", targetReps: 20 },
      ]},
      { category: "🎯 Post Moves (6'7\" = Post Mandatory)", exercises: [
        { name: "Drop step (left + right)", sets: 4, reps: "8 each", note: "Pivot hard, explode baseline", trackerType: "reps", targetReps: 8 },
        { name: "Up-and-under", sets: 3, reps: "6 each", note: "Fake → duck under → layup", trackerType: "reps", targetReps: 6 },
        { name: "Jump hook", sets: 4, reps: "10 each", note: "Off glass — unblockable at your height", trackerType: "reps", targetReps: 10 },
        { name: "Spin move (post)", sets: 3, reps: "6 each", note: "Shoulder seal → quick spin → finish", trackerType: "reps", targetReps: 6 },
        { name: "Turnaround mid-range", sets: 4, reps: "8 each", note: "Catch on block, turn, shoot", trackerType: "shot", targetReps: 32 },
      ]},
      { category: "🔀 Perimeter Skills", exercises: [
        { name: "Hesitation dribble", sets: 3, reps: "10 each", note: "Sell the stop, explode past defender", trackerType: "reps", targetReps: 10 },
        { name: "Euro step (low-impact)", sets: 3, reps: "8 each", note: "2-step gather — lateral around defender", trackerType: "reps", targetReps: 8 },
        { name: "Step-back 3-point sim", sets: 4, reps: "8", note: "Jab → step-back → rise and fire", trackerType: "shot", targetReps: 32 },
        { name: "Pull-up mid-range", sets: 4, reps: "10", note: "Drive, gather, pull up at elbow", trackerType: "shot", targetReps: 40 },
      ]},
      { category: "🛡️ Defensive Skills", exercises: [
        { name: "Close-out technique", sets: 3, reps: "10", note: "Sprint → brake → hand high, low hips", trackerType: "reps", targetReps: 10 },
        { name: "Ball denial stance", sets: 3, reps: "30 sec", note: "Body between ball and man — hold it", trackerType: "time", targetReps: 30 },
        { name: "Help-side positioning", sets: 3, reps: "10 rotations", note: "See ball + man — rotate through positions", trackerType: "reps", targetReps: 10 },
        { name: "Box-out technique", sets: 3, reps: "10 each", note: "Contact → pivot into them → seal → locate ball", trackerType: "reps", targetReps: 10 },
      ]},
      { category: "🧠 Basketball IQ", exercises: [
        { name: "Play drawing session", sets: 1, reps: "20 min", note: "Draw offensive sets, defensive rotations", trackerType: "check" },
        { name: "Film breakdown", sets: 1, reps: "30 min", note: "One player, your position — study spacing", trackerType: "check" },
        { name: "Verbalize read-react", sets: 1, reps: "15 min", note: "If X happens, I do Y — out loud", trackerType: "check" },
      ]},
      { category: "✋ Grip Strength", exercises: [
        { name: "Hand gripper", sets: 3, reps: "20 each", note: "Ball security + shot control", trackerType: "reps", targetReps: 20 },
        { name: "Rice bucket drill", sets: 3, reps: "3 min", note: "Open/close hands in rice — pro-level finger strength", trackerType: "time", targetReps: 180 },
        { name: "Towel wringing", sets: 3, reps: "30 sec", note: "Wring both directions — forearm + wrist", trackerType: "time", targetReps: 30 },
      ]},
    ]
  },
  {
    day: "Saturday", label: "Full Court Practice", tag: "COURT", color: "#E74C3C",
    workouts: [
      { category: "🏟️ Court Day — Go ALL OUT", exercises: [
        { name: "Full shooting session", sets: 1, reps: "300–500 shots", note: "Corners, wings, mid-range, 3s, free throws", trackerType: "shot", targetReps: 400 },
        { name: "Live dribble moves", sets: 1, reps: "30 min", note: "Hesitation, euro step, spin, step-back", trackerType: "check" },
        { name: "Post footwork (live)", sets: 1, reps: "20 min", note: "Drop step, up-and-under, jump hook — full speed", trackerType: "check" },
        { name: "Pickup game or 1v1", sets: 1, reps: "As long as possible", note: "Film yourself — competition is irreplaceable", trackerType: "check" },
        { name: "Free throw ritual", sets: 1, reps: "50 makes", note: "End EVERY session here — non-negotiable", trackerType: "shot", targetReps: 50 },
      ]},
    ]
  },
  {
    day: "Sunday", label: "Rest + Nutrition", tag: "REST", color: "#7F8C8D",
    workouts: [
      { category: "Recovery Protocol", exercises: [
        { name: "Sleep 9+ hours", sets: 1, reps: "—", note: "Growth hormone + skill consolidation peak in sleep", trackerType: "check" },
        { name: "Walking only", sets: 1, reps: "20–30 min", note: "Light blood flow — no intensity", trackerType: "check" },
        { name: "Nutrition audit", sets: 1, reps: "—", note: "~3,200–3,500 kcal. 180–200g protein", trackerType: "check" },
        { name: "Hydration — 3.5–4L", sets: 1, reps: "—", note: "Performance drops sharply at 2% dehydration", trackerType: "check" },
        { name: "Contrast shower (legs)", sets: 1, reps: "10 min", note: "2 min hot → 30 sec cold, repeat", trackerType: "check" },
      ]},
    ]
  },
];
