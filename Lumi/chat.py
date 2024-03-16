#!/usr/bin/env python
# coding: utf-8

# In[1]:


import random
import json
import torch


# In[2]:


from model import NeuralNet
from nltk_functions import bag_of_words, tokenize


# In[3]:


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


# In[4]:


with open('data.json', 'r') as json_data:
    intents = json.load(json_data)


# In[5]:


FILE = "data.pth"
data = torch.load(FILE)


# In[6]:


input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]


# In[7]:


model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()


# In[8]:


bot_name = "Lumi"


# In[9]:


def get_response(msg):
    # Check if certain words are present in the message
    if 'specific_word' in msg.lower():  # Change 'specific_word' to the word you're checking for
        # Call another function or perform an action
        return "Are you an existing customer? (yes/no): "
    
    # If certain words are not present, proceed with the original logic
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    
    return "I do not understand the question. Can you rephrase it in a different way?"

# Define the function to be called when certain words are detected
def handle_home_loan_application():
    # Assume send_message function sends a message to the chatbot interface
    return "Are you an existing customer? (yes/no): "
    response = input("Are you an existing customer? (yes/no): ").lower()


# In[ ]:


if __name__ == "__main__":
    print("Hi, I'm Lumi! (type 'quit' to exit)")
    while True:
        # sentence = "do you use credit cards?"
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)


# In[ ]:




