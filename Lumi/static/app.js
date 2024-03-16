class Chatbox {
    constructor() {
        this.openButton = document.querySelector('.chatbox__button');
        this.chatBox = document.querySelector('.chatbox__support');
        this.sendButton = document.querySelector('.send__button');
        this.state = false;
        this.messages = [];
        this.homeLoanEligibilityActive = false;
        this.inputFieldListener = null;
        this.followUpQuestions = [
            "Are you an existing customer?",
            "What is your salary?",
            "What is your debt?",
            "What is your gender?",
            "What is your current debt?"
        ];
        this.currentFollowUpIndex = 0;
        this.userData = {}; // To store user responses
    }

    display() {
        const { openButton, chatBox, sendButton } = this;
        openButton.addEventListener('click', () => this.toggleState(chatBox));
        sendButton.addEventListener('click', () => this.onSendButton(chatBox));
    
        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key == "Enter") {
                if (!this.homeLoanEligibilityActive) {
                    this.onSendButton(chatBox);
                } else {
                    // If in home loan eligibility mode, handle follow-up questions
                    this.handleFollowUpQuestions(node.value);
                }
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hide box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 };

        this.messages.push(msg1);

        if (!this.homeLoanEligibilityActive) {
            if (text1.toLowerCase().includes('home loan')) {
                // Activate home loan eligibility mode
                this.homeLoanEligibilityActive = true;
                // Ask the first follow-up question
                this.sendMessage(chatbox, this.followUpQuestions[this.currentFollowUpIndex]);
            } else {
                // Normal flow
                this.handleNormalFlow(text1, chatbox);
            }
        } else {
            // In home loan eligibility mode
            this.handleFollowUpQuestions(text1);
        }

        textField.value = '';
    }

    handleNormalFlow(message, chatbox) {
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: message }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "Lumi", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox);
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
        });
    }

    handleFollowUpQuestions(message) {
        // Store user response
        this.userData[this.followUpQuestions[this.currentFollowUpIndex]] = message;

        // Ask the next follow-up question or revert to normal flow
        if (this.currentFollowUpIndex < this.followUpQuestions.length - 1) {
            // Ask next question
            this.currentFollowUpIndex++;
            this.sendMessage(this.chatBox, this.followUpQuestions[this.currentFollowUpIndex]);
        } else {
            // Assume we have enough information, revert to normal flow
            this.homeLoanEligibilityActive = false;
            this.sendMessage(this.chatBox, "Details collected");
            //this.handleNormalFlow("Home loan details collected.", this.chatBox);
            // Optionally, you can clear the follow-up related data here
            this.currentFollowUpIndex = 0;
            this.userData = {};
        }

        console.log("UserData:", this.userData);
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name == "Lumi") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }

    // Function to send a message to the chatbox interface
    sendMessage(chatbox, message) {
        // Add the message to the chat history
        let msg = { name: "Lumi", message: message };
        this.messages.push(msg);
        // Update the chatbox interface
        this.updateChatText(chatbox);
    }
}

const chatbox =  new Chatbox();
chatbox.display();
