/*
  RoutesDB

  Estrutura:
  - RoutesDB.routes: array de objetos de rota
    { origin: string, destination: string, distanceKm: number }
    origin/destination: nome da cidade e estado (ex: "São Paulo, SP")

  Métodos:
  - getAllCities(): retorna array único e ordenado alfabeticamente com todos
    os nomes de cidades presentes nas rotas (origem + destino).

  - findDistance(origin, destination): busca a distância entre duas cidades
    procurando em ambas as direções. Normaliza entradas (trim + lowercase)
    e retorna distância em km ou `null` se não encontrada.

  Este arquivo define uma única variável global: RoutesDB
*/

var RoutesDB = {
  routes: [
    { origin: "São Paulo, SP", destination: "Rio de Janeiro, RJ", distanceKm: 430 },
    { origin: "São Paulo, SP", destination: "Brasília, DF", distanceKm: 1015 },
    { origin: "Rio de Janeiro, RJ", destination: "Brasília, DF", distanceKm: 1148 },
    { origin: "São Paulo, SP", destination: "Campinas, SP", distanceKm: 95 },
    { origin: "Rio de Janeiro, RJ", destination: "Niterói, RJ", distanceKm: 13 },
    { origin: "Belo Horizonte, MG", destination: "Ouro Preto, MG", distanceKm: 100 },
    { origin: "São Paulo, SP", destination: "Curitiba, PR", distanceKm: 408 },
    { origin: "São Paulo, SP", destination: "Santos, SP", distanceKm: 72 },
    { origin: "Curitiba, PR", destination: "Florianópolis, SC", distanceKm: 300 },
    { origin: "Porto Alegre, RS", destination: "Florianópolis, SC", distanceKm: 460 },
    { origin: "Salvador, BA", destination: "Recife, PE", distanceKm: 807 },
    { origin: "Fortaleza, CE", destination: "Recife, PE", distanceKm: 803 },
    { origin: "Manaus, AM", destination: "Belém, PA", distanceKm: 1600 },
    { origin: "Belém, PA", destination: "São Luís, MA", distanceKm: 680 },
    { origin: "São Paulo, SP", destination: "Belo Horizonte, MG", distanceKm: 586 },
    { origin: "Rio de Janeiro, RJ", destination: "Belo Horizonte, MG", distanceKm: 434 },
    { origin: "Brasília, DF", destination: "Goiânia, GO", distanceKm: 209 },
    { origin: "Goiânia, GO", destination: "Cuiabá, MT", distanceKm: 924 },
    { origin: "Cuiabá, MT", destination: "Campo Grande, MS", distanceKm: 690 },
    { origin: "Porto Alegre, RS", destination: "São Paulo, SP", distanceKm: 1122 },
    { origin: "Recife, PE", destination: "Maceió, AL", distanceKm: 267 },
    { origin: "Maceió, AL", destination: "Aracaju, SE", distanceKm: 270 },
    { origin: "Aracaju, SE", destination: "Salvador, BA", distanceKm: 327 },
    { origin: "Natal, RN", destination: "Fortaleza, CE", distanceKm: 534 },
    { origin: "Teresina, PI", destination: "São Luís, MA", distanceKm: 441 },
    { origin: "Vitória, ES", destination: "Belo Horizonte, MG", distanceKm: 525 },
    { origin: "Vitória, ES", destination: "Rio de Janeiro, RJ", distanceKm: 520 },
    { origin: "Porto Alegre, RS", destination: "Curitiba, PR", distanceKm: 710 },
    { origin: "Fortaleza, CE", destination: "Teresina, PI", distanceKm: 640 },
    { origin: "São Paulo, SP", destination: "Ribeirão Preto, SP", distanceKm: 315 },
    { origin: "Campinas, SP", destination: "Ribeirão Preto, SP", distanceKm: 150 },
    { origin: "Belo Horizonte, MG", destination: "Uberlândia, MG", distanceKm: 531 },
    { origin: "Brasília, DF", destination: "Belo Horizonte, MG", distanceKm: 716 },
    { origin: "Salvador, BA", destination: "Vitória, ES", distanceKm: 920 },
    { origin: "Manaus, AM", destination: "Porto Velho, RO", distanceKm: 790 },
    { origin: "Belém, PA", destination: "Macapá, AP", distanceKm: 515 }
  ],

  /*
    Retorna array com todos os nomes de cidades (origin + destination), sem
    duplicatas e ordenado alfabeticamente.
  */
  getAllCities: function() {
    var set = new Set();
    this.routes.forEach(function(r) {
      if (r.origin) set.add(r.origin);
      if (r.destination) set.add(r.destination);
    });
    return Array.from(set).sort(function(a,b){
      return a.localeCompare(b, 'pt-BR');
    });
  },

  /*
    Procura distância entre origin e destination. Normaliza entradas e
    verifica ambas as direções. Retorna número (km) ou null.
  */
  findDistance: function(origin, destination) {
    if (!origin || !destination) return null;
    var o = String(origin).trim().toLowerCase();
    var d = String(destination).trim().toLowerCase();

    for (var i = 0; i < this.routes.length; i++) {
      var route = this.routes[i];
      var ro = String(route.origin).trim().toLowerCase();
      var rd = String(route.destination).trim().toLowerCase();
      if (ro === o && rd === d) return route.distanceKm;
      if (ro === d && rd === o) return route.distanceKm; // both directions
    }
    return null;
  }
};

/* Exemplo de uso (para desenvolvimento):
   RoutesDB.getAllCities();
   RoutesDB.findDistance('São Paulo, SP', 'Rio de Janeiro, RJ');
*/
