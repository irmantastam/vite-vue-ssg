# Vite + Vue SSG example

A simple house plant tracker app made with [Contentful](https://contentful.com) and [Vue.js](https://vuejs.org/), based on [Contentful Vue Starter](https://github.com/contentful/starter-vue-tracker).

This is a Static Site Generation (SSG) example Vue app.

Data is fetched and static assets are prerendered on build.

## Features

- Built with Vue 3 and Vite.
- Simple content model and structure. Easy to adjust to your needs.
- Uses the [Contentful GraphQL API](https://www.contentful.com/developers/docs/references/graphql/) to fetch the content.

## Configuration

### Step 1. Create an account and a space on Contentful (skip if you already have an account)

First, [create an account on Contentful](https://www.contentful.com/sign-up/).

After creating an account, create a new empty **space** from the [dashboard](https://app.contentful.com/) and assign to it any name of your liking.

### Step 2. Create a content model

The [content model](https://www.contentful.com/developers/docs/concepts/data-model/) defines the data structures of your application/websites. The structures are flexible and you can tailor them to your needs.

For this example you need to create a content model that defines a plant. **You can create them automatically by using this starter or by doing it manually** to familiarize yourself with the Contentful user interface.

#### Create the content model manually

##### Create a `Plant` content type

From your Contentful space, go to **Content model** and add a new content type:

- Give it the **Name** `Plant`, the **Api Identifier** should be `plant`

Once the content model is saved, add these fields (you don't have to modify the settings unless specified):

- `Common Name` - **Text** field (type **short text**).
  - Under **Field Options** in Settings, check **_This field represents the Entry title_**
- `Scientific Name` - **Rich Text** field.
- `Image` - **Media** field.
- `Last Watered` - **Date & time** field.
- `Watering Schedule` - **Short Text** field.
- `Sunlight` - **Short Text** field.
- `Happiness` - **Boolean** field.

Save the content type and continue.

### Step 4. Populate Content

Go to the **Content** section in your space, then click on **Add entry** and select the **Plant** content type:

**Important:** For each entry and asset, you need to click on **Publish**. If not, the entry will be in draft state.

### Step 5. Set up environment variables

From your contentful space, go to **Settings > API keys**. Create a new API key.

Create a `.env` file (which will be ignored by Git):

Then set each variable in `.env`:

- `VITE_CONTENTFUL_SPACE_ID` should be the **Space ID** field of your API Key
- `VITE_CONTENTFUL_ACCESS_TOKEN` should be the **[Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/) - access token** field of your API key

Your `.env` file should look like this:

```bash
VITE_CONTENTFUL_SPACE_ID=...
VITE_CONTENTFUL_ACCESS_TOKEN=...
```

### Step 6. Run in development mode

```bash
npm install
npm run dev
```

Your app should be up and running on [http://localhost:5173](http://localhost:5173)!

## Deploy

To deploy, run the following command and commit your changes to GitHub.

```bash
npm run build
```

Chose Vercel as your hosting provider and create a new project.

**NOTE:** You'll have to configure the **_VITE_CONTENTFUL_SPACE_ID_** and **_VITE_CONTENTFUL_ACCESS_TOKEN_** values.
