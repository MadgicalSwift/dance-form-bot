// export const localisedStrings = {
//   welcomeMessage: `नमस्कार 👋 Khabri Media Bot में आपका स्वागत है! 🤖 हमारे पास दुनिया भर से समाचार 🌍, आपके क्षेत्र से समाचार 🏡`,
//   language_changed: 'भाषा बदलकर हिंदी हो गई',
//   askUserName: " क्या आप कृपया मुझे अपना नाम बता सकते हैं? ",
// };


export const localised = {
  seeMoreMessage: 'अधिक डेटा देखें',
  seeMoreVideo: 'और देखें',
  language_hindi: 'हिन्दी',
  language_english: 'English',
  language_changed: 'भाषा अंग्रेजी में बदल गई',
  languageSelection: 'कोई एक भाषा चुनें: ',
  welcomeMessage: "😊 डांस एक्सप्लोर में आपका स्वागत है! 🎉 भारत के विविध नृत्य रूपों की खोज करें, जिनमें से प्रत्येक एक अलग राज्य का प्रतिनिधित्व करता है। क्या आप अन्वेषण के लिए तैयार हैं? आइए 🕺भारत की लय में गोता लगाएँ!! ",
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  selectSubtopic: (topicName: string) =>
    `📜 बढ़िया विकल्प! अब चयनित राज्य से एक नृत्य शैली चुनें।**${topicName}**: 🌟🕺:`,
  mainMenu: 'मुख्य मेन्यू',
  chooseTopic: "आप किस राज्य की जीवंत नृत्य संस्कृति को देखने के लिए उत्साहित हैं? 🌍💃 लय को अपनी जिज्ञासा का मार्गदर्शन करने दें! 🎶✨",
  retakeQuiz: 'प्रश्नोत्तरी फिर से लें',
  startQuiz: 'प्रश्नोत्तरी प्रारंभ करें',
  Moreexplanation: 'अधिक स्पष्टीकरण',
  viewChallenge: "दावेदार देखें",
  congratsMessage: "बधाई🎉! आपने प्रश्नोत्तरी पूरी कर ली है 🎉",
  endMessage: "जब भी आप जारी रखने के लिए तैयार हों, तो बॉट को फिर से शुरू करने के लिए बस 'Hi' टाइप करें। आपकी मदद करने के लिए तत्पर हूँ! 😊",
  askUserName: "क्या आप कृपया मुझे अपना नाम बता सकते हैं?",
  gotBadgeText: "अरे! मुझे टुडे क्विज़ में एक बैज मिला। प्रश्नोत्तरी लेने के लिए नीचे दिए गए लिंक पर क्लिक करें।",
  goodJobText: "अच्छा काम! इसे जारी रखो!",
  noChallenges: 'अभी तक कोई भी चुनौती पूरी नहीं हुई है.', 
  errorOccurred: 'चुनौतियाँ लाते समय एक त्रुटि उत्पन्न हुई। कृपया बाद में पुन: प्रयास करें।',
  explanation: (subtopicName: string) =>
    `📖 ** ${subtopicName} का स्पष्टीकरण :**`,
  moreExplanation: (subtopicName: string) =>
    `📝 नीचे दिए गए बटनों में से कोई भी चुनें`,
  difficulty: `🎯 आरंभ करने के लिए अपना प्रश्नोत्तरी स्तर चुनें!🚀`,
  rightAnswer: (explanation: string) =>
    `🌟 ज़बरदस्त! आपने ठीक समझा! \nइसे जांचें: **${explanation}**`,

  wrongAnswer: (correctAnswer: string, explanation: string) =>
    `👎बिल्कुल सही नहीं, लेकिन आप सीख रहे हैं! 💪\n सही उत्तर है: **${correctAnswer}**\n यहाँ स्पष्टीकरण है: **${explanation}** `,


  scoreInformation:(score:number,attempted: number) => 
    `आपने अब तक ${attempted}/10 प्रश्नों का प्रयास किया है और ${score} का सही उत्तर दिया है। आपका वर्तमान स्कोर ${score}/10 है. अपना अंतिम स्कोर देखने के लिए प्रश्नोत्तरी पूरी करें! इसे जारी रखो! 🚀
  `,


 

  score: (score: number, totalQuestions: number, badge: string) =>
    `🌟 बहुत खूब! आपने कमाल का काम किया है। **${score}** में से **${totalQuestions}**.\n\n💪 बधाई हो! आपने ${badge} बैज अर्जित किया! `,


  InformationMessage: (username: string) => `🌟 
नमस्ते ${username} !\n आपको कुल 10 प्रश्न मिलेंगे। \n प्रत्येक सही उत्तर के लिए, आपको 1 अंक मिलता है। चिंता न करें-गलत उत्तरों के लिए कोई अंक नहीं काटा जाएगा। 😊\nजब आप प्रश्नोत्तरी पूरी कर लेंगे। आपको अपने अंकों के आधार पर पुरस्कार मिलेगा।\n ये 🏅 स्कोरिंग पुरस्कार हैं :\n- Gold 🥇: कुल अंक = 10\n- Silver 🥈: कुल अंक ≥ 7\n- Bronze 🥉: कुल अंक ≥ 5\n\n✨ अपना अंतिम स्कोर जानने के लिए प्रश्नोत्तरी पूरी करें! इसे जारी रखो—आप यह पा सकते हैं 💪`,
};
