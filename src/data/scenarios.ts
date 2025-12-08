export type Option = {
  text: { en: string; hi: string; pa: string };
  imageUrl?: string;
};

export type Q = {
  prompt: { en: string; hi: string; pa: string };
  options: Option[];
  correctIndex: number;
  imageUrl?: string;
};

export type Block = {
  title: string;
  questions: Q[]; // 3 per block (if applicable)
};

export type Scenario = {
  key: string;       // unique id
  title: string;
  skillLabel: string; // UI label
  questions: Q[];    // questions
};

export function getScenarioWithShuffledOptions(scenarioKey: keyof typeof SCENARIOS): Scenario {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Scenario with key "${scenarioKey}" not found`);
  }

  // Deep clone the scenario to avoid mutating the original
  const clonedScenario: Scenario = {
    ...scenario,
    questions: scenario.questions.map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5) // Shuffle options
    }))
  };

  return clonedScenario;
}

export const SCENARIOS: Record<string, Scenario> = {
  greeting_teacher: {
    key: "greeting_teacher",
    title: "Greeting Teacher",
    skillLabel: "Social Skills",
    questions: [
      {
        prompt: { 
          en: "Who is this person standing near the classroom?", 
          hi: "कक्षा के पास खड़ा यह व्यक्ति कौन है?", 
          pa: "ਕਲਾਸ ਦੇ ਕੋਲ ਖੜ੍ਹਾ ਇਹ ਵਿਅਕਤੀ ਕੌਣ ਹੈ?" 
        },
        options: [
          { text: { en: "Teacher", hi: "शिक्षिका", pa: "ਅਧਿਆਪਿਕਾ" }, imageUrl: "/images/teacher.png" },
          { text: { en: "Policeman", hi: "पुलिसवाला", pa: "ਪੁਲੀਸ ਵਾਲਾ" }, imageUrl: "/images/policeman.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_1.png"
      },
      {
        prompt: { 
          en: "Is she someone you know from school or a stranger?", 
          hi: "क्या वह स्कूल से आपकी परिचित है या अजनबी?", 
          pa: "ਕੀ ਉਹ ਤੁਹਾਨੂੰ ਸਕੂਲ ਤੋਂ ਜਾਣਦੀ ਹੈ ਜਾਂ ਅਜਨਬੀ ਹੈ?" 
        },
        options: [
          { text: { en: "Someone I know from school", hi: "स्कूल से जान-पहचान वाली", pa: "ਸਕੂਲ ਤੋਂ ਜਾਣ-ਪਹਚਾਣ ਵਾਲੀ" }, imageUrl: "/school_person.png" },
          { text: { en: "A stranger", hi: "अजनबी", pa: "ਅਜਨਬੀ" }, imageUrl: "/stranger.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_2.png"
      },
      {
        prompt: { 
          en: "What do we call her?", 
          hi: "हमें उन्हें क्या बुलाना चाहिए?", 
          pa: "ਅਸੀਂ ਉਸਨੂੰ ਕੀ ਕਹਿੰਦੇ ਹਾਂ?" 
        },
        options: [
          { text: { en: "Ma’am", hi: "मैडम", pa: "ਮੈਡਮ" }, imageUrl: "/teacher.png" },
          { text: { en: "Uncle", hi: "अंकल", pa: "ਅੰਕਲ" }, imageUrl: "/uncle.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_3.png"
      },
      {
        prompt: { 
          en: "When you see your teacher, do you run away or walk up slowly?", 
          hi: "जब तुम अपनी अध्यापिका को देखते हो, तो क्या तुम भाग जाते हो या धीरे-धीरे चलकर उनके पास जाते हो?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ ਆਪਣੀ ਅਧਿਆਪਕਾ ਨੂੰ ਦੇਖਦੇ ਹੋ, ਤਾਂ ਕੀ ਤੁਸੀਂ ਭੱਜ ਜਾਂਦੇ ਹੋ ਜਾਂ ਹੌਲੀ-ਹੌਲੀ ਤੁਰ ਕੇ ਨੇੜੇ ਜਾਂਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Walk up slowly", hi: "धीरे-धीरे चलकर जाना", pa: "ਹੌਲੀ-ਹੌਲੀ ਚੱਲ ਕੇ ਜਾਣਾ" }, imageUrl: "/walk_slowly.png" },
          { text: { en: "Run away", hi: "भाग जाना", pa: "ਭੱਜ ਜਾਣਾ" }, imageUrl: "/Run away.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_4.png"
      },
      {
        prompt: { 
          en: "Should you smile or make a funny face?", 
          hi: "क्या तुम्हें मुस्कुराना चाहिए या मज़ाकिया चेहरा बनाना चाहिए?", 
          pa: "ਕੀ ਤੁਹਾਨੂੰ ਮੁਸਕੁਰਾਉਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਮਜ਼ਾਕੀਆ ਚਿਹਰਾ ਬਣਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Smile", hi: "मुस्कुराना", pa: "ਮੁਸਕਰਾਉਣਾ" }, imageUrl: "/smile.png" },
          { text: { en: "Funny face", hi: "मज़ाकिया चेहरा बनाना", pa: "ਮਜ਼ਾਕੀਆ ਚਿਹਰਾ ਬਣਾਉਣਾ" }, imageUrl: "/funny_face.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_5.png"
      },
      {
        prompt: { 
          en: "Where should your eyes look when you talk?", 
          hi: "बात करते समय तुम्हारी नज़र कहाँ होनी चाहिए?", 
          pa: "ਗੱਲ ਕਰਦੇ ਸਮੇਂ ਤੁਹਾਡੀਆਂ ਅੱਖਾਂ ਕਿੱਥੇ ਹੋਣੀਆਂ ਚਾਹੀਦੀਆਂ ਹਨ?" 
        },
        options: [
          { text: { en: "Her eyes", hi: "उनकी आँखों की ओर", pa: "ਉਹਨਾਂ ਦੀਆਂ ਅੱਖਾਂ ਵੱਲ" }, imageUrl: "/eyes.png" },
          { text: { en: "Floor", hi: "फ़र्श की ओर", pa: "ਫਰਸ਼ ਵੱਲ" }, imageUrl: "/Floor.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_6.png"
      },
      {
        prompt: { 
          en: "When greeting, should you shout or speak softly?", 
          hi: "अभिवादन करते समय, क्या तुम्हें चिल्लाना चाहिए या धीरे से बोलना चाहिए?", 
          pa: "ਅਭਿਵਾਦਨ ਕਰਦੇ ਸਮੇਂ, ਕੀ ਤੁਹਾਨੂੰ ਚੀਕਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਹੌਲੇ ਬੋਲਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Speak softly", hi: "धीरे से बोलना", pa: "ਹੌਲੇ ਬੋਲਣਾ" }, imageUrl: "/Speak softly.png" },
          { text: { en: "Shout", hi: "चिल्लाना", pa: "ਚੀਕਣਾ" }, imageUrl: "/Shout.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_7.png"
      },
      {
        prompt: { 
          en: "What is another polite word you can use in the morning?", 
          hi: "सुबह में आप एक और विनम्र शब्द क्या कह सकते हैं?", 
          pa: "ਸਵੇਰੇ ਤੁਸੀਂ ਹੋਰ ਕਿਹੜਾ ਨਮ੍ਰ ਸ਼ਬਦ ਬੋਲ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Good morning", hi: "सुप्रभात", pa: "ਸ਼ੁਭ ਸਵੇਰ" }, imageUrl: "/Good morning.png" },
          { text: { en: "Later", hi: "बाद में", pa: "ਬਾਅਦ ਵਿੱਚ" }, imageUrl: "/Later.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_8.png"
      },
      {
        prompt: { 
          en: "Teacher says “Good morning!” What will you say back?", 
          hi: "अध्यापिका कहती हैं “सुप्रभात!”, तो तुम जवाब में क्या कहोगे?", 
          pa: "ਅਧਿਆਪਕਾ ਕਹਿੰਦੀ ਹੈ “ਸ਼ੁਭ ਸਵੇਰ!”, ਤਾਂ ਤੁਸੀਂ ਵਾਪਸ ਕੀ ਕਹੋਗੇ?" 
        },
        options: [
          { text: { en: "Good morning, ma’am!", hi: "सुप्रभात, मैडम!", pa: "ਸ਼ੁਭ ਸਵੇਰ, ਮੈਡਮ!" }, imageUrl: "/Good morning maam.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "/Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_9.png"
      },
      {
        prompt: { 
          en: "Should you turn away or face her while talking?", 
          hi: "बात करते समय, क्या आपको मुँह मोड़ लेना चाहिए या उनकी ओर देखकर बात करनी चाहिए?", 
          pa: "ਗੱਲ ਕਰਦੇ ਸਮੇਂ, ਕੀ ਤੁਹਾਨੂੰ ਮੂੰਹ ਮੋੜ ਲੈਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਉਸ ਵੱਲ ਦੇਖ ਕੇ ਗੱਲ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?" 
        },
        options: [
          { text: { en: "Face her", hi: "उनकी ओर देखना", pa: "ਉਸ ਵੱਲ ਦੇਖਣਾ" }, imageUrl: "/Face her.png" },
          { text: { en: "Turn away", hi: "मुँह फेर लेना", pa: "ਮੂੰਹ ਮੋੜਨਾ" }, imageUrl: "/Turn away.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_10.png"
      },
      {
        prompt: { 
          en: "What can you add after greeting?", 
          hi: "नमस्कार करने के बाद आप और क्या कह सकते हैं?", 
          pa: "ਨਮਸਕਾਰ ਕਰਨ ਤੋਂ ਬਾਅਦ ਤੁਸੀਂ ਹੋਰ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "How are you, ma’am?", hi: "मैडम, आप कैसी हैं?", pa: "ਮੈਡਮ, ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?" }, imageUrl: "/How are you maam.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "/Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_11.png"
      },
      {
        prompt: { 
          en: "Do you wave, hide behind someone, or push?", 
          hi: "क्या तुम हाथ हिलाते हो, किसी के पीछे छिप जाते हो, या धक्का देते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਹੱਥ ਹਿਲਾਉਂਦੇ ਹੋ, ਕਿਸੇ ਦੇ ਪਿੱਛੇ ਲੁਕ ਜਾਂਦੇ ਹੋ, ਜਾਂ ਧੱਕਾ ਮਾਰਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Wave", hi: "हाथ हिलाना", pa: "ਹੱਥ ਹਿਲਾਉਣਾ" }, imageUrl: "/Wave.png" },
          { text: { en: "Hide", hi: "छुपना", pa: "ਲੁਕ ਜਾਣਾ" }, imageUrl: "/Hide.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_12.png"
      },
      {
        prompt: { 
          en: "What does a friendly face look like?", 
          hi: "दोस्ताना चेहरा कैसा दिखता है?", 
          pa: "ਦੋਸਤਾਨਾ ਚਿਹਰਾ ਕਿਹੋ ਜਿਹਾ ਲੱਗਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Smile", hi: "मुस्कान", pa: "ਮੁਸਕਾਨ" }, imageUrl: "/Smile.png" },
          { text: { en: "Frown", hi: "त्योरी", pa: "ਗੁੱਸੈਲਾ ਚਿਹਰਾ" }, imageUrl: "/Frown.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_13.png"
      },
      {
        prompt: { 
          en: "Should your hands be still or flapping?", 
          hi: "क्या तुम्हारे हाथ स्थिर रहने चाहिए या फड़फड़ाने चाहिए?", 
          pa: "ਕੀ ਤੁਹਾਡੇ ਹੱਥ ਸਥਿਰ ਰਹਿਣੇ ਚਾਹੀਦੇ ਹਨ ਜਾਂ ਫੜਫੜਾਉਣੇ ਚਾਹੀਦੇ ਹਨ?" 
        },
        options: [
          { text: { en: "Still", hi: "स्थिर", pa: "ਸਥਿਰ" }, imageUrl: "/Still.png" },
          { text: { en: "Flapping", hi: "फड़फड़ाते हुए", pa: "ਫੜਫੜਾਉਣੇ" }, imageUrl: "/Flapping.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_14.png"
      },
      {
        prompt: { 
          en: "Teacher is talking to another child. What should you do?", 
          hi: "अध्यापिका किसी और बच्चे की मदद कर रही है, तो आप क्या कर सकते हैं?", 
          pa: "ਅਧਿਆਪਕਾ ਕਿਸੇ ਹੋਰ ਬੱਚੇ ਨਾਲ ਗੱਲ ਕਰ ਰਹੀ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Wait", hi: "इंतज़ार करना", pa: "ਉਡੀਕ ਕਰੋ" }, imageUrl: "/Wait.png" },
          { text: { en: "Shout", hi: "चिल्लाना", pa: "ਚੀਕਣਾ" }, imageUrl: "/Shout.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_15.png"
      },
      {
        prompt: { 
          en: "How long can you wait before saying hello again?", 
          hi: "दुबारा नमस्ते कहने से पहले तुम कितनी देर इंतज़ार कर सकते हो?", 
          pa: "ਦੁਬਾਰਾ ਨਮਸਕਾਰ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਤੁਸੀਂ ਕਿੰਨੀ ਦੇਰ ਉਡੀਕ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "A few seconds", hi: "कुछ सेकंड", pa: "ਕੁਝ ਸੈਕੰਡ" }, imageUrl: "/A few seconds.png" },
          { text: { en: "Keep shouting", hi: "लगातार चिल्लाते रहना", pa: "ਲਗਾਤਾਰ ਚੀਕਦੇ ਰਹੋ" }, imageUrl: "/Keep shouting.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_16.png"
      },
      {
        prompt: { 
          en: "What can you say after she finishes?", 
          hi: "जब वह बात पूरी कर लें तो तुम क्या कहोगे?", 
          pa: "ਜਦੋਂ ਉਹ ਗੱਲ ਮੁਕਾ ਲਵੇ ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਹੋਗੇ?" 
        },
        options: [
          { text: { en: "Excuse me, ma’am", hi: "माफ़ कीजिए, मैडम", pa: "ਮਾਫ਼ ਕਰੋ ਜੀ, ਮੈਡਮ" }, imageUrl: "/Excuse me maam.png" },
          { text: { en: "Hey listen", hi: "ऐ सुनो", pa: "ਓਏ ਸੁਣ" }, imageUrl: "/Hey listen.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_17.png"
      },
      {
        prompt: { 
          en: "Teacher asks, “How are you?” What can you say?", 
          hi: "अध्यापिका पूछती है, “तुम कैसे हो?” तुम क्या कहोगे?", 
          pa: "ਅਧਿਆਪਕਾ ਪੁੱਛਦੀ ਹੈ, “ਤੂੰ ਕਿਵੇਂ ਹੈਂ?” ਤੁਸੀਂ ਕੀ ਕਹੋਗੇ?" 
        },
        options: [
          { text: { en: "I’m fine, thank you", hi: "मैं ठीक हूँ, धन्यवाद", pa: "ਮੈਂ ਠੀਕ ਹਾਂ, ਧੰਨਵਾਦ" }, imageUrl: "/Im fine thank you.png" },
          { text: { en: "No talk", hi: "कुछ नहीं कहना", pa: "ਕੁਝ ਨਹੀਂ ਕਹਣਾ" }, imageUrl: "/No talk.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_18.png"
      },
      {
        prompt: { 
          en: "Can you ask one question back to show interest?", 
          hi: "क्या रुचि दिखाने के लिए आप एक सवाल वापस पूछ सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਦਿਲਚਸਪੀ ਦਿਖਾਉਣ ਲਈ ਵਾਪਸ ਇੱਕ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes, “How are you?”", hi: "हाँ, “आप कैसी हैं?”", pa: "ਹਾਂ, “ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?”" }, imageUrl: "/Yes How are you.png" },
          { text: { en: "No, stay silent", hi: "नहीं, चुप रहना", pa: "ਨਹੀਂ, ਚੁੱਪ ਰਹੋ" }, imageUrl: "/No stay silent.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_19.png"
      },
      {
        prompt: { 
          en: "If you don’t understand, what can you say?", 
          hi: "अगर आपको समझ नहीं आता, तो आप क्या कह सकते हैं?", 
          pa: "ਜੇ ਤੁਹਾਨੂੰ ਸਮਝ ਨਹੀਂ ਆਉਂਦਾ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Can you repeat, please?", hi: "कृपया फिर से कहें", pa: "ਕਿਰਪਾ ਕਰਕੇ ਦੋਬਾਰਾ ਕਹੋ ਜੀ?" }, imageUrl: "/Can you repeat please.png" },
          { text: { en: "Ignore it", hi: "अनदेखा करना", pa: "ਅਣਸੁਣ ਕਰਨਾ" }, imageUrl: "/Ignore it.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_20.png"
      },
      {
        prompt: { 
          en: "When the talk is over, what can you say?", 
          hi: "जब बात खत्म हो जाए, तो आप क्या कह सकते हैं?", 
          pa: "ਜਦੋਂ ਗੱਲਬਾਤ ਖਤਮ ਹੋ ਜਾਏ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "See you later, ma’am", hi: "फिर मिलेंगे, मैडम", pa: "ਫਿਰ ਮਿਲਾਂਗੇ, ਮੈਡਮ" }, imageUrl: "/See you later maam.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "/Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_21.png"
      },
      {
        prompt: { 
          en: "Should you walk away while she’s talking?", 
          hi: "जब वह बात कर रही हों, तो क्या आपको चले जाना चाहिए?", 
          pa: "ਜਦੋਂ ਉਹ ਗੱਲ ਕਰ ਰਹੀ ਹੈ, ਤਾਂ ਕੀ ਤੁਹਾਨੂੰ ਤੁਰ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "/No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "/Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_22.png"
      },
      {
        prompt: { 
          en: "What body action shows goodbye?", 
          hi: "कौन सा शारीरिक इशारा “अलविदा” दिखाता है?", 
          pa: "ਕਿਹੜਾ ਹਾਵਭਾਵ “ਅਲਵਿਦਾ” ਦਰਸਾਉਂਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Wave", hi: "हाथ हिलाना", pa: "ਹੱਥ ਹਿਲਾਉਣਾ" }, imageUrl: "/Wave.png" },
          { text: { en: "Ignore", hi: "अनदेखा करना", pa: "ਅਣਡਿੱਠਾ ਕਰਨਾ" }, imageUrl: "/Ignore.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_23.png"
      },
      {
        prompt: { 
          en: "If you forget to greet, what can you do?", 
          hi: "अगर तुम नमस्ते करना भूल गए, तो तुम क्या कर सकते हो?", 
          pa: "ਜੇ ਤੂੰ ਨਮਸਕਾਰ ਕਰਨਾ ਭੁੱਲ ਗਿਆ, ਤਾਂ ਤੂੰ ਕੀ ਕਰ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Say sorry and greet later", hi: "माफ़ी माँगकर बाद में अभिवादन करो", pa: "ਮਾਫ਼ੀ ਮੰਗ ਕੇ ਬਾਅਦ ਵਿੱਚ ਨਮਸਕਾਰ ਕਰੋ" }, imageUrl: "/Say sorry and greet later.png" },
          { text: { en: "Leave", hi: "चले जाओ", pa: "ਚਲੇ ਜਾਓ" }, imageUrl: "/Leave.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_24.png"
      },
      {
        prompt: { 
          en: "If you feel shy, what can you do?", 
          hi: "अगर आपको शर्म आती है, तो आप क्या कर सकते हैं?", 
          pa: "ਜੇ ਤੁਹਾਨੂੰ ਸ਼ਰਮ ਆਉਂਦੀ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Smile and wave first", hi: "पहले मुस्कुरा कर हाथ हिलाओ", pa: "ਪਹਿਲਾਂ ਮੁਸਕਰਾ ਕੇ ਹੱਥ ਹਿਲਾਓ" }, imageUrl: "/Smile and wave first.png" },
          { text: { en: "Stay quiet", hi: "चुप रहो", pa: "ਚੁੱਪ ਰਹੋ" }, imageUrl: "/Stay quiet.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_25.png"
      },
      {
        prompt: { 
          en: "If the teacher greets first, what should you do?", 
          hi: "यदि अध्यापिका पहले नमस्ते करती हैं, तो आपको क्या करना चाहिए?", 
          pa: "ਜੇ ਅਧਿਆਪਕਾ ਪਹਿਲਾਂ ਨਮਸਕਾਰ ਕਰਦੀ ਹੈ, ਤਾਂ ਤੁਹਾਨੂੰ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Greet back", hi: "वापस अभिवादन करो", pa: "ਵਾਪਸ ਨਮਸਕਾਰ ਕਰੋ" }, imageUrl: "/Greet back.png" },
          { text: { en: "Do nothing", hi: "कुछ मत करो", pa: "ਕੁਝ ਨਾ ਕਰੋ" }, imageUrl: "/Do nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_26.png"
      },
      {
        prompt: { 
          en: "How can you greet the school guard?", 
          hi: "आप स्कूल के गार्ड को कैसे नमस्कार करोगे?", 
          pa: "ਤੂੰ ਸਕੂਲ ਦੇ ਗਾਰਡ ਨੂੰ ਕਿਵੇਂ ਨਮਸਕਾਰ ਕਰੇਂਗਾ?" 
        },
        options: [
          { text: { en: "Say, “Good morning, sir”", hi: "कहो, “सुप्रभात, सर”", pa: "ਕਹੋ, “ਸ਼ੁਭ ਸਵੇਰ, ਸਰ”" }, imageUrl: "/Say Good morning sir.png" },
          { text: { en: "Ignore him", hi: "उसे अनदेखा करो", pa: "ਉਸਨੂੰ ਅਣਡਿੱਠਾ ਕਰੋ" }, imageUrl: "/Ignore him.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_27.png"
      },
      {
        prompt: { 
          en: "What about your classmate? (How would you greet a classmate?)", 
          hi: "अपने सहपाठी को कैसे नमस्कार करोगे?", 
          pa: "ਆਪਣੇ ਕਲਾਸਮੇਟ ਨੂੰ ਕਿਵੇਂ ਗ੍ਰੀਟ ਕਰੋਗੇ?" 
        },
        options: [
          { text: { en: "Hi (name)", hi: "हाय (नाम)", pa: "ਹਾਇ (ਨਾਮ)" }, imageUrl: "/Hi name.png" },
          { text: { en: "Good morning, ma’am", hi: "सुप्रभात, मैडम", pa: "ਸ਼ੁਭ ਸਵੇਰ, ਮੈਡਮ" }, imageUrl: "/Good morning maam.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_28.png"
      },
      {
        prompt: { 
          en: "How do you feel when someone greets you?", 
          hi: "जब कोई आपको अभिवादन करता है तो आपको कैसा लगता है?", 
          pa: "ਜਦੋਂ ਕੋਈ ਤੁਹਾਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹੈ ਤਾਂ ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Happy", hi: "खुश", pa: "ਖੁਸ਼" }, imageUrl: "/Happy.png" },
          { text: { en: "Annoyed", hi: "नाराज़", pa: "ਨਾਰाज਼" }, imageUrl: "/Annoyed.png" }
        ],
        correctIndex: 0,
        imageUrl: "/greeting_teacher_29.png"
      }
    ]
  },
  ask_help: {
    key: "ask_help",
    title: "Ask for Help",
    skillLabel: "Social Skills",
    questions: [
      {
        prompt: { 
          en: "You’re trying to open your lunch box but can’t. What should you do?", 
          hi: "आप अपना लंच बॉक्स खोलने की कोशिश कर रहे हैं लेकिन खोल नहीं पा रहे। आपको क्या करना चाहिए?", 
          pa: "ਤੁਸੀਂ ਆਪਣਾ ਲੰਚ ਬਾਕਸ ਖੋਲ੍ਹਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰ ਰਹੇ ਹੋ ਪਰ ਖੋਲ੍ਹ ਨਹੀਂ ਪਾ ਰਹੇ। ਤੁਹਾਨੂੰ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Ask for help", hi: "मदद माँगो", pa: "ਮਦਦ ਮੰਗੋ" }, imageUrl: "Ask for help.png" },
          { text: { en: "Throw it", hi: "इसे फेंक दो", pa: "ਇਸ ਨੂੰ ਸੁੱਟ ਦਓ" }, imageUrl: "Throw it.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_1.png"
      },
      {
        prompt: { 
          en: "How can you tell you need help?", 
          hi: "आपको कैसे पता चलेगा कि आपको मदद चाहिए?", 
          pa: "ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਪਤਾ ਲਗੇਗਾ ਕਿ ਤੁਹਾਨੂੰ ਮਦਦ ਦੀ ਲੋੜ ਹੈ?" 
        },
        options: [
          { text: { en: "When I can’t do it after trying", hi: "जब कोशिश करने के बाद भी नहीं कर पाता", pa: "ਜਦੋਂ ਕੋਸ਼ਿਸ਼ ਤੋਂ ਬਾਅਦ ਵੀ ਨਹੀਂ ਕਰ ਸਕਾਂ" }, imageUrl: "When I cant do it after trying.png" },
          { text: { en: "Right away without trying", hi: "बिना कोशिश किए तुरंत", pa: "ਬਿਨਾਂ ਕੋਸ਼ਿਸ਼ ਕੀਤੇ ਹੀ" }, imageUrl: "Right away without trying.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_2.png"
      },
      {
        prompt: { 
          en: "Is it okay to ask for help when something is too hard?", 
          hi: "जब कुछ बहुत मुश्किल हो, तो मदद माँगना ठीक है?", 
          pa: "ਜਦੋਂ ਕੁਝ ਬਹੁਤ ਔਖਾ ਹੋਵੇ, ਤਾਂ ਮਦਦ ਮੰਗਣਾ ਠੀਕ ਹੈ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_3.png"
      },
      {
        prompt: { 
          en: "If you’re in class, who can you ask?", 
          hi: "यदि आप कक्षा में हैं, तो आप किससे पूछ सकते हैं?", 
          pa: "ਜੇ ਤੁਸੀਂ ਕਲਾਸ ਵਿੱਚ ਹੋ, ਤਾਂ ਤੁਸੀਂ ਕਿਸਨੂੰ ਪੁੱਛ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Teacher", hi: "शिक्षिका", pa: "ਅਧਿਆਪਿਕਾ" }, imageUrl: "Teacher.png" },
          { text: { en: "Friend", hi: "दोस्त", pa: "ਦੋਸਤ" }, imageUrl: "Friend.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_4.png"
      },
      {
        prompt: { 
          en: "In the playground, who should you go to?", 
          hi: "खेल के मैदान में, आपको किसके पास जाना चाहिए?", 
          pa: "ਖੇਡ ਮੈਦਾਨ ਵਿੱਚ, ਤੁਹਾਨੂੰ ਕਿਸ ਕੋਲ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Teacher on duty", hi: "ड्यूटी पर मौजूद शिक्षिका", pa: "ਡਿਊਟੀ ਤੇ ਮੌਜੂਦ ਅਧਿਆਪਿਕਾ" }, imageUrl: "Teacher on duty.png" },
          { text: { en: "Any adult", hi: "कोई भी वयस्क", pa: "ਕੋਈ ਵੀ ਵੱਡਾ" }, imageUrl: "Any adult.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_5.png"
      },
      {
        prompt: { 
          en: "Should you ask someone you know or a stranger?", 
          hi: "क्या आपको किसी जान-पहचान वाले से पूछना चाहिए या किसी अजनबी से?", 
          pa: "ਕੀ ਤੁਹਾਨੂੰ ਜਾਣ-ਪਹਚਾਣ ਵਾਲੇ ਨੂੰ ਪੁੱਛਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਅਜਨਬੀ ਨੂੰ?" 
        },
        options: [
          { text: { en: "Someone I know", hi: "कोई जान-पहचान वाला", pa: "ਜਾਣ-ਪਹਚਾਣ ਵਾਲਾ" }, imageUrl: "Someone I know.png" },
          { text: { en: "A stranger", hi: "अजनबी", pa: "ਅਜਨਬੀ" }, imageUrl: "A stranger.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_6.png"
      },
      {
        prompt: { 
          en: "What are the first two words you can say?", 
          hi: "सबसे पहले दो शब्द कौन से हैं जो आप कह सकते हैं?", 
          pa: "ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਕਿਹੜੇ ਦੋ ਸ਼ਬਦ ਤੁਸੀਂ ਕਹਿ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“Excuse me”", hi: "माफ़ कीजिए", pa: "ਮਾਫ਼ ਕਰਨਾ" }, imageUrl: "Excuse me.png" },
          { text: { en: "“Hey you”", hi: "ऐ तुम", pa: "ਓਏ ਤੂੰ" }, imageUrl: "Hey you.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_7.png"
      },
      {
        prompt: { 
          en: "What comes next?", 
          hi: "इसके बाद आप क्या कहेंगे?", 
          pa: "ਇਸ ਤੋਂ ਬਾਅਦ ਤੁਸੀਂ ਕੀ ਕਹੋਗੇ?" 
        },
        options: [
          { text: { en: "Please help me", hi: "कृपया मेरी मदद करें", pa: "ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰੋ ਜੀ" }, imageUrl: "Please help me.png" },
          { text: { en: "Do it yourself", hi: "खुद ही कर लो", pa: "ਖੁਦ ਹੀ ਕਰ ਲਓ" }, imageUrl: "Do it yourself.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_8.png"
      },
      {
        prompt: { 
          en: "How should your voice sound?", 
          hi: "आपकी आवाज़ कैसी होनी चाहिए?", 
          pa: "ਤੁਹਾਡੀ ਆਵਾਜ਼ ਕਿਹੋ ਜਿਹੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ?" 
        },
        options: [
          { text: { en: "Calm and clear", hi: "शांत और स्पष्ट", pa: "ਸ਼ਾਂਤ ਤੇ ਸਾਫ਼" }, imageUrl: "Calm and clear.png" },
          { text: { en: "Loud", hi: "ज़ोर से", pa: "ਉੱਚੀ" }, imageUrl: "Loud.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_9.png"
      },
      {
        prompt: { 
          en: "If words are hard, what else can you do?", 
          hi: "अगर शब्द बोलना कठिन है, तो आप और क्या कर सकते हैं?", 
          pa: "ਜੇ ਸ਼ਬਦ ਬੋਲਣੇ ਔਖੇ ਹਨ, ਤਾਂ ਤੁਸੀਂ ਹੋਰ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Point", hi: "इशारा करना", pa: "ਇਸ਼ਾਰਾ ਕਰੋ" }, imageUrl: "Point.png" },
          { text: { en: "Cry", hi: "रोना", pa: "ਰੋਣਾ" }, imageUrl: "Cry.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_10.png"
      },
      {
        prompt: { 
          en: "Which gesture means help?", 
          hi: "कौन सा इशारा “मदद” का संकेत है?", 
          pa: "ਕਿਹੜਾ ਇਸ਼ਾਰਾ “ਮਦਦ” ਦਾ ਸੰਕੇਤ ਹੈ?" 
        },
        options: [
          { text: { en: "Raise hand", hi: "हाथ उठाना", pa: "ਹੱਥ ਚੁੱਕਣਾ" }, imageUrl: "Raise hand.png" },
          { text: { en: "Fold arms", hi: "बाहें मोड़ना", pa: "ਬਾਹਾਂ ਮੋੜਨਾ" }, imageUrl: "Fold arms.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_11.png"
      },
      {
        prompt: { 
          en: "Is it okay to take the teacher’s things without asking?", 
          hi: "बिना पूछे अध्यापक की चीज़ें लेना क्या ठीक है?", 
          pa: "ਬਿਨਾਂ ਪੁੱਛੇ ਅਧਿਆਪਕ ਦੀਆਂ ਚੀਜ਼ਾਂ ਲੈਣਾ ਠੀਕ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_12.png"
      },
      {
        prompt: { 
          en: "What things make you angry?", 
          hi: "कौन सी बातें तुम्हें गुस्सा दिलाती हैं?", 
          pa: "ਕਿਹੜੀਆਂ ਗੱਲਾਂ ਤੁਹਾਨੂੰ ਗੁੱਸਾ ਦਿਵਾਉਂਦੀਆਂ ਹਨ?" 
        },
        options: [
          { text: { en: "Snatching toy", hi: "खिलौना छीनना", pa: "ਖਿਲੌਣਾ ਛੀਣਨਾ" }, imageUrl: "Snatching toy.png" },
          { text: { en: "Loud noise", hi: "तेज़ शोर", pa: "ਉੱਚਾ ਸ਼ੋਰ" }, imageUrl: "Loud noise.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_13.png"
      },
      {
        prompt: { 
          en: "Can you think before shouting?", 
          hi: "क्या तुम चिल्लाने से पहले सोच सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਚੀਕਣ ਤੋਂ ਪਹਿਲਾਂ ਸੋਚ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_14.png"
      },
      {
        prompt: { 
          en: "Can you tell an adult what upset you?", 
          hi: "क्या तुम किसी बड़े को बता सकते हो कि तुम्हें क्या परेशान कर गया?", 
          pa: "ਕੀ ਤੁਸੀਂ ਕਿਸੇ ਵੱਡੇ ਨੂੰ ਦੱਸ ਸਕਦੇ ਹੋ ਕਿ ਕਿਹੜੀ ਗੱਲ ਤੁਹਾਨੂੰ ਨਾਰाज़ ਕਰ ਗਈ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_15.png"
      },
      {
        prompt: { 
          en: "What can you do if the teacher doesn’t hear you?", 
          hi: "अगर अध्यापिका आपको नहीं सुनती, तो आप क्या कर सकते हैं?", 
          pa: "ਜੇ ਅਧਿਆਪਕਾ ਤੁਹਾਨੂੰ ਨਹੀਂ ਸੁਣਦੀ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Wait and ask again politely", hi: "प्रतीक्षा करें और फिर से विनम्रता से पूछें", pa: "ਉਡੀਕ ਕਰੋ ਅਤੇ ਫਿਰ ਨਮ੍ਰਤਾ ਨਾਲ ਪੁੱਛੋ" }, imageUrl: "Wait and ask again politely.png" },
          { text: { en: "Shout loudly", hi: "ज़ोर से चिल्लाएँ", pa: "ਜ਼ੋਰ ਨਾਲ ਚੀਕੋ" }, imageUrl: "Shout loudly.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_16.png"
      },
      {
        prompt: { 
          en: "If it’s urgent, who else can you go to?", 
          hi: "अगर बहुत ज़रूरी है, तो आप और किसके पास जा सकते हैं?", 
          pa: "ਜੇ ਇਹ ਬਹੁਤ ਜ਼ਰੂਰੀ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਹੋਰ ਕਿਸੇ ਕੋਲ ਜਾ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Another teacher", hi: "दूसरे अध्यापक", pa: "ਹੋਰ ਕਿਸੇ ਅਧਿਆਪਕ" }, imageUrl: "Another teacher.png" },
          { text: { en: "Run away", hi: "भाग जाओ", pa: "ਭੱਜ ਜਾਓ" }, imageUrl: "Run away.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_17.png"
      },
      {
        prompt: { 
          en: "Is it okay to hit or throw things when you don’t get help?", 
          hi: "अगर आपको मदद नहीं मिलती, तो मारना या चीज़ें फेंकना ठीक है क्या?", 
          pa: "ਜੇ ਤੁਹਾਨੂੰ ਮਦਦ ਨਹੀਂ ਮਿਲਦੀ, ਤਾਂ ਕੀ ਮਾਰਨਾ ਜਾਂ ਚੀਜ਼ਾਂ ਸੁੱਟਣੀਆਂ ਠੀਕ ਹਨ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_18.png"
      },
      {
        prompt: { 
          en: "If you see a friend struggling, what can you do?", 
          hi: "अगर आप देखते हैं कि आपका दोस्त मुश्किल में है, तो आप क्या कर सकते हैं?", 
          pa: "ਜੇ ਤੁਸੀਂ ਵੇਖੋ ਕਿ ਤੁਹਾਡਾ ਦੋਸਤ ਮੁਸ਼ਕਲ ਵਿੱਚ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Call the teacher", hi: "अध्यापक को बुलाओ", pa: "ਅਧਿਆਪਕ ਨੂੰ ਬੁਲਾਓ" }, imageUrl: "Call the teacher.png" },
          { text: { en: "Ignore", hi: "अनदेखा करो", pa: "ਅਣਡਿੱਠਾ ਕਰੋ" }, imageUrl: "Ignore.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_19.png"
      },
      {
        prompt: { 
          en: "What can you say to a friend?", 
          hi: "दोस्त से आप क्या कह सकते हैं?", 
          pa: "ਤੁਸੀਂ ਦੋਸਤ ਨੂੰ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Do you need help?", hi: "क्या तुम्हें मदद चाहिए?", pa: "ਕੀ ਤੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?" }, imageUrl: "Do you need help.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_20.png"
      },
      {
        prompt: { 
          en: "When should you not help alone?", 
          hi: "किन हालात में आपको अकेले मदद नहीं करनी चाहिए?", 
          pa: "ਕਿਹੜੇ ਹਾਲਾਤ ਵਿੱਚ ਤੁਹਾਨੂੰ ਇਕੱਲਿਆਂ ਮਦਦ ਨਹੀਂ ਕਰਨੀ ਚਾਹੀਦੀ?" 
        },
        options: [
          { text: { en: "If it’s dangerous (like fire or electricity)", hi: "अगर स्थिति खतरनाक हो, जैसे आग या बिजली", pa: "ਜੇ ਸਥਿਤੀ ਖਤਰਨਾਕ ਹੋਵੇ (ਜਿਵੇਂ ਆਗ ਜਾਂ ਬਿਜਲੀ)" }, imageUrl: "If its dangerous like fire or electricity.png" },
          { text: { en: "Never help anyone", hi: "कभी किसी की मदद मत करो", pa: "ਕਦੇ ਵੀ ਕਿਸੇ ਦੀ ਮਦਦ ਨਾ ਕਰੋ" }, imageUrl: "Never help anyone.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_21.png"
      },
      {
        prompt: { 
          en: "If the teacher is helping another child, should you keep pulling her hand?", 
          hi: "अगर अध्यापिका किसी और बच्चे की मदद कर रही है, तो क्या आपको उनका हाथ खींचते रहना चाहिए?", 
          pa: "ਜੇ ਅਧਿਆਪਕਾ ਕਿਸੇ ਹੋਰ ਬੱਚੇ ਦੀ ਮਦਦ ਕਰ ਰਹੀ ਹੈ, ਤਾਂ ਕੀ ਤੁਹਾਨੂੰ ਉਸਦਾ ਹੱਥ ਖਿੱਚਦੇ ਰਹਿਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_22.png"
      },
      {
        prompt: { 
          en: "What face shows you’re happy with help?", 
          hi: "कौन सा चेहरा दिखाता है कि आप मदद पाकर खुश हैं?", 
          pa: "ਕਿਹੜਾ ਚਿਹਰਾ ਦਿਖਾਉਂਦਾ ਹੈ ਕਿ ਤੁਸੀਂ ਮਦਦ ਮਿਲਣ ਤੋਂ ਖੁਸ਼ ਹੋ?" 
        },
        options: [
          { text: { en: "Smile", hi: "मुस्कान", pa: "ਮੁਸਕਾਨ" }, imageUrl: "Smile.png" },
          { text: { en: "Frown", hi: "त्योरी", pa: "ਗੁੱਸੈਲਾ ਚਿਹਰਾ" }, imageUrl: "Frown.png" }
        ],
        correctIndex: 0,
        imageUrl: "ask_help_23.png"
      }
    ]
  },

  wait_turn: {
    key: "wait_turn",
    title: "Waiting Your Turn",
    skillLabel: "Social Skills",
    questions: [
      {
        prompt: { 
          en: "When you play a game, does everyone go at the same time or one by one?", 
          hi: "जब आप खेलते हैं, तो क्या सभी एक साथ जाते हैं या एक-एक करके?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ ਖੇਡਦੇ ਹੋ, ਤਾਂ ਕੀ ਸਭ ਇਕੱਠੇ ਜਾਂਦੇ ਹਨ ਜਾਂ ਇੱਕ-ਇੱਕ ਕਰਕੇ?" 
        },
        options: [
          { text: { en: "One by one", hi: "एक-एक करके", pa: "ਇੱਕ-ਇੱਕ ਕਰਕੇ" }, imageUrl: "One by one.png" },
          { text: { en: "All at once", hi: "सभी एक साथ", pa: "ਸਾਰੇ ਇਕੱਠੇ" }, imageUrl: "All at once.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_1.png"
      },
      {
        prompt: { 
          en: "What does “my turn” mean?", 
          hi: "\"मेरी बारी\" का क्या मतलब है?", 
          pa: "\"ਮੇਰੀ ਵਾਰੀ\" ਦਾ ਕੀ ਮਤਲਬ ਹੈ?" 
        },
        options: [
          { text: { en: "It’s my time to do it", hi: "यह मेरा करने का समय है", pa: "ਇਹ ਮੇਰੇ ਕਰਨ ਦਾ ਸਮਾਂ ਹੈ" }, imageUrl: "Its my time to do it.png" },
          { text: { en: "It’s your time", hi: "यह तुम्हारा समय है", pa: "ਇਹ ਤੁਹਾਡਾ ਸਮਾਂ ਹੈ" }, imageUrl: "Its your time.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_2.png"
      },
      {
        prompt: { 
          en: "What does “your turn” mean?", 
          hi: "\"तुम्हारी बारी\" का क्या मतलब है?", 
          pa: "\"ਤੁਹਾਡੇ ਵਾਰੀ\" ਦਾ ਕੀ ਮਤਲਬ ਹੈ?" 
        },
        options: [
          { text: { en: "It’s the other person’s time", hi: "यह दूसरे व्यक्ति का समय है", pa: "ਇਹ ਦੂਜੇ ਵਿਅਕਤੀ ਦਾ ਸਮਾਂ ਹੈ" }, imageUrl: "Its the other persons time.png" },
          { text: { en: "It’s my time", hi: "यह मेरा समय है", pa: "ਇਹ ਮੇਰਾ ਸਮਾਂ ਹੈ" }, imageUrl: "Its my time.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_3.png"
      },
      {
        prompt: { 
          en: "If the teacher says “Now Ravi’s turn,” what should you do?", 
          hi: "यदि अध्यापक कहते हैं, \"अब रवि की बारी,\" तो आपको क्या करना चाहिए?", 
          pa: "ਜੇ ਅਧਿਆਪਕ ਕਹਿੰਦੇ ਹਨ, \"ਹੁਣ ਰਵਿ ਦੀ ਵਾਰੀ,\" ਤਾਂ ਤੁਹਾਨੂੰ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Wait", hi: "प्रतीक्षा करो", pa: "ਉਡੀਕ ਕਰੋ" }, imageUrl: "Wait.png" },
          { text: { en: "Grab the toy", hi: "खिलौना छीन लो", pa: "ਖਿਲੌਣਾ ਛੀਨ ਲਵੋ" }, imageUrl: "Grab the toy.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_4.png"
      },
      {
        prompt: { 
          en: "How do you know when your turn is coming?", 
          hi: "आपको कैसे पता चलेगा कि आपकी बारी आने वाली है?", 
          pa: "ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਪਤਾ ਲਗੇਗਾ ਕਿ ਤੁਹਾਡੀ ਵਾਰੀ ਆਉਣ ਵਾਲੀ ਹੈ?" 
        },
        options: [
          { text: { en: "When the teacher calls my name", hi: "जब अध्यापक मेरा नाम पुकारें", pa: "ਜਦੋਂ ਅਧਿਆਪਕਾ ਮੇਰਾ ਨਾਮ ਲਏ" }, imageUrl: "When the teacher calls my name.png" },
          { text: { en: "I just grab it", hi: "मैं बस इसे पकड़ लूँ", pa: "ਮੈਂ ਸਿਰਫ ਇਸ ਨੂੰ ਫੜ ਲਵਾਂਗਾ" }, imageUrl: "I just grab it.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_5.png"
      },
      {
        prompt: { 
          en: "Should you grab the toy before she says your name?", 
          hi: "क्या आपको नाम पुकारने से पहले खिलौना पकड़ लेना चाहिए?", 
          pa: "ਕੀ ਤੁਹਾਨੂੰ ਨਾਮ ਪੁਕਾਰਣ ਤੋਂ ਪਹਿਲਾਂ ਖਿਲੌਣਾ ਫੜ ਲੈਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_6.png"
      },
      {
        prompt: { 
          en: "Where should your hands be?", 
          hi: "आपके हाथ कहाँ होने चाहिए?", 
          pa: "ਤੁਹਾਡੇ ਹੱਥ ਕਿੱਥੇ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ?" 
        },
        options: [
          { text: { en: "On lap", hi: "गोद में", pa: "ਗੋਦ ਵਿੱਚ" }, imageUrl: "On lap.png" },
          { text: { en: "Taking toy", hi: "खिलौना पकड़ने में", pa: "ਖਿਲੌਣਾ ਲੈਣ ਵਿੱਚ" }, imageUrl: "Taking toy.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_7.png"
      },
      {
        prompt: { 
          en: "What can you look at?", 
          hi: "आप कहाँ देख सकते हैं?", 
          pa: "ਤੁਸੀਂ ਕਿੱਥੇ ਦੇਖ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "The person playing", hi: "जो खेल रहा है (उस व्यक्ति को)", pa: "ਖੇਡ ਰਹੇ ਵਿਅਕਤੀ ਨੂੰ" }, imageUrl: "The person playing.png" },
          { text: { en: "The ceiling", hi: "छत को", pa: "ਛੱਤ ਨੂੰ" }, imageUrl: "The ceiling.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_8.png"
      },
      {
        prompt: { 
          en: "What can you think or say quietly?", 
          hi: "आप चुपचाप क्या सोच या कह सकते हैं?", 
          pa: "ਤੁਸੀਂ ਚੁੱਪਚਾਪ ਕੀ ਸੋਚ ਜਾਂ ਕਹਿ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“I can wait my turn.”", hi: "\"मैं अपनी बारी का इंतज़ार कर सकता हूँ\"", pa: "\"ਮੈਂ ਆਪਣੀ ਵਾਰੀ ਦਾ ਉਡੀਕ ਕਰ ਸਕਦਾ ਹਾਂ\"" }, imageUrl: "I can wait my turn.png" },
          { text: { en: "“I want it now.”", hi: "\"मुझे अभी चाहिए\"", pa: "\"ਮੈਨੂੰ ਹੁਣੇ ਚਾਹੀਦਾ ਹੈ\"" }, imageUrl: "I want it now.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_9.png"
      },
      {
        prompt: { 
          en: "If waiting feels long, what can you do?", 
          hi: "यदि प्रतीक्षा लंबी लगती है, तो आप क्या कर सकते हैं?", 
          pa: "ਜੇ ਉਡੀਕ ਲੰਮੀ ਲਗਦੀ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Take deep breaths", hi: "गहरी साँस लो", pa: "ਡੂੰਘੀਆਂ ਸਾਹਾਂ ਲਵੋ" }, imageUrl: "Take deep breaths.png" },
          { text: { en: "Yell", hi: "चिल्लाओ", pa: "ਚਿਲਾਓ" }, imageUrl: "Yell.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_10.png"
      },
      {
        prompt: { 
          en: "How can you keep busy?", 
          hi: "आप खुद को व्यस्त कैसे रख सकते हैं?", 
          pa: "ਤੁਸੀਂ ਆਪਣੇ ਆਪ ਨੂੰ ਕਿਵੇਂ ਵਿਅਸਤ ਰੱਖ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Count to 5", hi: "5 तक गिनो", pa: "5 ਤੱਕ ਗਿਣੋ" }, imageUrl: "Count to 5.png" },
          { text: { en: "Kick the chair", hi: "कुर्सी को लात मारो", pa: "ਕੁਰਸੀ ਨੂੰ ਲਾਤ ਮਾਰੋ" }, imageUrl: "Kick the chair.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_11.png"
      },
      {
        prompt: { 
          en: "If you forget whose turn it is, what can you ask?", 
          hi: "अगर आप भूल जाते हैं कि किसकी बारी है, तो आप क्या पूछ सकते हैं?", 
          pa: "ਜੇ ਤੁਸੀਂ ਭੁੱਲ ਜਾਂਦੇ ਹੋ ਕਿ ਕਿਸ ਦੀ ਵਾਰੀ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਪੁੱਛ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“Is it my turn now?”", hi: "\"क्या अब मेरी बारी है?\"", pa: "\"ਕੀ ਹੁਣ ਮੇਰੀ ਵਾਰੀ ਹੈ?\"" }, imageUrl: "Is it my turn now.png" },
          { text: { en: "“Give me!”", hi: "\"मुझे दो!\"", pa: "\"ਮੇਨੂੰ ਦੇਓ!\"" }, imageUrl: "Give me.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_12.png"
      },
      {
        prompt: { 
          en: "When it’s your turn, what should you say?", 
          hi: "जब तुम्हारी बारी हो, तो तुम्हें क्या कहना चाहिए?", 
          pa: "ਜਦੋਂ ਤੁਹਾਡੀ ਵਾਰੀ ਹੋਵੇ, ਤਾਂ ਤੁਹਾਨੂੰ ਕੀ کہنا ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "“My turn!”", hi: "\"मेरी बारी!\"", pa: "\"ਮੇਰੀ ਵਾਰੀ!\"" }, imageUrl: "My turn.png" },
          { text: { en: "“Give me!”", hi: "\"मुझे दो!\"", pa: "\"ਮੇਨੂੰ ਦੇਓ!\"" }, imageUrl: "Give me.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_13.png"
      },
      {
        prompt: { 
          en: "Should you push to take it?", 
          hi: "क्या लेने के लिए धक्का देना चाहिए?", 
          pa: "ਕੀ ਲੈਣ ਲਈ ਧੱਕਾ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_14.png"
      },
      {
        prompt: { 
          en: "When you finish, what can you say?", 
          hi: "जब तुम ख़त्म कर लो, तो तुम क्या कह सकते हो?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ ਖਤਮ ਕਰ ਲਵੋ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“Now your turn.”", hi: "\"अब तुम्हारी बारी.\"", pa: "\"ਹੁਣ ਤੁਹਾਡੀ ਵਾਰੀ.\"" }, imageUrl: "Now your turn.png" },
          { text: { en: "“Done!”", hi: "\"हो गया!\"", pa: "\"ਹੋ ਗਿਆ!\"" }, imageUrl: "Done.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_15.png"
      },
      {
        prompt: { 
          en: "Can you wait for your turn on the slide too?", 
          hi: "क्या तुम फिसलपट्टी (स्लाइड) पर भी अपनी बारी का इंतज़ार कर सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਸਲਾਈਡ 'ਤੇ ਵੀ ਆਪਣੀ ਵਾਰੀ ਦੀ ਉਡੀਕ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_16.png"
      },
      {
        prompt: { 
          en: "What can you tell yourself while waiting?", 
          hi: "प्रतीक्षा करते समय तुम खुद से क्या कह सकते हो?", 
          pa: "ਉਡੀਕ ਕਰਦੇ ਸਮੇਂ ਤੁਸੀਂ ਆਪਣੇ ਆਪ ਨੂੰ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“I can do it.”", hi: "\"मैं कर सकता हूँ\"", pa: "\"ਮੈਂ ਕਰ ਸਕਦਾ ਹਾਂ\"" }, imageUrl: "I can do it.png" },
          { text: { en: "“Hurry up!”", hi: "\"जल्दी करो!\"", pa: "\"ਜਲਦੀ ਕਰੋ!\"" }, imageUrl: "Hurry up.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_17.png"
      },
      {
        prompt: { 
          en: "How do friends feel when you wait nicely?", 
          hi: "जब तुम अच्छे से इंतज़ार करते हो, तो दोस्तों को कैसा लगता है?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ ਚੰਗੀ ਤਰ੍ਹਾਂ ਉਡੀਕ ਕਰਦੇ ਹੋ, ਤਾਂ ਦੋਸਤਾਂ ਨੂੰ ਕਿਵੇਂ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Happy", hi: "खुश", pa: "ਖੁਸ਼" }, imageUrl: "Happy.png" },
          { text: { en: "Annoyed", hi: "नाराज़", pa: "ਨਾਰाज़" }, imageUrl: "Annoyed.png" }
        ],
        correctIndex: 0,
        imageUrl: "wait_turn_18.png"
      }
    ]
  },

  share_play: {
    key: "share_play",
    title: "Sharing and Playing",
    skillLabel: "Social Skills",
    questions: [
      {
        prompt: { 
          en: "When two children both want the same toy, what can they do?", 
          hi: "जब दो बच्चे एक ही खिलौना चाहते हैं, तो वे क्या कर सकते हैं?", 
          pa: "ਜਦੋਂ ਦੋ ਬੱਚੇ ਇੱਕੋ ਖਿਲੌਣਾ ਚਾਹੁੰਦੇ ਹਨ, ਤਾਂ ਉਹ ਕੀ ਕਰ ਸਕਦੇ ਹਨ?" 
        },
        options: [
          { text: { en: "Take turns", hi: "बारी-बारी से खेल सकते हैं", pa: "ਵਾਰੀ ਵਾਰੀ ਖੇਡ ਸਕਦੇ ਹਨ" }, imageUrl: "Take turns.png" },
          { text: { en: "Fight", hi: "लड़ सकते हैं", pa: "ਲੜ ਸਕਦੇ ਹਨ" }, imageUrl: "Fight.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_1.png"
      },
      {
        prompt: { 
          en: "What does sharing mean?", 
          hi: "साझा करने का क्या मतलब है?", 
          pa: "ਸਾਂਝਾ ਕਰਨ ਦਾ ਕੀ ਮਤਲਬ ਹੈ?" 
        },
        options: [
          { text: { en: "Letting someone use your toy too", hi: "अपना खिलौना किसी और को भी इस्तेमाल करने देना", pa: "ਆਪਣਾ ਖਿਡੌਣਾ ਕਿਸੇ ਹੋਰ ਨੂੰ ਵੀ ਵਰਤਣ ਦੇਣਾ" }, imageUrl: "Letting someone use your toy too.png" },
          { text: { en: "Keeping it only for yourself", hi: "इसे सिर्फ अपने पास रखना", pa: "ਸਿਰਫ ਆਪਣੇ ਲਈ ਰੱਖਣਾ" }, imageUrl: "Keeping it only for yourself.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_2.png"
      },
      {
        prompt: { 
          en: "Is sharing a good thing or a bad thing?", 
          hi: "साझा करना अच्छी बात है या बुरी बात?", 
          pa: "ਕੀ ਸਾਂਝਾ ਕਰਨਾ ਚੰਗੀ ਗੱਲ ਹੈ ਜਾਂ ਮੰਦੀ ਗੱਲ?" 
        },
        options: [
          { text: { en: "Good thing", hi: "अच्छी बात", pa: "ਚੰਗੀ ਗੱਲ" }, imageUrl: "Good thing.png" },
          { text: { en: "Bad thing", hi: "बुरी बात", pa: "ਮੰਦੀ ਗੱਲ" }, imageUrl: "Bad thing.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_3.png"
      },
      {
        prompt: { 
          en: "How do you feel when someone shares with you?", 
          hi: "जब कोई तुम्हारे साथ साझा करता है तो तुम्हें कैसा लगता है?", 
          pa: "ਜਦੋਂ ਕੋਈ ਤੁਹਾਡੇ ਨਾਲ ਸਾਂਝਾ ਕਰਦਾ ਹੈ ਤਾਂ ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਲੱਗਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Happy", hi: "खुश", pa: "ਖੁਸ਼" }, imageUrl: "Happy.png" },
          { text: { en: "Sad", hi: "दुखी", pa: "ਉਦਾਸ" }, imageUrl: "Sad.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_4.png"
      },
      {
        prompt: { 
          en: "How does your friend feel when you share?", 
          hi: "जब तुम साझा करते हो तो तुम्हारा दोस्त कैसा महसूस करता है?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ ਸਾਂਝਾ ਕਰਦੇ ਹੋ ਤਾਂ ਤੁਹਾਡਾ ਦੋਸਤ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Happy", hi: "खुश", pa: "ਖੁਸ਼" }, imageUrl: "Happy.png" },
          { text: { en: "Sad", hi: "दुखी", pa: "ਉਦਾਸ" }, imageUrl: "Sad.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_5.png"
      },
      {
        prompt: { 
          en: "If you keep all toys to yourself, how do others feel?", 
          hi: "अगर तुम सब खिलौने अपने पास रखते हो, तो दूसरों को कैसा लगता है?", 
          pa: "ਜੇ ਤੁਸੀਂ ਸਾਰੇ ਖਿਲੌਣੇ ਆਪਣੇ ਕੋਲ ਰੱਖਦੇ ਹੋ, ਤਾਂ ਹੋਰਾਂ ਨੂੰ ਕਿਵੇਂ ਲੱਗਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Sad", hi: "दुखी", pa: "ਉਦਾਸ" }, imageUrl: "Sad.png" },
          { text: { en: "Angry", hi: "गुस्सा", pa: "ਗੁੱਸੇ" }, imageUrl: "Angry.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_6.png"
      },
      {
        prompt: { 
          en: "If you want a friend’s toy, what can you say?", 
          hi: "अगर तुम्हें दोस्त का खिलौना चाहिए, तो तुम क्या कह सकते हो?", 
          pa: "ਜੇ ਤੁਹਾਨੂੰ ਦੋਸਤ ਦਾ ਖਿਲੌਣਾ ਚਾਹੀਦਾ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਹ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“Can I play with it, please?”", hi: "\"क्या मैं इसके साथ खेल सकता हूँ, कृपया?\"", pa: "\"ਕੀ ਮੈਂ ਇਸ ਨਾਲ ਖੇਡ ਸਕਦਾ ਹਾਂ, ਜੀ?\"" }, imageUrl: "Can I play with it please.png" },
          { text: { en: "“Give me now!”", hi: "\"अभी दो!\"", pa: "\"ਹੁਣੇ ਦੇ ਦੋ!\"" }, imageUrl: "Give me now.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_7.png"
      },
      {
        prompt: { 
          en: "Should you grab it or ask first?", 
          hi: "क्या तुम्हें खिलौना छीन लेना चाहिए या पहले पूछना चाहिए?", 
          pa: "ਕੀ ਤੂੰ ਆਪਣਾ ਖਿਲੌਣਾ ਲੁਕਾਉਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਪਹਿਲਾਂ ਪੁੱਛਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Ask first", hi: "पहले पूछो", pa: "ਪਹਿਲਾਂ ਪੁੱਛੋ" }, imageUrl: "Ask first.png" },
          { text: { en: "Grab it", hi: "छीन लो", pa: "ਛੀਨ ਲਵੋ" }, imageUrl: "Grab it.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_8.png"
      },
      {
        prompt: { 
          en: "If your friend says “Wait,” what can you say?", 
          hi: "अगर तुम्हारा दोस्त कहे \"रुको\", तो तुम क्या कहोगे?", 
          pa: "ਜੇ ਤੇਰਾ ਦੋਸਤ ਕਹੇ \"ਰੁਕ\", ਤਾਂ ਤੂੰ ਕੀ ਕਹੇਗਾ?" 
        },
        options: [
          { text: { en: "“Okay, I’ll wait.”", hi: "\"ठीक है, मैं इंतज़ार करूँगा\"", pa: "\"ਠੀਕ ਹੈ, ਮੈਂ ਉਡੀਕ ਕਰਾਂਗਾ\"" }, imageUrl: "Okay Ill wait.png" },
          { text: { en: "“No, give it.”", hi: "\"नहीं, मुझे दो\"", pa: "\"ਨਹੀਂ, ਦੇ ਦੋ\"" }, imageUrl: "No give it.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_9.png"
      },
      {
        prompt: { 
          en: "If you have a toy car and your friend has none, what can you say?", 
          hi: "अगर तुम्हारे पास एक कार है और दोस्त के पास नहीं है, तो तुम क्या कह सकते हो?", 
          pa: "ਜੇ ਤੇਰੇ ਕੋਲ ਇੱਕ ਖਿਲੌਨਾ ਕਾਰ ਹੈ ਅਤੇ ਤੇਰੇ ਦੋਸਤ ਕੋਲ ਨਹੀਂ ਹੈ, ਤਾਂ ਤੂੰ ਕੀ ਕਹਿ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "“You can play too!”", hi: "\"तुम भी खेल सकते हो!\"", pa: "\"ਤੂੰ ਵੀ ਖੇਡ ਸਕਦਾ ਹੈਂ!\"" }, imageUrl: "You can play too.png" },
          { text: { en: "“No one can touch it.”", hi: "\"इसे कोई नहीं छू सकता!\"", pa: "\"ਇਸਨੂੰ ਕੋਈ ਨਹੀਂ ਛੂਹ ਸਕਦਾ!\"" }, imageUrl: "No one can touch it.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_10.png"
      },
      {
        prompt: { 
          en: "Should you hide your toy or show it?", 
          hi: "क्या तुम्हें अपना खिलौना छुपाना चाहिए या दिखाना चाहिए?", 
          pa: "ਕੀ ਤੂੰ ਆਪਣਾ ਖਿਲੌਣਾ ਲੁਕਾਉਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਵਿਖਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Show it", hi: "दिखाओ", pa: "ਵਖਾਓ" }, imageUrl: "Show it.png" },
          { text: { en: "Hide it", hi: "छुपाओ", pa: "ਲੁਕਾਓ" }, imageUrl: "Hide it.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_11.png"
      },
      {
        prompt: { 
          en: "What face shows you’re happy to share?", 
          hi: "कौन सा चेहरा दिखाता है कि तुम साझा करके खुश हो?", 
          pa: "ਕਿਹੜਾ ਚਿਹਰਾ ਦਿਖਾਉਂਦਾ ਹੈ ਕਿ ਤੂੰ ਸਾਂਝਾ ਕਰਕੇ ਖੁਸ਼ ਹੈਂ?" 
        },
        options: [
          { text: { en: "Smile", hi: "मुस्कान", pa: "ਮੁਸਕਾਨ" }, imageUrl: "Smile.png" },
          { text: { en: "Frown", hi: "त्योरी", pa: "ਗੁੱਸੈਲਾ ਚਿਹਰਾ" }, imageUrl: "Frown.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_12.png"
      },
      {
        prompt: { 
          en: "How long can you play before giving a turn?", 
          hi: "बारी देने से पहले तुम कितनी देर खेल सकते हो?", 
          pa: "ਵਾਰੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਤੂੰ ਕਿੰਨੀ ਦੇਰ ਖੇਡ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "A few minutes", hi: "कुछ मिनट", pa: "ਕੁਝ ਮਿੰਟ" }, imageUrl: "A few minutes.png" },
          { text: { en: "All day", hi: "पूरा दिन", pa: "ਸਾਰਾ ਦਿਨ" }, imageUrl: "All day.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_13.png"
      },
      {
        prompt: { 
          en: "What can you say when giving a turn?", 
          hi: "बारी देते समय तुम क्या कह सकते हो?", 
          pa: "ਵਾਰੀ ਦੇਂਦੇ ਸਮੇਂ ਤੂੰ ਕੀ ਕਹਿ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "“Now your turn!”", hi: "\"अब तुम्हारी बारी!\"", pa: "\"ਹੁਣ ਤੇਰੀ ਵਾਰੀ!\"" }, imageUrl: "Now your turn.png" },
          { text: { en: "“Mine forever!”", hi: "\"हमेशा मेरी!\"", pa: "\"ਮੇਰੀ ਸਦਾ ਲਈ!\"" }, imageUrl: "Mine forever.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_14.png"
      },
      {
        prompt: { 
          en: "What do you do while waiting?", 
          hi: "इंतज़ार करते हुए तुम क्या करते हो?", 
          pa: "ਉਡੀਕ ਕਰਦੇ ਹੋਏ ਤੂੰ ਕੀ ਕਰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Watch or clap", hi: "देखो या ताली बजाओ", pa: "ਵੇਖਦੇ ਰਹੋ ਜਾਂ ਤਾਲੀ ਵਜਾਓ" }, imageUrl: "Watch or clap.png" },
          { text: { en: "Grab the toy", hi: "खिलौना छीन लो", pa: "ਖਿਲੌਣਾ ਛੀਨ ਲਵੋ" }, imageUrl: "Grab the toy.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_15.png"
      },
      {
        prompt: { 
          en: "If a friend says “No, it’s mine!”, what can you do?", 
          hi: "अगर दोस्त कहे \"नहीं, यह मेरा है!\", तो तुम क्या कर सकते हो?", 
          pa: "ਜੇ ਦੋਸਤ ਕਹੇ \"ਨਹੀਂ, ਇਹ ਮੇਰਾ ਹੈ!\", ਤਾਂ ਤੂੰ ਕੀ ਕਰ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Ask the teacher for help", hi: "शिक्षिका से मदद माँगो", pa: "ਅਧਿਆਪਿਕਾ ਕੋਲੋਂ ਮਦਦ ਮੰਗੋ" }, imageUrl: "Ask the teacher for help.png" },
          { text: { en: "Shout at them", hi: "उस पर चिल्लाओ", pa: "ਉਨ੍ਹਾਂ 'ਤੇ ਚੀਕੋ" }, imageUrl: "Shout at them.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_16.png"
      },
      {
        prompt: { 
          en: "Can you take another toy instead?", 
          hi: "क्या तुम इसकी बजाय कोई और खिलौना ले सकते हो?", 
          pa: "ਕੀ ਤੂੰ ਇਸ ਦੀ ਬਜਾਏ ਹੋਰ ਖਿਲੌਣਾ ਲੈ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_17.png"
      },
      {
        prompt: { 
          en: "Should you hit or push?", 
          hi: "क्या तुम्हें मारना या धक्का देना चाहिए?", 
          pa: "ਕੀ ਤੁਹਾਨੂੰ ਮਾਰਨਾ ਜਾਂ ਧੱਕਾ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_18.png"
      },
      {
        prompt: { 
          en: "Can two children play with the same toys together?", 
          hi: "क्या दो बच्चे एक ही खिलौने से साथ-साथ खेल सकते हैं?", 
          pa: "ਕੀ ਦੋ ਬੱਚੇ ਇਕੋ ਖਿਲੌਣੇ ਨਾਲ ਇਕੱਠੇ ਖੇਡ ਸਕਦੇ ਹਨ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_19.png"
      },
      {
        prompt: { 
          en: "What can you say to invite a friend?", 
          hi: "दोस्त को खेलने के लिए बुलाने के लिए तुम क्या कह सकते हो?", 
          pa: "ਦੋਸਤ ਨੂੰ ਖੇਡਣ ਲਈ ਸੱਦਣ ਵਾਸਤੇ ਤੂੰ ਕੀ ਕਹਿ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "“Let’s play together!”", hi: "\"चलो साथ खेलें!\"", pa: "\"ਚਲੋ ਇਕੱਠੇ ਖੇਡੀਏ!\"" }, imageUrl: "Lets play together.png" },
          { text: { en: "“Go away!”", hi: "\"दूर हो जाओ!\"", pa: "\"ਦੂਰ ਹੋ ਜਾਓ!\"" }, imageUrl: "Go away.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_20.png"
      },
      {
        prompt: { 
          en: "What helps both of you enjoy?", 
          hi: "किससे तुम दोनों को मज़ा आता है?", 
          pa: "ਕਿਸ ਨਾਲ ਤੁਹਾਨੂੰ ਦੋਵੇਂ ਨੂੰ ਮਜ਼ਾ ਆਉਂਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Take turns", hi: "बारी-बारी से", pa: "ਵਾਰੀ ਵਾਰੀ" }, imageUrl: "Take turns.png" },
          { text: { en: "Fight", hi: "लड़ना", pa: "ਲੜਨਾ" }, imageUrl: "Fight.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_21.png"
      },
      {
        prompt: { 
          en: "A friend shared a toy with you. What can you say?", 
          hi: "दोस्त ने तुम्हारे साथ खिलौना साझा किया। तुम क्या कहोगे?", 
          pa: "ਦੋਸਤ ਨੇ ਤੁਹਾਡੇ ਨਾਲ ਖਿਲੌਣਾ ਸਾਂਝਾ ਕੀਤਾ। ਤੁਸੀਂ ਕੀ ਕਹੋਗੇ?" 
        },
        options: [
          { text: { en: "“Thank you!”", hi: "\"धन्यवाद!\"", pa: "\"ਧੰਨਵਾਦ!\"" }, imageUrl: "Thank you.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_22.png"
      },
      {
        prompt: { 
          en: "Should you throw the toy back?", 
          hi: "क्या तुम्हें खिलौना वापस फेंक देना चाहिए?", 
          pa: "ਕੀ ਤੈਨੂੰ ਖਿਲੌਣਾ ਵਾਪਸ ਸੁੱਟ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_23.png"
      },
      {
        prompt: { 
          en: "What can you do to show kindness?", 
          hi: "दयालुता दिखाने के लिए तुम क्या कर सकते हो?", 
          pa: "ਦਇਆ ਦਿਖਾਉਣ ਲਈ ਤੂੰ ਕੀ ਕਰ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Share your toy next time", hi: "अगली बार अपना खिलौना साझा करो", pa: "ਅਗਲੀ ਵਾਰ ਆਪਣਾ ਖਿਲੌਣਾ ਸਾਂਝਾ ਕਰੋ" }, imageUrl: "Share your toy next time.png" },
          { text: { en: "Walk away", hi: "चले जाओ", pa: "ਚਲੇ ਜਾਓ" }, imageUrl: "Walk away.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_24.png"
      },
      {
        prompt: { 
          en: "If you both want the same toy, what can you do?", 
          hi: "अगर तुम दोनों को एक ही खिलौना चाहिए, तो तुम लोग क्या कर सकते हो?", 
          pa: "ਜੇ ਤੁਹਾਨੂੰ ਦੋਵੇਂ ਨੂੰ ਇਕੋ ਖਿਲੌਣਾ ਚਾਹੀਦਾ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Use a timer or take turns", hi: "टाइमर का उपयोग करो या बारी-बारी से खेलो", pa: "ਟਾਇਮਰ ਲਗਾਓ ਜਾਂ ਵਾਰੀਆਂ ਲਵੋ" }, imageUrl: "Use a timer or take turns.png" },
          { text: { en: "Grab it fast", hi: "जल्दी से छीन लो", pa: "ਜਲਦੀ ਨਾਲ ਛੀਨ ਲਵੋ" }, imageUrl: "Grab it fast.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_25.png"
      },
      {
        prompt: { 
          en: "If a toy breaks, what should you do?", 
          hi: "अगर खिलौना टूट जाए, तो तुम्हें क्या करना चाहिए?", 
          pa: "ਜੇ ਖਿਲੌਣਾ ਟੁੱਟ ਜਾਏ, ਤਾਂ ਤੁਹਾਨੂੰ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Say sorry", hi: "माफ़ी माँगो", pa: "ਮਾਫ਼ੀ ਮੰਗੋ" }, imageUrl: "Say sorry.png" },
          { text: { en: "Hide it", hi: "छुपा दो", pa: "ਲੁਕਾ ਦਓ" }, imageUrl: "Hide it.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_26.png"
      },
      {
        prompt: { 
          en: "If a friend cries, what can you say?", 
          hi: "अगर दोस्त रोने लगे, तो तुम क्या कह सकते हो?", 
          pa: "ਜੇ ਦੋਸਤ ਰੋਵੇ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਹਿ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“It’s okay, we can share.”", hi: "\"कोई बात नहीं, हम साझा कर सकते हैं\"", pa: "\"ਠੀਕ ਹੈ, ਅਸੀਂ ਸਾਂਝਾ ਕਰ ਸਕਦੇ ਹਾਂ.\"" }, imageUrl: "Its okay we can share.png" },
          { text: { en: "“Too bad for you.”", hi: "\"तुम्हारा ही नुकसान है\"", pa: "\"ਤੇਰਾ ਹੀ ਨੁਕਸਾਨ\"" }, imageUrl: "Too bad for you.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_27.png"
      },
      {
        prompt: { 
          en: "Can you share things at home too?", 
          hi: "क्या तुम घर पर भी चीज़ें साझा कर सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਘਰ ਵਿੱਚ ਵੀ ਚੀਜ਼ਾਂ ਸਾਂਝੀਆਂ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes, with brother or sister", hi: "हाँ, भाई या बहन के साथ", pa: "ਹਾਂ, ਭਰਾ ਜਾਂ ਭੈਣ ਨਾਲ" }, imageUrl: "Yes with brother or sister.png" },
          { text: { en: "No, never share at home", hi: "नहीं, घर पर कभी साझा मत करो", pa: "ਨਹੀਂ, ਘਰ ਵਿੱਚ ਕਦੇ ਵੀ ਸਾਂਝਾ ਨਾ ਕਰੋ" }, imageUrl: "No never share at home.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_28.png"
      },
      {
        prompt: { 
          en: "Can you share art materials at school?", 
          hi: "क्या तुम स्कूल में कला की सामग्री साझा कर सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਸਕੂਲ ਵਿੱਚ ਕਲਾ ਸਮੱਗਰੀ ਸਾਂਝੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_29.png"
      },
      {
        prompt: { 
          en: "How do you feel when everyone shares?", 
          hi: "जब सभी मिलकर साझा करते हैं तो तुम्हें कैसा लगता है?", 
          pa: "ਜਦੋਂ ਸਭ ਮਿਲਕੇ ਸਾਂਝਾ ਕਰਦੇ ਹਨ, ਤਾਂ ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਲੱਗਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Happy and calm", hi: "खुश और शांत", pa: "ਖੁਸ਼ ਅਤੇ ਸ਼ਾਂਤ" }, imageUrl: "Happy and calm.png" },
          { text: { en: "Left out", hi: "अलग-थलग पड़ा (अकेला)", pa: "ਅਕੇਲਾ ਮਹਿਸੂਸ ਕਰਨਾ" }, imageUrl: "Left out.png" }
        ],
        correctIndex: 0,
        imageUrl: "share_play_30.png"
      }
    ]
  },

  calm_down: {
    key: "calm_down",
    title: "Calm Down",
    skillLabel: "Emotional Regulation",
    questions: [
      {
        prompt: { 
          en: "How does your body feel when you get angry?", 
          hi: "जब तुम्हें गुस्सा आता है तो तुम्हारा शरीर कैसा महसूस करता है?", 
          pa: "ਜਦੋਂ ਤੈਨੂੰ ਗੁੱਸਾ ਆਉਂਦਾ ਹੈ ਤਾਂ ਤੇਰਾ ਸਰੀਰ ਕਿਵੇਂ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Hot", hi: "गरम", pa: "ਗਰਮ" }, imageUrl: "Hot.png" },
          { text: { en: "Cold", hi: "ठंडा", pa: "ਠੰਢਾ" }, imageUrl: "Cold.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_1.png"
      },
      {
        prompt: { 
          en: "What happens to your face when you’re angry?", 
          hi: "जब तुम गुस्से में होते हो तो तुम्हारे चेहरे का क्या हाल होता है?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ ਗੁੱਸੇ ਵਿੱਚ ਹੁੰਦੇ ਹੋ ਤਾਂ ਤੁਹਾਡੇ ਚਿਹਰੇ ਦਾ ਕੀ ਹਾਲ ਹੁੰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Frown", hi: "त्योरी चढ़ जाती है", pa: "ਭੌਹਾਂ ਚੜ੍ਹ ਜਾਂਦੀਆਂ ਹਨ" }, imageUrl: "Frown.png" },
          { text: { en: "Smile", hi: "मुस्कान आ जाती है", pa: "ਮੁਸਕਾਨ ਆ ਜਾਂਦੀ ਹੈ" }, imageUrl: "Smile.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_2.png"
      },
      {
        prompt: { 
          en: "What can your hands feel like?", 
          hi: "गुस्से में तुम्हारे हाथ कैसे महसूस होते हैं?", 
          pa: "ਗੁੱਸੇ ਵਿੱਚ ਤੇਰੇ ਹੱਥ ਕਿਵੇਂ ਮਹਿਸੂਸ ਹੁੰਦੇ ਹਨ?" 
        },
        options: [
          { text: { en: "Tight", hi: "कड़े/तनावयुक्त", pa: "ਤੰਗ" }, imageUrl: "Tight.png" },
          { text: { en: "Soft", hi: "नरम", pa: "ਨਰਮ" }, imageUrl: "Soft.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_3.png"
      },
      {
        prompt: { 
          en: "When you feel mad, what can you say to yourself?", 
          hi: "जब तुम गुस्सा महसूस करते हो, तो तुम खुद से क्या कह सकते हो?", 
          pa: "ਜਦੋਂ ਤੂੰ ਗੁੱਸਾ ਮਹਿਸੂਸ ਕਰਦਾ ਹੈਂ, ਤਾਂ ਤੂੰ ਆਪਣੇ ਆਪ ਨੂੰ ਕੀ ਕਹਿ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "“I’m angry.”", hi: "\"मैं गुस्सा हूँ।\"", pa: "\"ਮੈਂ ਗੁੱਸੇ ਵਿੱਚ ਹਾਂ।\"" }, imageUrl: "Im angry.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_4.png"
      },
      {
        prompt: { 
          en: "Is it okay to say you’re angry?", 
          hi: "क्या यह ठीक है कि तुम कहो कि तुम गुस्सा हो?", 
          pa: "ਕੀ ਇਹ ਠੀਕ ਹੈ ਕਿ ਤੂੰ ਕਹੇ ਕਿ ਤੈਨੂੰ ਗੁੱਸਾ ਆ ਰਿਹਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_5.png"
      },
      {
        prompt: { 
          en: "What words are not okay when angry?", 
          hi: "गुस्से में कौन से शब्द ठीक नहीं हैं?", 
          pa: "ਗੁੱਸੇ ਵਿੱਚ ਕਿਹੜੇ ਸ਼ਬਦ ਠੀਕ ਨਹੀਂ ਹਨ?" 
        },
        options: [
          { text: { en: "Bad words", hi: "गंदे शब्द", pa: "ਗੰਦੇ ਸ਼ਬਦ" }, imageUrl: "Bad words.png" },
          { text: { en: "Kind words", hi: "अच्छे शब्द", pa: "ਚੰਗੇ ਸ਼ਬਦ" }, imageUrl: "Kind words.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_6.png"
      },
      {
        prompt: { 
          en: "What things make you angry?", 
          hi: "कौन सी बातें तुम्हें गुस्सा दिलाती हैं?", 
          pa: "ਕਿਹੜੀਆਂ ਗੱਲਾਂ ਤੈਨੂੰ ਗੁੱਸਾ ਦਿੰਦੀਆਂ ਹਨ?" 
        },
        options: [
          { text: { en: "Snatching toy", hi: "खिलौना छीनना", pa: "ਖਿਲੌਣਾ ਛੀਣਣਾ" }, imageUrl: "Snatching toy.png" },
          { text: { en: "Loud noise", hi: "तेज़ शोर", pa: "ਉੱਚਾ ਸ਼ੋਰ" }, imageUrl: "Loud noise.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_7.png"
      },
      {
        prompt: { 
          en: "Can you think before shouting?", 
          hi: "क्या तुम चिल्लाने से पहले सोच सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਚੀਕਣ ਤੋਂ ਪਹਿਲਾਂ ਸੋਚ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_8.png"
      },
      {
        prompt: { 
          en: "Can you tell an adult what upset you?", 
          hi: "क्या तुम किसी बड़े को बता सकते हो कि तुम्हें क्या परेशान कर गया?", 
          pa: "ਕੀ ਤੁਸੀਂ ਕਿਸੇ ਵੱਡੇ ਨੂੰ ਦੱਸ ਸਕਦੇ ਹੋ ਕਿ ਕਿਹੜੀ ਗੱਲ ਤੁਹਾਨੂੰ ਨਾਰाज़ ਕਰ ਗਈ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_9.png"
      },
      {
        prompt: { 
          en: "When you start to feel mad, what can you say to yourself?", 
          hi: "जब तुम्हें गुस्सा आने लगे, तो तुम खुद से क्या कह सकते हो?", 
          pa: "ਜਦੋਂ ਤੈਨੂੰ ਗੁੱਸਾ ਆਉਣਾ ਸ਼ੁਰੂ ਹੋਵੇ, ਤਾਂ ਤੂੰ ਆਪਣੇ ਆਪ ਨੂੰ ਕੀ ਕਹਿ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "“Stop, breathe and think.”", hi: "\"रुको, साँस लो और सोचो।\"", pa: "\"ਰੁੱਕੋ, ਸਾਹ ਲਵੋ ਅਤੇ ਸੋਚੋ।\"" }, imageUrl: "Stop breathe and think.png" },
          { text: { en: "“Hit first”", hi: "\"पहले मारो\"", pa: "\"ਪਹਿਲਾਂ ਮਾਰੋ\"" }, imageUrl: "Hit first.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_10.png"
      },
      {
        prompt: { 
          en: "Should you hit first or stop first?", 
          hi: "तुम्हें पहले मारना चाहिए या पहले रुकना चाहिए?", 
          pa: "ਤੈਨੂੰ ਪਹਿਲਾਂ ਵਾਰ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਪਹਿਲਾਂ ਰੁਕਣਾ ਚਾਹੀਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Stop first", hi: "पहले रुको", pa: "ਪਹਿਲਾਂ ਰੁਕੋ" }, imageUrl: "Stop first.png" },
          { text: { en: "Hit first", hi: "पहले मारो", pa: "ਪਹਿਲਾਂ ਮਾਰੋ" }, imageUrl: "Hit first.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_11.png"
      },
      {
        prompt: { 
          en: "What helps you remember to stop?", 
          hi: "रुकना याद रखने में क्या मदद करता है?", 
          pa: "ਤੈਨੂੰ ਰੁਕਣਾ ਯਾਦ ਰੱਖਣ ਵਿੱਚ ਕੀ ਮਦਦ ਕਰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "A red stop sign picture", hi: "लाल “रुक” संकेत की तस्वीर", pa: "ਲਾਲ “ਰੋਕੋ” ਨਿਸ਼ਾਨ ਦੀ ਤਸਵੀਰ" }, imageUrl: "A red stop sign picture.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_12.png"
      },
      {
        prompt: { 
          en: "How can you use your breath to calm down?", 
          hi: "शांत होने के लिए तुम अपनी साँस का उपयोग कैसे कर सकते हो?", 
          pa: "ਸ਼ਾਂਤ ਹੋਣ ਲਈ ਤੂੰ ਆਪਣੀ ਸਾਹ ਕਿਵੇਂ ਵਰਤ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Take slow deep breaths", hi: "धीरे-धीरे गहरी साँस लो", pa: "ਹੌਲੇ-ਹੌਲੇ ਡੂੰਘੀਆਂ ਸਾਹਾਂ ਲਵੋ" }, imageUrl: "Take slow deep breaths.png" },
          { text: { en: "Shout", hi: "चिल्लाओ", pa: "ਚਿਲਾਓ" }, imageUrl: "Shout.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_13.png"
      },
      {
        prompt: { 
          en: "How many deep breaths can you take?", 
          hi: "तुम कितनी गहरी साँसें ले सकते हो?", 
          pa: "ਤੂੰ ਕਿੰਨੀ ਡੂੰਘੀਆਂ ਸਾਹਾਂ ਲੈ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "3 or more", hi: "3 या उससे अधिक", pa: "3 ਜਾਂ ਉਸ ਤੋਂ ਵੱਧ" }, imageUrl: "3 or more.png" },
          { text: { en: "0", hi: "0", pa: "0" }, imageUrl: "0.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_14.png"
      },
      {
        prompt: { 
          en: "Where can you keep your hands while breathing?", 
          hi: "सांस लेते समय तुम अपने हाथ कहाँ रख सकते हो?", 
          pa: "ਸਾਹ ਲੈਂਦੇ ਸਮੇਂ ਤੂੰ ਆਪਣੇ ਹੱਥ ਕਿੱਥੇ ਰੱਖ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "On tummy", hi: "पेट पर", pa: "ਪੇਟ ‘ਤੇ" }, imageUrl: "On tummy.png" },
          { text: { en: "Throw things", hi: "चीज़ें फेंको", pa: "ਚੀਜ਼ਾਂ ਸੁੱਟੋ" }, imageUrl: "Throw things.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_15.png"
      },
      {
        prompt: { 
          en: "What can you do if breathing doesn’t help?", 
          hi: "अगर गहरी साँस लेने से मदद नहीं मिलती, तो तुम क्या कर सकते हो?", 
          pa: "ਜੇ ਡੂੰਘਾ ਸਾਹ ਲੈਣ ਨਾਲ ਮਦਦ ਨਹੀਂ ਮਿਲਦੀ, ਤਾਂ ਤੂੰ ਕੀ ਕਰ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Ask for a break", hi: "ब्रेक माँगो", pa: "ਬ੍ਰੇਕ ਲਈ ਪੁੱਛੋ" }, imageUrl: "Ask for a break.png" },
          { text: { en: "Run away outside", hi: "बाहर भाग जाओ", pa: "ਬਾਹਰ ਭੱਜ ਜਾਓ" }, imageUrl: "Run away outside.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_16.png"
      },
      {
        prompt: { 
          en: "What can you say to the teacher?", 
          hi: "तुम अध्यापक से क्या कह सकते हो?", 
          pa: "ਤੂੰ ਅਧਿਆਪਕਾ ਨੂੰ ਕੀ ਕਹਿ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Can I go to the calm corner?", hi: "क्या मैं शांत कोने में जा सकता हूँ?", pa: "ਕੀ ਮੈਂ ਸ਼ਾਂਤ ਕੋਨੇ ਵਿੱਚ ਜਾ ਸਕਦਾ ਹਾਂ?" }, imageUrl: "Can I go to the calm corner.png" },
          { text: { en: "I’m leaving.", hi: "मैं जा रहा हूँ", pa: "ਮੈਂ ਜਾ ਰਿਹਾ ਹਾਂ" }, imageUrl: "Im leaving.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_17.png"
      },
      {
        prompt: { 
          en: "What should you NOT do when angry?", 
          hi: "जब तुम गुस्से में हो, तो क्या नहीं करना चाहिए?", 
          pa: "ਜਦੋਂ ਤੂੰ ਗੁੱਸੇ ਵਿੱਚ ਹੈਂ, ਤਾਂ ਕੀ ਨਹੀਂ ਕਰਨਾ ਚਾਹੀਦਾ?" 
        },
        options: [
          { text: { en: "Run away outside", hi: "बाहर भाग जाना", pa: "ਬਾਹਰ ਭੱਜ ਜਾਣਾ" }, imageUrl: "Run away outside.png" },
          { text: { en: "Ask for help", hi: "मदद माँगना", pa: "ਮਦਦ ਮੰਗਣਾ" }, imageUrl: "Ask for help.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_18.png"
      },
      {
        prompt: { 
          en: "What calm tool can you use?", 
          hi: "तुम कौन सा शांत रहने का उपकरण इस्तेमाल कर सकते हो?", 
          pa: "ਤੂੰ ਕਿਹੜਾ ਸ਼ਾਂਤ ਰਹਿਣ ਵਾਸਤੇ ਸੰਦ ਵਰਤ ਸਕਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Squeeze ball", hi: "तनाव गेंद", pa: "ਤਣਾਅ ਗੇਂਦ" }, imageUrl: "Squeeze ball.png" },
          { text: { en: "Book", hi: "किताब", pa: "ਕਿਤਾਬ" }, imageUrl: "Book.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_19.png"
      },
      {
        prompt: { 
          en: "What music helps you calm down?", 
          hi: "कैसा संगीत तुम्हें शांत होने में मदद करता है?", 
          pa: "ਕਿਹੜਾ ਸੰਗੀਤ ਤੈਨੂੰ ਸ਼ਾਂਤ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Soft music", hi: "धीमा संगीत", pa: "ਹੌਲਾ ਸੰਗੀਤ" }, imageUrl: "Soft music.png" },
          { text: { en: "Loud drum", hi: "तेज़ ढोल", pa: "ਉੱਚਾ ਢੋਲ" }, imageUrl: "Loud drum.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_20.png"
      },
      {
        prompt: { 
          en: "Is it okay to ask for your calm box?", 
          hi: "क्या अपना शांत बॉक्स माँगना ठीक है?", 
          pa: "ਕੀ ਆਪਣਾ ਸ਼ਾਂਤ ਬਾਕਸ ਮੰਗਣਾ ਠੀਕ ਹੈ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_21.png"
      },
      {
        prompt: { 
          en: "When calm, what can you tell your teacher?", 
          hi: "शांत होने पर तुम अध्यापक से क्या कह सकते हो?", 
          pa: "ਸ਼ਾਂਤ ਹੋ ਜਾਣ 'ਤੇ, ਤੁਸੀਂ ਆਪਣੇ ਅਧਿਆਪਕ ਨੂੰ ਕੀ ਦੱਸ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“I was angry because… (explain)”", hi: "\"मैं गुस्सा था क्योंकि...\"", pa: "\"ਮੈਂ ਗੁੱਸੇ ਵਿੱਚ ਸੀ ਕਿਉਂਕਿ...\"" }, imageUrl: "I was angry because explain.png" },
          { text: { en: "Nothing", hi: "कुछ नहीं", pa: "ਕੁਝ ਨਹੀਂ" }, imageUrl: "Nothing.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_22.png"
      },
      {
        prompt: { 
          en: "Should you talk while still yelling?", 
          hi: "क्या तुम्हें चिल्लाते हुए ही बात करनी चाहिए?", 
          pa: "ਕੀ ਤੂੰ ਚੀਕਦੇ ਹੋਏ ਹੀ ਗੱਲ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?" 
        },
        options: [
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" },
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_23.png"
      },
      {
        prompt: { 
          en: "What can the teacher say to help you?", 
          hi: "अध्यापक तुम्हारी मदद के लिए क्या कह सकते हैं?", 
          pa: "ਅਧਿਆਪਕਾ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਕੀ ਕਹਿ ਸਕਦੀ ਹੈ?" 
        },
        options: [
          { text: { en: "“Let’s solve it together.”", hi: "\"चलो, हम इसे साथ में हल करते हैं।\"", pa: "\"ਆਓ ਇਸ ਨੂੰ ਇਕੱਠੇ ਹੱਲ ਕਰੀਏ।\"" }, imageUrl: "Lets solve it together.png" },
          { text: { en: "“Stop it.”", hi: "\"बस करो\"", pa: "\"ਬੱਸ ਕਰੋ\"" }, imageUrl: "Stop it.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_24.png"
      },
      {
        prompt: { 
          en: "If you shouted at a friend, what can you do?", 
          hi: "अगर तुमने दोस्त पर चिल्लाया, तो तुम क्या कर सकते हो?", 
          pa: "ਜੇ ਤੁਸੀਂ ਦੋਸਤ 'ਤੇ ਚੀਲੇ, ਤਾਂ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Say sorry", hi: "माफ़ी माँगो", pa: "ਮਾਫ਼ੀ ਮੰਗੋ" }, imageUrl: "Say sorry.png" },
          { text: { en: "Ignore", hi: "अनदेखा करो", pa: "ਅਣਡਿੱਠਾ ਕਰੋ" }, imageUrl: "Ignore.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_25.png"
      },
      {
        prompt: { 
          en: "If you broke something, what next?", 
          hi: "अगर तुमसे कुछ टूट जाए, तो आगे क्या करोगे?", 
          pa: "ਜੇ ਤੁਸੀਂ ਕੁਝ ਤੋੜ ਦਿਓ, ਤਾਂ ਅਗਲੇ ਕੀ ਕਰੋਗੇ?" 
        },
        options: [
          { text: { en: "Tell an adult", hi: "किसी बड़े को बताओ", pa: "ਕਿਸੇ ਵੱਡੇ ਨੂੰ ਦੱਸੋ" }, imageUrl: "Tell an adult.png" },
          { text: { en: "Help fix it", hi: "ठीक करने में मदद करो", pa: "ਇਸ ਨੂੰ ਠੀਕ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰੋ" }, imageUrl: "Help fix it.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_26.png"
      },
      {
        prompt: { 
          en: "What happens when you say sorry?", 
          hi: "जब तुम \"सॉरी\" कहते हो तो क्या होता है?", 
          pa: "ਜਦੋਂ ਤੁਸੀਂ \"ਸਾਰੀ\" ਕਹਿੰਦੇ ਹੋ ਤਾਂ ਕੀ ਹੁੰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Friend feels better", hi: "दोस्त को अच्छा महसूस होता है", pa: "ਦੋਸਤ ਨੂੰ ਚੰਗਾ ਲੱਗਦਾ ਹੈ" }, imageUrl: "Friend feels better.png" },
          { text: { en: "Friend gets angry", hi: "दोस्त गुस्सा हो जाता है", pa: "ਦੋਸਤ ਗੁੱਸੇ ਹੋ ਜਾਂਦਾ ਹੈ" }, imageUrl: "Friend gets angry.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_27.png"
      },
      {
        prompt: { 
          en: "What can you tell yourself after calming down?", 
          hi: "शांत होने के बाद तुम खुद से क्या कह सकते हो?", 
          pa: "ਸ਼ਾਂਤ ਹੋਣ ਦੇ ਬਾਅਦ ਤੁਸੀਂ ਆਪਣੇ ਆਪ ਨੂੰ ਕੀ ਕਹਿ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "“I did it!”", hi: "\"मैंने कर लिया!\"", pa: "\"ਮੇਰੇ ਤੋਂ ਹੋ ਗਿਆ!\"" }, imageUrl: "I did it.png" },
          { text: { en: "“Whatever.”", hi: "\"जो भी.\"", pa: "\"ਜੋ ਮਰਜ਼ੀ.\"" }, imageUrl: "Whatever.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_28.png"
      },
      {
        prompt: { 
          en: "Can you use calm breathing at home too?", 
          hi: "क्या तुम घर पर भी शांत होने के लिए गहरी साँसें ले सकते हो?", 
          pa: "ਕੀ ਤੁਸੀਂ ਘਰ 'ਤੇ ਵੀ ਸ਼ਾਂਤ ਹੋਣ ਲਈ ਡੂੰਘੇ ਸਾਹ ਲੈ ਸਕਦੇ ਹੋ?" 
        },
        options: [
          { text: { en: "Yes", hi: "हाँ", pa: "ਹਾਂ" }, imageUrl: "Yes.png" },
          { text: { en: "No", hi: "नहीं", pa: "ਨਹੀਂ" }, imageUrl: "No.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_29.png"
      },
      {
        prompt: { 
          en: "How does it feel when you control anger?", 
          hi: "जब तुम गुस्से को नियंत्रण में रखते हो तो कैसा लगता है?", 
          pa: "ਜਦੋਂ ਤੂੰ ਗੁੱਸੇ ਨੂੰ ਕਾਬੂ ਕਰ ਲੈਂਦਾ ਹੈਂ, ਤਾਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ?" 
        },
        options: [
          { text: { en: "Happy", hi: "खुश", pa: "ਖੁਸ਼" }, imageUrl: "Happy.png" },
          { text: { en: "Proud", hi: "गर्व होता है", pa: "ਮਾਣ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ" }, imageUrl: "Proud.png" }
        ],
        correctIndex: 0,
        imageUrl: "calm_down_30.png"
      }
    ]
}}
