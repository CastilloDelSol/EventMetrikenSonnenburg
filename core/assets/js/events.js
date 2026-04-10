async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Konnte Datei nicht laden: ${url}`);
  }
  return response.json();
}

function getUniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort();
}

function populateSelect(select, values) {
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function matchesSearch(event, query) {
  const text = [
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

  return text.includes(query.toLowerCase());
}

function renderCards(events) {
  const results = document.getElementById("results");
  const search = document.getElementById("search");
  const yearFilter = document.getElementById("yearFilter");
  const sportFilter = document.getElementById("sportFilter");

  const listedEvents = events.filter(event => event.listed !== false);

  populateSelect(yearFilter, getUniqueSorted(listedEvents.map(event => String(event.year))));
  populateSelect(sportFilter, getUniqueSorted(listedEvents.map(event => event.sport)));

  function draw() {
    const query = search.value.trim();
    const year = yearFilter.value;
    const sport = sportFilter.value;

    const filtered = listedEvents.filter(event => {
      const okQuery = !query || matchesSearch(event, query);
      const okYear = !year || String(event.year) === year;
      const okSport = !sport || event.sport === sport;
      return okQuery && okYear && okSport;
    });

    if (!filtered.length) {
      results.innerHTML = `<p class="notice">Keine Events gefunden.</p>`;
      return;
    }

    results.innerHTML = filtered.map(event => `
      <article class="card">
        <p class="event-id-badge">${event.eventYearId}</p>
        <h2>${event.displayTitle}</h2>
        <div class="meta-list">
          <span class="tag">${event.year}</span>
          <span class="tag">${event.sport}</span>
          <span class="tag">${event.location}</span>
          <span class="tag">${event.status}</span>
        </div>
        <p>${event.shortDescription || ""}</p>
        <p class="muted">Basis-ID: ${event.eventId}</p>
        <p><a href="${event.url}">Zur Event-Seite</a></p>
      </article>
    `).join("");
  }

  search.addEventListener("input", draw);
  yearFilter.addEventListener("change", draw);
  sportFilter.addEventListener("change", draw);

  draw();
}

async function initEventsPage() {
  try {
    const data = await fetchJson("./data/events-index.json");
    renderCards(data.events || []);
  } catch (error) {
    console.error(error);
    const results = document.getElementById("results");
    if (results) {
      results.innerHTML = `<p class="notice">Der Eventindex konnte nicht geladen werden.</p>`;
    }
  }
}

initEventsPage();
