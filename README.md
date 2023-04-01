# MADWhatsThatApp

Github: https://github.com/rayyanp/MADWhatsThatApp

ESlinter used for airbnb code style.

All endpoints have been implemented. Some endpoints have been implemented multiple times.

All user input validated.

Error handling for all pages completed and displayed appropriately on the circumstance.

App.js: Navigation for Login.jsx, Register.jsx and MainAppNav.jsx

/Components:

Register.jsx: Register screen allows users to register. All user inputs, including email, password and names, are validated before being sent to the server. Endpoint implemented: Add a new user.

Login.jsx: Login screen allows users to login. All user inputs, including email, password are validated before being sent to the server. Error handling implemented if user inputs incorrect details. Once user successfully logs in a token session and their user id is stored in local storage. Endpoint implemented: Login into account.

MainAppNav.jsx: Checks session token for authentication of user and if user is logged in. If authenticated user will be redirected to chatList.jsx (home page), if not authenticated user will be redirected to login screen. MainAppNav.jsx is used for navigation of the app after successful login. 

ChatList.jsx: Home page of the app after successful login. Users can view their chats and create a new chat. Users can click on an individual chat to navigate to that specific chat. Endpoints implemented: View your list of chats, Start a new conversation.

ChatScreen.jsx: Chat screen allows users to view messages of the chat sent from others and themselves. Users can send messages, save draft messages, edit messages and delete messages.
Endpoints implemented: View details of a single chat, Send a message in the chat, Update a message in the chat, Delete a message in the chat.
Also the draft messages are saved in local storage using asyncStorage.

ChatInfo.jsx: The chat info screen allows users to view and edit chat information such as the name of the chat and users in the chat. Users can edit the chat name, remove users from the chat and add contacts/users to the chat. get_profile_image used to get profile images for users in the chat, get_user_image used to get profile image of logged in users profile photo.  Endpoints implemented: View details of a single chat, Update chat information, View your contacts, Add a user to the chat, Remove a user from the chat, get a users profile photo.

DraftMessage.jsx: Users can view their draft messages of that single chat. Each chat will have its own draft messages section. Users can edit the draft messages, delete the draft messages and send the draft messages to the chat. This was implemented by using asyncStorage.

Profile.jsx: Users can view their profile which shows their profile photo, first and last name and email. Users can also edit their profile by editing their email address, first and last name and password. All user inputs are validated before being sent to the server. Users can also update or upload a new profile photo by clicking the camera button to navigate to CameraSend.jsx. Endpoints implemented: Get user information, Update user information, Get a users profile photo.

CameraSend.jsx: Users can access their devices camera and take pictures which will be sent to the server and uploaded as their profile photo. Endpoints implemented: Upload a profile photo.

Contacts.jsx: Users can view all their contacts. They can also view all their contacts profile photos next to their name and email. Also they are able to start a conversation with a contact via a modal, delete a contact or block a contact/user. Users can also navigate to Blocked.jsx which displays all blocked contacts. Users can also search for contacts by clicking the search button which will navigate to SearchContacts.jsx. Endpoints implemented: View your contacts, Get a users profile photo, Start a conversation, Remove a contact, Block a user.

Blocked.jsx: Users can view all their contacts/users. They can also view all the blocked users profile photos next to their name and email. Also they are able to unblock a contact/user.
Endpoints implemented: View all blocked users, Get a users profile photo, Unblock a user.

SearchContacts.jsx: Users can search for contacts by inputting either their first name, last name or email and clicking the search button. The contacts that match the search will be displayed with their name and email and profile photo. If the search results are more than 20 then pagination is used for users to view the next set of results by clicking the next page or previous page to view the previous results. Users can also start a conversation with a contact via modal, delete a contact or block a contact/user. Endpoints implemented: Search for users, Get a users profile photo, Start a conversation, Remove a contact, Block a user.

SearchUser.jsx: Users can search for other users by inputting either their first name, last name or email and clicking the search button. The users that match the search will be displayed with their name and email and profile photo. If the search results are more than 20 then pagination is used for users to view the next set of results by clicking the next page or previous page to view the previous results. Users can also add other users to their contacts. Endpoints implemented: Search for users, Get a users profile photo, Add a contact.

Logout.jsx: Users can log out easily from the app. When the user clicks the log out button they will be asked to confirm if they want to log out and if yes the user will be logged out and the user id and session toke will be removed from local storage.

globalStyles.js: Global styles are used to for similar or same styles used across different components.
