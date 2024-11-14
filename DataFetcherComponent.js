import { LitElement, html, css } from 'lit';

class DataFetcherComponent extends LitElement {
  static properties = {
    siteData: { type: Object },
    error: { type: String },
    loading: { type: Boolean },
    jsonURL: { type: String, attribute: 'json-url' }
  };

  constructor() {
    super();
    this.siteData = null;
    this.error = '';
    this.loading = false;
    this.jsonURL = '';
  }

  static styles = css`
    :host {
      display: block;
    }
    .input-container {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #a3a3a7;
      border-radius: 4px;
      font-size: 16px;
    }
    input:invalid {
      border-color: #ff0202;
    }
    button {
      padding: 8px 16px;
      border: 1px solid #080808;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 16px;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .error {
      color: #ff0000;
      margin-top: 8px;
    }
  `;

  validateSiteJson(data) {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.title === 'string' &&
      Array.isArray(data.items) &&
      data.items.every(item => 
        item &&
        typeof item === 'object' &&
        typeof item.title === 'string' &&
        typeof item.location === 'string'
      )
    );
  }

  async handleFetch() {
    const urlInput = this.shadowRoot.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
      this.error = 'Please enter a URL';
      return;
    }

    const siteJsonUrl = url.endsWith('site.json') ? url : `${url}${url.endsWith('/') ? '' : '/'}site.json`;
    
    this.loading = true;
    this.error = '';
    
    try {
      const response = await fetch(siteJsonUrl);
      if (!response.ok) throw new Error('Failed to fetch site.json');
      
      const data = await response.json();
      if (!this.validateSiteJson(data)) {
        throw new Error('Invalid site.json format');
      }

      this.error = '';
      this.siteData = data;
    } catch (err) {
      this.error = 'Could not retrieve valid site.json';
      this.siteData = null;
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="input-container">
        <input 
          id="urlInput" 
          type="url" 
          placeholder="Enter site URL"
          required
          pattern="https?://.*"
          @keyup="${e => e.key === 'Enter' && this.handleFetch()}"
        />
        <button 
          @click=${this.handleFetch}
          ?disabled=${this.loading}
        >
          ${this.loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>
      ${this.error ? html`<p class="error">${this.error}</p>` : ''}
      ${this.siteData
        ? html`<site-visualizer .data=${this.siteData}></site-visualizer>`
        : ''}
    `;
  }
}

customElements.define('data-fetcher-component', DataFetcherComponent);
