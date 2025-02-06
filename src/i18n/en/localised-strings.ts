export const localised = {
  seeMoreMessage: 'See More Data',
  seeMoreVideo: 'See More',
  language_hindi: 'हिन्दी',
  
  language_english: 'English',
  language_changed: 'Language changed to English',
  languageSelection: 'Choose any one language: ',
  welcomeMessage: "😊 Welcome to Dance Explore! 🎉 Discover the diverse dance forms of India, each representing a different state. Are you ready to explore? Let’s 🕺dive into the rhythm of India!! ",
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  selectSubtopic: (topicName: string) =>
    `📜 Great choice! Now pick a dance form from the selected state **${topicName}**🌟🕺:`,
  mainMenu: 'Main Menu',
  chooseTopic: "Which state’s vibrant dance culture are you excited to explore? 🌍💃 Let the rhythm guide your curiosity! 🎶✨",
  retakeQuiz: 'Retake Quiz',
  startQuiz: 'Start Quiz',
  Moreexplanation: 'More Explanation',
  question: 'Question',
  viewChallenge: "View Challengers",
  congratsMessage: "Congrats🎉! you have completed the quiz 🎉 ",
  endMessage: "Whenever you're ready to continue, just type 'Hi' to start the bot again. Looking forward to helping you out! 😊",
  askUserName: " Can you please tell me your name? ",
  gotBadgeText: "Hey! I got a badge in the Today quiz. Click the link below to take the quiz.",
  goodJobText: "Good job! Keep pushing!",
  noChallenges: 'No challenges have been completed yet.', 
  errorOccurred: 'An error occurred while fetching challenges. Please try again later.',
  explanation: (subtopicName: string) =>
    `📖 Explanation of ${subtopicName}:`,
  moreExplanation: (subtopicName: string) =>
    `📝 Choose Any from Below Buttons`,
  difficulty: `🎯 Choose your quiz level to get started!🚀`,
  rightAnswer: (explanation: string) =>
    `🌟 Fantastic! You got it 👍right! \nCheck this out: **${explanation}**`,

  wrongAnswer: (correctAnswer: string, explanation: string) =>
    `👎Not quite right, but you’re learning!  💪\n The correct answer is: **${correctAnswer}**\n Here’s the explanation : **${explanation}** `,


  scoreInformation:(score:number,attempted: number) => 
    `You've attempted ${attempted}/10 questions so far and answered ${score} correctly. Your current score is ${score}/10. Complete the quiz to see your final score! Keep it up! 🚀`,


 

  score: (score: number, totalQuestions: number, badge: string) =>
    `🌟 Wow! You did an awesome job.  **${score}** out of **${totalQuestions}**.\n\n💪 Congratulations! You earned ${badge} badge! `,
  InformationMessage: (username: string) => `Hello ${username} 🎯 Welcome to the Quiz! \n You’ll answer 10 questions—earn 1 point for each correct answer. No penalties for wrong answers! 😊 \n 🏆 Rewards: \n 🥇 Gold: Score 10 \n 🥈 Silver: Score 7–9 \n 🥉 Bronze: Score 5–6 \n Ready to test your knowledge? Let’s go! 🚀
`,

};