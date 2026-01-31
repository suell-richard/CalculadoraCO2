/*
  app.js

  Inicialização da aplicação e manipulador do formulário principal.
  - Popula o datalist de cidades
  - Configura o autofill de distância
  - Escuta o submit do formulário, valida, calcula e renderiza resultados

  Comentários explicativos estão incluídos em cada passo para facilitar
  manutenção e leitura.
*/

(function(){
  'use strict';

  // Quando o DOM estiver pronto, inicializa componentes
  document.addEventListener('DOMContentLoaded', function(){
    // Preenche datalist com cidades disponíveis
    if (typeof CONFIG !== 'undefined' && typeof CONFIG.populateDatalist === 'function') {
      CONFIG.populateDatalist();
    }

    // Configura autofill de distância (origem/destino)
    if (typeof CONFIG !== 'undefined' && typeof CONFIG.setupDistanceAutofill === 'function') {
      CONFIG.setupDistanceAutofill();
    }

    // Seleciona o formulário
    var form = document.getElementById('calculator-form');
    if (!form) {
      console.warn('Formulário #calculator-form não encontrado');
      return;
    }

    console.log('✅ Calculadora inicializada!');

    // Handler de submit do formulário
    form.addEventListener('submit', function(e){
      e.preventDefault();

      // Coleta valores do formulário
      var origin = (document.getElementById('origin') && document.getElementById('origin').value || '').trim();
      var destination = (document.getElementById('destination') && document.getElementById('destination').value || '').trim();
      var distanceRaw = (document.getElementById('distance') && document.getElementById('distance').value) || '';
      var distance = parseFloat(distanceRaw);
      var checkedTransport = document.querySelector('input[name="transport"]:checked');
      var transportMode = checkedTransport ? checkedTransport.value : null;

      // Validação simples dos campos obrigatórios
      if (!origin) { alert('Por favor, informe a origem.'); return; }
      if (!destination) { alert('Por favor, informe o destino.'); return; }
      if (!distance || isNaN(distance) || distance <= 0) { alert('Por favor, informe uma distância válida (> 0).'); return; }
      if (!transportMode) { alert('Selecione um meio de transporte.'); return; }

      // Botão de submit para exibir loading
      var submitButton = form.querySelector('button[type="submit"]') || document.querySelector('.calculator__submit');
      if (submitButton && typeof UI !== 'undefined' && typeof UI.showLoading === 'function') {
        UI.showLoading(submitButton);
      }

      // Esconder resultados anteriores
      if (typeof UI !== 'undefined') {
        UI.hideElement('results');
        UI.hideElement('carbon-credits');
      }

      // Simula processamento assíncrono (ex: chamada API)
      setTimeout(function(){
        try {
          // Calcula emissão para o modo selecionado
          var emission = (typeof Calculator !== 'undefined' && typeof Calculator.calculateEmission === 'function') ? Calculator.calculateEmission(distance, transportMode) : null;

          // Calcula emissão do carro como baseline (se disponível)
          var carEmission = (typeof Calculator !== 'undefined' && typeof Calculator.calculateEmission === 'function') ? Calculator.calculateEmission(distance, 'car') : null;

          // Calcula economia em relação ao carro
          var savings = null;
          if (typeof Calculator !== 'undefined' && typeof Calculator.calculateSavings === 'function' && emission !== null && carEmission !== null) {
            savings = Calculator.calculateSavings(emission, carEmission);
          }

          // Calcula comparação entre modos
          var comparison = (typeof Calculator !== 'undefined' && typeof Calculator.calculateAllModes === 'function') ? Calculator.calculateAllModes(distance) : [];

          // Calcula créditos de carbono necessários e estimativa de preço
          var kgPerCredit = (CONFIG && CONFIG.CARBON_CREDIT && CONFIG.CARBON_CREDIT.KG_PER_CREDIT) ? Number(CONFIG.CARBON_CREDIT.KG_PER_CREDIT) : 1000;
          var creditsNeeded = (emission !== null) ? (emission / kgPerCredit) : 0;
          // Estimativa de preço usando Calculator.estimateCreditPrice
          var priceEstimate = (typeof Calculator !== 'undefined' && typeof Calculator.estimateCreditPrice === 'function') ? Calculator.estimateCreditPrice(creditsNeeded) : { min:0, max:0, average:0 };

          // Preparar dados para renderização
          var resultsData = {
            origin: origin,
            destination: destination,
            distance: distance,
            emission: emission,
            mode: transportMode,
            savings: savings
          };

          var creditsData = {
            credits: creditsNeeded,
            price: priceEstimate
          };

          // Determina contêineres de saída (compatível com diferentes marcas)
          var resultsContainer = document.getElementById('results-content') || document.getElementById('comparison-content');
          var comparisonContainer = document.getElementById('comparison-content');
          var creditsContainer = document.getElementById('carbon-credits-content');

          // Renderiza e injeta HTML (os renderers retornam strings)
          if (resultsContainer && typeof UI !== 'undefined' && typeof UI.renderResults === 'function') {
            resultsContainer.innerHTML = UI.renderResults(resultsData);
          }

          if (comparisonContainer && typeof UI !== 'undefined' && typeof UI.renderComparison === 'function') {
            comparisonContainer.innerHTML = UI.renderComparison(comparison, transportMode);
          }

          if (creditsContainer && typeof UI !== 'undefined' && typeof UI.renderCarbonCredits === 'function') {
            creditsContainer.innerHTML = UI.renderCarbonCredits(creditsData);
          }

          // Exibe as seções de resultados
          if (typeof UI !== 'undefined') {
            UI.showElement('results');
            UI.showElement('carbon-credits');
            UI.scrollToElement('results');
          }

          // Remove estado de loading do botão
          if (submitButton && typeof UI !== 'undefined' && typeof UI.hideLoading === 'function') {
            UI.hideLoading(submitButton);
          }

        } catch (err) {
          // Em caso de erro, loga e informa o usuário
          console.error('Erro no processamento:', err);
          alert('Ocorreu um erro ao calcular. Tente novamente.');
          if (submitButton && typeof UI !== 'undefined' && typeof UI.hideLoading === 'function') {
            UI.hideLoading(submitButton);
          }
        }
      }, 1500);

    }); // fim submit listener

  }); // DOMContentLoaded

})();
