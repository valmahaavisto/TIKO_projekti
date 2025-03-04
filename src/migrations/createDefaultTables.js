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

      CREATE TABLE IF NOT EXISTS Tyyppi (
        tyyppitunnus INT NOT NULL,
        tyyppinimi VARCHAR(20) NOT NULL,
        PRIMARY KEY (tyyppitunnus)
      );

      CREATE TABLE IF NOT EXISTS Luokka (
        luokkatunnus INT NOT NULL,
        luokkanimi VARCHAR(20) NOT NULL,
        PRIMARY KEY (luokkatunnus)
      );

      CREATE TABLE IF NOT EXISTS Teos (
        teostunnus INT NOT NULL,
        isbn VARCHAR(13) NOT NULL,
        nimi VARCHAR(50) NOT NULL,
        tekija VARCHAR(50) NOT NULL,
        julkaisuvuosi INT NOT NULL,
        paino DECIMAL (5,2) NOT NULL,
        tyyppitunnus INT NOT NULL,
        luokkatunnus INT NOT NULL,
        PRIMARY KEY (teostunnus),
        FOREIGN KEY (tyyppitunnus) REFERENCES Tyyppi,
        FOREIGN KEY (luokkatunnus) REFERENCES Luokka
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
        kappaletunnus INT NOT NULL,
        teostunnus INT NOT NULL,
        divaritunnus INT NOT NULL,
        tila INT DEFAULT 0,
        sisaanostohinta DECIMAL (5,2) NOT NULL,
        myyntihinta DECIMAL (5,2) NOT NULL,
        aikaleima TIMESTAMP DEFAULT NULL,
        myyntiaika TIMESTAMP NOT NULL,
        CHECK (tila IN (0,1,2)),
        PRIMARY KEY (kappaletunnus),
        FOREIGN KEY (teostunnus) REFERENCES Teos,
        FOREIGN KEY (divaritunnus) REFERENCES Divari
      );

      CREATE TABLE IF NOT EXISTS Lahetys (
        lahetystunnus INT NOT NULL,
        tilaustunnus INT NOT NULL,
        osalahetysnro INT NOT NULL,
        kulut DECIMAL(5,2) NOT NULL,
        PRIMARY KEY (lahetystunnus),
        FOREIGN KEY (tilaustunnus) REFERENCES Tilaus
      );

      CREATE TABLE IF NOT EXISTS Postitushinnasto (
        painoraja DECIMAL (5,2),
        hinta DECIMAL (5,2) NOT NULL,
        PRIMARY KEY (painoraja)
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

    console.log('Tables created and default data inserted successfully');
  } catch (err) {
    console.error('Error creating tables or inserting data:', err);
  } finally {
    client.release();
  }
};

// Export the function so it can be used in index.js
module.exports = createDefaultTables;
