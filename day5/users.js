const API_URL = "https://jsonplaceholder.typicode.com/users";

// DOM Elements
const loadUsersBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Stored in-memory array of loaded users
let loadedUsers = [];

/**
 * Draws an array of users into #users-list.
 * Displays each user's name, email, city, and company name using createElement and textContent.
 * @param {Array<Object>} list - The array of user objects to render.
 */
function renderUsers(list) {
  usersList.innerHTML = "";

  if (!list || list.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "empty-message";
    emptyLi.textContent = "No users match your filter.";
    usersList.appendChild(emptyLi);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");
    li.className = "user-card";

    const nameEl = document.createElement("h3");
    nameEl.className = "user-name";
    nameEl.textContent = user.name;

    const emailEl = document.createElement("p");
    emailEl.className = "user-email";
    emailEl.textContent = `Email: ${user.email}`;

    const cityEl = document.createElement("p");
    cityEl.className = "user-city";
    const city = user.address && user.address.city ? user.address.city : "N/A";
    cityEl.textContent = `City: ${city}`;

    const companyEl = document.createElement("p");
    companyEl.className = "user-company";
    const company = user.company && user.company.name ? user.company.name : "N/A";
    companyEl.textContent = `Company: ${company}`;

    li.appendChild(nameEl);
    li.appendChild(emailEl);
    li.appendChild(cityEl);
    li.appendChild(companyEl);

    usersList.appendChild(li);
  });
}

/**
 * Fetches users from JSONPlaceholder, checks response.ok,
 * updates #status, and renders the user cards.
 */
async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadUsersBtn.disabled = true;
  usersList.innerHTML = "";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    loadedUsers = data;
    filterInput.value = "";
    renderUsers(loadedUsers);
    statusText.textContent = `Loaded ${loadedUsers.length} users.`;
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error("Error loading users:", error);
  } finally {
    loadUsersBtn.disabled = false;
  }
}

// Event Listeners
loadUsersBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const query = filterInput.value.trim().toLowerCase();

  if (loadedUsers.length === 0) {
    statusText.textContent = "Please load users first.";
    renderUsers([]);
    return;
  }

  const filteredUsers = loadedUsers.filter((user) =>
    user.name.toLowerCase().includes(query)
  );

  renderUsers(filteredUsers);

  if (filteredUsers.length === 0) {
    statusText.textContent = "No users match your filter.";
  } else {
    statusText.textContent = `Showing ${filteredUsers.length} of ${loadedUsers.length} users.`;
  }
});
