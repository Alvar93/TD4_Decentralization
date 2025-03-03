import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const nodeRegistry: Node[] = []; // Stocke les nœuds enregistrés en mémoire

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Route de status
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    if (!nodeId || !pubKey) {
      return res.status(400).json({ error: "Missing nodeId or pubKey" });
    }

    // Vérifie si le nœud est déjà enregistré
    const existingNode = nodeRegistry.find((node) => node.nodeId === nodeId);
    if (!existingNode) {
      nodeRegistry.push({ nodeId, pubKey });
      console.log(`Node ${nodeId} registered successfully.`);
    }
    return res.status(201).json({ success: true });
  });

  // Route pour récupérer la liste des nœuds enregistrés
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.json({ nodes: nodeRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
