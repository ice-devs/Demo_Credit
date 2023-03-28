# Demo Credit Demo Credit is a MVP (minimum viable product) wallet service which allows users of this service to create a wallet account which can be used to receive loans they have been granted and also send money for repayments. This service is built using; - NodeJs -  Express.Js framework for backend - KnexJs ORM -  For database mapping - AWS - Elastic beanstalk for deployment to cloud provisioned EC2 server - MySQL RDS - Typescript ## Prerequisites * NodeJs installed ## Installation and Setup - Clone the git repo ``` git clone https://github.com/ice-devs/Demo_Credit.git ``` - Install dependencies ``` nmp install ``` - Update environment vaiables by editing the "set_env.sh" file in the root folder of the project directory - Set up environment by running the command below > using git bash terminal ``` bash set_env.sh ``` - Start server > In development environment ``` npm run dev ``` > In production environment ``` npm run start ``` - Test or use API endpoints ## Functionalities and Usage This API service allows for the following functionalities using it's API endpoints > Please kindly note that any endpoint with **"Auth required"** needs authorization first, this service uses JWT token generated when a new user is created or when an existing user logs in to perform this authorization. Therefore when you are about run a request that needs authorization, make sure the JWT token generated by the use-case user is set as the authorization bearers token in postman - Create a user wallet profile. - ###### ```POST {{host}}/api/v0/auth/``` - ###### No Auth required - ###### Body request ```json "name" : "", "email" : "", "password": "" ``` > **Note:** A JWT token is sent in the response when the request is successful, this token should be used as authorization token for requests that require authorization - Login into an existing user wallet profile . - ###### ```POST {{host}}/api/v0/auth/login/``` - ###### No Auth required - ###### Body request ```json "email" : "", "password": "" ``` > **Note:** A JWT token is sent in the response when the login is successful, this token should be used as authorization token for requests that require authorization - Deposit into user wallet using the user's id. - ###### ```POST {{host}}/api/v0/deposit/``` - ###### No Auth required - ###### Body request ```json "amount" : "", "userId": "" ``` - List out all wallet profiles - ###### ```GET {{host}}/api/v0/auth/users/``` - ###### No Auth required - Create an account for a particular user - ###### ```POST {{host}}/api/v0/create/``` - ###### Auth required - ###### Body request ```json "accountName" : "" ``` - Fund a particular user account from the user's wallet - ###### ```POST {{host}}/api/v0/fund/``` - ###### Auth required - ###### Body request ```json "accountNo" : "", "amount": "" ``` > **Note:** user can only fund an account that was created by the user. - Withdraw from a user account into the user's wallet. - ###### ```POST {{host}}/api/v0/withdraw/``` - ###### Auth required - ###### Body request ```json "accountNo" : "", "amount": "" ``` > **Note:** user can only withdraw fund from an account that was created by the user. - Tranfer from a user account to another account (may belong to user or another user) - ###### ```POST {{host}}/api/v0/transfer/``` - ###### Auth required - ###### Body request ```json "fromAccount" : "", "toAccount" : "", "amount": "" ``` > **Note:** user can transfer funds to any account, but must tranfer from an account created by the user - List out all accounts of a particular user - ###### ```GET {{host}}/api/v0/account/byUserId/``` - ###### No Auth required - ###### Query parameter ```?userId=""``` - List out all accounts - ###### ```GET {{host}}/api/v0/account/``` - ###### No Auth required