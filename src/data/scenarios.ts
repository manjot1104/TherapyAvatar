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
        title: "Recognizing a Familiar Person",
        questions: [
          { prompt: "Who is this person standing near the classroom?", options: ["Teacher", "Policeman", "Dog"], correctIndex: 0 },
          { prompt: "Is she someone you know from school or a stranger?", options: ["Someone I know from school", "A stranger"], correctIndex: 0 },
          { prompt: "What do we call her?", options: ["Ma’am", "Uncle"], correctIndex: 0 },
        ],
      },
      {
        title: "Approach Politely",
        questions: [
          { prompt: "When you see your teacher, do you run away or walk up slowly?", options: ["Walk up slowly", "Run away"], correctIndex: 0 },
          { prompt: "Should you smile or make a funny face?", options: ["Smile", "Funny face"], correctIndex: 0 },
          { prompt: "Where should your eyes look when you talk?", options: ["Her eyes", "Floor", "Ceiling"], correctIndex: 0 },
        ],
      },
      {
        title: "Starting the Greeting",
        questions: [
          { prompt: "What can you say first?", options: ["Hi ma’am", "Go away"], correctIndex: 0 },
          { prompt: "When greeting, should you shout or speak softly?", options: ["Speak softly", "Shout"], correctIndex: 0 },
          { prompt: "What is another polite word you can use in the morning?", options: ["Good morning", "Later"], correctIndex: 0 },
        ],
      },
      {
        title: "Responding to Teacher’s Greeting",
        questions: [
          { prompt: "Teacher says ‘Good morning!’ What will you say back?", options: ["Good morning, ma’am!", "Nothing"], correctIndex: 0 },
          { prompt: "Should you turn away or face her while talking?", options: ["Face her", "Turn away"], correctIndex: 0 },
          { prompt: "What can you add after greeting?", options: ["How are you ma’am?", "Nothing"], correctIndex: 0 },
        ],
      },
      {
        title: "Using Body Language",
        questions: [
          { prompt: "Do you wave, hide behind someone, or push?", options: ["Wave", "Hide", "Push"], correctIndex: 0 },
          { prompt: "What does a friendly face look like?", options: ["Smile", "Frown"], correctIndex: 0 },
          { prompt: "Should your hands be still or flapping?", options: ["Still", "Flapping"], correctIndex: 0 },
        ],
      },
      {
        title: "When Teacher is Busy",
        questions: [
          { prompt: "Teacher is talking to another child. What should you do?", options: ["Wait", "Shout"], correctIndex: 0 },
          { prompt: "How long can you wait before saying hello again?", options: ["A few seconds", "Keep shouting"], correctIndex: 0 },
          { prompt: "What can you say after she finishes?", options: ["Excuse me ma’am", "Hey listen"], correctIndex: 0 },
        ],
      },
      {
        title: "Maintaining Conversation",
        questions: [
          { prompt: "Teacher asks, ‘How are you?’ What can you say?", options: ["I’m fine, thank you", "No talk"], correctIndex: 0 },
          { prompt: "Can you ask one question back to show interest?", options: ["Yes, 'How are you?'", "No, stay silent"], correctIndex: 0 },
          { prompt: "If you don’t understand, what can you say?", options: ["Can you repeat please?", "Ignore it"], correctIndex: 0 },
        ],
      },
      {
        title: "Ending the Talk Politely",
        questions: [
          { prompt: "When the talk is over, what can you say?", options: ["See you later ma’am", "Nothing"], correctIndex: 0 },
          { prompt: "Should you walk away while she’s talking?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "What body action shows goodbye?", options: ["Wave", "Ignore"], correctIndex: 0 },
        ],
      },
      {
        title: "Handling Mistakes or Shyness",
        questions: [
          { prompt: "If you forget to greet, what can you do?", options: ["Say sorry and greet later", "Leave"], correctIndex: 0 },
          { prompt: "If you feel shy, what can you do?", options: ["Smile and wave first", "Hide"], correctIndex: 0 },
          { prompt: "If teacher greets first, what should you do?", options: ["Greet back", "Ignore"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalization & Confidence",
        questions: [
          { prompt: "How can you greet the school guard?", options: ["Good morning sir", "Hi ma’am"], correctIndex: 0 },
          { prompt: "What about your classmate?", options: ["Hi (name)", "Good morning ma’am"], correctIndex: 0 },
          { prompt: "How do you feel when someone greets you?", options: ["Happy", "Scared"], correctIndex: 0 },
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
        title: "Knowing When Help Is Needed",
        questions: [
          { prompt: "You’re trying to open your lunch box but can’t. What should you do?", options: ["Ask for help", "Throw it", "Cry"], correctIndex: 0 },
          { prompt: "How can you tell you need help?", options: ["When I can’t do it after trying", "Right away without trying"], correctIndex: 0 },
          { prompt: "Is it okay to ask for help when something is too hard?", options: ["Yes", "No"], correctIndex: 0 },
        ],
      },
      {
        title: "Finding the Right Person",
        questions: [
          { prompt: "If you’re in class, who can you ask?", options: ["Teacher", "Friend", "Stranger"], correctIndex: 0 },
          { prompt: "In playground, who should you go to?", options: ["Teacher on duty", "Any adult", "Run away"], correctIndex: 0 },
          { prompt: "Should you ask someone you know or a stranger?", options: ["Someone I know", "A stranger"], correctIndex: 0 },
        ],
      },
      {
        title: "Starting the Request",
        questions: [
          { prompt: "What are the first two words you can say?", options: ["Excuse me", "Hey you", "Nothing"], correctIndex: 0 },
          { prompt: "What comes next?", options: ["Please help me", "Do it yourself"], correctIndex: 0 },
          { prompt: "How should your voice sound?", options: ["Calm and clear", "Loud", "Crying"], correctIndex: 0 },
        ],
      },
      {
        title: "Showing What You Need",
        questions: [
          { prompt: "If words are hard, what else can you do?", options: ["Point", "Cry", "Hide"], correctIndex: 0 },
          { prompt: "Which gesture means help?", options: ["Raise hand", "Fold arms", "Clap"], correctIndex: 0 },
          { prompt: "Is it okay to take the teacher’s things without asking?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Waiting for Help",
        questions: [
          { prompt: "After you ask, what should you do?", options: ["Wait", "Shout again"], correctIndex: 0 },
          { prompt: "How can you wait calmly?", options: ["Take deep breaths", "Kick the chair"], correctIndex: 0 },
          { prompt: "If teacher is helping another child, should you keep pulling her hand?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Accepting Help",
        questions: [
          { prompt: "Teacher comes to help you. What can you say?", options: ["Thank you", "Whatever"], correctIndex: 0 },
          { prompt: "If she shows you how, should you try again?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "What face shows you’re happy with help?", options: ["Smile", "Frown"], correctIndex: 0 },
        ],
      },
      {
        title: "If Help Doesn’t Come",
        questions: [
          { prompt: "What can you do if teacher doesn’t hear you?", options: ["Wait and ask again politely", "Shout loudly"], correctIndex: 0 },
          { prompt: "If it’s urgent, who else can you go to?", options: ["Another teacher", "Run away"], correctIndex: 0 },
          { prompt: "Is it okay to hit or throw things when you don’t get help?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Helping Peers",
        questions: [
          { prompt: "If you see a friend struggling, what can you do?", options: ["Call teacher", "Ignore", "Laugh"], correctIndex: 0 },
          { prompt: "What can you say to friend?", options: ["Do you need help?", "Nothing"], correctIndex: 0 },
          { prompt: "When should you not help alone?", options: ["If it’s dangerous like fire or electricity", "Never help anyone"], correctIndex: 0 },
        ],
      },
      {
        title: "Handling Correction",
        questions: [
          { prompt: "Teacher says, ‘You can try again yourself.’ What can you say?", options: ["Okay!", "No!"], correctIndex: 0 },
          { prompt: "If you make a mistake, what should you say?", options: ["Sorry", "Blame someone"], correctIndex: 0 },
          { prompt: "How does learning feel when you get help?", options: ["Good", "Bad"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalization & Confidence",
        questions: [
          { prompt: "At home, who can you ask for help?", options: ["Mom or Dad", "Stranger"], correctIndex: 0 },
          { prompt: "In a shop, what can you say if you can’t find something?", options: ["Excuse me, can you help me?", "Where is it?"], correctIndex: 0 },
          { prompt: "When someone helps you, how can you end the talk?", options: ["Thank you, bye!", "Walk away silently"], correctIndex: 0 },
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
        title: "Understanding the Idea of Turns",
        questions: [
          { prompt: "When you play a game, does everyone go at the same time or one by one?", options: ["One by one", "All at once"], correctIndex: 0 },
          { prompt: "What does ‘my turn’ mean?", options: ["It’s my time to do it", "It’s your time"], correctIndex: 0 },
          { prompt: "What does ‘your turn’ mean?", options: ["It’s the other person’s time", "It’s my time"], correctIndex: 0 },
        ],
      },
      {
        title: "Identifying Whose Turn It Is",
        questions: [
          { prompt: "If teacher says ‘Now Ravi’s turn’, what should you do?", options: ["Wait", "Grab the toy"], correctIndex: 0 },
          { prompt: "How do you know when your turn is coming?", options: ["When teacher calls my name", "I just grab it"], correctIndex: 0 },
          { prompt: "Should you grab the toy before she says your name?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "What to Do While Waiting",
        questions: [
          { prompt: "Where should your hands be?", options: ["On lap", "Taking toy", "Waving"], correctIndex: 0 },
          { prompt: "What can you look at?", options: ["The person playing", "The ceiling"], correctIndex: 0 },
          { prompt: "What can you think or say quietly?", options: ["I can wait my turn", "I want it now"], correctIndex: 0 },
        ],
      },
      {
        title: "Handling Long Waits",
        questions: [
          { prompt: "If waiting feels long, what can you do?", options: ["Take deep breaths", "Yell"], correctIndex: 0 },
          { prompt: "How can you keep busy?", options: ["Count to 5", "Kick chair"], correctIndex: 0 },
          { prompt: "If you forget whose turn, what can you ask?", options: ["Is it my turn now?", "Give me!"], correctIndex: 0 },
        ],
      },
      {
        title: "Taking Your Turn Properly",
        questions: [
          { prompt: "When it’s your turn, what should you say?", options: ["My turn!", "Give me!"], correctIndex: 0 },
          { prompt: "Should you push to take it?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "When you finish, what can you say?", options: ["Now your turn", "Done!"], correctIndex: 0 },
        ],
      },
      {
        title: "Losing Turn or Game",
        questions: [
          { prompt: "If you lose a turn, what can you say?", options: ["Okay, maybe next time", "No way!"], correctIndex: 0 },
          { prompt: "What should you not do?", options: ["Cry / Throw toy / Leave angry", "Take deep breaths"], correctIndex: 0 },
          { prompt: "What helps you feel better?", options: ["Take a breath or ask for a hug", "Shout loudly"], correctIndex: 0 },
        ],
      },
      {
        title: "Sharing and Fairness",
        questions: [
          { prompt: "If someone took two turns, what can you say?", options: ["Can I have my turn please?", "Give it now!"], correctIndex: 0 },
          { prompt: "Is it good to grab back?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "What makes games fun?", options: ["Everyone gets turns", "Only I play"], correctIndex: 0 },
        ],
      },
      {
        title: "Waiting in Everyday Life",
        questions: [
          { prompt: "In a queue for swing, what do you do?", options: ["Stand and wait quietly", "Push others"], correctIndex: 0 },
          { prompt: "In class, when you want to speak?", options: ["Raise hand", "Shout"], correctIndex: 0 },
          { prompt: "At home, waiting for TV?", options: ["Ask ‘Can I watch after you?’", "Grab the remote"], correctIndex: 0 },
        ],
      },
      {
        title: "Calming Body While Waiting",
        questions: [
          { prompt: "When you feel impatient, what can you do?", options: ["Squeeze stress ball", "Hit"], correctIndex: 0 },
          { prompt: "Where should your feet be?", options: ["On floor", "Stomping"], correctIndex: 0 },
          { prompt: "What face shows you’re waiting nicely?", options: ["Smile", "Angry face"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalization & Confidence",
        questions: [
          { prompt: "Can you wait for your turn on the slide too?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "What can you tell yourself while waiting?", options: ["I can do it", "Hurry up!"], correctIndex: 0 },
          { prompt: "How do friends feel when you wait nicely?", options: ["Happy", "Annoyed"], correctIndex: 0 },
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
        title: "Understanding Sharing",
        questions: [
          { prompt: "When two children both want the same toy, what can they do?", options: ["Take turns", "Fight", "Cry"], correctIndex: 0 },
          { prompt: "What does sharing mean?", options: ["Letting someone use your toy too", "Keeping it only for yourself"], correctIndex: 0 },
          { prompt: "Is sharing a good thing or bad thing?", options: ["Good thing", "Bad thing"], correctIndex: 0 },
        ],
      },
      {
        title: "Feelings About Sharing",
        questions: [
          { prompt: "How do you feel when someone shares with you?", options: ["Happy", "Sad"], correctIndex: 0 },
          { prompt: "How does your friend feel when you share?", options: ["Happy", "Sad"], correctIndex: 0 },
          { prompt: "If you keep all toys to yourself, how do others feel?", options: ["Sad", "Angry"], correctIndex: 0 },
        ],
      },
      {
        title: "Asking to Share",
        questions: [
          { prompt: "If you want a friend's toy, what can you say?", options: ["Can I play with it please?", "Give me now!"], correctIndex: 0 },
          { prompt: "Should you grab it or ask first?", options: ["Ask first", "Grab it"], correctIndex: 0 },
          { prompt: "If your friend says 'Wait', what can you say?", options: ["Okay, I'll wait", "No, give it"], correctIndex: 0 },
        ],
      },
      {
        title: "Offering to Share",
        questions: [
          { prompt: "If you have a car and friend has none, what can you say?", options: ["You can play too!", "No one can touch it"], correctIndex: 0 },
          { prompt: "Should you hide your toy or show it?", options: ["Show it", "Hide it"], correctIndex: 0 },
          { prompt: "What face shows you're happy to share?", options: ["Smile", "Frown"], correctIndex: 0 },
        ],
      },
      {
        title: "Taking Turns While Sharing",
        questions: [
          { prompt: "How long can you play before giving a turn?", options: ["A few minutes", "All day"], correctIndex: 0 },
          { prompt: "What can you say when giving turn?", options: ["Now your turn!", "Mine forever!"], correctIndex: 0 },
          { prompt: "What do you do while waiting?", options: ["Watch or clap", "Grab the toy"], correctIndex: 0 },
        ],
      },
      {
        title: "Handling No",
        questions: [
          { prompt: "If friend says 'No, it's mine!', what can you do?", options: ["Ask teacher for help", "Shout at them", "Push them"], correctIndex: 0 },
          { prompt: "Can you take another toy instead?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Should you hit or push?", options: ["No", "Yes"], correctIndex: 0 },
        ],
      },
      {
        title: "Playing Together",
        questions: [
          { prompt: "Can two children play with the same toys together?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "What can you say to invite a friend?", options: ["Let's play together!", "Go away!"], correctIndex: 0 },
          { prompt: "What helps both of you enjoy?", options: ["Take turns", "Fight"], correctIndex: 0 },
        ],
      },
      {
        title: "Saying Thank You",
        questions: [
          { prompt: "Friend shared a toy with you. What can you say?", options: ["Thank you!", "Nothing"], correctIndex: 0 },
          { prompt: "Should you throw the toy back?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "What can you do to show kindness?", options: ["Share your toy next time", "Walk away"], correctIndex: 0 },
        ],
      },
      {
        title: "Fixing Problems",
        questions: [
          { prompt: "If you both want the same toy, what can you do?", options: ["Use a timer or take turns", "Grab it fast"], correctIndex: 0 },
          { prompt: "If toy breaks, what should you do?", options: ["Say sorry", "Hide it"], correctIndex: 0 },
          { prompt: "If friend cries, what can you say?", options: ["It's okay, we can share", "Too bad for you"], correctIndex: 0 },
        ],
      },
      {
        title: "Generalisation",
        questions: [
          { prompt: "Can you share things at home too?", options: ["Yes, with brother or sister", "No, never share at home"], correctIndex: 0 },
          { prompt: "Can you share art materials at school?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "How do you feel when everyone shares?", options: ["Happy and calm", "Left out"], correctIndex: 0 },
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
        title: "Recognising the Feeling",
        questions: [
          { prompt: "How does your body feel when you get angry?", options: ["Hot", "Cold", "Sleepy"], correctIndex: 0 },
          { prompt: "What happens to your face when you're angry?", options: ["Frown", "Smile"], correctIndex: 0 },
          { prompt: "What can your hands feel like?", options: ["Tight", "Soft"], correctIndex: 0 },
        ],
      },
      {
        title: "Naming the Emotion",
        questions: [
          { prompt: "When you feel mad, what can you say?", options: ["I'm angry.", "Nothing"], correctIndex: 0 },
          { prompt: "Is it okay to say you're angry?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "What words are not okay when angry?", options: ["Bad words", "Kind words"], correctIndex: 0 },
        ],
      },
      {
        title: "Noticing Triggers",
        questions: [
          { prompt: "What things make you angry?", options: ["Snatching toy", "Loud noise"], correctIndex: 0 },
          { prompt: "Can you think before shouting?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "Can you tell an adult what upset you?", options: ["Yes", "No"], correctIndex: 0 },
        ],
      },
      {
        title: "Stop and Think",
        questions: [
          { prompt: "When you start to feel mad, what can you say to yourself?", options: ["Stop, breathe and think.", "Hit first"], correctIndex: 0 },
          { prompt: "Should you hit first or stop first?", options: ["Stop first", "Hit first"], correctIndex: 0 },
          { prompt: "What helps you remember to stop?", options: ["A red stop sign picture", "Nothing"], correctIndex: 0 },
        ],
      },
      {
        title: "Breathing and Relaxation",
        questions: [
          { prompt: "How can you use your breath to calm?", options: ["Take slow deep breaths", "Shout"], correctIndex: 0 },
          { prompt: "How many deep breaths can you take?", options: ["3 or more", "0"], correctIndex: 0 },
          { prompt: "Where can you keep your hands while breathing?", options: ["On tummy", "Throw things"], correctIndex: 0 },
        ],
      },
      {
        title: "Taking a Break",
        questions: [
          { prompt: "What can you do if breathing doesn't help?", options: ["Ask for a break", "Run away outside"], correctIndex: 0 },
          { prompt: "What can you say to teacher?", options: ["Can I go to calm corner?", "I'm leaving"], correctIndex: 0 },
          { prompt: "What should you not do when angry?", options: ["Run away outside", "Ask for help"], correctIndex: 0 },
        ],
      },
      {
        title: "Using Calm Tools",
        questions: [
          { prompt: "What calm tool can you use?", options: ["Squeeze ball", "Book", "Toy car"], correctIndex: 0 },
          { prompt: "What music helps you calm?", options: ["Soft music", "Loud drum"], correctIndex: 0 },
          { prompt: "Is it okay to ask for your calm box?", options: ["Yes", "No"], correctIndex: 0 },
        ],
      },
      {
        title: "Talking After You're Calm",
        questions: [
          { prompt: "When calm, what can you tell your teacher?", options: ["I was angry because…", "Nothing"], correctIndex: 0 },
          { prompt: "Should you talk while still yelling?", options: ["No", "Yes"], correctIndex: 0 },
          { prompt: "What can teacher say to help you?", options: ["Let's solve it together.", "Stop it"], correctIndex: 0 },
        ],
      },
      {
        title: "Making It Right",
        questions: [
          { prompt: "If you shouted at a friend, what can you do?", options: ["Say sorry", "Ignore"], correctIndex: 0 },
          { prompt: "If you broke something, what next?", options: ["Tell adult", "Help fix it"], correctIndex: 0 },
          { prompt: "What happens when you say sorry?", options: ["Friend feels better", "Friend gets angry"], correctIndex: 0 },
        ],
      },
      {
        title: "Confidence and Generalisation",
        questions: [
          { prompt: "What can you tell yourself after calming down?", options: ["I did it!", "Whatever"], correctIndex: 0 },
          { prompt: "Can you use calm breathing at home too?", options: ["Yes", "No"], correctIndex: 0 },
          { prompt: "How does it feel when you control anger?", options: ["Happy", "Proud"], correctIndex: 0 },
        ],
      },
    ],
  },
};

export type ScenarioKey = keyof typeof SCENARIOS;

function shuffleArray<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestion(question: Q): Q {
  const indexed = question.options.map((opt, idx) => ({ opt, idx }));
  const shuffled = shuffleArray(indexed);
  const newCorrectIndex = shuffled.findIndex((entry) => entry.idx === question.correctIndex);
  return {
    ...question,
    options: shuffled.map((entry) => entry.opt),
    correctIndex: newCorrectIndex,
  };
}

export function getScenarioWithShuffledOptions(key: ScenarioKey): Scenario {
  const scenario = SCENARIOS[key];
  return {
    ...scenario,
    blocks: scenario.blocks.map((block) => ({
      ...block,
      questions: block.questions.map((question) => shuffleQuestion(question)),
    })),
  };
}
