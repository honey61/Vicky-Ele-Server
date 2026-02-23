const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const z = require("zod/v4");
const { getMcpContext } = require("../services/chatbotMcpService");

dotenv.config();

async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment.");
  }

  await mongoose.connect(mongoUri);
}

function createServer() {
  const server = new McpServer({
    name: "vicky-electronics-chatbot-mcp",
    version: "1.0.0"
  });

  server.registerTool(
    "search_products",
    {
      description: "Search products from Vicky Electronics MongoDB catalog by natural language query.",
      inputSchema: {
        query: z.string().min(1).describe("User's product question or search text."),
        limit: z.number().int().min(1).max(20).optional().describe("Maximum products to return.")
      }
    },
    async ({ query, limit }) => {
      const result = await getMcpContext(query, limit || 6);

      return {
        content: [
          {
            type: "text",
            text: result.found
              ? `Found ${result.products.length} matching products:\n${result.contextText}`
              : "No matching products found."
          }
        ],
        structuredContent: {
          found: result.found,
          count: result.products.length,
          products: result.products
        }
      };
    }
  );

  return server;
}

async function main() {
  await connectMongo();
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vicky Electronics MCP server running on stdio");
}

main().catch((error) => {
  console.error("MCP server startup error:", error);
  process.exit(1);
});
