const mongoose = require("mongoose");
const http = require("http");
const url = require("url");

mongoose
  .connect(
    "mongodb+srv://root:root@cluster0.iejwi.mongodb.net/tipo_cambio?retryWrites=true&w=majority"
  )
  .then(function () {
    console.log("Conectado a la base de datos");
  });

const CurrencyValueSchema = new mongoose.Schema({
  moneda: { type: String },
  valor: { type: Number },
});

const CurrencySchema = new mongoose.Schema(
  {
    moneda: { type: String, unique: true },
    cambios: { type: [CurrencyValueSchema] },
  },
  { collection: "cambios" }
);

const CurrencyModel = mongoose.model("currencies", CurrencySchema);

// url.com/?moneda=MXN&cantidad=20&cambio=USD

const server = http.createServer(function (request, response) {
  const result = url.parse(request.url, true);

  const query = result.query;

  // Validamos que exista el parámetro "moneda"
  if (!query.moneda) {
    response.write("ERROR: No se indico la moneda de origen");
    return response.end();
  }

  // Validamos que exista el parámetro "cantidad"
  if (!query.cantidad) {
    response.write("ERROR: No se indico la cantidad a convertir");
    return response.end();
  }

  // Validamos que exista el parámetro "cambio"
  if (!query.cambio) {
    response.write("ERROR: No se indico el tipo de cambio");
    return response.end();
  }

  const cantidad = Number(query.cantidad);

  // Validamos que la cantidad sí sea un número positivo
  if (isNaN(cantidad) && cantidad >= 0) {
    response.write("La cantidad debe ser un número");
    return response.end();
  }
  console.log(query.moneda);
  CurrencyModel.findOne({ moneda: query.moneda }).then(function (documento) {
    if (!documento) {
      response.write("La moneda no existe en la base de datos");
      return response.end();
    }

    const cambio = documento.cambios.find((x) => x.moneda === query.cambio);

    if (!cambio) {
      response.write("El tipo de cambio no existe en la base de datos");
      return response.end();
    }

    response.write(
      `${cantidad} ${query.moneda} = ${cantidad * cambio.valor} ${
        cambio.moneda
      }`
    );

    response.end();
  });

  // response.end(); <--- Aquí no va por que el proceso es asíncrono.
});

server.listen(8080, function () {
  console.log("Escuchando puerto 8080");
});
