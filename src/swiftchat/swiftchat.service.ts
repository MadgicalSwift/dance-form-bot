import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import axios from 'axios';
import {
  createMainTopicButtons,
  createSubTopicButtons,
  createButtonWithExplanation,
  createTestYourSelfButton,
  questionButton,
  answerFeedback,
  optionButton,
  buttonWithScore,
  //videoWithButton,
  //imageWithButton,
  mediaWithButton
} from 'src/i18n/buttons/button';
dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  sendExperimentVideo(from: string, selectedExperimentDetails: any) {
    throw new Error('Method not implemented.');
  }
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: 'text',
      text: {
        body: requestBody,
      },
    };
  }

// fn done
  async sendInformationMessage(from: string, username: string, language:string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.InformationMessage(username); // Pass username dynamically
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey
    );
    return response;
  }

  // fn done
  async scoreInformation(from: string, score: number, attempted: number, language:string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);

    const message = localisedStrings.scoreInformation(score, attempted);
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendWelcomeMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.welcomeMessage,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  // nor done
  async endMessage(from: string, language:string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    // const message = localised.endMessage;
    const requestData = this.prepareRequestData(from, localisedStrings.endMessage);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }


  // nor done
  async sendName(from: string,language:string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    // const message = localised.askUserName
    const requestData = this.prepareRequestData(from, localisedStrings.askUserName);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

 
  async newscorecard(from: string, score: number, totalQuestions: number, badge: string,language:string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    //const messageData = createDifficultyButtons(from);
    const currentDate = new Date()
    const date = currentDate.getDate()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear() % 100


    let backgroundColor = "teal"; // Default for low scores
    if (score >= 9) backgroundColor = "orange";
    else if (score >= 7) backgroundColor = "blue";
    else if (score >= 5) backgroundColor = "green";
    else if (score >= 3) backgroundColor = "pink";

    let performanceMessage = "Keep going! You got this!"; // Default
    if (score >= 9) performanceMessage = "Outstanding! Keep shining!";
    else if (score >= 7) performanceMessage = "Great work! Keep improving!";
    else if (score >= 5) performanceMessage = "Good effort! Keep practicing!";
    else if (score >= 3) performanceMessage = "Nice try! You’re learning!";

    const performanceScore = `${(score / totalQuestions) * 100}%`;

    const payload = {
        to: from,
        type: "scorecard",
        scorecard: {
            theme: "theme2",
            background: backgroundColor, 
            performance: "high",
            share_message: localisedStrings.gotBadgeText,
            text1: `Quiz-${date}-${month}-${year}`,
            text2: performanceMessage, // Dynamic encouragement (≤ 35 chars)
            text3: performanceScore, // Score percentage
            text4: `${badge} `,
            score: `${score}/${totalQuestions}`,
            animation: "confetti"
        }
    }

    const response = await axios.post(this.baseUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    await this.sendScore(from, score, totalQuestions, badge,language);
    return response;
  }

     // don't chnage ===================Original code=========
     /*async sendVideo(from: string, videoUrl: string, title: any, subTopic: string, aboutVideo: string,language:string) {
      if (!videoUrl) {
        return;
      }
      const videoData = videoWithButton(
        from, // The recipient's phone number
        videoUrl, // Video URL
        title,
        subTopic,
        aboutVideo,
        language
      );
      try {
        const response = await this.sendMessage(this.baseUrl, videoData, this.apiKey);
        return response
      } catch (error) {
        console.error('Error sending video message:', error);
      }
    }

//==========================Original code=============
    async imageWithButton(from: string, imageUrl: string, Title: any, subTopic: string, aboutimage: string,language:string) {
      if (!imageUrl) {
        return;
      }
      const imagedata = imageWithButton(
        from, // The recipient's phone number
        imageUrl, // Video URL
        subTopic,
        Title,
        language
  
      );
      try {
        const response = await this.sendMessage(this.baseUrl, imagedata, this.apiKey);
        
        return response
      } catch (error) {
        console.error('Error sending image message:', error);
      }
    }*/

     
//===========================My code=========
        async sendMedia(
          from: string,
          mediaItems: Array<{ type: "video" | "image"; url: string; title: string; description: string }>,
          subTopic: string,
          language: string
        ) {
          if (!mediaItems || mediaItems.length === 0) {
            return;
          }
        console.log(mediaItems,"swift")
          const mediaData = mediaWithButton(from, mediaItems, subTopic, language);
        
          try {
            const response = await this.sendMessage(this.baseUrl, mediaData, this.apiKey);
            return response;
          } catch (error) {
            console.error("Error sending media message:", error);
          }
        }
      
  



  
    // dont'know
    async checkAnswer(
      from: string,
      answer: string,
      selectedMainTopic: string,
      selectedSubtopic: string,
      randomSet: string,
      currentQuestionIndex: number,
      score: number,
      language:string
    ) {
      const { feedbackMessage, result } = answerFeedback(
        from,
        answer,
        selectedMainTopic,
        selectedSubtopic,
        randomSet,
        currentQuestionIndex,
        score,
        language
      );
  
      const requestData = this.prepareRequestData(from, feedbackMessage);
      try {
        const response = await this.sendMessage(
          this.baseUrl,
          requestData,
          this.apiKey,
        );
        return { response, result };
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
// don;t change
  async sendQuestion(from: string,selectedMainTopic: string,selectedSubtopic: string, selectedQuestionIndex: number , language:string
  ) {
    const { messageData, randomSet } = await questionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      selectedQuestionIndex,
      language
    );
    if (!messageData) {
      return;
    }
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }

  // button done
  async sendExplanation(from: string, subtopicName: string, language:string) {
    const messageData = createButtonWithExplanation(from, subtopicName,language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
   // button done
   async sendScore(from: string, score: number, totalQuestions: number, badge: string,language:string) {
    const messageData = buttonWithScore(from, score, totalQuestions, badge,language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  // button done
  async sendInitialTopics(from: string,language:string) {
    console.log(" object 2 = ", language)
    const messageData = createMainTopicButtons(from , language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

   // button done
   async sendSubTopics(from: string, topicName: string,language:string) {
    const messageData = createSubTopicButtons(from, topicName,language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }


  
    // button done
    async getQuestionBySet( from: string,answer: string, selectedMainTopic: string, selectedSubtopic: string,randomSet: string,currentQuestionIndex: number, language:string) {
      const messageData = optionButton(from,selectedMainTopic,selectedSubtopic,randomSet,currentQuestionIndex,language);
      const response = await this.sendMessage(
        this.baseUrl,
        messageData,
        this.apiKey,
      );
      return { response, randomSet };
    }
  
  
  // button done
    async sendLanguageSelectionMessage(from: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.languageSelection;
      const messageData = {
        to: from,
        type: 'button',
        button: {
          body: {
            type: 'text',
            text: {
              body: message,
            },
          },
          buttons: [
            {
              type: 'solid',
              body: localisedStrings.language_english,
              reply: 'english',
            },
            {
              type: 'solid',
              body: localisedStrings.language_hindi,
              reply: 'hindi',
            },
          ],
          allow_custom_response: false,
        },
      };
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }

  // button done
  async sendCompleteExplanation(from: string, subtopicName: string, language:string) {
    const messageData = createTestYourSelfButton(from, subtopicName, language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }







}