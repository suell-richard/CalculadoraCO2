/*
  Calculator

  Objeto global com funções para calcular emissões, comparar modos,
  calcular economia em relação a um baseline e estimar preço de créditos.

  Métodos:
    - calculateEmission(distanceKm, transportMode)
    - calculateAllModes(distanceKm)
    - calculateSavings(emission, baselineEmission)
    - estimateCreditPrice(credits)

  Depende de `CONFIG.EMISSION_FACTORS` e `CONFIG.CARBON_CREDIT`.
*/

var Calculator = {

  // Calcula emissão (kg CO2) para um dado modo e distância.
  // Fórmula: emission = distanceKm * fatorDeEmissao
  // Retorna número arredondado para 2 casas ou null se modo inválido.
  calculateEmission: function(distanceKm, transportMode) {
    if (typeof distanceKm !== 'number') distanceKm = Number(distanceKm) || 0;
    if (!transportMode || typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) return null;
    var factor = CONFIG.EMISSION_FACTORS[transportMode];
    if (typeof factor !== 'number') return null;
    var emission = distanceKm * factor;
    return Number(emission.toFixed(2));
  },

  // Calcula emissões para todos os modos definidos em CONFIG.EMISSION_FACTORS.
  // Retorna array de objetos: { mode, emission, percentageVsCar }
  // percentageVsCar = (emission / carEmission) * 100, ou null se carEmission === 0
  calculateAllModes: function(distanceKm) {
    if (typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) return [];
    var modes = Object.keys(CONFIG.EMISSION_FACTORS || {});
    var results = [];

    // calcular emissão do carro como baseline quando existir
    var carEmission = null;
    if (modes.indexOf('car') !== -1) {
      carEmission = this.calculateEmission(distanceKm, 'car');
    }

    modes.forEach(function(mode) {
      var emission = Calculator.calculateEmission(distanceKm, mode);
      var percentageVsCar = null;
      if (carEmission !== null && carEmission !== 0) {
        percentageVsCar = Number(((emission / carEmission) * 100).toFixed(2));
      } else if (carEmission === 0) {
        // se baseline do carro for 0, só definir 100% quando ambos forem zero
        percentageVsCar = (emission === 0) ? 100 : null;
      }

      results.push({ mode: mode, emission: emission, percentageVsCar: percentageVsCar });
    });

    // ordenar por emissão (menor primeiro)
    results.sort(function(a,b){
      return a.emission - b.emission;
    });

    return results;
  },

  // Calcula a economia (kg) e a % de redução em relação ao baseline.
  // savedKg = baseline - emission
  // percentage = (savedKg / baseline) * 100
  // Retorna { savedKg, percentage } com valores arredondados para 2 casas.
  calculateSavings: function(emission, baselineEmission) {
    emission = Number(emission) || 0;
    baselineEmission = Number(baselineEmission) || 0;
    var savedKg = baselineEmission - emission;
    var percentage = null;
    if (baselineEmission > 0) {
      percentage = (savedKg / baselineEmission) * 100;
    }
    return {
      savedKg: Number(savedKg.toFixed(2)),
      percentage: percentage === null ? null : Number(percentage.toFixed(2))
    };
  },

  // Estima preço de créditos de carbono a partir do número de créditos.
  // min = credits * PRICE_MIN_BRL
  // max = credits * PRICE_MAX_BRL
  // average = (min + max) / 2
  // Retorna { min, max, average } arredondados para 2 casas.
  estimateCreditPrice: function(credits) {
    credits = Number(credits) || 0;
    if (typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT) return { min: 0, max: 0, average: 0 };
    var minUnit = Number(CONFIG.CARBON_CREDIT.PRICE_MIN_BRL) || 0;
    var maxUnit = Number(CONFIG.CARBON_CREDIT.PRICE_MAX_BRL) || 0;
    var min = credits * minUnit;
    var max = credits * maxUnit;
    var average = (min + max) / 2;
    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      average: Number(average.toFixed(2))
    };
  }

};

/* Exemplos de uso:
   Calculator.calculateEmission(100, 'car');
   Calculator.calculateAllModes(100);
   Calculator.calculateSavings(8, 12);
   Calculator.estimateCreditPrice(2.5);
*/
