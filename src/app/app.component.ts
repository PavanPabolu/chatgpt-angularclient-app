import { Component, ElementRef } from '@angular/core';
/*The component imports Component and ElementRef from Angular's core library. 
Component is used to define the component itself, while ElementRef allows direct 
access to the DOM element associated with the component.*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
//The @Component decorator specifies the metadata for the component, including its selector, template URL, and styles.

/*The AppComponent class contains properties for managing the chat interface, including the 
title of the application, image paths for bot and user avatars, and references to the form 
and container elements.*/

export class AppComponent {
  title = 'chatGTPClient';
  loadinterval: any;
  bot = './assets/bot.svg';
  user = './assets/user.svg';

  form:any;
  container:any;

  //Lifecycle Hook
  //The constructor injects ElementRef, allowing access to the component's DOM elements.
  constructor(private elementref: ElementRef) {    
  }

  /*This lifecycle hook is called after the view is initialized. It sets up event listeners 
  for form submission and keyup events (specifically looking for the Enter key). 
  It also references the chat container element. */
  ngAfterViewInit(){
    this.form = this.elementref.nativeElement.querySelector('form');
    this.form.addEventListener('submit', this.handlesubmit);
    this.form.addEventListener('keyup', (e: any) => { 
      if (e.keycode === 13){
        this.handlesubmit(e);
      }
    });
    this.container = this.elementref.nativeElement.querySelector('#container');
  }

  //Helper Functions: 

  //Loader Function: This function simulates a loading state by adding dots to the text content of an element at intervals.
  // handling three dots ; bot thinking
  loader(element: any){
    element.textContent = '';
    this.loadinterval = setInterval(() => {
      element.textContent += '.';
      if (element.textContent === '....'){
          element.textContent = '';
      }
    }, 300)
  }

  //Type Text Function: This function simulates typing by incrementally adding characters of a given text to an HTML element.
  //to show one word typing at a time by bot
  typetext(element:any, text:any){
    let index = 0;

    let interval = setInterval(() => {
      if (index < text.length){
        element.innerHTML += text.charAt(index);
        index++;
      }
      else {
        clearInterval(interval);
      }
    }, 20)
  }

  // Unique ID Generator: Generates a unique identifier using the current timestamp and a random number.
  generateUniqueId(){
    const timestamp = Date.now();
    const rnNumber = Math.random();
    const hex = rnNumber.toString(16);
    return `id-${timestamp}-${hex}`;
  }

  //Stripes Function: Constructs HTML markup for chat messages, distinguishing between user and bot messages using different classes and avatars.
  //color variation of grey for bot and user
  stripes(ai: any, value:any, uniqueId: any){
    return(
      `
      <div class= "wrapper ${ai && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img src="${ai ? this.bot : this.user}"/>
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
      `
    )
  }

  //Handle Submit Function:
  /*
  This asynchronous function handles form submissions:
  * Prevents default form submission behavior.
  * Retrieves user input.
  * Displays user messages and a placeholder for bot responses.
  * Calls a server endpoint to get a response based on user input.
  * Displays the bot's response character by character.
  * Handles errors gracefully by alerting the user.
  */
  handlesubmit = async(e: any) => {
    e.preventDefault();

    const data = new FormData(this.form ?? undefined);

    // user stripes
    if (this.container != null) {
      this.container.innerHTML += this.stripes(false, data.get('prompt'), null)
    }
    // bot stripes
    const uniqueId = this.generateUniqueId();
    if (this.container != null){
      this.container.innerHTML += this.stripes(true, " ", uniqueId);
      this.container.scrollTop = this.container?.scrollHeight;
    }

    const messageDiv = document.getElementById(uniqueId);
    this.loader(messageDiv);

    // fetch the data from serve

    const response = await fetch("http://localhost:5000/", {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: data.get('prompt')
      })
    })

    clearInterval(this.loadinterval);
    if (messageDiv != null){
      messageDiv.innerHTML = '';
    }

    if (response.ok){
      const data = await response.json();
      const parseddata = data.bot.trim();

      this.typetext(messageDiv, parseddata);
    }
    else {
      const err = await response.text();
      if (messageDiv != null){
        messageDiv.innerHTML = 'Something went wrong';
        alert(err);
      }
    }
  }
}