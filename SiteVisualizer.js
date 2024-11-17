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
      background-color: #ffffff;
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
      font-weight: 500;
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
      border: 1px solid rgba(0, 0, 0, 0.1);
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
      background-color: #ffffff;
      min-height: 200px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .card-image-container {
      position: relative;
      width: 100%;
      height: 150px;
      border-radius: 4px;
      overflow: hidden;
      background-color: #f5f5f5;
      cursor: pointer;
    }
    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .card-image:hover {
      transform: scale(1.05);
    }
    .card-image.loading {
      opacity: 0;
    }
    .card h3 {
      margin: 0;
      font-size: 18px;
      color: #000000;
    }
    .card p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
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
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .card-links a:hover {
      background: #797c7d;
      color: white;
    }
    .card-metadata {
      font-size: 14px;
      color: #666;
    }
    .description {
      white-space: pre-wrap;
      word-break: break-word;
    }
    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
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
      return { name: 'Default Theme', color: '#666' };
    }
    if (themeData.variables && themeData.variables.hexCode) {
      return {
        name: themeData.name || 'Custom Theme',
        color: themeData.variables.hexCode
      };
    }
    return {
      name: themeData.name || 'Custom Theme',
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

  validateAndFormatUrl(url) {
    if (!url) return null;
    try {
      if (url.startsWith('/')) {
        return `https://haxtheweb.org${url}`;
      }

      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      return `https://haxtheweb.org/${url}`;
    } catch (e) {
      console.error('Error formatting URL:', e);
      return null;
    }
  }

  getImageUrl(item) {
    if (!item) return null;

    if (item.metadata?.files && Array.isArray(item.metadata.files)) {
      const imageFile = item.metadata.files.find(file => 
        file && 
        file.type && 
        file.type.startsWith('image/') && 
        file.url
      );
      if (imageFile) {
        return this.validateAndFormatUrl(imageFile.url);
      }
    }

    if (item.metadata?.image) {
      return this.validateAndFormatUrl(item.metadata.image);
    }

    if (item.metadata?.thumbnail) {
      return this.validateAndFormatUrl(item.metadata.thumbnail);
    }

    if (item.image) {
      return this.validateAndFormatUrl(item.image);
    }

    if (item.thumbnail) {
      return this.validateAndFormatUrl(item.thumbnail);
    }

    if (item.location) {
      return this.validateAndFormatUrl(`${item.location}/assets/banner.jpg`);
    }

    return null;
  }

  handleImageClick(imageUrl) {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  renderImage(item) {
    const imageUrl = this.getImageUrl(item);
    if (!imageUrl) {
      return html`
        <div class="card-image-container">
          <div class="placeholder">No image available</div>
        </div>
      `;
    }

    return html`
      <div class="card-image-container" @click="${() => this.handleImageClick(imageUrl)}">
        <img 
          src="${imageUrl}" 
          alt="${item.title || 'Content preview'}" 
          class="card-image loading"
          @load="${(e) => {
            e.target.classList.remove('loading');
          }}"
          @error="${(e) => {
            const container = e.target.closest('.card-image-container');
            if (container) {
              container.innerHTML = '<div class="placeholder">Image not available</div>';
            }
          }}"
        />
      </div>
    `;
  }

  render() {
    if (!this.data) {
      return html`<p>No data available</p>`;
    }

    const { title, metadata = {}, items = [] } = this.data;
    const theme = this.getThemeDisplay(metadata.theme);
    const description = this.getDescription(this.data);
    const dates = this.getDateInfo(metadata);

    return html`
      <div class="overview">
        <div class="metadata-grid">
          <div class="label">Name:</div>
          <div class="value">${title || 'Untitled'}</div>

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
            ${this.renderImage(item)}
            <h3>${item.title || 'Untitled'}</h3>
            <p>${item.description || 'No description available'}</p>
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