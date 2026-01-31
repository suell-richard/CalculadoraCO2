/*
  CONFIG

  Variáveis e utilitários de configuração para o calculador de emissões.
  Define um objeto global `CONFIG` contendo:
    - EMISSION_FACTORS: fatores (kg CO2 por km)
    - TRANSPORT_MODES: metadados (label, icon, color)
    - CARBON_CREDIT: valores para cálculo de créditos
    - populateDatalist(): popula <datalist id="cities-list"> com cidades
    - setupDistanceAutofill(): lógica de preenchimento automático da distância

  Observação: as funções interagem com elementos DOM existentes no HTML
  (ids: `origin`, `destination`, `distance`, `manual-distance`, `cities-list`).
*/

var CONFIG = {
  EMISSION_FACTORS: {
    bicycle: 0,
    car: 0.12,
    bus: 0.089,
    truck: 0.96
  },

  TRANSPORT_MODES: {
    bicycle: { label: 'Bicicleta', icon: '🚲', color: '#10b981' },
    car:     { label: 'Carro',     icon: '🚗', color: '#059669' },
    bus:     { label: 'Ônibus',    icon: '🚌', color: '#34d399' },
    truck:   { label: 'Caminhão',  icon: '🚛', color: '#8b5cf6' }
  },

  CARBON_CREDIT: {
    KG_PER_CREDIT: 1000,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 150
  },

  /*
    Popula o datalist de cidades usando RoutesDB.getAllCities().
    Cria <option value="Cidade, UF"> para cada cidade.
  */
  populateDatalist: function() {
    try {
      var cities = [];
      if (typeof RoutesDB !== 'undefined' && typeof RoutesDB.getAllCities === 'function') {
        cities = RoutesDB.getAllCities();
      }

      var datalist = document.getElementById('cities-list');
      if (!datalist) return;

      // limpar opções existentes
      datalist.innerHTML = '';

      cities.forEach(function(city) {
        var opt = document.createElement('option');
        opt.value = city;
        datalist.appendChild(opt);
      });
    } catch (e) {
      // falha silenciosa para não quebrar inicialização
      console.error('CONFIG.populateDatalist error:', e);
    }
  },

  /*
    Configura o preenchimento automático da distância entre origem e destino.
    - Observa mudanças nos inputs `origin` e `destination`.
    - Usa RoutesDB.findDistance() para obter a distância.
    - Controla o estado do input `distance` e do helper text.
  */
  setupDistanceAutofill: function() {
    try {
      var originInput = document.getElementById('origin');
      var destinationInput = document.getElementById('destination');
      var distanceInput = document.getElementById('distance');
      var manualCheckbox = document.getElementById('manual-distance');

      if (!originInput || !destinationInput || !distanceInput || !manualCheckbox) return;

      // helper abaixo do input de distância (assume estrutura do HTML)
      var helper = distanceInput.parentElement.querySelector('.calculator__helper');
      var originalHelperText = helper ? helper.textContent : '';

      var tryFill = function() {
        var o = originInput.value.trim();
        var d = destinationInput.value.trim();

        if (!o || !d) {
          if (helper) { helper.textContent = originalHelperText; helper.style.color = ''; }
          distanceInput.value = '';
          distanceInput.readOnly = true;
          return;
        }

        var dist = null;
        if (typeof RoutesDB !== 'undefined' && typeof RoutesDB.findDistance === 'function') {
          dist = RoutesDB.findDistance(o, d);
        }

        if (dist !== null && dist !== undefined) {
          distanceInput.value = dist;
          distanceInput.readOnly = true;
          if (helper) { helper.textContent = originalHelperText; helper.style.color = 'var(--primary)'; }
        } else {
          distanceInput.value = '';
          distanceInput.readOnly = true;
          if (helper) {
            helper.textContent = "Distância não encontrada — marque 'Inserir distância manualmente' para preencher manualmente.";
            helper.style.color = 'var(--danger)';
          }
        }
      };

      // eventos de mudança nos inputs
      originInput.addEventListener('change', function() { if (!manualCheckbox.checked) tryFill(); });
      destinationInput.addEventListener('change', function() { if (!manualCheckbox.checked) tryFill(); });

      // controlar checkbox de modo manual
      manualCheckbox.addEventListener('change', function() {
        if (this.checked) {
          distanceInput.readOnly = false;
          if (helper) { helper.textContent = 'Modo manual ativado — insira a distância em km.'; helper.style.color = 'var(--text-light)'; }
        } else {
          // re-tentar preenchimento automático
          tryFill();
        }
      });

      // tentativa inicial (caso já haja valores)
      if (!manualCheckbox.checked) tryFill();
    } catch (e) {
      console.error('CONFIG.setupDistanceAutofill error:', e);
    }
  }
};

/* Nota: para ativar automaticamente após o carregamento da página, adicione:
   document.addEventListener('DOMContentLoaded', function(){
     CONFIG.populateDatalist();
     CONFIG.setupDistanceAutofill();
   });
*/
