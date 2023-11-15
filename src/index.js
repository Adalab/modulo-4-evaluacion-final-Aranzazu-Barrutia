const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

// init express aplication
const serverPort = process.env.PORT || 4001;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

// conexion con la DB
async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASS,
    database: process.env.DATABASE,
  });
  await connection.connect();
  console.log(
    `Conexión establecida con la base de datos (identificador=${connection.threadId})`
  );

  return connection;
}
const generateToken = (payload) => {
  const token = jwt.sign(payload, 'secreto', { expiresIn: '12h' });
  return token;
};
// creamos  nuestros endpoints
//get, post, put, delete

//obtener todas las directoras (get/directora)
server.get('/directoras', async (req, res) => {
  //SELECT DB
  const query = 'SELECT * FROM directora';

  //conexion BD
  const connection = await getConnection();

  //ejecuto la consulta a la BD
  const [results, fields] = await connection.query(query);
  console.log(results.length);
  const numOfElements = results.length;
  connection.end();

  //envio respuesta
  if (numOfElements === 0) {
    res.json({
      success: true,
      message: 'No existe la receta que buscas',
    });
    return;
  }

  //Enviar una respuesta
  res.json({
    results: results[0], // listado
  });
});

//obtengo listado de pelis
server.get('/films', async (req, res) => {
  //SELECT DB
  const query = 'SELECT * FROM film';
  //conexion BD
  const connection = await getConnection();
  //ejecuto la consulta a la BD
  const [results, fields] = await connection.query(query);
  console.log(results.length);
  const numOfElements = results.length;
  connection.end();
  //envio rspuesta
  res.json({ info: { count: numOfElements }, results: results });
});

//obtengo listado usuarias
server.get('/users', async (req, res) => {
  //SELECT DB
  const query = 'SELECT * FROM users';
  //conexion DB
  const connection = await getConnection();
  //ejecuto la consulta a la BD
  const [results, fields] = await connection.query(query);
  console.log(results.length);
  const numOfElements = results.length;
  connection.end();
  //envio rspuesta
  res.json({ info: { count: numOfElements }, results: results });
});

//inserto una directora/peli/usuaria/ POST
server.post('/create', async (req, res) => {
  //hago la query
  const dataDirectora = req.body;
  const { name_directora, country, prize } = dataDirectora;

  let sql = 'INSERT INTO directora(name_directora,country,prize)VALUES(?,?,?);';
  try {
    //conexion DB
    const connection = await getConnection();
    //ejecuto la consulta a la BD
    const [resultDirectora, fields] = await connection.query(sql, [
      name_directora,
      country,
      prize,
    ]);
    connection.end();
    if (resultDirectora.affectedRows === 0) {
      res.json({
        succes: false,
        message: 'No se ha rellenado correctamente',
      });
      return;
    }
    //envio respuesta
    res.json({
      success: true,
      id: resultDirectora.insertId,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Comprueba que los campos no están vacíos ${error}`,
    });
  }
});
//actualizo la DB(PUT)
server.put('/create/:idDirectora', async (req, res) => {
  const dataDirectora = req.body;
  const { name_directora, country, prize } = dataDirectora;
  //obtengo el ID de la directora
  const idDirectora = req.params.id;
  //hago  la query
  let sql =
    'UPDATE directora SET name_directora = ?, country = ?, prize = ? WHERE idDirectora = ?';

  //conexion DB
  const connection = await getConnection();

  //ejecuto la consulta a la BD
  try {
    const [resultDirectora, fields] = await connection.query(sql, [
      name_directora,
      country,
      prize,
      idDirectora,
    ]);
    connection.end();
    if (resultDirectora.affectedRows === 0) {
      res.json({
        succes: false,
        message: 'No se ha rellenado correctamente',
      });
      return;
    }
    //envio respuesta
    res.json({
      success: true,
      message: `El campo se actualizo correctamente`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `El campo no se pudo actualizar, intentalo de nuevo`,
    });
  }
});
//eliminar una directora

server.delete('/fkDirectora', async (req, res) => {
  //obtengo id directora
  const fkDirectora = req.params.fk_directora;

  //hago la query(consulta)
  let sql = 'DELETE FROM users WHERE users.fk_directora = ?';

  //conexion DB
  try {
    const connection = await getConnection();

    //ejecuto la consulta
    const [resultDirectora, fields] = await connection.query(sql, [
      fkDirectora,
    ]);

    connection.end();
    res.json({
      succes: true,
      message: `El campo se borró correctamente`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `El campo no se pudo borrar, intentalo de nuevo`,
    });
  }
});
server.delete('/idDirectora', async (req, res) => {
  //obtengo id directora
  const idDirectora = req.params.id;
  connection.end();
  //validar id
  if (isNaN(parseInt(idDirectora))) {
    res.json({
      succes: false,
      error: `El idDirectora tiene que ser un número`,
    });
    return;
  }
  //hago la query(consulta)
  let sql = 'DELETE  FROM directora WHERE idDirectora = ?';

  //conexion DB
  try {
    const connection = await getConnection();

    //ejecuto la consulta
    const [resultDirectora, fields] = await connection.query(sql, [
      idDirectora,
    ]);

    res.json({
      succes: true,
      message: `El campo se borró correctamente`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `El campo no se pudo borrar, intentalo de nuevo`,
    });
  }
});
//REGISTRO

app.post('/register', async (req, res) => {
  const email = req.body.email;
  const usersName = req.body.usersName;
  const password = req.body.password;

  const passwordHashed = await bcrypt.hash(password, 5);

  const sql =
    'INSERT INTO usuarios(usersName,email, password) VALUES (?, ?, ?)';

  const conn = await getConnection();

  const [results] = await conn.query(sql, [usersName, email, passwordHashed]);
  conn.end();
  res.json({
    success: true,
    id: results.insertId,
  });
});

//LOGIN
app.post('/login', async (req, res) => {
  const nombre = req.body.usersName;
  const password = req.body.password;

  const sql = 'SELECT * FROM usuarios WHERE usersName = ?';

  const conn = await getConnection();

  const [users] = await conn.query(sql, [usersName]);
  const user = users[0];

  const isOkPassword =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(isOkPassword && user)) {
    return res.json({ success: false, error: 'Error' });
  }
  const infoToken = {
    username: user.usersName,
    id: user.id,
  };

  const token = generateToken(infoToken);
  res.json({ success: true, token, username: user.usersName });
});
