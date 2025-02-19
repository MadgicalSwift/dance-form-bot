import { url } from 'inspector';
import englishData from '../../datasource/english_data.json';
import hindiData from '../../datasource/hindi_data.json';
import _ from 'lodash';
import { LocalizationService } from 'src/localization/localization.service';

export function createMainTopicButtons(from: string, language:string) {
  const localisedStrings = LocalizationService.getLocalisedString(language)
  // Extract topic names from the data
  let data = language === 'english' ? englishData : hindiData;
  const topics = data.topics.map((topic) => topic.topicName);

  // Create buttons for each topic
  const buttons = topics.map((topicName) => ({
    type: 'solid',
    body: topicName,
    reply: topicName,
  }));

  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localisedStrings.chooseTopic,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}

export function createSubTopicButtons(from: string, topicName: string,language:string) {
  // Find the topic in the data
  const localisedStrings = LocalizationService.getLocalisedString(language)
  let data = language === 'english' ? englishData : hindiData;
  const topic = data.topics.find((topic) => topic.topicName === topicName);

  // If the topic exists, create buttons for each subtopic
  if (topic && topic.subtopics) {
    const buttons = topic.subtopics.map((subtopic) => ({
      type: 'solid',
      body: subtopic.subtopicName,
      reply: subtopic.subtopicName,
    }));

    return {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localisedStrings.selectSubtopic(topicName),
          },
        },
        buttons: buttons,
        allow_custom_response: false,
      },
    };
  } else {

    return null;
  }
}

export function createButtonWithExplanation(from: string, subtopicName: string,language:string) {
  const localisedStrings = LocalizationService.getLocalisedString(language)

  const buttons = [
    {
      type: 'solid',
      body: localisedStrings.seeMoreVideo,
      reply: localisedStrings.seeMoreVideo,
    },
    {
      type: 'solid',
      body: localisedStrings.startQuiz,
      reply: localisedStrings.startQuiz,
    },
    {
      type: 'solid',
      body: localisedStrings.mainMenu,
      reply: localisedStrings.mainMenu,
    },
  ];
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localisedStrings.moreExplanation(subtopicName),
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}





// correct  code
export function imageWithButton(from, images, subTopic, title, language: string) {
  // Map each image object into the desired structure
  const articles = images.map((image) => {
    const header = image.videoUrl
      ? {
        tags: [subTopic],
        title: image.title,
          header:{type: "text",
          text: {
            body: image.videoUrl, // URL of the video
          },
        },
        description: image.Descrip,
      }
      : {
          // Default header for image when no videoUrl is present
          tags: [subTopic], // Subtopic name as a tag
          title: image.title,
          header:{type: "image",
          image: {
            url: image.imageUrl, // The image URL
            body: image.Descrip, // The title as the caption for the image
          },
        },
        description: image.Descrip,
        actions: [
                      {
                          button_text: "Open Image",
                          type: "website",
                          website: {
                              title: "Welcome to Swiftchat",
                              payload: "qwerty",
                              url: image.imageUrl,
                             
                          }
                      }
                  ]
        };

    return header
  });

  return {
    to: from, // Recipient's mobile number
    type: "article", // Message type is 'article'
    article: articles, // Array of articles
  };
}







export function createTestYourSelfButton(
  from: string,
  subtopicName: string,
  language:string
) {
  const localisedStrings = LocalizationService.getLocalisedString(language)
  const buttons = [
    {
      type: 'solid',
      body: localisedStrings.startQuiz,
      reply: localisedStrings.startQuiz,
    },
    {
      type: 'solid',
      body: localisedStrings.mainMenu,
      reply: localisedStrings.mainMenu,
    },
  ];
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localisedStrings.moreExplanation(subtopicName),
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}
// export function createDifficultyButtons(from: string,language:string) { // not in used
//   const buttons = [
//     {
//       type: 'solid',
//       body: 'Easy',
//       reply: 'Easy',
//     },
//     {
//       type: 'solid',
//       body: 'Medium',
//       reply: 'Medium',
//     },
//     {
//       type: 'solid',
//       body: 'Hard',
//       reply: 'Hard',
//     },
//   ];
//   return {
//     to: from,
//     type: 'button',
//     button: {
//       body: {
//         type: 'text',
//         text: {
//           body: localised.difficulty,
//         },
//       },
//       buttons: buttons,
//       allow_custom_response: false,
//     },
//   };
// }

export function questionButton(
  from: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  selectedQuestionIndex: number,
  language:string

) {
  const localisedStrings = LocalizationService.getLocalisedString(language)
  let data = language === 'english' ? englishData : hindiData;
  const topic = data.topics.find(
    (topic) => topic.topicName === selectedMainTopic,
  );
  if (!topic) {

  }

  const subtopic = topic.subtopics.find(
    (subtopic) => subtopic.subtopicName == selectedSubtopic,
  );
  if (!subtopic) {

  }

  const questionSets = subtopic.questionSets;
  if (questionSets.length === 0) {

    return;
  }

  // Randomly select a question set based on difficulty level
  const questionSet = _.sample(questionSets);
  if (!questionSet) {

    return;
  }

  const randomSet = questionSet.setNumber;
  const question = questionSet.questions[0];

  const shuffledOptions = _.shuffle(question.options);
  const buttons = shuffledOptions.map((option: string) => ({
    type: 'solid',
    body: option,
    reply: option,
  }));

  const messageData = {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: `${localisedStrings.question}: ${selectedQuestionIndex + 1}\n ${question.question}`,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };

  return { messageData, randomSet };
}

export function answerFeedback(
  from: string,
  answer: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  randomSet: string,
  currentQuestionIndex: number,
  score: number,
  language:string
) {
  let data = language === 'english' ? englishData : hindiData;
  const topic = data.topics.find((t) => t.topicName === selectedMainTopic);
  if (!topic) {

  }

  const subtopic = topic.subtopics.find(
    (st) => st.subtopicName === selectedSubtopic,
  );
  if (!subtopic) {

  }

  // Find the question set by its level and set number

  const questionSet = subtopic.questionSets.find(
    (qs) =>
      qs.setNumber === parseInt(randomSet),
  );

  if (!questionSet) {

  }

  const question = questionSet.questions[currentQuestionIndex];


  
  const explanation = question.explanation;
  if (!explanation) {

  }

  if (!question.answer) {

  }
  const correctAnswer = question.answer;
  const userAnswer = Array.isArray(answer) ? answer[0] : answer;
  const correctAns = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
const localisedStrings = LocalizationService.getLocalisedString(language)
  const isCorrect = userAnswer === correctAns;
  const feedbackMessage =
    isCorrect
      ? localisedStrings.rightAnswer(explanation)
      : localisedStrings.wrongAnswer(correctAns, explanation);
  const result = isCorrect ? 1 : 0;

  return { feedbackMessage, result };
}


export function videoWithButton(from: string, videoUrl: string, videoTitle: string , subTopic: string, aboutVideo: string) {
  // console.log(videoUrl);
  // console.log(videoTitle);
  return {
    to: from, // Recipient's mobile number
    type: "article", // Message type is article
    article: [
      {
        tags: [`${subTopic}`], // Subtopic name
        title: videoTitle, // Title of the video
        header: {
          type: "text",
          text: {
            body: videoUrl, // URL of the video
          },
        },
        description: aboutVideo
      },
    ],
  };
}


export function buttonWithScore(
  from: string,
  score: number,
  totalQuestions: number,
  badge: string,
  language:string
) {
  const localisedStrings = LocalizationService.getLocalisedString(language)
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localisedStrings.congratsMessage
        },
      },
      buttons: [
        {
          type: 'solid',
          body: localisedStrings.mainMenu,
          reply: localisedStrings.mainMenu,
        },
        {
          type: 'solid',
          body: localisedStrings.retakeQuiz,
          reply: localisedStrings.retakeQuiz,
        },
        {
          type: 'solid',
          body: localisedStrings.viewChallenge,
          reply: localisedStrings.viewChallenge,
        }
      ],
      allow_custom_response: false,
    },
  };
}
export function optionButton(
  from: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  randomSet: string,
  currentQuestionIndex: number,
  language:string
) {
  // Find the selected topic
  const localisedStrings = LocalizationService.getLocalisedString(language)
  let data = language === 'english' ? englishData : hindiData;
  const topic = data.topics.find(
    (topic) => topic.topicName === selectedMainTopic,
  );
  if (!topic) {


    return;
  }

  // Find the selected subtopic
  const subtopic = topic.subtopics.find(
    (subtopic) => subtopic.subtopicName === selectedSubtopic,
  );
  if (!subtopic) {


    return;
  }

  // Find the question set based on difficulty and set number
  const questionSet = subtopic.questionSets.find(
    (set) =>
      set.setNumber === parseInt(randomSet),
  );
  if (!questionSet) {

    return;
  }

  // Check if the current question index is valid
  if (
    currentQuestionIndex < 0 ||
    currentQuestionIndex >= questionSet.questions.length
  ) {

    return;
  }

  // Retrieve the question at the current index
  const question = questionSet.questions[currentQuestionIndex];
  const shuffledOptions = _.shuffle(question.options);

  const buttons = shuffledOptions.map((option: string) => ({
    type: 'solid',
    body: option,
    reply: option,
  }));
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: `${localisedStrings.question}: ${currentQuestionIndex + 1}\n ${question.question}`,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}