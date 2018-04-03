# UPlanner

UPlanner is a web application designed to assist lectures and educators to plan units.

### Prerequisites

To run this project you will need a few things to be installed.

1. Node JS
2. NPM
3. MySQL (or MariaDB)


### Installation

To start the server follow these steps:
1. Make a copy of this project into your local machine

2. Install the project dependences by navigating to the main project directory and run the command:

```
npm install
```

3. initialize the database by running the following command

```
mysql -u root -p < dbSQL.sql
```
alternatively, you can copy the contents of dbSQL.sql into MySQL

4. To start the server run the command:

```
npm start
```

## How to use UPlanner

### Create new unit
To create a new topic navigate to the my units list and select 'add new unit'. From there you will be prompted to fill in the details of the unit. Then click add unit and the unit will be save

### Add new topic
To add a new topic, navigate to the unit you wish to at a topic to using the 'My Units' list. Then click the plus button at the bottom of the topics list. A new topic will appear in the top of the in the info bar. fill in the information and press save.

### Add new note
To add a new note click the add note button in the topics bar

### Re-order topics
To re order topics, click and drag the topic in the topics menu to the position you want it to be in.

### Change or delete unit detail
To change a units details, click the information icon next to the units long name

### Delete a topic
to delete a topic press the delete button in the info bar.


## Reflection

This coursework has taught  me a lot about RESTful servers, mainly how RESTful servers are structured and how they function.
Its has highlighted to me that fact that the RESTful architecture is well suited for web applications such as UPlanner as different sections of the project can be worked on independently, as well as the ease of scalability.

something else that this project as taught me is how effective Caching data can be with a rest server. I noticed a massive decrees in server requests after marking my public files as catchable. further improving the performance of the server, although this dose have a Potentially negative effect as data can become outdated and unreliable.

This project has also thought me about workflow. I began to follow Rich's GitHub post about workflow, this has helped me maintain good version control and regular commits. Using this method has helped me organise my work and visualise what needs to be done.




## Potential future features
Future features that could be added to this project could be a second server for websockets  as to allow for users to collaboratively plan their units.

Another future feature could be to allow for files to be uploaded to each topics. this could allow users to keep files such as lecture slide and other resources in one place.

## Author

* **UP805988** - *University of Portsmouth*
