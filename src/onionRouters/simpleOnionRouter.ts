import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey } from "../crypto";
import axios from "axios";

console.log(`Le script démarre`);

export async function simpleOnionRouter(nodeId: number) {
  console.log(`Starting onion router with nodeId: ${nodeId}`);

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Génération des clés RSA
  const { publicKey, privateKey } = await generateRsaKeyPair();
  const publicKeyString = await exportPubKey(publicKey);
  const privateKeyString = await exportPrvKey(privateKey);

  // Enregistrement automatique dans le registre
  async function registerNode() {
    try {
      const response = await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
        nodeId,
        pubKey: publicKeyString,
      });

      if (response.status === 200) {
        console.log(`Node ${nodeId} successfully registered on the registry.`);
      } else {
        console.error(`Failed to register node ${nodeId}: Unexpected status code ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to register node ${nodeId}:`, error);
    }
  }

  await registerNode();

  // Route pour récupérer la clé privée (pour les tests uniquement)
  onionRouter.get("/getPrivateKey", (req, res) => {
    if (privateKeyString) {
      res.json({ result: privateKeyString });
    } else {
      res.status(500).json({ error: "Private key not available" });
    }
  });

  // Routes pour les messages reçus
  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  // Route pour recevoir et traiter les messages
  onionRouter.post("/message", async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      lastReceivedEncryptedMessage = message;
      // Logique de déchiffrement et de transfert du message
      // ...

      return res.status(200).send("Message forwarded successfully");
    } catch (error) {
      console.error("Failed to forward message:", error);
      return res.status(500).json({ error: "Failed to forward message" });
    }
  });

  // Vérification de l'état du nœud
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}


