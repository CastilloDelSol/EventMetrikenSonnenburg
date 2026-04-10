async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Konnte Datei nicht laden: ${url}`);
  }
  return response.json();
}

function isEmbedded() {
  return window.self !== window.top;
}

function getEventJsonPath() {
  const pathname = window.location.pathname.replace(/\/$/, "");
  return `${pathname}/event.json`;
}

function createMetric(label, value) {
  return `
    <div class="metric">
      <span>${label}</span>
      <strong>${value ?? "-"}</strong>
    </div>
  `;
}

function renderOptionalModules(data) {
  const modules = [];
  const show = data.show || {};

  if (show.showDescription !== false && data.description) {
    modules.push(`
      <section class="module-box">
        <h2>Beschreibung</h2>
        <p>${data.description}</p>
      </section>
    `);
  }

  if (show.showMetrics !== false && data.metrics) {
    modules.push(`
      <section class="module-box">
        <h2>Metriken</h2>
        <div class="metrics-grid">
          ${createMetric("Teilnehmer", data.metrics.participants)}
          ${createMetric("Finisher", data.metrics.finishers)}
          ${createMetric("Distanzen", data.metrics.distances)}
          ${createMetric("Bestzeit", data.metrics.bestTime)}
        </div>
      </section>
    `);
  }

  if (show.showLinks && data.links?.website) {
    modules.push(`
      <section class="module-box">
        <h2>Weiterführende Links</h2>
        <p><a href="${data.links.website}" target="_blank" rel="noopener noreferrer">Offizielle Event-Website</a></p>
      </section>
    `);
  }

  if (show.showEmbedInfo) {
    modules.push(`
      <section class="module-box">
        <h2>Einbindung</h2>
        <p>Diese Seite kann direkt aufgerufen oder per iframe eingebunden werden.</p>
      </section>
    `);
  }

  return modules.join("");
}

function renderEventPage(data) {
  const container = document.getElementById("event-content");
  if (!container) return;

  const embedded = isEmbedded();

  container.innerHTML = `
    ${embedded ? `<p class="embed-note">Eingebettete Ansicht</p>` : ""}
    <article class="event-detail">
      <header class="event-header">
        <div class="event-title-row">
          <div>
            <p class="event-id-badge">${data.eventYearId}</p>
            <h1>${data.displayTitle}</h1>
            <p class="muted">
              ${data.date || ""} · ${data.location || ""} · ${data.sport || ""}
            </p>
          </div>
        </div>
        <div class="meta-list">
          <span class="tag">Basis-ID: ${data.eventId}</span>
          <span class="tag">Jahr: ${data.year}</span>
          <span class="tag">Status: ${data.status}</span>
        </div>
      </header>

      <div class="modules">
        ${renderOptionalModules(data)}
      </div>
    </article>
  `;
}

async function initEventPage() {
  const container = document.getElementById("event-content");

  try {
    const data = await fetchJson(getEventJsonPath());

    if (isEmbedded() && data.embedAllowed === false) {
      container.innerHTML = `<p class="notice">Diese Event-Seite ist nicht zur Einbettung freigegeben.</p>`;
      return;
    }

    renderEventPage(data);
  } catch (error) {
    console.error(error);
    if (container) {
      container.innerHTML = `<p class="notice">Die Eventdaten konnten nicht geladen werden.</p>`;
    }
  }
}

initEventPage();
