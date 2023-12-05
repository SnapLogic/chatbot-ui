# Chatbot UI

This is forked from Chatbot UI, an open source chat UI for AI models.

## To use multiple pipelines, please go to branch v2.

## Running Locally
If you are using v2, please refer to the README.md in v2.

**1. Clone Repo**

```bash
git clone https://github.com/shuminCA/chatbot-ui.git
```

**2. Install Dependencies**

```bash
npm i
```

**3. Provide Pipeline Endpoint and Bearer Token**

Create a .env.local file in the root of the repo with your pipeline endpoint and bearer token:

```javascript
NEXT_PUBLIC_API_ENDPOINT=YOUR_ENDPOINT
NEXT_PUBLIC_BEARER_TOKEN=YOUR_TOKEN
```

**4. Run App**

```bash
npm run dev
```

**5. Use It**

You should be able to start chatting. For better experience, please go to "Settings" -> "Theme" and select "light mode".

## Customize UI

This interface allows users to personalize various aspects of their chatbot's appearance, including text elements and color schemes. Follow these steps to tailor your chatbot to your preferences.

**1. Customizing Text Elements**

You can modify the following text elements:
- Chatbot Title
- Chatbot Name
  
To make these changes:
- Navigate to the root folder of your project.
- Open the file named `constants.config.js`.
- Edit the values as shown in the example below:

```javascript
const CONSTANTS = {
    chatbotTitle: "Chatbot Title",
    chatbotName: "Chatbot Name",
};

module.exports = CONSTANTS;
```

**2. Customizing Color Scheme**

You can adjust the color schemes for:
- Chatbot Name
- Sidebar
- Search Bar
- Conversation Box

To customize the colors:
- Go to the root folder of your project.
- Open the file `tailwind.config.js`.
- Locate the `theme` key and modify the color values under the `colors` and `textColor` sections as needed. 

Here is an example:

```javascript
// Additional code may be present above or below this snippet
  theme: {
    extend: {
      colors: {
        'sidebar': '#07224E',
        'conversation': '#53709E',
        'searchbar': '#141B38',
      },
      textColor: {
        'primary': '#1C3194',
      }
    },
  },
// Additional code may be present above or below this snippet
```
