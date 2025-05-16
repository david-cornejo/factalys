CREATE TABLE empresa(
  id_empresa SERIAL PRIMARY KEY NOT NULL,
  nombre_empresa VARCHAR(100) NOT NULL
);

CREATE TABLE clientes(
  id_cliente SERIAL PRIMARY KEY NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  curp VARCHAR(13) NOT NULL,
  rfc VARCHAR(16) NOT NULL,
  telefono INT NOT NULL,
  id_empresa INT NOT NULL,
 FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);
