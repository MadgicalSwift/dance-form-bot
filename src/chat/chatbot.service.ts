import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { localised } from 'src/i18n/en/localised-strings';
import { LocalizationService } from 'src/localization/localization.service';
import englishData from '../datasource/english_data.json';
import hindiData from '../datasource/hindi_data.json';
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
  private readonly englishTopics: any[] = englishData.topics;
  private readonly hindiTopics: any[] = hindiData.topics;
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
    let topics = []
    // Retrieve botID from environment variables
    const botID = process.env.BOT_ID;
    let userData = await this.userService.findUserByMobileNumber(from, botID);

    // If no user data is found, create a new user
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
      userData = await this.userService.findUserByMobileNumber(from, botID);
    }
    if(userData.language=="english"){
      topics = this.englishTopics
    }
    else{
      topics = this.hindiTopics
    }

    // Convert plain user data to a User class instance
    const user = plainToClass(User, userData);

    const localisedStrings = LocalizationService.getLocalisedString(user.language);
    console.log('user-language', user.language);
    
    if (persistent_menu_response) {
      if (persistent_menu_response.body == "Change Topic") {

        
        user.selectedSet = null;
        user.selectedMainTopic = null;
        user.selectedSubtopic = null;
        user.score = 0;
        user.questionsAnswered = 0;
        user.startingIndex = 0;
        user.lastIndex = 0;
        
        await this.userService.saveUser(user);

        await this.message.sendInitialTopics(from,user.language);
        return
      }

      if (persistent_menu_response.body == "Change Language") {
       
        user.selectedSet = null;
        user.selectedMainTopic = null;
        user.selectedSubtopic = null;
        user.score = 0;
        user.questionsAnswered = 0;
        user.startingIndex = 0;
        user.lastIndex = 0;
        
        await this.message.sendLanguageSelectionMessage(from, user.language);
        await this.userService.saveUser(user);
        return
      }
      

    }
  
    else if (button_response) {
      const buttonBody = button_response.body;
      
      if (['english', 'hindi'].includes(buttonBody?.toLowerCase())) {
        user.language = buttonBody.toLowerCase();
        await this.userService.saveUser(user);
        console.log('afterselecting-user-language', user.language);
        if (user.name == null){
          
          await this.message.sendName(from,user.language);
        }
        else{
          
        await this.message.sendInitialTopics(from , user.language);
        }
      }
      let userSelectedLanguage = user.language;
      
    if (buttonBody === localisedStrings.mainMenu) {

        user.selectedSet = null;
        user.questionsAnswered = 0;
        user.startingIndex = 0;
        user.score = 0;
        await this.userService.saveUser(user);

        await this.message.sendInitialTopics(from ,userSelectedLanguage);
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      
      // Handle 'Retake Quiz' button - reset quiz progress and send the first question
      if (buttonBody === localisedStrings.retakeQuiz) {
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
          userSelectedLanguage
        );
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      if (buttonBody === localisedStrings.viewChallenge) {
        await this.handleViewChallenges(from, userData,userSelectedLanguage);
        await this.message.endMessage(from,userSelectedLanguage);
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
        return 'ok';
      }
      // Handle 'See More ' button - send complete explanation for the subtopic

      if (buttonBody === localisedStrings.seeMoreVideo) {
        const topic = user.selectedSubtopic;
        const subtopic = topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === topic);
      
        if (subtopic) {
          const imageUrl = subtopic.image_link;
          console.log(imageUrl,"iiiiiiiiiiii")

          // const videoUrl = subtopic.video_link;
          // const description = subtopic.description;
          // const Title = subtopic.title;
          // const aboutimage = subtopic.Descrip;
           const SubTopic = subtopic.subtopicName;
      
          let indexing = user.startingIndex;
          let updateIndexing = user.lastIndex;
      
          if (indexing >= imageUrl.length) {
            user.startingIndex = 0;
            user.lastIndex = 0;
            await this.userService.saveUser(user);
            await this.message.sendCompleteExplanation(from, SubTopic, userSelectedLanguage);
          } else {
            const mediaItems = [];
            //console.log(imageUrl,"iiiiiiiiiiii")
            // Add all images in the current slice to the media items array
            const eachImageUrl = imageUrl.slice(indexing, updateIndexing);
            eachImageUrl.forEach((image, index) => {
              mediaItems.push({
                type: "image",
                url: image.imageUrl,
                title: image.title, 
                description: image.Descrip, 
              });
            });
          
            // =========Send all media items in a single request========//
            await this.message.sendMedia(from, mediaItems, SubTopic, userSelectedLanguage);
      
            if (updateIndexing >= imageUrl.length) {
              user.startingIndex = 0;
              user.lastIndex = 0;
              await this.userService.saveUser(user);
              await this.message.sendCompleteExplanation(from, SubTopic, userSelectedLanguage);
            } else {
              await this.message.sendExplanation(from, SubTopic, userSelectedLanguage);
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


     /* if (buttonBody === localisedStrings.seeMoreVideo) {

        const topic = user.selectedSubtopic;
        // Find the selected subtopic in the list of topics
        const subtopic = topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === topic);
        if (subtopic) {
          const imageUrl = subtopic.image_link;
          const videoUrl = subtopic.video_link
          const description = subtopic.description;
          const Title = subtopic.title;
          const aboutimage = subtopic.Descrip
          const SubTopic = subtopic.subtopicName


          // Divide all the videos into parts of 3 each

          let indexing = user.startingIndex; 
          let updateIndexing = user.lastIndex;   
          if (indexing >= imageUrl.length) {
            user.startingIndex = 0;
            user.lastIndex = 0;
            await this.userService.saveUser(user);
            await this.message.sendCompleteExplanation(from, SubTopic,userSelectedLanguage);

          }
          else {
            const eachImageUrl = imageUrl.slice(indexing, updateIndexing);
             console.log(eachImageUrl,"hhhhhhhhhhhh")
           //await this.message.imageWithButton(from, eachImageUrl, Title, SubTopic, aboutimage,userSelectedLanguage);
           await this.message.sendMedia(from, [
            { type: "video", url: videoUrl, title: "Sample Video", description: "This is a sample video" },
            { type: "image", url: eachImageUrl, title: "Image 1", description: "Description of Image 1" },
          ], SubTopic, userSelectedLanguage);
          



            if (user.lastIndex >= imageUrl.length) {
              user.startingIndex = 0;
              user.lastIndex = 0;
              await this.userService.saveUser(user);
              await this.message.sendCompleteExplanation(from, SubTopic,userSelectedLanguage);
            }
            else {

              await this.message.sendExplanation(from, SubTopic,userSelectedLanguage);
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
      }*/



      // Handle 'Test Yourself' button - show difficulty options to the user

      if (buttonBody === localisedStrings.startQuiz) {

        await this.message.sendInformationMessage(from, user.name,userSelectedLanguage);

        user.questionsAnswered = 0;
        await this.userService.saveUser(user);

        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const selectedQuestionIndex = user.questionsAnswered;

        const { randomSet } = await this.message.sendQuestion(
          from,
          selectedMainTopic,
          selectedSubtopic,
          selectedQuestionIndex,
          user.language
        );

        user.selectedSet = randomSet;

        await this.userService.saveUser(user);
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
        let userSelectedLanguage = user.language;
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const randomSet = user.selectedSet;
        const score = user.score;

        const currentQuestionIndex = user.questionsAnswered;
        const { result } = await this.message.checkAnswer(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          currentQuestionIndex,
          score,
          userSelectedLanguage
        );

        // Update user score and questions answered
        user.score += result;
        user.questionsAnswered += 1;
        await this.userService.saveUser(user);


        if ( currentQuestionIndex < 9) {

          await this.message.scoreInformation(from,user.score, currentQuestionIndex+1,userSelectedLanguage)
        }
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
          
          await this.message.newscorecard(from, user.score, user.questionsAnswered, badge,userSelectedLanguage)
          
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
          userSelectedLanguage
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
      const topic = topics.find((topic) => topic.topicName === buttonBody);
  
      if (topic) {
        const mainTopic = topic.topicName;

        user.selectedMainTopic = mainTopic;
        await this.userService.saveUser(user);

        await this.message.sendSubTopics(from, mainTopic,userSelectedLanguage);
        const trackingData = {
          distinct_id: from,
          button: buttonBody,
          botID: botID,
        };

        this.mixpanel.track('Button_Click', trackingData);
      } else {
        // Handle subtopic selection - find the subtopic and send an explanation
        const subtopic = topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === buttonBody);
        /*if (subtopic) {
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
          //await this.message.sendVideo(from, videoUrl, title, subTopic, aboutVideo,userSelectedLanguage);


          // code for buttonimage

          const imageUrl = subtopic.image_link;
          const Title = subtopic.title;
          const aboutimage = subtopic.Descrip
          const SubTopic = subtopic.subtopicName

          let indexing = user.startingIndex; 
          user.lastIndex = user.lastIndex + 3;
          await this.userService.saveUser(user);
          let updateIndexing = user.lastIndex; 


          const eachImageUrl = imageUrl.slice(indexing, updateIndexing);

          //await this.message.imageWithButton(from, eachImageUrl, Title, SubTopic, aboutimage,userSelectedLanguage);
          await this.message.sendMedia(from, [
            { type: "video", url: videoUrl, title: "Sample Video", description: "This is a sample video" },
            { type: "image", url: eachImageUrl, title: "Image 1", description: "Description of Image 1" },
            
          ], subTopic, userSelectedLanguage);
         


          if (updateIndexing >= imageUrl.length) {

            user.lastIndex = 0;
            await this.userService.saveUser(user);

            await this.message.sendCompleteExplanation(from, subtopicName,userSelectedLanguage);


          }
          else {
            user.startingIndex = user.lastIndex;
            user.lastIndex = user.lastIndex + 3;
            await this.userService.saveUser(user);
            await this.message.sendExplanation(from, subtopicName,userSelectedLanguage);


          }


        }*/

          if (subtopic) {
            const subtopicName = subtopic.subtopicName;
            const description = subtopic.description[0];
            if (!description) {
              // Handle case where description is missing
            }
            user.selectedSubtopic = subtopicName;
            const videoUrl = subtopic.video_link;
            const title = subtopic.title;
            const aboutVideo = subtopic.descrip;
            let subTopic = subtopic.subtopicName;
            if (subTopic.length > 20) {
              subTopic = subTopic.slice(0, 20) + '...';
            }
          
            await this.userService.saveUser(user);
          
            // Code for sending media (video and images)
            const imageUrl = subtopic.image_link;
            const Title = subtopic.title;
            const aboutimage = subtopic.Descrip;
            const SubTopic = subtopic.subtopicName;
          
            let indexing = user.startingIndex;
            user.lastIndex = user.lastIndex + 3;
            await this.userService.saveUser(user);
            let updateIndexing = user.lastIndex;
          
            const eachImageUrl = imageUrl.slice(indexing, updateIndexing);
          
            // Create an array of media items
            const mediaItems = [];
          
            // Add the video to the media items array
            mediaItems.push({
              type: "video",
              url: videoUrl,
              title: title,
              description: aboutVideo,
            });
          
            // Add all images in the current slice to the media items array
            eachImageUrl.forEach((image, index) => {
              mediaItems.push({
                type: "image",
                url: image.imageUrl, // Use the imageUrl from the image object
                title: image.title, // Use the title from the image object
                description: image.Descrip, // Use the Descrip from the image object
              });
            });
          
          console.log(aboutimage,"hgjhgjhgjhjgjhgjhjhgj",subtopic.Descrip)
            // Send all media items in a single request
            await this.message.sendMedia(from, mediaItems, SubTopic, userSelectedLanguage);
          
            if (updateIndexing >= imageUrl.length) {
              user.lastIndex = 0;
              await this.userService.saveUser(user);
              await this.message.sendCompleteExplanation(from, subtopicName, userSelectedLanguage);
            } else {
              user.startingIndex = user.lastIndex;
              user.lastIndex = user.lastIndex + 3;
              await this.userService.saveUser(user);
              await this.message.sendExplanation(from, subtopicName, userSelectedLanguage);
            }
          
            const trackingData = {
              distinct_id: from,
              button: buttonBody,
              botID: botID,
            };
          
            this.mixpanel.track('Button_Click', trackingData);
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
        
        // user.name = null
        
        await this.userService.saveUser(user); //save in database
        let userLang = userData.language
        await this.message.sendWelcomeMessage(from, userLang);

        await this.message.sendLanguageSelectionMessage(from, userLang)
       
      }
      else {
        
        //  save username and send the main topic
        await this.userService.saveUserName(from, botID, text.body);
        console.log('user-language for topic', user.language);
        
        await this.message.sendInitialTopics(from, user.language);
      }

    }

    return 'ok';
  }
  async handleViewChallenges(from: string, userData: any, userSelectedLanguage:string): Promise<void> {
    try {
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