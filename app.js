const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];
const TOKEN_PATH = "token.json";
const SENT_THREADS_PATH = "sentThreads.json";

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listThreads(auth, sentThreads) {
  const gmail = google.gmail({ version: "v1", auth });
  gmail.users.threads.list(
    {
      userId: "me",
      q: "is:unread",
    },
    (err, res) => {
      if (err) return console.error("The API returned an error:", err);
      const threads = res.data.threads;
      if (threads && threads.length) {
        threads.forEach((thread) => {
          const threadId = thread.id;
          if (!sentThreads.includes(threadId)) {
            const senderEmail = thread.messages[0].from; // Extract sender's email address
            sendReply(auth, threadId, senderEmail);
            sentThreads.push(threadId);
          }
        });
        saveSentThreads(sentThreads);
      } else {
        console.log("No new threads found.");
      }
    }
  );
}

function sendReply(auth, threadId, senderEmail) {
  const gmail = google.gmail({ version: "v1", auth });
  const raw =
    `To: ${senderEmail}\n` +
    "Subject: Re: Your Email Subject\n\n" +
    "This is your reply message. You can customize it as needed.";
  gmail.users.threads.modify(
    {
      userId: "me",
      id: threadId,
      resource: {
        removeLabelIds: ["UNREAD"],
        addLabelIds: ["prayag"],
      },
    },
    (err) => {
      if (err) return console.error("Error marking thread as read:", err);
      gmail.users.messages.send(
        {
          userId: "me",
          resource: {
            raw: Buffer.from(raw).toString("base64"),
          },
          threadId: threadId,
        },
        (err, res) => {
          if (err) return console.error("Error sending reply:", err);
          console.log("Reply sent successfully.");
        }
      );
    }
  );
}

function saveSentThreads(sentThreads) {
  fs.writeFile(SENT_THREADS_PATH, JSON.stringify(sentThreads), (err) => {
    if (err) console.error("Error saving sent threads:", err);
  });
}

// task 1
function processEmails() {
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    fs.readFile(SENT_THREADS_PATH, (err, sentThreadsData) => {
      const sentThreads = err ? [] : JSON.parse(sentThreadsData);
      authorize(JSON.parse(content), (auth) => listThreads(auth, sentThreads));
    });
  });
}

const minInterval = 45000; // 45 seconds in milliseconds
const maxInterval = 120000; // 120 seconds in milliseconds

function getRandomInterval() {
  return (
    Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval
  );
}

const randomInterval = getRandomInterval();

console.log("Random Interval:", randomInterval, "milliseconds");

setInterval(processEmails, getRandomInterval());
