class AutoComplete {
  /**
   * Кастомный автокомплит
   * @param elem
   * @param pathname
   * @param threshold
   */
  constructor(elem, pathname, threshold) {
    this.field = elem;
    this.pathname = pathname;
    this.threshold = threshold;
    this.token = 'term';
    this.initListeners();
    this.debouncedSearch = _.debounce(this.search, 100, {
      'leading': true,
      'trailing': false,
    });
  }

  async search(query) {
    const url = new URL(window.location.origin);
    url.pathname = this.pathname;
    url.searchParams.set(this.token, query);

    this.beforeFetch(url);

    try {
      const result = await fetch(url, {headers: {'X-Requested-With': 'XMLHttpRequest'}});
      return result.json();
    } catch {
      return [];
    }
  }

  renderResultList(data) {
    this.removeContainer();

    const div = document.createElement('div');
    div.classList.add('position-relative');
    this.container = div;
    this.container.addEventListener('click', this.onSelection.bind(this));

    const ul = document.createElement('ul');
    ul.classList.add('autocomplete', 'autocomplete--lg');

    for (const item of data) {
      const li = document.createElement('li');
      this.updateListItem(li, item);
      ul.append(li);
    }

    if (!data.length) {
      const li = document.createElement('li');
      li.textContent = 'Нет результатов';
      ul.append(li);
    }
    div.append(ul);
    this.field.after(div);
  }

  updateListItem(li, data) {
    li.textContent = data.label;
    li.dataset['value'] = data.value;
  }

  onSelection(event) {
    if (event.target.tagName !== 'LI') return;
    const li = event.target;
    if (li.dataset['value']) {
      this.field.value = li.textContent;
      this.field.dataset['value'] = li.dataset['value'];
      this.field.dispatchEvent(new CustomEvent('autocomplete-selected', {bubles: true}));
    }
    this.removeContainer();
  }

  removeContainer() {
    this.container && this.container.remove();
  }

  beforeFetch() {

  }

  initListeners() {
    this.field.addEventListener('input', async (event) => {
      const query = event.target.value.trim();
      if (query.length < this.threshold) {
        this.removeContainer();
      } else {
        const response = await this.debouncedSearch(query);
        if (response) {
          this.renderResultList(response);
        } else {
          this.renderResultList([]);
        }
      }
    });

    this.field.addEventListener('blur', () => {
      const isHover = Boolean(this.container && this.container.matches(':hover'));
      if (!isHover) this.removeContainer();
    });
  }

  static initFields(configArray) {
    /**
     * Принимает массив объектов конфигурации автокомплита
     * Инициализирует соответствующие поля
     */
    for (const config of configArray) {
      const field = document.querySelector(`[data-js-autocomplete="${name}"]`);
      new AutoComplete(field, config.pathname, config.threshold);
    }
  }
}

new AutoComplete(document.querySelector('[data-autocomplete="okpd2"]'), '/nsi/search-okpd2/', 3);
