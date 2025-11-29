// src/data/scenarios.ts
export type Option = {
  text: string;
  imageUrl?: string;
};

export type Q = {
  prompt: string;
  options: Option[];
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
          { prompt: "Who is this person standing near the classroom?", options: [{ text: "Teacher", imageUrl: "/images/teacher.png" }, { text: "Policeman", imageUrl: "/images/policeman.png" }], correctIndex: 0 },
          { prompt: "Is she someone you know from school or a stranger?", options: [{ text: "Someone I know from school", imageUrl: "/images/school_person.png" }, { text: "A stranger", imageUrl: "/images/stranger.png" }], correctIndex: 0 },
          { prompt: "What do we call her?", options: [{ text: "Ma'am", imageUrl: "/images/teacher.png" }, { text: "Uncle", imageUrl: "/images/uncle.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Approach Politely",
        questions: [
          { prompt: "When you see your teacher, do you run away or walk up slowly?", options: [{ text: "Walk up slowly", imageUrl: "/images/walk_slowly.png" }, { text: "Run away", imageUrl: "/images/run_away.png" }], correctIndex: 0 },
          { prompt: "Should you smile or make a funny face?", options: [{ text: "Smile", imageUrl: "/images/smile.png" }, { text: "Funny face", imageUrl: "/images/funny_face.png" }], correctIndex: 0 },
          { prompt: "Where should your eyes look when you talk?", options: [{ text: "Her eyes", imageUrl: "/images/eyes.png" }, { text: "Floor", imageUrl: "/images/floor.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Starting the Greeting",
        questions: [
          { prompt: "When greeting, should you shout or speak softly?", options: [{ text: "Speak softly", imageUrl: "/images/speak_softly.png" }, { text: "Shout", imageUrl: "/images/shout.png" }], correctIndex: 0 },
          { prompt: "What is another polite word you can use in the morning?", options: [{ text: "Good morning", imageUrl: "/images/good_morning.png" }, { text: "Later", imageUrl: "/images/later.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Responding to Teacher’s Greeting",
        questions: [
          { prompt: "Teacher says ‘Good morning!’ What will you say back?", options: [{ text: "Good morning, ma’am!", imageUrl: "/images/good_morning_maam.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
          { prompt: "Should you turn away or face her while talking?", options: [{ text: "Face her", imageUrl: "/images/face_her.png" }, { text: "Turn away", imageUrl: "/images/turn_away.png" }], correctIndex: 0 },
          { prompt: "What can you add after greeting?", options: [{ text: "How are you ma’am?", imageUrl: "/images/how_are_you_maam.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Using Body Language",
        questions: [
          { prompt: "Do you wave, hide behind someone, or push?", options: [{ text: "Wave", imageUrl: "/images/wave.png" }, { text: "Hide", imageUrl: "/images/hide.png" }], correctIndex: 0 },
          { prompt: "What does a friendly face look like?", options: [{ text: "Smile", imageUrl: "/images/smile.png" }, { text: "Frown", imageUrl: "/images/frown.png" }], correctIndex: 0 },
          { prompt: "Should your hands be still or flapping?", options: [{ text: "Still", imageUrl: "/images/still.png" }, { text: "Flapping", imageUrl: "/images/flapping.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "When Teacher is Busy",
        questions: [
          { prompt: "Teacher is talking to another child. What should you do?", options: [{ text: "Wait", imageUrl: "/images/wait.png" }, { text: "Shout", imageUrl: "/images/shout.png" }], correctIndex: 0 },
          { prompt: "How long can you wait before saying hello again?", options: [{ text: "A few seconds", imageUrl: "/images/a_few_seconds.png" }, { text: "Keep shouting", imageUrl: "/images/keep_shouting.png" }], correctIndex: 0 },
          { prompt: "What can you say after she finishes?", options: [{ text: "Excuse me ma’am", imageUrl: "/images/excuse_me_maam.png" }, { text: "Hey listen", imageUrl: "/images/hey_listen.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Maintaining Conversation",
        questions: [
          { prompt: "Teacher asks, ‘How are you?’ What can you say?", options: [{ text: "I’m fine, thank you", imageUrl: "/images/im_fine_thank_you.png" }, { text: "No talk", imageUrl: "/images/no_talk.png" }], correctIndex: 0 },
          { prompt: "Can you ask one question back to show interest?", options: [{ text: "Yes, 'How are you?'", imageUrl: "/images/yes_how_are_you.png" }, { text: "No, stay silent", imageUrl: "/images/no_stay_silent.png" }], correctIndex: 0 },
          { prompt: "If you don’t understand, what can you say?", options: [{ text: "Can you repeat please?", imageUrl: "/images/can_you_repeat_please.png" }, { text: "Ignore it", imageUrl: "/images/ignore_it.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Ending the Talk Politely",
        questions: [
          { prompt: "When the talk is over, what can you say?", options: [{ text: "See you later ma’am", imageUrl: "/images/see_you_later_maam.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
          { prompt: "Should you walk away while she’s talking?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
          { prompt: "What body action shows goodbye?", options: [{ text: "Wave", imageUrl: "/images/wave.png" }, { text: "Ignore", imageUrl: "/images/ignore.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Handling Mistakes or Shyness",
        questions: [
          { prompt: "If you forget to greet, what can you do?", options: [{ text: "Say sorry and greet later", imageUrl: "/images/say_sorry_and_greet_later.png" }, { text: "Leave", imageUrl: "/images/leave.png" }], correctIndex: 0 },
          { prompt: "If you feel shy, what can you do?", options: [{ text: "Smile and wave first", imageUrl: "/images/smile_and_wave_first.png" }, { text: "Hide", imageUrl: "/images/hide.png" }], correctIndex: 0 },
          { prompt: "If teacher greets first, what should you do?", options: [{ text: "Greet back", imageUrl: "/images/greet_back.png" }, { text: "Ignore", imageUrl: "/images/ignore.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Generalization & Confidence",
        questions: [
          { prompt: "How can you greet the school guard?", options: [{ text: "Good morning sir", imageUrl: "/images/good_morning_sir.png" }, { text: "Hi ma’am", imageUrl: "/images/hi_maam.png" }], correctIndex: 0 },
          { prompt: "What about your classmate?", options: [{ text: "Hi (name)", imageUrl: "/images/hi_name.png" }, { text: "Good morning ma’am", imageUrl: "/images/good_morning_maam.png" }], correctIndex: 0 },
          { prompt: "How do you feel when someone greets you?", options: [{ text: "Happy", imageUrl: "/images/happy.png" }, { text: "Scared", imageUrl: "/images/scared.png" }], correctIndex: 0 },
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
          { prompt: "You’re trying to open your lunch box but can’t. What should you do?", options: [{ text: "Ask for help", imageUrl: "/images/ask_for_help.png" }, { text: "Throw it", imageUrl: "/images/throw_it.png" }], correctIndex: 0 },
          { prompt: "How can you tell you need help?", options: [{ text: "When I can’t do it after trying", imageUrl: "/images/when_i_cant_do_it_after_trying.png" }, { text: "Right away without trying", imageUrl: "/images/right_away_without_trying.png" }], correctIndex: 0 },
          { prompt: "Is it okay to ask for help when something is too hard?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Finding the Right Person",
        questions: [
          { prompt: "If you’re in class, who can you ask?", options: [{ text: "Teacher", imageUrl: "/images/teacher.png" }, { text: "Friend", imageUrl: "/images/friend.png" }], correctIndex: 0 },
          { prompt: "In playground, who should you go to?", options: [{ text: "Teacher on duty", imageUrl: "/images/teacher_on_duty.png" }, { text: "Any adult", imageUrl: "/images/any_adult.png" }], correctIndex: 0 },
          { prompt: "Should you ask someone you know or a stranger?", options: [{ text: "Someone I know", imageUrl: "/images/someone_i_know.png" }, { text: "A stranger", imageUrl: "/images/stranger.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Starting the Request",
        questions: [
          { prompt: "What are the first two words you can say?", options: [{ text: "Excuse me", imageUrl: "/images/excuse_me.png" }, { text: "Hey you", imageUrl: "/images/hey_you.png" }], correctIndex: 0 },
          { prompt: "What comes next?", options: [{ text: "Please help me", imageUrl: "/images/please_help_me.png" }, { text: "Do it yourself", imageUrl: "/images/do_it_yourself.png" }], correctIndex: 0 },
          { prompt: "How should your voice sound?", options: [{ text: "Calm and clear", imageUrl: "/images/calm_and_clear.png" }, { text: "Loud", imageUrl: "/images/loud.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Showing What You Need",
        questions: [
          { prompt: "If words are hard, what else can you do?", options: [{ text: "Point", imageUrl: "/images/point.png" }, { text: "Cry", imageUrl: "/images/cry.png" }], correctIndex: 0 },
          { prompt: "Which gesture means help?", options: [{ text: "Raise hand", imageUrl: "/images/raise_hand.png" }, { text: "Fold arms", imageUrl: "/images/fold_arms.png" }], correctIndex: 0 },
          { prompt: "Is it okay to take the teacher’s things without asking?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Waiting for Help",
        questions: [
          { prompt: "After you ask, what should you do?", options: [{ text: "Wait", imageUrl: "/images/wait.png" }, { text: "Shout again", imageUrl: "/images/shout_again.png" }], correctIndex: 0 },
          { prompt: "How can you wait calmly?", options: [{ text: "Take deep breaths", imageUrl: "/images/take_deep_breaths.png" }, { text: "Kick the chair", imageUrl: "/images/kick_the_chair.png" }], correctIndex: 0 },
          { prompt: "If teacher is helping another child, should you keep pulling her hand?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Accepting Help",
        questions: [
          { prompt: "Teacher comes to help you. What can you say?", options: [{ text: "Thank you", imageUrl: "/images/thank_you.png" }, { text: "Whatever", imageUrl: "/images/whatever.png" }], correctIndex: 0 },
          { prompt: "If she shows you how, should you try again?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "What face shows you’re happy with help?", options: [{ text: "Smile", imageUrl: "/images/smile.png" }, { text: "Frown", imageUrl: "/images/frown.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "If Help Doesn’t Come",
        questions: [
          { prompt: "What can you do if teacher doesn’t hear you?", options: [{ text: "Wait and ask again politely", imageUrl: "/images/wait_and_ask_again_politely.png" }, { text: "Shout loudly", imageUrl: "/images/shout_loudly.png" }], correctIndex: 0 },
          { prompt: "If it’s urgent, who else can you go to?", options: [{ text: "Another teacher", imageUrl: "/images/another_teacher.png" }, { text: "Run away", imageUrl: "/images/run_away.png" }], correctIndex: 0 },
          { prompt: "Is it okay to hit or throw things when you don’t get help?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Helping Peers",
        questions: [
          { prompt: "If you see a friend struggling, what can you do?", options: [{ text: "Call teacher", imageUrl: "/images/call_teacher.png" }, { text: "Ignore", imageUrl: "/images/ignore.png" }], correctIndex: 0 },
          { prompt: "What can you say to friend?", options: [{ text: "Do you need help?", imageUrl: "/images/do_you_need_help.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
          { prompt: "When should you not help alone?", options: [{ text: "If it’s dangerous like fire or electricity", imageUrl: "/images/if_its_dangerous_like_fire_or_electricity.png" }, { text: "Never help anyone", imageUrl: "/images/never_help_anyone.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Handling Correction",
        questions: [
          { prompt: "Teacher says, ‘You can try again yourself.’ What can you say?", options: [{ text: "Okay!", imageUrl: "/images/okay.png" }, { text: "No!", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "If you make a mistake, what should you say?", options: [{ text: "Sorry", imageUrl: "/images/sorry.png" }, { text: "Blame someone", imageUrl: "/images/blame_someone.png" }], correctIndex: 0 },
          { prompt: "How does learning feel when you get help?", options: [{ text: "Good", imageUrl: "/images/good.png" }, { text: "Bad", imageUrl: "/images/bad.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Generalization & Confidence",
        questions: [
          { prompt: "At home, who can you ask for help?", options: [{ text: "Mom or Dad", imageUrl: "/images/mom_or_dad.png" }, { text: "Stranger", imageUrl: "/images/stranger.png" }], correctIndex: 0 },
          { prompt: "In a shop, what can you say if you can’t find something?", options: [{ text: "Excuse me, can you help me?", imageUrl: "/images/excuse_me_can_you_help_me.png" }, { text: "Where is it?", imageUrl: "/images/where_is_it.png" }], correctIndex: 0 },
          { prompt: "When someone helps you, how can you end the talk?", options: [{ text: "Thank you, bye!", imageUrl: "/images/thank_you_bye.png" }, { text: "Walk away silently", imageUrl: "/images/walk_away_silently.png" }], correctIndex: 0 },
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
          { prompt: "When you play a game, does everyone go at the same time or one by one?", options: [{ text: "One by one", imageUrl: "/images/one_by_one.png" }, { text: "All at once", imageUrl: "/images/all_at_once.png" }], correctIndex: 0 },
          { prompt: "What does ‘my turn’ mean?", options: [{ text: "It’s my time to do it", imageUrl: "/images/its_my_time.png" }, { text: "It’s your time", imageUrl: "/images/its_your_time.png" }], correctIndex: 0 },
          { prompt: "What does ‘your turn’ mean?", options: [{ text: "It’s the other person’s time", imageUrl: "/images/other_persons_time.png" }, { text: "It’s my time", imageUrl: "/images/its_my_time.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Identifying Whose Turn It Is",
        questions: [
          { prompt: "If teacher says ‘Now Ravi’s turn’, what should you do?", options: [{ text: "Wait", imageUrl: "/images/wait.png" }, { text: "Grab the toy", imageUrl: "/images/grab_the_toy.png" }], correctIndex: 0 },
          { prompt: "How do you know when your turn is coming?", options: [{ text: "When teacher calls my name", imageUrl: "/images/my_name.png" }, { text: "I just grab it", imageUrl: "/images/grab_it.png" }], correctIndex: 0 },
          { prompt: "Should you grab the toy before she says your name?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "What to Do While Waiting",
        questions: [
          { prompt: "Where should your hands be?", options: [{ text: "On lap", imageUrl: "/images/on_lap.png" }, { text: "Taking toy", imageUrl: "/images/taking_toy.png" }], correctIndex: 0 },
          { prompt: "What can you look at?", options: [{ text: "The person playing", imageUrl: "/images/the_person_playing.png" }, { text: "The ceiling", imageUrl: "/images/the_ceiling.png" }], correctIndex: 0 },
          { prompt: "What can you think or say quietly?", options: [{ text: "I can wait my turn", imageUrl: "/images/i_can_wait_my_turn.png" }, { text: "I want it now", imageUrl: "/images/i_want_it_now.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Handling Long Waits",
        questions: [
          { prompt: "If waiting feels long, what can you do?", options: [{ text: "Take deep breaths", imageUrl: "/images/take_deep_breaths.png" }, { text: "Yell", imageUrl: "/images/yell.png" }], correctIndex: 0 },
          { prompt: "How can you keep busy?", options: [{ text: "Count to 5", imageUrl: "/images/count_to_5.png" }, { text: "Kick chair", imageUrl: "/images/kick_chair.png" }], correctIndex: 0 },
          { prompt: "If you forget whose turn, what can you ask?", options: [{ text: "Is it my turn now?", imageUrl: "/images/is_it_my_turn_now.png" }, { text: "Give me!", imageUrl: "/images/give_me.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Taking Your Turn Properly",
        questions: [
          { prompt: "When it’s your turn, what should you say?", options: [{ text: "My turn!", imageUrl: "/images/my_turn.png" }, { text: "Give me!", imageUrl: "/images/give_me.png" }], correctIndex: 0 },
          { prompt: "Should you push to take it?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
          { prompt: "When you finish, what can you say?", options: [{ text: "Now your turn", imageUrl: "/images/now_your_turn.png" }, { text: "Done!", imageUrl: "/images/done.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Losing Turn or Game",
        questions: [
          { prompt: "If you lose a turn, what can you say?", options: [{ text: "Okay, maybe next time", imageUrl: "/images/okay_maybe_next_time.png" }, { text: "No way!", imageUrl: "/images/no_way.png" }], correctIndex: 0 },
          { prompt: "What should you not do?", options: [{ text: "Cry / Throw toy / Leave angry", imageUrl: "/images/cry_throw_toy_leave_angry.png" }, { text: "Take deep breaths", imageUrl: "/images/take_deep_breaths.png" }], correctIndex: 0 },
          { prompt: "What helps you feel better?", options: [{ text: "Take a breath or ask for a hug", imageUrl: "/images/take_a_breath_or_ask_for_a_hug.png" }, { text: "Shout loudly", imageUrl: "/images/shout_loudly.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Sharing and Fairness",
        questions: [
          { prompt: "If someone took two turns, what can you say?", options: [{ text: "Can I have my turn please?", imageUrl: "/images/can_i_have_my_turn_please.png" }, { text: "Give it now!", imageUrl: "/images/give_it_now.png" }], correctIndex: 0 },
          { prompt: "Is it good to grab back?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
          { prompt: "What makes games fun?", options: [{ text: "Everyone gets turns", imageUrl: "/images/everyone_gets_turns.png" }, { text: "Only I play", imageUrl: "/images/only_i_play.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Waiting in Everyday Life",
        questions: [
          { prompt: "In a queue for swing, what do you do?", options: [{ text: "Stand and wait quietly", imageUrl: "/images/stand_and_wait_quietly.png" }, { text: "Push others", imageUrl: "/images/push_others.png" }], correctIndex: 0 },
          { prompt: "In class, when you want to speak?", options: [{ text: "Raise hand", imageUrl: "/images/raise_hand.png" }, { text: "Shout", imageUrl: "/images/shout.png" }], correctIndex: 0 },
          { prompt: "At home, waiting for TV?", options: [{ text: "Ask ‘Can I watch after you?’", imageUrl: "/images/ask_can_i_watch_after_you.png" }, { text: "Grab the remote", imageUrl: "/images/grab_the_remote.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Calming Body While Waiting",
        questions: [
          { prompt: "When you feel impatient, what can you do?", options: [{ text: "Squeeze stress ball", imageUrl: "/images/squeeze_stress_ball.png" }, { text: "Hit", imageUrl: "/images/hit.png" }], correctIndex: 0 },
          { prompt: "Where should your feet be?", options: [{ text: "On floor", imageUrl: "/images/on_floor.png" }, { text: "Stomping", imageUrl: "/images/stomping.png" }], correctIndex: 0 },
          { prompt: "What face shows you’re waiting nicely?", options: [{ text: "Smile", imageUrl: "/images/smile.png" }, { text: "Angry face", imageUrl: "/images/angry_face.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Generalization & Confidence",
        questions: [
          { prompt: "Can you wait for your turn on the slide too?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "What can you tell yourself while waiting?", options: [{ text: "I can do it", imageUrl: "/images/i_can_do_it.png" }, { text: "Hurry up!", imageUrl: "/images/hurry_up.png" }], correctIndex: 0 },
          { prompt: "How do friends feel when you wait nicely?", options: [{ text: "Happy", imageUrl: "/images/happy.png" }, { text: "Annoyed", imageUrl: "/images/annoyed.png" }], correctIndex: 0 },
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
          { prompt: "When two children both want the same toy, what can they do?", options: [{ text: "Take turns", imageUrl: "/images/take_turns.png" }, { text: "Fight", imageUrl: "/images/fight.png" }], correctIndex: 0 },
          { prompt: "What does sharing mean?", options: [{ text: "Letting someone use your toy too", imageUrl: "/images/letting_someone_use_your_toy_too.png" }, { text: "Keeping it only for yourself", imageUrl: "/images/keeping_it_only_for_yourself.png" }], correctIndex: 0 },
          { prompt: "Is sharing a good thing or bad thing?", options: [{ text: "Good thing", imageUrl: "/images/good_thing.png" }, { text: "Bad thing", imageUrl: "/images/bad_thing.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Feelings About Sharing",
        questions: [
          { prompt: "How do you feel when someone shares with you?", options: [{ text: "Happy", imageUrl: "/images/happy.png" }, { text: "Sad", imageUrl: "/images/sad.png" }], correctIndex: 0 },
          { prompt: "How does your friend feel when you share?", options: [{ text: "Happy", imageUrl: "/images/happy.png" }, { text: "Sad", imageUrl: "/images/sad.png" }], correctIndex: 0 },
          { prompt: "If you keep all toys to yourself, how do others feel?", options: [{ text: "Sad", imageUrl: "/images/sad.png" }, { text: "Angry", imageUrl: "/images/angry.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Asking to Share",
        questions: [
          { prompt: "If you want a friend's toy, what can you say?", options: [{ text: "Can I play with it please?", imageUrl: "/images/can_i_play_with_it_please.png" }, { text: "Give me now!", imageUrl: "/images/give_me_now.png" }], correctIndex: 0 },
          { prompt: "Should you grab it or ask first?", options: [{ text: "Ask first", imageUrl: "/images/ask_first.png" }, { text: "Grab it", imageUrl: "/images/grab_it.png" }], correctIndex: 0 },
          { prompt: "If your friend says 'Wait', what can you say?", options: [{ text: "Okay, I'll wait", imageUrl: "/images/okay_ill_wait.png" }, { text: "No, give it", imageUrl: "/images/no_give_it.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Offering to Share",
        questions: [
          { prompt: "If you have a car and friend has none, what can you say?", options: [{ text: "You can play too!", imageUrl: "/images/you_can_play_too.png" }, { text: "No one can touch it", imageUrl: "/images/no_one_can_touch_it.png" }], correctIndex: 0 },
          { prompt: "Should you hide your toy or show it?", options: [{ text: "Show it", imageUrl: "/images/show_it.png" }, { text: "Hide it", imageUrl: "/images/hide_it.png" }], correctIndex: 0 },
          { prompt: "What face shows you're happy to share?", options: [{ text: "Smile", imageUrl: "/images/smile.png" }, { text: "Frown", imageUrl: "/images/frown.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Taking Turns While Sharing",
        questions: [
          { prompt: "How long can you play before giving a turn?", options: [{ text: "A few minutes", imageUrl: "/images/a_few_minutes.png" }, { text: "All day", imageUrl: "/images/all_day.png" }], correctIndex: 0 },
          { prompt: "What can you say when giving turn?", options: [{ text: "Now your turn!", imageUrl: "/images/now_your_turn.png" }, { text: "Mine forever!", imageUrl: "/images/mine_forever.png" }], correctIndex: 0 },
          { prompt: "What do you do while waiting?", options: [{ text: "Watch or clap", imageUrl: "/images/watch_or_clap.png" }, { text: "Grab the toy", imageUrl: "/images/grab_the_toy.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Handling No",
        questions: [
          { prompt: "If friend says 'No, it's mine!', what can you do?", options: [{ text: "Ask teacher for help", imageUrl: "/images/ask_teacher_for_help.png" }, { text: "Shout at them", imageUrl: "/images/shout_at_them.png" }], correctIndex: 0 },
          { prompt: "Can you take another toy instead?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "Should you hit or push?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Playing Together",
        questions: [
          { prompt: "Can two children play with the same toys together?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "What can you say to invite a friend?", options: [{ text: "Let's play together!", imageUrl: "/images/lets_play_together.png" }, { text: "Go away!", imageUrl: "/images/go_away.png" }], correctIndex: 0 },
          { prompt: "What helps both of you enjoy?", options: [{ text: "Take turns", imageUrl: "/images/take_turns.png" }, { text: "Fight", imageUrl: "/images/fight.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Saying Thank You",
        questions: [
          { prompt: "Friend shared a toy with you. What can you say?", options: [{ text: "Thank you!", imageUrl: "/images/thank_you.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
          { prompt: "Should you throw the toy back?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
          { prompt: "What can you do to show kindness?", options: [{ text: "Share your toy next time", imageUrl: "/images/share_your_toy_next_time.png" }, { text: "Walk away", imageUrl: "/images/walk_away.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Fixing Problems",
        questions: [
          { prompt: "If you both want the same toy, what can you do?", options: [{ text: "Use a timer or take turns", imageUrl: "/images/use_a_timer_or_take_turns.png" }, { text: "Grab it fast", imageUrl: "/images/grab_it_fast.png" }], correctIndex: 0 },
          { prompt: "If toy breaks, what should you do?", options: [{ text: "Say sorry", imageUrl: "/images/say_sorry.png" }, { text: "Hide it", imageUrl: "/images/hide_it.png" }], correctIndex: 0 },
          { prompt: "If friend cries, what can you say?", options: [{ text: "It's okay, we can share", imageUrl: "/images/its_okay_we_can_share.png" }, { text: "Too bad for you", imageUrl: "/images/too_bad_for_you.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Generalisation",
        questions: [
          { prompt: "Can you share things at home too?", options: [{ text: "Yes, with brother or sister", imageUrl: "/images/yes_with_brother_or_sister.png" }, { text: "No, never share at home", imageUrl: "/images/no_never_share_at_home.png" }], correctIndex: 0 },
          { prompt: "Can you share art materials at school?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "How do you feel when everyone shares?", options: [{ text: "Happy and calm", imageUrl: "/images/happy_and_calm.png" }, { text: "Left out", imageUrl: "/images/left_out.png" }], correctIndex: 0 },
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
          { prompt: "How does your body feel when you get angry?", options: [{ text: "Hot", imageUrl: "/images/hot.png" }, { text: "Cold", imageUrl: "/images/cold.png" }], correctIndex: 0 },
          { prompt: "What happens to your face when you're angry?", options: [{ text: "Frown", imageUrl: "/images/frown.png" }, { text: "Smile", imageUrl: "/images/smile.png" }], correctIndex: 0 },
          { prompt: "What can your hands feel like?", options: [{ text: "Tight", imageUrl: "/images/tight.png" }, { text: "Soft", imageUrl: "/images/soft.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Naming the Emotion",
        questions: [
          { prompt: "When you feel mad, what can you say?", options: [{ text: "I'm angry.", imageUrl: "/images/im_angry.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
          { prompt: "Is it okay to say you're angry?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "What words are not okay when angry?", options: [{ text: "Bad words", imageUrl: "/images/bad_words.png" }, { text: "Kind words", imageUrl: "/images/kind_words.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Noticing Triggers",
        questions: [
          { prompt: "What things make you angry?", options: [{ text: "Snatching toy", imageUrl: "/images/snatching_toy.png" }, { text: "Loud noise", imageUrl: "/images/loud_noise.png" }], correctIndex: 0 },
          { prompt: "Can you think before shouting?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "Can you tell an adult what upset you?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Stop and Think",
        questions: [
          { prompt: "When you start to feel mad, what can you say to yourself?", options: [{ text: "Stop, breathe and think.", imageUrl: "/images/stop_breathe_and_think.png" }, { text: "Hit first", imageUrl: "/images/hit_first.png" }], correctIndex: 0 },
          { prompt: "Should you hit first or stop first?", options: [{ text: "Stop first", imageUrl: "/images/stop_first.png" }, { text: "Hit first", imageUrl: "/images/hit_first.png" }], correctIndex: 0 },
          { prompt: "What helps you remember to stop?", options: [{ text: "A red stop sign picture", imageUrl: "/images/a_red_stop_sign_picture.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Breathing and Relaxation",
        questions: [
          { prompt: "How can you use your breath to calm?", options: [{ text: "Take slow deep breaths", imageUrl: "/images/take_slow_deep_breaths.png" }, { text: "Shout", imageUrl: "/images/shout.png" }], correctIndex: 0 },
          { prompt: "How many deep breaths can you take?", options: [{ text: "3 or more", imageUrl: "/images/3_or_more.png" }, { text: "0", imageUrl: "/images/0.png" }], correctIndex: 0 },
          { prompt: "Where can you keep your hands while breathing?", options: [{ text: "On tummy", imageUrl: "/images/on_tummy.png" }, { text: "Throw things", imageUrl: "/images/throw_things.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Taking a Break",
        questions: [
          { prompt: "What can you do if breathing doesn't help?", options: [{ text: "Ask for a break", imageUrl: "/images/ask_for_a_break.png" }, { text: "Run away outside", imageUrl: "/images/run_away_outside.png" }], correctIndex: 0 },
          { prompt: "What can you say to teacher?", options: [{ text: "Can I go to calm corner?", imageUrl: "/images/can_i_go_to_calm_corner.png" }, { text: "I'm leaving", imageUrl: "/images/im_leaving.png" }], correctIndex: 0 },
          { prompt: "What should you not do when angry?", options: [{ text: "Run away outside", imageUrl: "/images/run_away_outside.png" }, { text: "Ask for help", imageUrl: "/images/ask_for_help.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Using Calm Tools",
        questions: [
          { prompt: "What calm tool can you use?", options: [{ text: "Squeeze ball", imageUrl: "/images/squeeze_ball.png" }, { text: "Book", imageUrl: "/images/book.png" }], correctIndex: 0 },
          { prompt: "What music helps you calm?", options: [{ text: "Soft music", imageUrl: "/images/soft_music.png" }, { text: "Loud drum", imageUrl: "/images/loud_drum.png" }], correctIndex: 0 },
          { prompt: "Is it okay to ask for your calm box?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Talking After You're Calm",
        questions: [
          { prompt: "When calm, what can you tell your teacher?", options: [{ text: "I was angry because…", imageUrl: "/images/i_was_angry_because.png" }, { text: "Nothing", imageUrl: "/images/nothing.png" }], correctIndex: 0 },
          { prompt: "Should you talk while still yelling?", options: [{ text: "No", imageUrl: "/images/no.png" }, { text: "Yes", imageUrl: "/images/yes.png" }], correctIndex: 0 },
          { prompt: "What can teacher say to help you?", options: [{ text: "Let's solve it together.", imageUrl: "/images/lets_solve_it_together.png" }, { text: "Stop it", imageUrl: "/images/stop_it.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Making It Right",
        questions: [
          { prompt: "If you shouted at a friend, what can you do?", options: [{ text: "Say sorry", imageUrl: "/images/say_sorry.png" }, { text: "Ignore", imageUrl: "/images/ignore.png" }], correctIndex: 0 },
          { prompt: "If you broke something, what next?", options: [{ text: "Tell adult", imageUrl: "/images/tell_adult.png" }, { text: "Help fix it", imageUrl: "/images/help_fix_it.png" }], correctIndex: 0 },
          { prompt: "What happens when you say sorry?", options: [{ text: "Friend feels better", imageUrl: "/images/friend_feels_better.png" }, { text: "Friend gets angry", imageUrl: "/images/friend_gets_angry.png" }], correctIndex: 0 },
        ],
      },
      {
        title: "Confidence and Generalisation",
        questions: [
          { prompt: "What can you tell yourself after calming down?", options: [{ text: "I did it!", imageUrl: "/images/i_did_it.png" }, { text: "Whatever", imageUrl: "/images/whatever.png" }], correctIndex: 0 },
          { prompt: "Can you use calm breathing at home too?", options: [{ text: "Yes", imageUrl: "/images/yes.png" }, { text: "No", imageUrl: "/images/no.png" }], correctIndex: 0 },
          { prompt: "How does it feel when you control anger?", options: [{ text: "Happy", imageUrl: "/images/happy.png" }, { text: "Proud", imageUrl: "/images/proud.png" }], correctIndex: 0 },
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
