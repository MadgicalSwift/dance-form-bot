import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomException } from 'src/common/exception/custom.exception';
import { localised } from 'src/i18n/en/localised-strings';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';

@Injectable()
export abstract class MessageService {
  constructor(public readonly mixpanel: MixpanelService) {}
  async prepareWelcomeMessage() {
    return localised.welcomeMessage;
  }
  getSeeMoreButtonLabel() {
    return localised.seeMoreMessage;
  }

  async sendMessage(baseUrl: string, requestData: any, token: string) {
    try {
      const response = await axios.post(baseUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.log('Error sending message:', error.response?.data);
      throw new CustomException(error);
    }
  }

 
  

  
  abstract sendWelcomeMessage(from: string, language: string);
  abstract sendSubTopics(from: string, topicName: string);
  abstract sendExplanation(
    from: string,
    subtopicName: string,
  );
  abstract sendCompleteExplanation(
    from: string,
    subtopicName: string,
  );
  abstract difficultyButtons(from: string);
  abstract sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
  );
  abstract checkAnswer(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  );
  abstract sendName(from:string);
  abstract sendInitialTopics(from:string);
  abstract getQuestionBySet(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  );
  
  abstract sendScore(from: string, score: number, totalQuestions: number, badge:string);
  abstract endMessage(from:string);
  abstract sendLanguageChangedMessage(from: string, language: string);
  abstract newscorecard(from: string,score: number, totalQuestions: number, badge:string);
  abstract sendVideo(from: string,  videoUrl: string, title:string, subTopic: string, aboutVideo: string);
  abstract imageWithButton(from: string,  imageUrl: string, Title:any, subTopic: string, aboutimage: string );
  // abstract imageWithButton2(from: string,  imageUrl: string, Title:any, subTopic: string, aboutimage: string );
  abstract sendInformationMessage(from: string, username: string);
}