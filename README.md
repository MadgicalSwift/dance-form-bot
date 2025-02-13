#  Dance-Form-Bot

Welcome to the Dance Form Bot, an interactive platform designed to help users discover and learn about traditional Indian dance forms based on their state. Whether you are a dance enthusiast, a student, or simply curious about India's rich cultural heritage, this bot provides a seamless way to explore regional dance forms, take engaging quizzes, and access detailed information.


# Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js and npm installed
* Nest.js CLI installed (npm install -g @nestjs/cli)
* DynomoDB database accessible

## Getting Started
### Installation
* Fork the repository
Click the "Fork" button in the upper right corner of the repository page. This will create a copy of the repository under your GitHub account.


* Clone this repository:
```
https://github.com/MadgicalSwift/dance-form-bot.git
```
* Navigate to the Project Directory:
```
cd dance-form-bot
```
* Install Project Dependencies:
```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Add the following environment variables:

```bash
USERS_TABLE= user_table
REGION= region
ACCESS_KEY_ID= access_key_id
SECRET_ACCESS_KEY= secret_access_key
API_URL = api_url
BOT_ID = bot_id
API_KEY = api_key
```
# API Endpoints
```
POST api/message: Endpoint for handling user requests. 
Get/api/status: Endpoint for checking the status of  api
```
# folder structure

```bash
src/
├── app.controller.ts
├── app.module.ts
├── lambda.ts
├── main.ts
├── chat/
│   ├── chat.service.ts
│   └── chatbot.model.ts
├── common/
│   ├── exceptions/
│   │   ├── custom.exception.ts
│   │   └── http-exception.filter.ts
│   ├── middleware/
│   │   ├── log.helper.ts
│   │   └── log.middleware.ts
│   └── utils/
│       └── date.service.ts
├── config/
│   └── database.config.ts
├── i18n/
|    └── buttons/
│       └── buttons.ts
│   ├── en/
│   │   └── localised-strings.ts
│   └── hi/
│       └── localised-strings.ts
├── localization/
│   ├── localization.service.ts
│   └── localization.module.ts
│
├── message/
│   ├── message.service.ts
│   └── message.service.ts
└── model/
│   ├── user.entity.ts
│   ├──user.module.ts
│   └──query.ts
└── swiftchat/
|    ├── swiftchat.module.ts
|    └── swiftchat.service.ts
└── datasource/
    ├── english_data.json
    └── hindi_data.json
└── intent/
    ├── intent.classifier.ts
├── mixpanel/
│   ├── mixpanel.service.specs.ts
│   └── mixpanel.service.ts
    

```

# Link
* [Documentation]https://app.clickup.com/43312857/v/dc/199tpt-9236

