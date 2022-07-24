
## Readme Contents



1. About the Project
2. Features and Functionality  
   2.1 MongoStore
   2.2 API  
   2.3 Images  
   2.4 Test Suite  
   2.5 OAuth  
   2.6 Password Hashing and Salting


3. Deployment / Installation  
   3.1 Glitch  
   3.2 Heroku
4. Reference List
5. Image & Sample Content Credits



**1.   About the project**

This project implements a node.js/hapi web application with API (openAPI 2.0 compliant) that allows users of the system to record and share information about unusual places of interest.

The application is built on version 14.16.0 of Node.js and the hapi Framework version 20.2.1 to implement a documented OpenAPI 2.0 compliant API with JWT authentication (hapi-swagger and hapi-auth-jwt2).

The API and data models are accompanied by extensive test suites using mocha.js testing framework and the chai assertion library.  
The initial project commit was based on the following archive:

- https://wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-05-models/unit-2/book-playtime-0-5-0/archives/playtime-0.5.0.zip

**2. Functionality & Features**


***mongoStore*** – This store implements a MongoDB based version of the Store object. The Mongoose library is used to interface between a mongo server (credentials defined as an environment variable). This interface relies on the definition of a Data Schema and model for the Collection which is declared in a js file that accompanies the export file for the store Object. The mongo storage type is unique among the four database types implemented in that a native mongo Object objectId() is used as a unique identifier and not a String. It also returns a versioning property that is relied on by mongo servers to resolve potential issues where clusters/shards are in use. This presented challenges for the current project in terms of maintaining the interoperability between data storage types and this was resolved by updating the Validation framework (joi-schemas.js) to accept this new ObjectId data type in addition to the string ids used in the other systems and also by permitting the version control property v as an optional value.

**2.2 API**  
In parallel with the browser accessible version of PlaceMark there is a set of API endpoints which mirror the operations possible via the browser version of the app.  
These are as follows:  
Place Endpoints
- GET - /api/placemark - Get all Places
- POST - /api/placemark - Creates a new Place
- DELETE - /api/placemark - Deletes all places.
- GET - /api/placemark/{id} - Gets details related to a Place
- DELETE - /api/placemark/{id} - Deletes a place.

Category Endpoints
- GET - /api/placemark/category - Get all Categories
- POST - /api/placemark/category - Creates a new Category
- DELETE - /api/placemark/category - Deletes all categories.
- POST - /api/placemark/category/{categoryId}/places - Adds a place to a category
- DELETE - /api/placemark/category/{categoryId}/places/{placeId} - Deletes a place from a category.
- GET - /api/placemark/category/{id} - Gets details related to a Category
- DELETE - /api/placemark/category/{id} - Deletes a category.
- GET - /api/placemark/category/{id}/places - Get Places tagged with Category
- POST - /api/place/uploadimage - uploads an image file to cloudinary service
- DELETE - /api/place/deleteimage/{id} - deletes an image file from the cloudinary service


User Endpoints
- GET - /api/users - Get all userApi
- POST - /api/users - Create a new User
- DELETE - /api/users - Deletes all users
- GET - /api/users/{id} - Get a User by ID
- POST - /api/users/find  - Return a User by their Email provided as post data
- POST - /api/users/authenticate  - Authenticates a set of user credentials and returns a JWT token
- POST - /api/revokeToken" - accepts a token at front end log out and stores in database as a revoked token
- ANY  -  /api/checkToken  - checks the validity of the presented token against the values stored in the revoked token database. If revoked returns true.
- GET  - /github - stores a user created via OAuth sign up.
- GET | POST-  /auth - initiated a Github OAuth Login / Sign up depending on credentials provided.

The Hapi-swagger library is used to provide user documentation of the requests formats expected and response payloads which will be returned. This is available at /documentation once the project is running. The Hapi-swagger generated documentation also provides a tool for exploring the API functionality. To avail of this in a live environment you must first obtain a JSON Web token (JWT) by supplying a valid set of user credentials via the POST /api/users/authenticate endpoint.

{ "email": "string", "password": "string" }  
A demo live environment is available at: https://lit-plains-40353.herokuapp.com/documentation

To create an account use the following endpoint https://lit-plains-40353.herokuapp.com/documentation#/api/postApiUsers

**API Authentication**

With the exception of the `POST /api/users/authenticate` and the `POST /api/users`, routes are secured and require a valid JWT to obtain a successful response.

Implementing this functionality in the project relies on two packages:
- https://github.com/dwyl/hapi-auth-jwt2
- https://github.com/auth0/node-jsonwebtoken

The content of the JWT used mirrors the content available in the front-end cookie, storing the users email and their user id. Additional parameters can be added to the JWT by editing the /api/jwt-utils.js file to include them in the createToken() and decodeToken() methods.

To secure a route to require JWT authentication the JWT auth strategy must be included for the controller method associated with the route. This is accomplished by adding a new auth property to the controller method with a value of the following:

auth: { strategy: "jwt", },


**2.3 Images**  
The place model allows users to store image URLs related to individual placemarks.  
To store these images a cloud-based hosting service, Cloudinary was selected. The implementation of the feature was guided by the process outlined in the following tutorial

>  https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-11-deployment/unit-1-deployment/book-3-cloudinary

The delete method  was updated to return a response.


**2.4Test suite**

The project is accompanied by 2 test suites one focused on testing the API functionality and another focused on unit testing the integrity of the model

test  
│  
├── api\  
│   ├── auth-api-test.js  
│   ├── category-api-test.js  
│   ├── place-api-test.js  
│   ├── placemark-service.js  
│   └── user-api-test.js  
│  
├── model\  
│   ├── category-model-test.js  
│   ├── places-model-test.js  
│   └── users-model-test.js  
│  
├── fixtures.js  
└── test-utils.js

The node `package.json` file is configured to run the test suites using: npm run test  
Note that only test driven scripts are compatible and behaviour driven scripts if these are required will need to be refactored to a separate folder.

The testing suites in place rely on sample data provided in `fixtures.js`, this file should be modified according to your projects needs.

Further information on the mocha.js testing framework and chai assertion library is available in the respective documentation. Reference below.

**2.5 OAuth**
The hapi/Bell plugin was used to enable OAuth with gitHub. Following creation of the auth strategy in server.js the user-api.js file was update with a new auth method to handle traffic. Once the OAuth request has been handled by Github this is then relayed back to the front end as either
1. if a user exists for authenticated gitHub profile  /auth/{placemarkuserId}/{base64encodedtoken}
2. if not yet registered
   /github/{base64endodeduserobject}

**2.6 Password Hashing and Salting**

To apply this in the hapi application the bcrypt library was installed via npm. Bcrypt has the added convenience of generating the salt value and returning a single string representing the hashed value, the salt and the work factor value used to slow the generation of the salt. OWASP (2022) guidelines on password storage recommend a work factor value of at least 10 to ensure it is sufficiently computationally ‘expensive’ for potential attackers to attempt to brute force.

**3.  Deployment / Installation**

**3.1 To deploy your own version of this repository on Glitch.**
1. Log into your Glitch account or create a new one (https://www.glitch.com)
2. Click [New Project] and [import from GitHub]
3. In the dialog that appears enter the repo address for this project: https://github.com/StephenSwantonIRL/PlaceMarkAPI.git
4. Edit the Glitch project .env file to create the following variables adding your own API keys for the relevant services:

> cookie_name  
> cookie_password  
> db  
> cloudinary_name  
> cloudinary_key  
> cloudinary_secret  
> githubclientid
> githubclientsecret
> domain
> frontEndDomain

The `db` variable is the `mongodb+srv://` connection url for your mongoDB hosting. Cloudinary variables are available in your user account. frontEndDomain is the deployment domain for your front end;
5. Thats it!




**3.1 To deploy your own version of this repository on Amazon Web Services EC2 instance**

1. Log into your AWS web console and create a new instance.
2. Ensure port 4000 is open to incoming web traffic when configuring security groups.
3. SSH into the instance and run the following commands

   sudo yum -y update

   sudo  yum -y install git

   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

   . ~/.nvm/nvm.sh

   nvm install 16.0.0

   git clone https://github.com/StephenSwantonIRL/PlaceMarkAPI.git

   cd P*

   npm install

   nano .env     [ and paste in your environment variable - see above]

   npm install -g pm2

   env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v16.0.0/bin /home/ec2-user/.nvm/versions/node/v16.0.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

   pm2 startup

   pm2 start src/server.js

   pm2 save

That's it!

**4. References**
- Bulma - Documentation - https://bulma.io/documentation/
- Chai Assertion Library - Documentation, Assert - https://www.chaijs.com/api/assert/
- CKeditor - CKEditor Documentation - Getting Started - https://ckeditor.com/docs/ckeditor5/latest/installation/index.html
- Dotenv - dotenv - https://www.npmjs.com/package/dotenv
- GeeksforGeeks - Lodash _.cloneDeep() Method - https://www.geeksforgeeks.org/lodash-_-clonedeep-method/
- GeeksforGeeks - Lodash _.orderBy() Method - https://www.geeksforgeeks.org/lodash-_-orderby-method/
- Glitch Support Center - Can I change the version of node.js my project uses? - https://glitch.happyfox.com/kb/article/59-can-i-change-the-version-of-node-js-my-project-uses/
- Google - Firebase Documentation - Perform Simple and Compound Queries in Cloud FireStore - https://firebase.google.com/docs/firestore/query-data/queries
- Google - Firebase Documentation - Get Started with Cloud Firestore - https://firebase.google.com/docs/firestore/quickstart
- Handlebars - Handlebars API reference - https://handlebarsjs.com/api-reference/
- Handlebars - Handlebars Guide - https://handlebarsjs.com/guide/
- Heroku - Deploying with Git - https://devcenter.heroku.com/articles/git
- John Papa - Node.js Everywhere with Environment Variables! - https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
- Lowdb - https://github.com/typicode/lowdb
- Mastering JS - Updating Documents in Mongoose - https://masteringjs.io/tutorials/mongoose/update
- Mongoose JS - Documentation - Schema Types  - https://mongoosejs.com/docs/schematypes.html
- W3schools - JavaScript Fetch API - https://www.w3schools.com/js/js_api_fetch.asp
- W3schools - onclick Event - https://www.w3schools.com/jsref/event_onclick.asp
- WIT CompSci2021 - PlayTime version 5 - https://wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-05-models/unit-2/book-playtime-0-5-0/archives/playtime-0.5.0.zip
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 5 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-05-models/unit-2/book-playtime-0-5-0
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 6 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-06-apis/unit-2/book-playtime-0-6-0
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 7 -https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-07-rest/unit-2/book-playtime-0-7-0
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 8 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-08-openapi/unit-2/book-playtime-0-8-0
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 9 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-09-jwt/unit-1/book-1
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 10 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-11-deployment/unit-1-deployment/book-1-mongo-atlas
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 11 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-11-deployment/unit-1-deployment/book-2-deployment
- WIT CompSci2021 - Full Stack Web Development Course Material - Lab 12 - https://reader.tutors.dev/#/lab/wit-hdip-comp-sci-2021-full-stack.netlify.app/topic-11-deployment/unit-1-deployment/book-3-cloudinary
- WIT CompSci2021 - Glitch Playlist version 5 - https://github.com/wit-hdip-comp-sci-2021/playlist-5
- YairEO –  Tagify - https://github.com/yairEO/tagify


**5.   Image & Content Credits**  
J Comp on FreePiK  - Happy travel photo  - https://www.freepik.com/photos/happy-travel  
Foer, J., Morton, E., Thuras, D., & Obscura, A. (2019). Atlas Obscura: An Explorer's Guide to the World's Hidden Wonders. Workman Publishing.ng.