async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Konnte Datei nicht laden: ${url}`);
  }
  return response.json();
}

function showSection(id, visible) {
  const el = document.getElementById(id);
  if (el) {
    el.hidden = !visible;
  }
}

function eventMatchesSearch(event, query) {
  const haystack = [
    event.eventId,
    event.eventYearId,
    event.displayTitle,
    event.location,
    event.sport,
    String(event.year),
    event.shortDescription
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function renderLandingEvents(events) {
  const input = document.getElementById("landing-search");
  const container = document.getElementById("landing-event-results");

  if (!input || !container) return;

  const listed = events.filter(item => item.listed !== false);

  function draw() {
    const query = input.value.trim();
    const filtered = !query
      ? listed.slice(0, 6)
      : listed.filter(event => eventMatchesSearch(event, query)).slice(0, 6);

    if (!filtered.length) {
      container.innerHTML = `<p class="notice">Keine passenden Events gefunden.</p>`;
      return;
    }

    container.innerHTML = filtered.map(event => `
      <article class="card">
        <p class="event-id-badge">${event.eventYearId}</p>
        <h3>${event.displayTitle}</h3>
        <div class="meta-list">
          <span class="tag">${event.year}</span>
          <span class="tag">${event.sport}</span>
          <span class="tag">${event.location}</span>
        </div>
        <p class="muted">${event.shortDescription || ""}</p>
        <p><a href="${event.url}">Event ansehen</a></p>
      </article>
    `).join("");
  }

  input.addEventListener("input", draw);
  draw();
}

async function initLandingPage() {
  try {
    const config = await fetchJson("./data/site-config.json");

    showSection("hero", config.showHero);
    showSection("about", config.showAbout);
    showSection("services", config.showServices);
    showSection("event-preview", config.showEventPreview);
    showSection("contact", config.showContact);

    if (config.showEventPreview) {
      const eventIndex = await fetchJson("./data/events-index.json");
      renderLandingEvents(eventIndex.events || []);
    }
  } catch (error) {
    console.error(error);
  }
}

initLandingPage();
