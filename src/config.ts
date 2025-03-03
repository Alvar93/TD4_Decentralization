export const REGISTRY_PORT = 8080;
export const BASE_ONION_ROUTER_PORT = 4000;
export const BASE_USER_PORT = 3000;
export const NODE_PORT = process.env.NODE_PORT || 3001; // Chaque nœud doit avoir un port unique
export const REGISTRY_URL = `http://localhost:${REGISTRY_PORT}`;
export const NODE_ID = parseInt(process.env.NODE_ID || "1", 10);