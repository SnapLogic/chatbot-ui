# Chatbot UI

This is forked from Chatbot UI, an open source chat UI for AI models.

## Running Locally
**Please make sure you update the node.js to the latest version.**

### 1. Clone Repo

```bash
git clone https://github.com/SnapLogic/chatbot-ui.git
```

### 2. Install Dependencies

```bash
npm i
```

### 3. Provide Pipeline Endpoint and Bearer Token

Create a .env.local file in the root of the repo with your pipeline endpoint and bearer token:

```javascript
NEXT_PUBLIC_API_ENDPOINT=YOUR_ENDPOINT
NEXT_PUBLIC_BEARER_TOKEN=YOUR_TOKEN
```

### 4. Run App
There are two methods to run the application: using npm or Docker.

#### Using npm

To run the app with npm, execute the following command in your terminal:

```bash
npm run dev
```

This will start the application.

#### Using Docker

Alternatively, you can run the app using Docker. Follow these steps:

<img width="947" alt="Screenshot 2023-12-19 at 12 04 05 PM" src="https://github.com/shuminCA/chatbot-ui/assets/89661340/cecf399e-8f90-4802-8d2a-3ca6ef8df645">

**1. Create a docker image**

Build a docker image by running the following command:

```bash
docker build .
```
**2. Run the Docker Image**

After you have successfully built the Docker image, you can run it using either its image ID or SHA256 digest.
```bash
docker run -p 3000:3000 {imageId/sha256}
```

Now you can run the chatbot at localhost:3000.

### 5. Use It

You should be able to start chatting. For better experience, please go to "Settings" -> "Theme" and select "light mode".

## Customize UI

This interface allows users to personalize various aspects of their chatbot's appearance, including text elements and color schemes. Follow these steps to tailor your chatbot to your preferences.

<img width="1108" alt="Screenshot 2023-12-04 at 4 01 16 PM" src="https://github.com/shuminCA/chatbot-ui/assets/89661340/02e81123-7401-4a9b-b3d4-3066e53fcae8">


### 1. Customizing Text Elements

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

### 2. Customizing Color Scheme

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
