import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localised } from 'src/i18n/en/localised-strings';
import data from '../datasource/data.json';
import axios from 'axios';
import {
  createMainTopicButtons,
  createSubTopicButtons,
  createButtonWithExplanation,
  createDifficultyButtons,
  createTestYourSelfButton,
  questionButton,
  answerFeedback,
  optionButton,
  buttonWithScore,
  videoWithButton,
  imageWithButton
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

  async sendInformationMessage(from: string, username: string) {
    const message = localised.InformationMessage(username); // Pass username dynamically
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey
    );
    return response;
  }

  async sendWelcomeMessage(from: string, language: string) {

    const message = localised.welcomeMessage;
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  async endMessage(from: string) {

    const message = localised.endMessage;
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  async sendInitialTopics(from: string) {
    const messageData = createMainTopicButtons(from);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  async sendName(from: string) {
    const message = localised.askUserName
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }


  async scoreInformation(from: string, score: number, attempted: number) {
    const message = localised.scoreInformation(score, attempted);
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendSubTopics(from: string, topicName: string) {

    const messageData = createSubTopicButtons(from, topicName);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async difficultyButtons(from: string) {
    const messageData = createDifficultyButtons(from);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  async newscorecard(from: string, score: number, totalQuestions: number, badge: string) {
    //const messageData = createDifficultyButtons(from);
    const currentDate = new Date()
    const date = currentDate.getDate()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear() % 100


    // console.log(currentDate.getDate())
    const payload = {
      to: from,
      type: "scorecard",
      scorecard: {
        theme: "theme2",
        background: "blue",
        performance: "high",
        share_message: localised.gotBadgeText,
        text1: `Quiz-${date}-${month}-${year}`,
        text2: localised.goodJobText,
        text3: `${score * 10}%`,
        text4: `${badge} `,
        score: `${score}/10`,
        animation: "confetti"
      }
    }

    const response = await axios.post(this.baseUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    await this.sendScore(from, score, totalQuestions, badge);
    // console.log(response)
    return response;
  }

  async sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    selectedQuestionIndex: number,
  ) {
    const { messageData, randomSet } = await questionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      selectedQuestionIndex,
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

  async sendExplanation(
    from: string,
    // description: string,
    subtopicName: string,

  ) {
    const messageData = createButtonWithExplanation(from, subtopicName);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  //  async sendVideo(from: string, selectVideo: any) {
  //   if (!selectVideo) {
  //     return;
  //   }
  //       console.log(selectVideo)
  //   // Create the video message data
  //   const videoUrl=selectVideo;
  //   const videoTitle=selectVideo.title||"Title not provided"
  //   const videoData = videoWithButton(
  //              from, // The recipient's phone number
  //             videoUrl, // Video URL
  //             videoTitle
  //         );
  //      console.log(videoData)
  //   // Send the video message using the sendMessage function
  //   try {
  //     const response = await this.sendMessage(this.baseUrl, videoData, this.apiKey);
  //     console.log('Message sent successfully:', response);
  //     return response
  //   } catch (error) {
  //     console.error('Error sending video message:', error);
  //   }
  // }



  async sendVideo(from: string, videoUrl: string, title: any, subTopic: string, aboutVideo: string) {
    if (!videoUrl) {
      return;
    }
    // console.log(videoUrl)
    // Create the video message data
    //const videoUrl=selectVideo
    //const videoTitle=title||"Title not provided"
    const videoData = videoWithButton(
      from, // The recipient's phone number
      videoUrl, // Video URL
      title,
      subTopic,
      aboutVideo
    );
    // console.log(videoData)
    // Send the video message using the sendMessage function
    try {
      const response = await this.sendMessage(this.baseUrl, videoData, this.apiKey);
      // console.log('Message sent successfully:', response);
      return response
    } catch (error) {
      console.error('Error sending video message:', error);
    }
  }



  async imageWithButton(from: string, imageUrl: string, Title: any, subTopic: string, aboutimage: string) {

    // console.log('swiftchat imageURL', imageUrl);

    if (!imageUrl) {
      return;
    }
    const imagedata = imageWithButton(
      from, // The recipient's phone number
      imageUrl, // Video URL
      subTopic,
      Title,

    );
    try {
      const response = await this.sendMessage(this.baseUrl, imagedata, this.apiKey);
      // console.log('Message sent successfully:', response);
      return response
    } catch (error) {
      console.error('Error sending image message:', error);
    }
  }






  async sendCompleteExplanation(
    from: string,
    // description: string,
    subtopicName: string,

  ) {
    const messageData = createTestYourSelfButton(
      from,
      subtopicName,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async checkAnswer(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
    score: number
  ) {
    const { feedbackMessage, result } = answerFeedback(
      from,
      answer,
      selectedMainTopic,
      selectedSubtopic,
      randomSet,
      currentQuestionIndex,
      score
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

  async getQuestionBySet(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  ) {
    const messageData = optionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      randomSet,
      currentQuestionIndex,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }


  async sendScore(from: string, score: number, totalQuestions: number, badge: string) {


    const messageData = buttonWithScore(from, score, totalQuestions, badge);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  // async sendLanguageChangedMessage(from: string, language: string) {
  //   const localisedStrings = LocalizationService.getLocalisedString(language);
  //   const requestData = this.prepareRequestData(
  //     from,
  //     localisedStrings.select_language,
  //   );

  //   const response = await this.sendMessage(
  //     this.baseUrl,
  //     requestData,
  //     this.apiKey,
  //   );
  //   return response;
  // }

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
            reply: 'English',
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







}