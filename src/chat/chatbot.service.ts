import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { localised } from 'src/i18n/en/localised-strings';
import data from '../datasource/data.json';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { plainToClass } from 'class-transformer';
import { User } from 'src/model/user.entity';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { log } from 'console';



@Injectable()
export class ChatbotService {
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private botId = process.env.BOT_ID;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatMessageService: SwiftchatMessageService;
  private readonly topics: any[] = data.topics;
  private readonly mixpanel: MixpanelService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatMessageService: SwiftchatMessageService,
    mixpanel: MixpanelService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.swiftchatMessageService = swiftchatMessageService;
    this.userService = userService;
    this.mixpanel = mixpanel;
  }

  public async processMessage(body: any): Promise<any> {
    // Destructure 'from', 'text', and 'button_response' from the body
    const { from, text, button_response, persistent_menu_response } = body;

    // Retrieve botID from environment variables
    const botID = process.env.BOT_ID;
    let userData = await this.userService.findUserByMobileNumber(from, botID);

    // If no user data is found, create a new user
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
      userData = await this.userService.findUserByMobileNumber(from, botID);
    }

    // Convert plain user data to a User class instance
    const user = plainToClass(User, userData);
    // console.log('persistent_menu_response', persistent_menu_response)

    if (persistent_menu_response) {
      if (persistent_menu_response.body == "Change Topic") {

        user.selectedSet = null;
        user.questionsAnswered = 0;
        user.startingIndex = 0;
        user.score = 0;

        await this.message.sendInitialTopics(from);

        await this.userService.saveUser(user);
        return

      }

    }

    // Handle button response from the user
    else if (button_response) {
      const buttonBody = button_response.body;

      // Handle 'Main Menu' button - reset user quiz data and send welcome message
      if (buttonBody === localised.mainMenu) {

        user.selectedSet = null;
        user.questionsAnswered = 0;
        user.startingIndex = 0;
        user.score = 0;
        await this.userService.saveUser(user);
        // await this.message.sendWelcomeMessage(from, user.language);
        await this.message.sendInitialTopics(from);
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      // Handle 'Retake Quiz' button - reset quiz progress and send the first question
      if (buttonBody === localised.retakeQuiz) {
        user.questionsAnswered = 0;
        user.score = 0;
        await this.userService.saveUser(user);
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        // const selectedDifficulty = user.selectedDifficulty;
        const randomSet = user.selectedSet;
        await this.message.getQuestionBySet(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          user.questionsAnswered,
        );
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      if (buttonBody === localised.viewChallenge) {
        await this.handleViewChallenges(from, userData);
        await this.message.endMessage(from);
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      // Handle 'More Explanation' button - send complete explanation for the subtopic

      if (buttonBody === localised.seeMoreVideo) {

        const topic = user.selectedSubtopic;
        // Find the selected subtopic in the list of topics
        const subtopic = this.topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === topic);
        if (subtopic) {
          const imageUrl = subtopic.image_link;
          const description = subtopic.description;
          const Title = subtopic.title;
          const aboutimage = subtopic.Descrip
          const SubTopic = subtopic.subtopicName


          // start

          let indexing = user.startingIndex; //3 
          let updateIndexing = user.lastIndex;   //6

          if (indexing >= imageUrl.length) {
            user.startingIndex = 0;
            user.lastIndex = 0;
            await this.userService.saveUser(user);
            await this.message.sendCompleteExplanation(from, SubTopic);

          }
          else {
            const eachImageUrl = imageUrl.slice(indexing, updateIndexing);
            // console.log('eachImageUrl', eachImageUrl);

            await this.message.imageWithButton(from, eachImageUrl, Title, SubTopic, aboutimage);



            if (user.lastIndex >= imageUrl.length) {
              user.startingIndex = 0;
              user.lastIndex = 0;
              await this.userService.saveUser(user);
              await this.message.sendCompleteExplanation(from, SubTopic);
            }
            else {

              await this.message.sendExplanation(from, SubTopic);
            }
            user.startingIndex = user.lastIndex;
            user.lastIndex = user.lastIndex + 3;
            await this.userService.saveUser(user);


          }

        }
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      // Handle 'Test Yourself' button - show difficulty options to the user

      if (buttonBody === localised.startQuiz) {

        await this.message.sendInformationMessage(from, user.name);

        user.questionsAnswered = 0;
        await this.userService.saveUser(user);

        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const selectedQuestionIndex = user.questionsAnswered;

        const { randomSet } = await this.message.sendQuestion(
          from,
          selectedMainTopic,
          selectedSubtopic,
          selectedQuestionIndex
        );

        user.selectedSet = randomSet;

        await this.userService.saveUser(user);
        // console.log("question set", user.selectedSet)
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }

      // Handle quiz answer submission - check if the user is answering a quiz question
      if (user.selectedSet) {

        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        // const selectedDifficulty = user.selectedDifficulty;
        const randomSet = user.selectedSet;
        const score = user.score;

        // console.log("before", user)

        const currentQuestionIndex = user.questionsAnswered;
        const { result } = await this.message.checkAnswer(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          currentQuestionIndex,
          score
        );
        // Update user score and questions answered

        user.score += result;
        user.questionsAnswered += 1;
        await this.userService.saveUser(user);


        await this.message.scoreInformation(from,user.score, currentQuestionIndex+1)

        

        // If the user has answered 10 questions, send their final score
        if (user.questionsAnswered >= 10) {

          let badge = '';
          if (user.score === 10) {
            badge = 'Gold 🥇';
          } else if (user.score >= 7) {
            badge = 'Silver 🥈';
          } else if (user.score >= 5) {
            badge = 'Bronze 🥉';
          } else {
            badge = 'Novice 🔰';
          }

          // Store the data to be stored in database
          const challengeData = {
            topic: selectedMainTopic,
            subTopic: selectedSubtopic,
            question: [
              {
                setNumber: randomSet,
                score: user.score,
                badge: badge,
              },
            ],
          };
          // Save the challenge data into the database
          await this.userService.saveUserChallenge(
            from,
            userData.Botid,
            challengeData,
          );
          // console.log("Challenge Data:", challengeData)
          // console.log("user:", user )
          await this.message.newscorecard(from, user.score, user.questionsAnswered, badge)
          // await this.message.sendScore(

          //   user.score,
          //   user.questionsAnswered,

          //   payload
          // );
          let isAnswer = ""
          if (result == 1) {
            isAnswer = "correct"
          }
          else {
            isAnswer = "incorrect"
          }
          const trackingData = {
            distinct_id: from,
            user_answer: buttonBody,
            isAnswer: isAnswer,
            botID: botID,
          };

          this.mixpanel.track('Taking_Quiz', trackingData);

          return 'ok';
        }
        // Send the next quiz question
        await this.message.getQuestionBySet(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          user.questionsAnswered,
        );
        let isAnswer = ""
        if (result == 1) {
          isAnswer = "correct"
        }
        else {
          isAnswer = "incorrect"
        }
        const trackingData = {
          distinct_id: from,
          user_answer: buttonBody,
          isAnswer: isAnswer,
          botID: botID,
        };

        this.mixpanel.track('Taking_Quiz', trackingData);

        return 'ok';
      }

      // Handle topic selection - find the main topic and save it to the user data
      const topic = this.topics.find((topic) => topic.topicName === buttonBody);
      // console.log("topic", topic);
      if (topic) {
        const mainTopic = topic.topicName;

        user.selectedMainTopic = mainTopic;

        await this.userService.saveUser(user);
        // console.log("Main topic:", mainTopic)

        await this.message.sendSubTopics(from, mainTopic);
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
      } else {
        // Handle subtopic selection - find the subtopic and send an explanation
        const subtopic = this.topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === buttonBody);
        if (subtopic) {
          const subtopicName = subtopic.subtopicName;
          const description = subtopic.description[0];
          if (!description) {

          }
          user.selectedSubtopic = subtopicName;
          const videoUrl = subtopic.video_link;
          const title = subtopic.title;
          const aboutVideo = subtopic.descrip
          let subTopic = subtopic.subtopicName
          if (subTopic.length > 20) {
            subTopic = subTopic.slice(0, 20) + '...'


          }

          await this.userService.saveUser(user);
          // const selectVideo =subtopic.video_link;
          // await this.message.sendVideo(from, selectVideo)
          await this.message.sendVideo(from, videoUrl, title, subTopic, aboutVideo);


          // code for buttonimage

          const imageUrl = subtopic.image_link;
          const Title = subtopic.title;
          const aboutimage = subtopic.Descrip
          const SubTopic = subtopic.subtopicName

          let indexing = user.startingIndex; //starting indexing should be 0
          user.lastIndex = user.lastIndex + 3; //update indexing 0+3= 3 
          await this.userService.saveUser(user);
          let updateIndexing = user.lastIndex; //updating indexing is 3


          const eachImageUrl = imageUrl.slice(indexing, updateIndexing);

          await this.message.imageWithButton(from, eachImageUrl, Title, SubTopic, aboutimage);


          if (updateIndexing >= imageUrl.length) {

            user.lastIndex = 0;
            await this.userService.saveUser(user);

            await this.message.sendCompleteExplanation(from, subtopicName);


          }
          else {
            user.startingIndex = user.lastIndex;
            user.lastIndex = user.lastIndex + 3;
            await this.userService.saveUser(user);
            await this.message.sendExplanation(from, subtopicName);


          }
          // const firstThreeImageUrls = imageUrl.slice(indexing, updateIndexing);


          // const firstThreeImageUrls = imageUrl.slice(0, 3);



          // for image button 

          // console.log('sangeeta-startingIndex', user.startingIndex);

          // await this.message.imageWithButton(from, imageUrl, Title, subTopic, aboutimage);



        }

        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
      }

      return 'ok';
    }

    // Handle text message input - reset user data and send a welcome message
    else {

      if (localised.validText.includes(text.body)) {
        const userData = await this.userService.findUserByMobileNumber(
          from,
          botID,
        );
        if (!userData) {
          await this.userService.createUser(from, 'English', botID);
        }

        user.selectedSet = null;
        user.selectedMainTopic = null;
        user.selectedSubtopic = null;
        user.score = 0;
        user.questionsAnswered = 0;
        user.startingIndex = 0;
        user.lastIndex = 0;
        await this.userService.saveUser(user);
        // console.log("user data -", userData)
        if (userData.name == null) {
          await this.message.sendWelcomeMessage(from, user.language);

          await this.message.sendName(from);
        }
        else {
          await this.message.sendWelcomeMessage(from, user.language);

          await this.message.sendInitialTopics(from);
        }
      }
      else {

        await this.userService.saveUserName(from, botID, text.body);
        await this.message.sendInitialTopics(from);
      }

    }

    return 'ok';
  }
  async handleViewChallenges(from: string, userData: any): Promise<void> {
    try {
      // console.log("userData", userData)
      const topStudents = await this.userService.getTopStudents(
        userData.Botid,
        userData.selectedMainTopic,
        userData.selectedSet,
        userData.selectedSubtopic,
      );
      if (topStudents.length === 0) {

        await this.swiftchatMessageService.sendMessage(this.baseUrl, {
          to: from,
          type: 'text',
          text: { body: localised.noChallenges },
        }, this.apiKey);
        return;
      }
      // Format the response message with the top 3 students
      let message = 'Top 10 Users:\n\n';
      topStudents.forEach((student, index) => {
        const totalScore = student.score || 0;
        const studentName = student.name || 'Unknown';

        let badge = '';
        if (totalScore === 10) {
          badge = 'Gold 🥇';
        } else if (totalScore >= 7) {
          badge = 'Silver 🥈';
        } else if (totalScore >= 5) {
          badge = 'Bronze 🥉';
        } else {
          badge = 'Novice 🔰';
        }

        message += `${index + 1}. ${studentName}\n`;
        message += `    Score: ${totalScore}\n`;
        message += `    Badge: ${badge}\n\n`;
      });

      // Send the message with the top students' names, scores, and badges
      await this.swiftchatMessageService.sendMessage(this.baseUrl, {
        to: from,
        type: 'text',
        text: { body: message },
      }, this.apiKey);
    } catch (error) {
      console.error('Error handling View Challenges:', error);
      await this.swiftchatMessageService.sendMessage(this.baseUrl, {
        to: from,
        type: 'text',
        text: {
          body: localised.errorOccurred,
        },
      }, this.apiKey);
    }
  }

}
export default ChatbotService;