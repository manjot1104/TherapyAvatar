// src/data/scenarios.ts
export type Q = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type Block = {
  title: string;
  questions: Q[]; // 3 per block
};

export type Scenario = {
  key: string;         // unique id
  title: string;
  skillLabel: string;  // UI label
  blocks: Block[];     // 10 blocks
};

export const SCENARIOS: Record<string, Scenario> = {
  /* =========================================================
     1) GREETING A TEACHER
     ========================================================= */
  greeting_teacher: {
    key: "greeting_teacher",
    title: "Greeting a Teacher at School",
    skillLabel: "Social Greeting",
    blocks: [
      {
        title: "Recognize Person",
        questions: [
          { prompt: "Who is this near the classroom?", options: ["Teacher", "Policeman", "Dog"], correctIndex: 0 },
          { prompt: "Is she known from school or a stranger?", options: ["Known", "Stranger"], correctIndex: 0 },
          { prompt: "What do we call her?", options: ["Ma’am", "Uncle"], correctIndex: 0 },
        ],
      },
      {
        title: "Approach Politely",
        questions: [
          { prompt: "When you see your teacher, do you…", options: ["Walk up slowly", "Run away"], correctIndex: 0 },
          { prompt: "Your face should be…", options: ["Smiling", "Funny face"], correctIndex: 0 },
          { prompt: "Eyes look at…", options: ["Her eyes", "Floor", "Ceiling"], correctIndex: 0 },
        ],
      },
      {
        title: "Start the Greeting",
        questions: [
          { prompt: "What can you say first?", options: ["Hi ma’am", "Go away"], correctIndex: 0 },
          { prompt: "Voice should be…", options: ["Soft", "Shouting"], correctIndex: 0 },
          { prompt: "Morning polite word?", options: ["Good morning", "Later"], correctIndex: 0 },
        ],
      },
      {
        title: "Respond to Greeting",
        questions: [
          { prompt: "Teacher says ‘Good morning!’ You say…", options: ["Good morning, ma’am", "Hmm"], correctIndex: 0 },
          { prompt: "Body faces…", options: ["Her", "Away"], correctIndex: 0 },
          { prompt: "Add one polite line:", options: ["How are you ma’am?", "Nothing"], correctIndex: 0 },
        ],
      },
      {
        title: "Body Language",
        questions: [
          { prompt: "Do you wave, hide, or push?", options: ["Wave", "Hide", "Push"], correctIndex: 0 },
          { prompt: "Friendly face…", options: ["Smile", "Frown"], correctIndex: 0 },
          { prompt: "Hands should be…", options: ["Still", "Flapping"], correctIndex: 0 },
        ],
      },
      {
        title: "Teacher is Busy",
        questions: [
          { prompt: "She’s talking to another child. You…", options: ["Wait", "Shout"], correctIndex: 0 },
          { prompt: "Wait how long before trying again?", options: ["A few seconds", "Keep shouting"], correctIndex: 0 },
          { prompt: "Then say…", options: ["Excuse me ma’am", "Hey listen"], correctIndex: 0 },
        ],
      },
      {
        title: "Maintain Conversation",
        questions: [
          { prompt: "‘How are you?’ You say…", options: ["I’m fine, thank you", "No talk"], correctIndex: 0 },
          { prompt: "Ask back:", options: ["How are you?", "Bye"], correctIndex: 0 },
          { prompt: "Don’t understand? Say…", options: ["Can you repeat please?", "Ignore"], correctIndex: 0 },
        ],
      },
      {
        title: "End Politely",
        questions: [
          { prompt: "To end, say…", options: ["See you later ma’am", "Nothing"], correctIndex: 0 },
          { prompt: "Walk away while she’s talking?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "Goodbye action:", options: ["Wave", "Ignore"], correctIndex: 0 },
        ],
      },
      {
        title: "Mistakes/Shyness",
        questions: [
          { prompt: "Forgot to greet. Now…", options: ["Say sorry and greet later", "Leave"], correctIndex: 0 },
          { prompt: "Feel shy. Try…", options: ["Smile and wave first", "Hide"], correctIndex: 0 },
          { prompt: "She greets first. You…", options: ["Greet back", "Ignore"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalize",
        questions: [
          { prompt: "Guard ko greet:", options: ["Good morning sir", "Hi dude"], correctIndex: 0 },
          { prompt: "Classmate ko:", options: ["Hi (name)", "Good morning ma’am"], correctIndex: 0 },
          { prompt: "When greeted, you feel…", options: ["Happy", "Scared"], correctIndex: 0 },
        ],
      },
    ],
  },

  /* =========================================================
     2) ASKING FOR HELP POLITELY
     ========================================================= */
  ask_help: {
    key: "ask_help",
    title: "Asking for Help Politely",
    skillLabel: "Requesting Help",
    blocks: [
      {
        title: "Know Need",
        questions: [
          { prompt: "Lunch box nahi khul raha. You…", options: ["Ask for help", "Throw it", "Cry"], correctIndex: 0 },
          { prompt: "Help kab maangni?", options: ["Try karke bhi na ho", "Bina try"], correctIndex: 0 },
          { prompt: "Hard ho to help sahi?", options: ["Yes", "No"], correctIndex: 0 },
        ],
      },
      {
        title: "Right Person",
        questions: [
          { prompt: "In class, kisse pucho?", options: ["Teacher", "Stranger"], correctIndex: 0 },
          { prompt: "Playground pe?", options: ["Teacher on duty", "Run away"], correctIndex: 0 },
          { prompt: "Known ya stranger?", options: ["Known person", "Stranger"], correctIndex: 0 },
        ],
      },
      {
        title: "Start Request",
        questions: [
          { prompt: "First two words:", options: ["Excuse me", "Hey you"], correctIndex: 0 },
          { prompt: "Then bolo:", options: ["Please help me", "Do it yourself"], correctIndex: 0 },
          { prompt: "Voice:", options: ["Calm & clear", "Loud/Crying"], correctIndex: 0 },
        ],
      },
      {
        title: "Show Need",
        questions: [
          { prompt: "Words mushkil? You…", options: ["Point", "Cry"], correctIndex: 0 },
          { prompt: "Help ka gesture:", options: ["Raise hand", "Clap"], correctIndex: 0 },
          { prompt: "Teacher ki cheez bina puchhe uthao?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Wait After Ask",
        questions: [
          { prompt: "Ask ke baad?", options: ["Wait", "Shout again"], correctIndex: 0 },
          { prompt: "Calm wait:", options: ["Deep breaths", "Kick chair"], correctIndex: 0 },
          { prompt: "Helping another child; pull her hand?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Accept Help",
        questions: [
          { prompt: "Teacher aayi. You say…", options: ["Thank you", "Finally!"], correctIndex: 0 },
          { prompt: "She shows how. Try again?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Happy face:", options: ["Smile", "Frown"], correctIndex: 0 },
        ],
      },
      {
        title: "If Not Heard",
        questions: [
          { prompt: "Didn’t hear you. You…", options: ["Wait & ask again politely", "Shout"], correctIndex: 0 },
          { prompt: "Urgent ho to:", options: ["Another teacher", "Run away"], correctIndex: 0 },
          { prompt: "Hit/throw allowed?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Help a Friend",
        questions: [
          { prompt: "Friend struggling. You…", options: ["Call teacher", "Laugh"], correctIndex: 0 },
          { prompt: "Say to friend:", options: ["Do you need help?", "Nothing"], correctIndex: 0 },
          { prompt: "Kab help alone na karein?", options: ["Danger (fire/electric)", "Always help"], correctIndex: 0 },
        ],
      },
      {
        title: "Handle Correction",
        questions: [
          { prompt: "Teacher: ‘Try yourself.’ You…", options: ["Okay", "No!"], correctIndex: 0 },
          { prompt: "Mistake hua:", options: ["Say sorry", "Blame"], correctIndex: 0 },
          { prompt: "Learning with help feels…", options: ["Good", "Bad"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalize",
        questions: [
          { prompt: "At home ask…", options: ["Mom/Dad", "Stranger"], correctIndex: 0 },
          { prompt: "Shop me bolo:", options: ["Excuse me, can you help me?", "Where is it?"], correctIndex: 0 },
          { prompt: "End talk:", options: ["Thank you / Bye", "Leave"], correctIndex: 0 },
        ],
      },
    ],
  },

  /* =========================================================
     3) WAITING FOR YOUR TURN
     ========================================================= */
  wait_turn: {
    key: "wait_turn",
    title: "Waiting for Your Turn",
    skillLabel: "Turn-taking",
    blocks: [
      {
        title: "What is a Turn?",
        questions: [
          { prompt: "Games go…", options: ["One by one", "All at once"], correctIndex: 0 },
          { prompt: "‘My turn’ means…", options: ["My time", "Your time"], correctIndex: 0 },
          { prompt: "‘Your turn’ means…", options: ["Other’s time", "My time"], correctIndex: 0 },
        ],
      },
      {
        title: "Whose Turn?",
        questions: [
          { prompt: "Teacher: ‘Ravi’s turn’. You…", options: ["Wait", "Grab"], correctIndex: 0 },
          { prompt: "Know your turn is coming when…", options: ["Name is called", "Guess"], correctIndex: 0 },
          { prompt: "Grab toy before name?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "While Waiting",
        questions: [
          { prompt: "Hands:", options: ["On lap", "Taking toy", "Waving"], correctIndex: 0 },
          { prompt: "Look at:", options: ["Player", "Ceiling"], correctIndex: 0 },
          { prompt: "Think quietly:", options: ["I can wait my turn", "I want now"], correctIndex: 0 },
        ],
      },
      {
        title: "Long Waits",
        questions: [
          { prompt: "Feels long. Do…", options: ["Deep breaths", "Yell"], correctIndex: 0 },
          { prompt: "Keep busy:", options: ["Count to 5", "Kick chair"], correctIndex: 0 },
          { prompt: "Forgot whose turn. Ask…", options: ["Is it my turn now?", "Give me"], correctIndex: 0 },
        ],
      },
      {
        title: "Taking Turn",
        questions: [
          { prompt: "When it’s yours, say…", options: ["My turn!", "Give me!"], correctIndex: 0 },
          { prompt: "Push to take?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "After finish, say…", options: ["Now your turn", "Done"], correctIndex: 0 },
        ],
      },
      {
        title: "Losing Turn",
        questions: [
          { prompt: "Lose a turn. Say…", options: ["Okay, next time", "Nooo"], correctIndex: 0 },
          { prompt: "Don’t…", options: ["Cry/Throw/Leave angry", "Breathe"], correctIndex: 0 },
          { prompt: "Feel better by…", options: ["Breathing/Hug", "Shouting"], correctIndex: 0 },
        ],
      },
      {
        title: "Fairness",
        questions: [
          { prompt: "Someone took two turns. You say…", options: ["Can I have my turn please?", "Give it!"], correctIndex: 0 },
          { prompt: "Grab back?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "Games are fun when…", options: ["Everyone gets turns", "I only play"], correctIndex: 0 },
        ],
      },
      {
        title: "Everyday Waiting",
        questions: [
          { prompt: "Queue for swing:", options: ["Stand & wait", "Push"], correctIndex: 0 },
          { prompt: "In class to speak:", options: ["Raise hand", "Shout"], correctIndex: 0 },
          { prompt: "Home TV waiting:", options: ["Can I watch after you?", "Give remote"], correctIndex: 0 },
        ],
      },
      {
        title: "Calming Body",
        questions: [
          { prompt: "Impatient → use…", options: ["Stress ball", "Hit"], correctIndex: 0 },
          { prompt: "Feet:", options: ["On floor", "Stamp"], correctIndex: 0 },
          { prompt: "Face while waiting:", options: ["Smile", "Angry"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalize",
        questions: [
          { prompt: "Slide me wait?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Self-talk:", options: ["I can do it", "I can’t"], correctIndex: 0 },
          { prompt: "Friends feel when you wait:", options: ["Happy", "Sad"], correctIndex: 0 },
        ],
      },
    ],
  },

  /* =========================================================
     4) SHARING TOYS & PLAY TURNS
     ========================================================= */
  share_play: {
    key: "share_play",
    title: "Sharing Toys & Taking Turns",
    skillLabel: "Sharing",
    blocks: [
      {
        title: "Sharing Idea",
        questions: [
          { prompt: "Sharing toys is…", options: ["Good", "Bad"], correctIndex: 0 },
          { prompt: "Turn miss? Say…", options: ["Okay, next time", "Cry"], correctIndex: 0 },
          { prompt: "Games fun when…", options: ["Everyone gets turn", "Only me"], correctIndex: 0 },
        ],
      },
      {
        title: "Ask to Share",
        questions: [
          { prompt: "Want toy. You say…", options: ["Can I play after you?", "Give now"], correctIndex: 0 },
          { prompt: "Say ‘please’?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Tone:", options: ["Polite", "Angry"], correctIndex: 0 },
        ],
      },
      {
        title: "Offer Share",
        questions: [
          { prompt: "Your toy. You say…", options: ["Would you like a turn?", "No one"], correctIndex: 0 },
          { prompt: "Set a rule:", options: ["2 minutes each", "Only me"], correctIndex: 0 },
          { prompt: "If friend says no:", options: ["Okay, later", "Grab"], correctIndex: 0 },
        ],
      },
      {
        title: "Swap & Return",
        questions: [
          { prompt: "Swap toys means…", options: ["Exchange turns", "Keep both"], correctIndex: 0 },
          { prompt: "Return on time?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Forget return?", options: ["Sorry, here you go", "Hide it"], correctIndex: 0 },
        ],
      },
      {
        title: "Conflict Fix",
        questions: [
          { prompt: "Both want same toy. You…", options: ["Take turns", "Fight"], correctIndex: 0 },
          { prompt: "Need help → ask…", options: ["Teacher/Parent", "No one"], correctIndex: 0 },
          { prompt: "Hitting allowed?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Praise & Thanks",
        questions: [
          { prompt: "Friend shared. You say…", options: ["Thank you", "Nothing"], correctIndex: 0 },
          { prompt: "Praise makes friend feel…", options: ["Happy", "Bad"], correctIndex: 0 },
          { prompt: "Next time sharing…", options: ["Easier", "Harder"], correctIndex: 0 },
        ],
      },
      {
        title: "Group Play",
        questions: [
          { prompt: "3 kids, 1 toy. Do…", options: ["Turn order", "All grab"], correctIndex: 0 },
          { prompt: "Wait while others play:", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Cheering others is…", options: ["Good", "Bad"], correctIndex: 0 },
        ],
      },
      {
        title: "Respect Rules",
        questions: [
          { prompt: "Use timer rule:", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Break rules?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "If upset:", options: ["Breathe & ask help", "Throw toy"], correctIndex: 0 },
        ],
      },
      {
        title: "Care of Toys",
        questions: [
          { prompt: "Shared toys ko…", options: ["Handle gently", "Break"], correctIndex: 0 },
          { prompt: "After turn:", options: ["Keep back", "Leave anywhere"], correctIndex: 0 },
          { prompt: "Dirty toy:", options: ["Clean/Inform", "Ignore"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalize",
        questions: [
          { prompt: "Home TV sharing:", options: ["Ask turn", "Snatch remote"], correctIndex: 0 },
          { prompt: "Park swing:", options: ["Queue/Turns", "Push others"], correctIndex: 0 },
          { prompt: "Sharing makes friends feel…", options: ["Happy", "Jealous"], correctIndex: 0 },
        ],
      },
    ],
  },

  /* =========================================================
     5) CALMING DOWN WHEN ANGRY
     ========================================================= */
  calm_down: {
    key: "calm_down",
    title: "Calming Down When Angry",
    skillLabel: "Self-regulation",
    blocks: [
      {
        title: "Body Clues",
        questions: [
          { prompt: "Angry body feels…", options: ["Hot", "Cold", "Sleepy"], correctIndex: 0 },
          { prompt: "Face looks…", options: ["Frown", "Smile"], correctIndex: 0 },
          { prompt: "Hands feel…", options: ["Tight", "Soft"], correctIndex: 0 },
        ],
      },
      {
        title: "Name Emotion",
        questions: [
          { prompt: "When mad, say…", options: ["I’m angry", "Nothing"], correctIndex: 0 },
          { prompt: "Is it okay to say it?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Bad words allowed?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Notice Triggers",
        questions: [
          { prompt: "What makes you angry?", options: ["Snatching/Loud", "Nothing"], correctIndex: 0 },
          { prompt: "Think before shouting?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Tell an adult what upset you?", options: ["Yes", "No"], correctIndex: 0 },
        ],
      },
      {
        title: "Stop & Think",
        questions: [
          { prompt: "Say to yourself:", options: ["Stop, breathe, think", "Hit first"], correctIndex: 0 },
          { prompt: "Hit first or stop first?", options: ["Stop first", "Hit first"], correctIndex: 0 },
          { prompt: "Reminder picture:", options: ["Red stop sign", "Skull"], correctIndex: 0 },
        ],
      },
      {
        title: "Breathing",
        questions: [
          { prompt: "Calm using…", options: ["Slow deep breaths", "Shout"], correctIndex: 0 },
          { prompt: "How many breaths?", options: ["3 or more", "0"], correctIndex: 0 },
          { prompt: "Hands kept…", options: ["On tummy", "Throw things"], correctIndex: 0 },
        ],
      },
      {
        title: "Take a Break",
        questions: [
          { prompt: "Breathing not enough. You…", options: ["Ask for a break", "Run outside"], correctIndex: 0 },
          { prompt: "Say to teacher:", options: ["Can I go to calm corner?", "I’m leaving"], correctIndex: 0 },
          { prompt: "Run outside allowed?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Calm Tools",
        questions: [
          { prompt: "Use…", options: ["Squeeze ball", "Throw chair"], correctIndex: 0 },
          { prompt: "Music:", options: ["Soft", "Loud drum"], correctIndex: 0 },
          { prompt: "Ask for calm box?", options: ["Yes", "No"], correctIndex: 0 },
        ],
      },
      {
        title: "Talk After Calm",
        questions: [
          { prompt: "Tell teacher:", options: ["I was angry because…", "Nothing"], correctIndex: 0 },
          { prompt: "Talk while yelling?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "Teacher can say:", options: ["Let’s solve it together", "Stop it"], correctIndex: 0 },
        ],
      },
      {
        title: "Make it Right",
        questions: [
          { prompt: "Shouted at friend. Do…", options: ["Say sorry", "Ignore"], correctIndex: 0 },
          { prompt: "Broke something. Next…", options: ["Tell adult / Help fix", "Hide"], correctIndex: 0 },
          { prompt: "Saying sorry makes friend…", options: ["Feel better", "Angry"], correctIndex: 0 },
        ],
      },
      {
        title: "Confidence",
        questions: [
          { prompt: "After calming, tell yourself…", options: ["I did it!", "Whatever"], correctIndex: 0 },
          { prompt: "Use breathing at home?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Controlling anger feels…", options: ["Happy/Proud", "Bad"], correctIndex: 0 },
        ],
      },
    ],
  },
};
