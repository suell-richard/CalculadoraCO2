/*
  UI

  Objeto global responsável por utilitários de formatação e pela geração
  de strings HTML para exibir resultados, comparação de modos e créditos
  de carbono. Todas as funções retornam HTML como string (renderers)
  e não fazem DOM mutations automaticamente.
*/

var UI = {

  /* UTILITÁRIOS */
  formatNumber: function(number, decimals) {
    var d = (typeof decimals === 'number') ? decimals : 0;
    var n = Number(number) || 0;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  },

  // Formata valor em moeda BRL, ex: "R$ 1.234,56"
  formatCurrency: function(value) {
    var v = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  },

  showElement: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('hidden');
  },

  hideElement: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('hidden');
  },

  scrollToElement: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* RENDERERS */
  // data: { origin, destination, distance, emission, mode, savings }
  renderResults: function(data) {
    var modeMeta = (CONFIG && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[data.mode]) || { icon: '', label: data.mode || '' };

    var routeCard = "<div class=\"results__card results__card--route\">" +
      "<div class=\"results__card-title\">Rota</div>" +
      "<div class=\"results__card-value\">" + (data.origin || '') + " → " + (data.destination || '') + "</div>" +
      "</div>";

    var distanceStr = UI.formatNumber(data.distance || 0, 0) + " km";
    var distanceCard = "<div class=\"results__card results__card--distance\">" +
      "<div class=\"results__card-title\">Distância</div>" +
      "<div class=\"results__card-value\">" + distanceStr + "</div>" +
      "</div>";

    var emissionStr = UI.formatNumber(data.emission || 0, 2) + " kg CO₂";
    var emissionCard = "<div class=\"results__card results__card--emission\">" +
      "<div class=\"results__card-title\">Emissão</div>" +
      "<div class=\"results__card-value\">🍃 " + emissionStr + "</div>" +
      "</div>";

    var transportCard = "<div class=\"results__card results__card--transport\">" +
      "<div class=\"results__card-title\">Transporte</div>" +
      "<div class=\"results__card-value\">" + (modeMeta.icon || '') + " " + (modeMeta.label || '') + "</div>" +
      "</div>";

    var savingsCard = '';
    if (data.mode !== 'car' && data.savings && typeof data.savings.savedKg === 'number') {
      savingsCard = "<div class=\"results__card results__card--savings\">" +
        "<div class=\"results__card-title\">Economia vs Carro</div>" +
        "<div class=\"results__card-value\">" + UI.formatNumber(data.savings.savedKg,2) + " kg (" + (data.savings.percentage!==null? UI.formatNumber(data.savings.percentage,2) + "%" : "-") + ")</div>" +
        "</div>";
    }

    var html = "<div class=\"results results--grid\">" + routeCard + distanceCard + emissionCard + transportCard + savingsCard + "</div>";
    return html;
  },

  // modesArray: [{ mode, emission, percentageVsCar }], selectedMode: 'car' etc.
  renderComparison: function(modesArray, selectedMode) {
    var carEmission = null;
    var itemsHtml = modesArray.map(function(m){ if (m.mode === 'car') carEmission = m.emission; return m; });

    var html = '<div class="comparison">';

    modesArray.forEach(function(item){
      var selectedClass = (item.mode === selectedMode) ? ' comparison__item--selected' : '';
      var meta = (CONFIG && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[item.mode]) || { icon: '', label: item.mode };

      var pct = (item.percentageVsCar === null || item.percentageVsCar === undefined) ? 0 : item.percentageVsCar;
      var pctForBar = Math.max(0, pct); // percent value

      // color coding
      var barColor = '#10b981';
      if (pctForBar <= 25) barColor = '#10b981';
      else if (pctForBar <= 75) barColor = '#f59e0b';
      else if (pctForBar <= 100) barColor = '#f97316';
      else barColor = '#ef4444';

      var emissionStr = UI.formatNumber(item.emission || 0, 2) + ' kg';

      html += '<div class="comparison__item' + selectedClass + '">';
      html +=   '<div class="comparison__header">' +
                '<div class="comparison__icon">' + (meta.icon || '') + '</div>' +
                '<div class="comparison__meta"><div class="comparison__label">' + (meta.label || item.mode) + '</div>' +
                '<div class="comparison__emission">' + emissionStr + '</div></div>';

      if (item.mode === selectedMode) html += '<div class="comparison__badge">Selecionado</div>';
      html +=   '</div>'; // header

      html += '<div class="comparison__body">';
      html +=   '<div class="comparison__percent">' + (pct !== null ? UI.formatNumber(pct,2) + '%' : '-') + '</div>';
      html +=   '<div class="comparison__bar" aria-hidden="true">' +
                '<div class="comparison__bar-fill" style="width:' + Math.min(pctForBar,200) + '%;background:' + barColor + ';height:12px;border-radius:8px"></div>' +
                '</div>';
      html += '</div>';
      html += '</div>';
    });

    html += '<div class="comparison__tip">Dica: escolha meios mais leves em emissões para reduzir seu impacto. A bicicleta não gera emissões diretas.</div>';
    html += '</div>';
    return html;
  },

  // creditsData: { credits, price: { min, max, average } }
  renderCarbonCredits: function(creditsData) {
    var credits = Number((creditsData && creditsData.credits) || 0);
    var price = (creditsData && creditsData.price) || { min:0, max:0, average:0 };

    var creditsStr = UI.formatNumber(credits, 2);
    var avgPriceStr = UI.formatCurrency(price.average || 0);
    var minStr = UI.formatCurrency(price.min || 0);
    var maxStr = UI.formatCurrency(price.max || 0);

    var card1 = '<div class="credits__card">' +
                '<div class="credits__value">' + creditsStr + '</div>' +
                '<div class="credits__helper">1 crédito = ' + UI.formatNumber((CONFIG && CONFIG.CARBON_CREDIT && CONFIG.CARBON_CREDIT.KG_PER_CREDIT) || 1000,0) + ' kg CO₂</div>' +
                '</div>';

    var card2 = '<div class="credits__card">' +
                '<div class="credits__value">' + avgPriceStr + '</div>' +
                '<div class="credits__helper">Estimativa (média) — faixa: ' + minStr + ' – ' + maxStr + '</div>' +
                '</div>';

    var info = '<div class="credits__info">Créditos de carbono representam redução ou remoção verificada de emissões. Comprar créditos compensa suas emissões.</div>';

    var button = '<div class="credits__actions"><button class="calculator__submit">🛒 Compensar Emissões</button></div>';

    var html = '<div class="credits__grid">' + card1 + card2 + '</div>' + info + button;
    return html;
  }

};

/*
  Loading helpers

  Estrutura HTML esperada para o botão:
  <button id="my-btn" class="calculator__submit">Calcular Emissão</button>

  - `showLoading(buttonElement)`:
      * salva o texto original em `buttonElement.dataset.originalText`
      * desabilita o botão (disabled)
      * substitui `innerHTML` por '<span class="spinner"></span> Calculando...'

  - `hideLoading(buttonElement)`:
      * reabilita o botão
      * restaura o texto original a partir de `buttonElement.dataset.originalText`
*/

UI.showLoading = function(buttonElement) {
  if (!buttonElement) return;
  try {
    // salvar texto original
    if (typeof buttonElement.dataset !== 'undefined') {
      buttonElement.dataset.originalText = buttonElement.innerHTML;
    }
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
  } catch (e) {
    console.error('UI.showLoading error:', e);
  }
};

UI.hideLoading = function(buttonElement) {
  if (!buttonElement) return;
  try {
    buttonElement.disabled = false;
    var original = (buttonElement.dataset && buttonElement.dataset.originalText) ? buttonElement.dataset.originalText : null;
    if (original) {
      buttonElement.innerHTML = original;
    }
  } catch (e) {
    console.error('UI.hideLoading error:', e);
  }
};

/* Observação: renderers retornam strings; use por exemplo:
   document.getElementById('comparison-content').innerHTML = UI.renderComparison(results, 'car');
*/
