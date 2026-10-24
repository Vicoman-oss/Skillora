
const sampleServices = [
  {
    id: 1,
    name: "Ada",
    title: "Graphic Design",
    category: "Design",
    price: 5000,
    state: "Lagos",
    description: "Flyers, posters and social media designs."
  },
  {
    id: 2,
    name: "David",
    title: "Private Mathematics Tutor",
    category: "Tutoring",
    price: 3000,
    state: "FCT",
    description: "Simple mathematics lessons for students."
  },
  {
    id: 3,
    name: "Mariam",
    title: "Short Video Editing",
    category: "Video Editing",
    price: 4000,
    state: "Kano",
    description: "Editing short videos for social media."
  },
  {
    id: 4,
    name: "John",
    title: "Website Design",
    category: "Web Development",
    price: 10000,
    state: "Rivers",
    description: "Simple responsive websites for small businesses."
  }
];

let services = JSON.parse(localStorage.getItem("skilloraServices") || "null") || sampleServices;
let favourites = JSON.parse(localStorage.getItem("skilloraFavourites") || "[]");

const $ = id => document.getElementById(id);

const serviceGrid = $("servicesGrid");
const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const stateFilter = $("stateFilter");
const listingStatus = $("listingStatus");

function saveData() {
  localStorage.setItem("skilloraServices", JSON.stringify(services));
  localStorage.setItem("skilloraFavourites", JSON.stringify(favourites));
}

function renderServices() {
  if (!serviceGrid) return;

  const query = (searchInput?.value || "").toLowerCase();
  const category = categoryFilter?.value || "all";
  const state = stateFilter?.value || "all";

  const filtered = services.filter(service =>
    `${service.title} ${service.name} ${service.description} ${service.category}`
      .toLowerCase().includes(query) &&
    (category === "all" || service.category === category) &&
    (state === "all" || service.state === state)
  );

  serviceGrid.replaceChildren();

  if (listingStatus) {
    listingStatus.textContent = `${filtered.length} service${filtered.length === 1 ? "" : "s"} found`;
  }

  $("emptyState")?.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach(service => {
    const card = document.createElement("article");
    card.className = "service-card";

    const categoryLabel = document.createElement("p");
    categoryLabel.className = "category-label";
    categoryLabel.textContent = service.category;

    const title = document.createElement("h3");
    title.textContent = service.title;

    const description = document.createElement("p");
    description.textContent = service.description;

    const provider = document.createElement("p");
    provider.className = "provider-info";
    provider.textContent = `${service.name} • ${service.state}`;

    const price = document.createElement("p");
    price.className = "service-price";
    price.textContent = `₦${Number(service.price).toLocaleString()} onwards`;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const detailsButton = document.createElement("button");
    detailsButton.className = "button button-primary";
    detailsButton.textContent = "View Details";
    detailsButton.addEventListener("click", () => showDetails(service));

    const saveButton = document.createElement("button");
    saveButton.className = "save-button";
    saveButton.textContent = favourites.includes(service.id) ? "♥ Saved" : "♡ Save";
    saveButton.addEventListener("click", () => {
      favourites = favourites.includes(service.id)
        ? favourites.filter(id => id !== service.id)
        : [...favourites, service.id];
      saveData();
      renderServices();
    });

    actions.append(detailsButton, saveButton);
    card.append(categoryLabel, title, description, provider, price, actions);
    serviceGrid.append(card);
  });
}

function showDetails(service) {
  const content = $("detailsContent");
  if (!content) return;

  content.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = service.title;

  const description = document.createElement("p");
  description.textContent = service.description;

  const provider = document.createElement("p");
  provider.textContent = `Provider: ${service.name} (${service.state})`;

  const price = document.createElement("p");
  price.textContent = `Price: ₦${Number(service.price).toLocaleString()}`;

  content.append(title, description, provider, price);

  const contactButton = $("contactProviderBtn");
  if (contactButton) {
    contactButton.onclick = () => openMessages(service);
  }

  $("detailsDialog")?.showModal();
}

function openMessages(service) {
  $("detailsDialog")?.close();

  const heading = $("messageHeading");
  if (heading) heading.textContent = `Demo chat: ${service.name}`;

  const list = $("messageList");
  if (list) {
    list.replaceChildren();
    const note = document.createElement("p");
    note.textContent = "This is a demo only. Messages are not sent to real people.";
    list.append(note);
  }

  $("messageDialog")?.showModal();
}

searchInput?.addEventListener("input", renderServices);
categoryFilter?.addEventListener("change", renderServices);
stateFilter?.addEventListener("change", renderServices);

$("postServiceBtn")?.addEventListener("click", () => $("serviceDialog")?.showModal());
$("heroPostBtn")?.addEventListener("click", () => $("serviceDialog")?.showModal());

$("serviceForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("providerName").value.trim();
  const title = $("serviceTitle").value.trim();
  const category = $("serviceCategory").value;
  const price = Number($("servicePrice").value);
  const state = $("providerState").value;
  const description = $("serviceDescription").value.trim();

  if (!name || !title || !category || !state || !description ||
      !Number.isFinite(price) || price <= 0) {
    alert("Please complete all fields and enter a valid price.");
    return;
  }

  services.unshift({
    id: Date.now(),
    name,
    title,
    category,
    price,
    state,
    description
  });

  saveData();
  event.target.reset();
  $("serviceDialog")?.close();
  renderServices();
  alert("Listing added on this device!");
});

$("messageForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const input = $("messageInput");
  const message = input?.value.trim();
  if (!message) return;

  const bubble = document.createElement("p");
  bubble.className = "message sent";
  bubble.textContent = message;
  $("messageList")?.append(bubble);

  input.value = "";
});

document.querySelectorAll("[data-close-dialog]").forEach(button => {
  button.addEventListener("click", () => {
    button.closest("dialog")?.close();
  });
});

async function loadStates() {
  const dropdowns = [$("stateFilter"), $("providerState")].filter(Boolean);
  const status = $("stateStatus");

  try {
    if (status) status.textContent = "Loading states...";

    const response = await fetch("https://facts.ng/api/states");
    if (!response.ok) throw new Error("State API unavailable");

    const data = await response.json();
    const states = Array.isArray(data) ? data : data.data;

    if (!Array.isArray(states)) throw new Error("Unexpected state data");

    dropdowns.forEach(select => {
      const isFilter = select.id === "stateFilter";
      select.replaceChildren();

      const first = document.createElement("option");
      first.value = isFilter ? "all" : "";
      first.textContent = isFilter ? "All States" : "Choose your state";
      select.append(first);

      states.forEach(item => {
        const name = typeof item === "string" ? item : item.name;
        if (!name) return;

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.append(option);
      });
    });

    if (status) status.textContent = "States loaded.";
  } catch (error) {
    if (status) {
      status.textContent = "Could not load states. Refresh or check your connection.";
    }
    console.error("State loading error:", error);
  }
}

renderServices();
loadStates();
