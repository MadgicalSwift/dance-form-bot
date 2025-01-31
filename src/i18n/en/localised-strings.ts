export const localised = {
  seeMoreMessage: 'See More Data',
  language_hindi: 'हिन्दी',
  language_english: 'English',
  language_changed: 'Language changed to English',
  welcomeMessage: "😊 Welcome to Dance Explore! 🎉 Discover the diverse dance forms of India, each representing a different state. Are you ready to explore? Let’s 🕺dive into the rhythm of India!! ",
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  selectSubtopic: (topicName: string) =>
  `📜 Great choice! Now pick a dance form from the selected state. **${topicName}**: 🌟🕺:`,
  mainMenu:'Main Menu',
  chooseTopic:"Which state’s vibrant dance culture are you excited to explore? 🌍💃 Let the rhythm guide your curiosity! 🎶✨",
  retakeQuiz:'Retake Quiz',
  startQuiz: 'Start Quiz',

  Moreexplanation:'More Explanation',
  viewChallenge:"View Challenges",
  endMessage:"Whenever you're ready to continue, just type 'Hi' to start the bot again. Looking forward to helping you out! 😊",
  explanation: (subtopicName: string, description: string) =>
  `📖 **Explanation of ${subtopicName}:**\n${description}`,
  moreExplanation: (subtopicName: string, description: string) =>
  `📝 More Explanation of  **${subtopicName}:**\n${description}`,
  difficulty: `🎯 Choose your quiz level to get started!🚀`,
  rightAnswer: (explanation: string) =>
  `🌟 Fantastic! You got it 👍right! \nCheck this out: **${explanation}**`,
  wrongAnswer: (correctAnswer: string, explanation: string) =>
 `👎Not quite right, but you’re learning!  💪\n The correct answer is: **${correctAnswer}**\n Here’s the explanation : **${explanation}**`,
  score: (score: number, totalQuestions: number,  badge:string) =>
  `🌟 Wow! You did an awesome job.  **${score}** out of **${totalQuestions}**.\n\n💪 Congratulations! You earned ${ badge} badge! `,
  InformationMessage : (username :string) => `🌟 Hello ${username} !\nYou will get total 10 questions. \n For every correct answer, you earn 1 mark. Don’t worry—no marks will be deducted for wrong answers. 😊\n when you complete the quiz . You  will get the rewarded based on your scores.\n These are the 🏅 Scoring Rewards:\n- Gold 🥇: Total score = 10\n- Silver 🥈: Total score ≥ 7\n- Bronze 🥉: Total score ≥ 5\n\n✨ Complete the quiz to discover your final score! Keep it up—you’ve got this! 💪`,
};