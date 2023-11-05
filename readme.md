1. Checking for New Emails:

    Task Description: The app needs to check for new emails in a specific Gmail ID.
    Code Flow:
        The app authenticates using Google OAuth 2.0 by implementing the "Login with Google" API.
        It reads unread threads from the Gmail inbox using the Gmail API's users.threads.list method with the query is:unread.
        The app identifies unread threads and extracts the sender's email address from the first message in each thread.

2. Sending Replies to Emails with No Prior Replies:

    Task Description: The app should reply to first-time email threads sent by others to your mailbox.
    Code Flow:
        For each unread thread without prior replies, the app composes a reply message.
        It marks the thread as read (UNREAD label removed) and adds a custom label (prayag in this case) using the users.threads.modify method.
        The app sends the composed reply to the sender's email address using the Gmail API's users.messages.send method.

3. Adding a Label to the Email and Moving It:

    Task Description: After sending the reply, the app should add a label (in this case, prayag) to the email thread and move it to the label.
    Code Flow:
        The app modifies the thread to add the custom label using the users.threads.modify method.
        If the label does not exist, Gmail API automatically creates it.
        The thread is now labeled and moved to the specified label in the Gmail inbox.

4. Repeating the Process in Random Intervals:

    Task Description: The app should repeat the entire process (Tasks 1-3) in random intervals between 45 to 120 seconds.
    Code Flow:
        The app uses setInterval to schedule the processEmails function at random intervals between 45 to 120 seconds (specified in milliseconds).
        The processEmails function includes the entire flow of tasks (checking for new emails, sending replies, adding labels, and moving emails).
