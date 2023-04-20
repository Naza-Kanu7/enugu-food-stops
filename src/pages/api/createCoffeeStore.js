import { table, getMinifiedRecords, findRecordByFilter } from "../../../lib/airtable";

// const Airtable = require('airtable');
// const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY);

// const table = base('Coffee-Stores')

const createCoffeeStore = async (req, res) => {
  if (req.method === "POST") {
    const { id, name, neighbourhood, address, imgUrl, voting } = req.body;

    try {
      if (id) {
        const records = await findRecordByFilter(id);

        if (records.length !== 0) {
          res.json( records );

        } else {
          if (name) {
            const createRecords = await table.create([
              {
                fields: {
                  id,
                  name,
                  address,
                  neighbourhood,
                  voting,
                  imgUrl,
                },
              },
            ]);
            const records = getMinifiedRecords(createRecords);
            res.json({ message: "create a record", records });
          } else {
            res.status(400);
            res.json({ message: "name is missing" });
          }
        }
      } else {
        res.status(400);
        res.json({ message: "ID is missing" });
      }
    } catch (err) {
      console.error("Error creating or finding a Store", err);
      res.status(500);
      res.json({ message: "Error creating or finding a Store", err });
    }
  }
};

export default createCoffeeStore;
