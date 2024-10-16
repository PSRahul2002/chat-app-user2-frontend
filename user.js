let currentUserId = 2; // Change to 1 for User1, 2 for User2

// Use the WebSocket URL of your backend on Render.com (wss for secure WebSocket)
let ws_url = `wss://chat-app-backend-2-9wz8.onrender.com/ws/${currentUserId}`;
let ws = new WebSocket(ws_url);

// Show the delete button for User1 only
if (currentUserId === 1) {
  document.getElementById("deleteUser2Messages").style.display = "block";
}

// Function to append messages to the message list with correct CSS and username
function appendMessage(userId, messageText, currentUserId) {
  let messages = document.getElementById("messages");
  let message = document.createElement("div");
  message.className = "message";

  // Determine if the message is from the current user or another user
  if (userId === currentUserId) {
    message.classList.add("you"); // Apply 'you' class for the current user
    message.textContent = `You: ${messageText}`; // Show 'You' for current user's messages
  } else {
    message.classList.add("other"); // Apply 'other' class for other users
    let username = userId === 1 ? "User1" : "User2"; // Map user_id to "User1" or "User2"
    message.textContent = `${username}: ${messageText}`; // Show 'User1' or 'User2' for others
  }

  // Append the message to the messages container
  messages.appendChild(message);

  // Scroll to the latest message
  messages.scrollTop = messages.scrollHeight;
}

// WebSocket message handler to receive messages from the server
ws.onmessage = function (event) {
  try {
    let messageData = JSON.parse(event.data); // Parse the incoming message
    console.log("Received WebSocket message:", messageData); // Debug log

    // If the action is "refresh", clear the chat and reload the page
    if (messageData.action === "refresh") {
      console.log(
        "Received 'refresh' action, clearing chat and reloading page..."
      );

      // Clear the chat messages from the frontend
      document.getElementById("messages").innerHTML = ""; // Clear message container

      // Optionally reload the page to reflect the cleared state
      location.reload(); // Reload the page
    } else {
      // Otherwise, treat it as a normal chat message
      appendMessage(messageData.user_id, messageData.message, currentUserId);
    }
  } catch (e) {
    console.error("Error parsing WebSocket message:", e);
  }
};

// Handle WebSocket disconnections and reconnections
ws.onclose = function () {
  console.log("WebSocket connection closed. Attempting to reconnect...");
  setTimeout(() => {
    ws = new WebSocket(ws_url);
  }, 3000); // Attempt reconnection after 3 seconds
};

ws.onerror = function (error) {
  console.error("WebSocket encountered an error:", error);
};

// Function to send a message
function sendMessage() {
  let input = document.getElementById("messageText");
  let message = input.value;

  if (message) {
    // Display the message on the page before sending it
    appendMessage(currentUserId, message, currentUserId); // Show 'You' for the current user's message

    // Send the message via WebSocket
    ws.send(JSON.stringify({ user_id: currentUserId, message }));

    // Clear the input field
    input.value = "";
  }
}

// Add event listener for the 'Enter' key press on the input field
document
  .getElementById("messageText")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      sendMessage();
    }
  });

// Add event listener for the "Send" button click
document.getElementById("sendButton").addEventListener("click", function () {
  sendMessage(); // Call the sendMessage function when the button is clicked
});

// Function to delete User2's messages
function deleteUser2Messages() {
  fetch(
    "https://chat-app-backend-2-9wz8.onrender.com/delete_user2_messages?user_id=1",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to delete messages: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Delete request successful:", data);
      alert(`Deleted ${data.deleted_count} messages from User2.`);
    })
    .catch((error) => {
      console.error("Error deleting messages:", error);
      alert("An error occurred while deleting messages.");
    });
}
