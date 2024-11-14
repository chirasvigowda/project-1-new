import { LitElement, html, css } from "lit";

class SiteVisualizer extends LitElement {
  static properties = {
    data: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }
    .overview {
      border: 1px solid #000000;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .site-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .site-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 16px 24px;
      align-items: start;
    }
    .label {
      color: #666;
      font-size: 18px;
    }
    .value {
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .theme-indicator {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin: 0 auto;
      max-width: 1200px;
    }
    @media (min-width: 1200px) {
      .cards {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .card {
      border: 1px solid #000000;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .card-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
    }
    .card h3 {
      margin: 0;
      font-size: 18px;
    }
    .card-links {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .card-links a {
      color: #000000;
      text-decoration: none;
      padding: 4px 8px;
      border: 1px solid #000000;
      border-radius: 4px;
      font-size: 14px;
    }
    .card-links a:hover {
      background: #797c7d;
      color: white;
    }
    .card-metadata {
      font-size: 14px;
      color: #000000;
    }
  `;

  formatDate(date) {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  }

  getSourceUrl(location) {
    return this.jsonURL;
  }

  render() {
    if (!this.data) {
      return html`<p>No data to display</p>`;
    }

    const { title, metadata = {}, items = [] } = this.data;

    return html`
      <div class="overview">
        <div class="site-header">
          ${metadata.logo ? html`
            <img 
              src="${metadata.logo}" 
              alt="${title} logo" 
              class="site-logo"
            />
          ` : ''}
          ${metadata.icon ? html`
            <simple-icon icon="${metadata.icon}"></simple-icon>
          ` : ''}
        </div>

        <div class="metadata-grid">
          <div class="label">Name:</div>
          <div class="value">${title || 'N/A'}</div>

          <div class="label">Description:</div>
          <div class="value">${metadata.description || 'N/A'}</div>

          <div class="label">Theme:</div>
          <div class="value">
            <span 
              class="theme-indicator" 
              style="background-color: ${metadata.hexCode || '#666'}"
            ></span>
            ${metadata.theme || 'N/A'}
          </div>

          <div class="label">Created:</div>
          <div class="value">${this.formatDate(metadata.created)}</div>

          <div class="label">Last updated:</div>
          <div class="value">${this.formatDate(metadata.updated)}</div>
        </div>
      </div>

      <div class="cards">
        ${items.map(item => html`
          <div class="card">
            ${item.metadata.images[0] ? html`
              <img 
                src="https://haxtheweb.org/${item.metadata.images[0]}" 
                alt="${item.title}" 
                class="card-image"
              />
            ` : ''}
            <h3>${item.title}</h3>
            ${item.description ? html`<p>${item.description}</p>` : ''}
            <div class="card-metadata">
              Last updated: ${this.formatDate(item.metadata?.updated)}
            </div>
            <div class="card-links">
              <a href="https://haxtheweb.org/${item.location}" target="_blank">View Page</a>
              <a href="https://haxtheweb.org/${item.location}" target="_blank">View Source</a>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('site-visualizer', SiteVisualizer);