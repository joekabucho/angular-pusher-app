import { Component } from '@angular/core';
import Chatkit from '@pusher/chatkit-client';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Angular Chatroom';
  messages = [];
  users = [];
  currentUser: any;
  currentRoom = {};

  _username: string = '';
  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  _message: string = '';
  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  sendMessage() {
    const { message, currentUser } = this;
    currentUser.sendMessage({
      text: message,
      roomId: '816c5627-fffb-4142-adac-a2cba0c6ebaa',
    });
    
    this.message = '';
  }

  addUser() {
    const { username } = this;
    axios.post('http://46.101.128.222:5200/users', { username })
      .then(() => {
        const tokenProvider = new Chatkit.TokenProvider({
          url: 'http://46.101.128.222:5200/authenticate'
        });

        const chatManager = new Chatkit.ChatManager({
          instanceLocator: 'v1:us1:b24fbeda-26ef-451f-98eb-12c1048778a9',
          userId: username,
          tokenProvider
        });

        return chatManager
          .connect()
          .then(currentUser => {
            currentUser.subscribeToRoom({
              roomId: '816c5627-fffb-4142-adac-a2cba0c6ebaa',
              messageLimit: 100,
              hooks: {
                onMessage: message => {
                  this.messages.push(message);
                },
                onPresenceChanged: (state, user) => {
                  this.users = currentUser.users.sort((a) => {
                    if (a.presence.state === 'online') return -1;
                    
                    return 1;
                  });
                },
              },
            });

            this.currentUser = currentUser;
            this.users = currentUser.users;
            
          });
      })
        .catch(error => console.error(error))
  }

}
