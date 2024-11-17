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
    .card p {
      margin: 0;
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
    .description {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `;

  formatDate(date) {
    if (!date) return 'The date is not available.';
    
    try {
      const timestamp = typeof date === 'string' ? parseInt(date) : date;
      const milliseconds = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const dateObj = new Date(milliseconds);
      
      if (isNaN(dateObj.getTime())) {
        return 'The date is not available.';
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } catch (e) {
      return 'The date is not available.';
    }
  }

  getThemeDisplay(themeData) {
    if (!themeData || typeof themeData !== 'object') {
      return { name: 'N/A', color: '#666' };
    }
    if (themeData.variables && themeData.variables.hexCode) {
      return {
        name: themeData.name || 'N/A',
        color: themeData.variables.hexCode
      };
    }
    return {
      name: themeData.name || 'N/A',
      color: themeData.hexCode || themeData.color || '#666'
    };
  }

  getDescription(data) {
    return data.description || 
           data.metadata?.description || 
           data.metadata?.about || 
           data.about || 
           'There is no description available.';
  }

  getDateInfo(metadata) {
    const siteCreated = metadata?.site?.created;
    const siteUpdated = metadata?.site?.updated;
    
    return {
      created: this.formatDate(siteCreated),
      updated: this.formatDate(siteUpdated)
    };
  }

  getImageUrl(item) {
    const imageFile = item.metadata?.files?.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      return imageFile.url;
    }
    return null;
  }

  render() {
    if (!this.data) {
      return html`<p>No data to display</p>`;
    }

    const { title, metadata = {}, items = [] } = this.data;
    const theme = this.getThemeDisplay(metadata.theme);
    const description = this.getDescription(this.data);
    const dates = this.getDateInfo(metadata);

    return html`
      <div class="overview">
        <div class="metadata-grid">
          <div class="label">Name:</div>
          <div class="value">${title || 'N/A'}</div>

          <div class="label">Description:</div>
          <div class="value description">${description}</div>

          <div class="label">Theme:</div>
          <div class="value">
            <span 
              class="theme-indicator" 
              style="background-color: ${theme.color}"
            ></span>
            ${theme.name}
          </div>

          <div class="label">Created:</div>
          <div class="value">${dates.created}</div>

          <div class="label">Last updated:</div>
          <div class="value">${dates.updated}</div>
        </div>
      </div>

      <div class="cards">
        ${items.map(item => html`
          <div class="card">
            ${this.getImageUrl(item) ? html`
              <img 
                src="${this.getImageUrl(item)}" 
                alt="${item.title}" 
                class="card-image"
              />
            ` : ''}
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="card-metadata">
              Last updated: ${this.formatDate(item.metadata?.updated)}
            </div>
            <div class="card-links">
              <a href="https://haxtheweb.org/${item.location}" target="_blank">View Page</a>
              <a href="https://haxtheweb.org/${item.slug}" target="_blank">View Source</a>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('site-visualizer', SiteVisualizer);