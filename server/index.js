const express = require("express");
const cors = require("cors");
const crypto = require("./crypto");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0488b49f04c4d65cfa3cfdb12a9c2910c95fbf19d0b03e51ca3b17857d6fae000931d311475a918f2caa8f89b66ec71d5d663ad2a41714efe11a26ca8316ba507b" : 100,
  "046266451ac09f2edca3b70cb11b62253caa151c60c2311bd32478897f0aca4bf7d701e30eb336879225f7a932b2352a52d56c7a70e7c85b006777798b3a1e5acd" : 50,
  "04bd49e23dce7db94a23603bdd7c0d80c52a79670025ea7c0e18398323b1c7172845a706c6123d27c36c611375dd834e6ed06ba64b5fe3d1f6bd900f6396db4b0d" : 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances.get(address) || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, signature } = req.body;
  const { recipient, amount } = message;

  const pubKey = crypto.signatureToPubKey(message, signature);
  const sender = crypto.pubKeyToAddress(pubKey);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances.get(sender) < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances.set(sender, balances.get(sender) - amount);
    balances.set(recipient, balances.get(recipient) + amount);
    res.send({ balance: balances.get(sender) });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
