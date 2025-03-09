const pool = require('../config/db'); 

const createDefaultTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Asiakas (
        asiakastunnus INT NOT NULL,
        nimi VARCHAR(30) NOT NULL,
        osoite VARCHAR(50) NOT NULL,
        pnro CHAR(5) NOT NULL,
        sposti VARCHAR(30) NOT NULL,
        salasana VARCHAR(50) NOT NULL,
        PRIMARY KEY (asiakastunnus)
      );

      CREATE TABLE IF NOT EXISTS Tilaus (
        tilaustunnus INT NOT NULL,
        asiakastunnus INT NOT NULL,
        vahvistusaika TIMESTAMP DEFAULT NULL,
        tila INT DEFAULT 0,
        kulut DECIMAL (5,2) NOT NULL,
        CHECK (tila IN (0,1)),
        PRIMARY KEY (tilaustunnus),
        FOREIGN KEY (asiakastunnus) REFERENCES Asiakas
      );

      CREATE TABLE IF NOT EXISTS Teos (
        isbn CHAR(13) NOT NULL,
        nimi VARCHAR(50) NOT NULL,
        tekija VARCHAR(50) NOT NULL,
        julkaisuvuosi INT NOT NULL,
        tyyppi VARCHAR(20) NOT NULL,
        luokka VARCHAR(20) NOT NULL,
        paino DECIMAL (5,2) NOT NULL,
        PRIMARY KEY (isbn)
      );

      CREATE TABLE IF NOT EXISTS Divari (
        divaritunnus INT NOT NULL,
        nimi VARCHAR(30) NOT NULL,
        osoite VARCHAR(50) NOT NULL,
        web_sivu VARCHAR(100) NOT NULL,
        rooli INT NOT NULL,
        PRIMARY KEY (divaritunnus)
      );

      CREATE TABLE IF NOT EXISTS Teoskappale (
        isbn CHAR(13) NOT NULL,
        kappaletunnus INT NOT NULL,
        divaritunnus INT NOT NULL,
        tila INT DEFAULT 0,
        sisaanostohinta DECIMAL (5,2) NOT NULL,
        myyntihinta DECIMAL (5,2) NOT NULL,
        myyntiaika TIMESTAMP NOT NULL,
        CHECK (tila IN (0,1,2)),
        PRIMARY KEY (kappaletunnus),
        FOREIGN KEY (isbn) REFERENCES Teos,
        FOREIGN KEY (divaritunnus) REFERENCES Divari
      );

      CREATE TABLE IF NOT EXISTS Osalahetys (
        tilaustunnus INT NOT NULL,
        osalahetysnro INT NOT NULL,
        kulut DECIMAL(5,2) NOT NULL,
        PRIMARY KEY (tilaustunnus, osalahetysnro),
        FOREIGN KEY (tilaustunnus) REFERENCES Tilaus
      );

      CREATE TABLE IF NOT EXISTS Postitushinnasto (
        painoraja DECIMAL (5,2),
        hinta DECIMAL (5,2) NOT NULL,
        PRIMARY KEY (painoraja)
      );

      CREATE TABLE IF NOT EXISTS Varattu_kappale (
        tilaustunnus INT NOT NULL,
        kappaletunnus INT NOT NULL,
        aikaleima TIMESTAMP NOT NULL,
        osalahetysnro INT DEFAULT 0,
        PRIMARY KEY (tilaustunnus, kappaletunnus),
        FOREIGN KEY (tilaustunnus) REFERENCES Tilaus,
        FOREIGN KEY (kappaletunnus) REFERENCES Teoskappale,
        FOREIGN KEY (tilaustunnus, osalahetysnro) REFERENCES Osalahetys
      );
    `);

    await client.query(`
      INSERT INTO Teos (isbn, nimi, tekija, julkaisuvuosi, tyyppi, luokka, paino) VALUES
      ('9155430674', 'Elektran tytär', 'Madeleine Brent', 1986, 'romantiikka', 'romaani', 0.5),
      ('9156381451', 'Tuulentavoittelijan morsian', 'Madeleine Brent', 1978, 'romantiikka', 'romaani', 0.5),
      ('1995', 'Turms kuolematon', 'Mika Waltari', 1995, 'Historia', 'romaani', 0.5),
      ('1940', 'Komisario Palmun erehdys', 'Mika Waltari', 1940, 'dekkari', 'romaani', 0.5),
      ('1989', 'Friikkilän pojat Mexicossa', 'Shelton Gilbert', 1989, 'huumori', 'sarjakuva', 0.5),
      ('9789510396230', 'Miten saan ystäviä, menestystä, vaikutusvaltaa', 'Dale Carnegie', 1939, 'opas', 'tietokirja', 0.5)
      ON CONFLICT (isbn) DO NOTHING;
    `);

    await client.query(`
    INSERT INTO Asiakas (asiakastunnus, nimi, osoite, pnro, sposti, salasana) VALUES
    (1, 'Matti Meikäläinen', 'Esimerkkikatu 1, 00100 Helsinki', '12345', 'matti.meikalainen@example.com', 'salasana123'),
    (2, 'Anna Esimerkki', 'Testikatu 5, 00200 Helsinki', '23456', 'anna.esimerkki@example.com', 'annaSalasana456'),
    (3, 'Pekka Malli', 'Mallitie 7, 00300 Helsinki', '34567', 'pekka.malli@example.com', 'pekkaMalli789'),
    (4, 'Laura Näyte', 'Näytekatu 10, 00400 Helsinki', '45678', 'laura.nayte@example.com', 'lauraSalasana012'),
    (5, 'Janne Testi', 'Testikatu 12, 00500 Helsinki', '56789', 'janne.testi@example.com', 'janneTesti345')
    ON CONFLICT (asiakastunnus) DO NOTHING;
    `);

    
    console.log('Tables created and default data inserted successfully');
  } catch (err) {
    console.error('Error creating tables or inserting data:', err);
  } finally {
    client.release();
  }
};

// Export the function so it can be used in index.js
module.exports = createDefaultTables;
