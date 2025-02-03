import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomException } from 'src/common/exception/custom.exception';
import { localised } from 'src/i18n/en/localised-strings';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';

@Injectable()
export abstract class MessageService {
  constructor(public readonly mixpanel: MixpanelService) { }
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
  abstract sendSubTopics(from: string, topicName: string, language: string);
  abstract sendExplanation(
    from: string,
    subtopicName: string,
    language: string
  );
  abstract sendCompleteExplanation(
    from: string,
    subtopicName: string,
    language: string
  );
  // abstract difficultyButtons(from: string,language: string);
  abstract sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    selectedQuestionIndex: number,
    language: string
  );
  abstract checkAnswer(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
    score: number,
    language: string
  );
  abstract sendName(from: string,language:string);
  abstract sendInitialTopics(from: string,language:string );
  abstract getQuestionBySet(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
    language: string
  );

  abstract sendScore(from: string, score: number, totalQuestions: number, badge: string,language: string);
  abstract endMessage(from: string,language: string);
  abstract scoreInformation(from: string,score:number,attempted: number,language: string);

  abstract sendLanguageSelectionMessage(from: string, language: string);
  abstract newscorecard(from: string, score: number, totalQuestions: number, badge: string,language: string);
  abstract sendVideo(from: string, videoUrl: string, title: string, subTopic: string, aboutVideo: string,language: string);
  abstract imageWithButton(from: string, imageUrl: string, Title: any, subTopic: string, aboutimage: string,language: string);
  abstract sendInformationMessage(from: string, username: string,language: string);
}