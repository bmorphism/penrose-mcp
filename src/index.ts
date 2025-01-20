#!/usr/bin/env node

/**
 * Penrose MCP Server
 * 
 * Provides tools for creating and manipulating mathematical diagrams through the Model Context Protocol.
 * Implements a three-tier architecture:
 * - Domain Generator: Creates domain-specific language (DSL) definitions
 * - Substance Processor: Defines mathematical objects and relationships
 * - Style Renderer: Handles visual representation rules
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Types for Domain definitions
interface DomainType {
  name: string;
  predicates?: Array<{
    name: string;
    args: Array<string>;
  }>;
}

interface Domain {
  name: string;
  types: Array<DomainType>;
}

// Types for Substance definitions
interface Declaration {
  type: string;
  objects: Array<string>;
}

interface Statement {
  predicate: string;
  args: Array<string>;
}

interface Substance {
  domain: string;
  declarations: Array<Declaration>;
  statements: Array<Statement>;
}

// Types for Style definitions
interface StyleRule {
  selector: string;
  properties: Record<string, any>;
  constraints: Array<string>;
}

interface Style {
  canvas: {
    width: number;
    height: number;
  };
  rules: Array<StyleRule>;
}

// In-memory storage
const domains: Map<string, Domain> = new Map();
const substances: Map<string, Substance> = new Map();
const styles: Map<string, Style> = new Map();

// Create MCP server with capabilities
const server = new Server(
  {
    name: "penrose-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Resource handlers for accessing mathematical definitions
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = [];
  
  // List domains
  for (const [name, domain] of domains) {
    resources.push({
      uri: `domain:///${name}`,
      mimeType: "application/json",
      name: `Domain: ${domain.name}`,
      description: `Mathematical domain definition for ${domain.name}`
    });
  }
  
  // List substances
  for (const [name, substance] of substances) {
    resources.push({
      uri: `substance:///${name}`,
      mimeType: "application/json", 
      name: `Substance: ${name}`,
      description: `Mathematical objects and relationships for domain ${substance.domain}`
    });
  }
  
  // List styles
  for (const [name, style] of styles) {
    resources.push({
      uri: `style:///${name}`,
      mimeType: "application/json",
      name: `Style: ${name}`,
      description: `Visual style rules for diagram rendering`
    });
  }
  
  return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const id = url.pathname.replace(/^\//, '');
  
  // Handle different resource types
  if (request.params.uri.startsWith('domain://')) {
    const domain = domains.get(id);
    if (!domain) throw new Error(`Domain ${id} not found`);
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(domain, null, 2)
      }]
    };
  }
  
  if (request.params.uri.startsWith('substance://')) {
    const substance = substances.get(id);
    if (!substance) throw new Error(`Substance ${id} not found`);
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(substance, null, 2)
      }]
    };
  }
  
  if (request.params.uri.startsWith('style://')) {
    const style = styles.get(id);
    if (!style) throw new Error(`Style ${id} not found`);
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(style, null, 2)
      }]
    };
  }
  
  throw new Error(`Invalid resource URI: ${request.params.uri}`);
});

// Tool handlers for creating and manipulating diagrams
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_domain",
        description: "Create domain-specific language (DSL) definitions",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Domain name"
            },
            types: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Type name"
                  },
                  predicates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        args: {
                          type: "array",
                          items: { type: "string" }
                        }
                      },
                      required: ["name", "args"]
                    }
                  }
                },
                required: ["name"]
              }
            }
          },
          required: ["name", "types"]
        }
      },
      {
        name: "create_substance",
        description: "Define mathematical objects and relationships",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Reference to domain"
            },
            declarations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  objects: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["type", "objects"]
              }
            },
            statements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  predicate: { type: "string" },
                  args: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["predicate", "args"]
              }
            }
          },
          required: ["domain", "declarations", "statements"]
        }
      },
      {
        name: "create_style",
        description: "Define visual representation rules",
        inputSchema: {
          type: "object",
          properties: {
            canvas: {
              type: "object",
              properties: {
                width: { type: "number" },
                height: { type: "number" }
              },
              required: ["width", "height"]
            },
            rules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  selector: { type: "string" },
                  properties: { type: "object" },
                  constraints: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["selector", "properties", "constraints"]
              }
            }
          },
          required: ["canvas", "rules"]
        }
      },
      {
        name: "generate_diagram",
        description: "Generate diagram from domain/substance/style",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string" },
            substance: { type: "string" },
            style: { type: "string" },
            variation: { type: "string" }
          },
          required: ["domain", "substance", "style"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "create_domain": {
      const args = request.params.arguments;
      if (!args || typeof args !== 'object') {
        throw new Error('Invalid arguments');
      }

      const { name, types } = args as { name?: string; types?: Array<any> };
      if (!name || !Array.isArray(types)) {
        throw new Error('Invalid domain definition: requires name and types array');
      }

      // Validate types
      const validatedTypes: Array<DomainType> = types.map(type => {
        if (!type.name || typeof type.name !== 'string') {
          throw new Error('Invalid type definition: requires name');
        }

        const validatedType: DomainType = { name: type.name };
        if (type.predicates) {
          if (!Array.isArray(type.predicates)) {
            throw new Error('Invalid predicates: must be an array');
          }
          validatedType.predicates = type.predicates.map((pred: any) => {
            if (!pred.name || !Array.isArray(pred.args)) {
              throw new Error('Invalid predicate: requires name and args array');
            }
            return {
              name: String(pred.name),
              args: pred.args.map((arg: any) => String(arg))
            };
          });
        }
        return validatedType;
      });

      const domain: Domain = { name, types: validatedTypes };
      domains.set(name, domain);
      return {
        content: [{
          type: "text",
          text: `Created domain: ${name}`
        }]
      };
    }

    case "create_substance": {
      const args = request.params.arguments;
      if (!args || typeof args !== 'object') {
        throw new Error('Invalid arguments');
      }

      const { domain: domainName, declarations, statements } = args as {
        domain?: string;
        declarations?: Array<any>;
        statements?: Array<any>;
      };

      if (!domainName || !Array.isArray(declarations) || !Array.isArray(statements)) {
        throw new Error('Invalid substance definition: requires domain, declarations array, and statements array');
      }

      // Validate domain exists
      if (!domains.has(domainName)) {
        throw new Error(`Domain ${domainName} not found`);
      }

      // Validate declarations
      const validatedDeclarations: Array<Declaration> = declarations.map(decl => {
        if (!decl.type || !Array.isArray(decl.objects)) {
          throw new Error('Invalid declaration: requires type and objects array');
        }
        return {
          type: String(decl.type),
          objects: decl.objects.map((obj: any) => String(obj))
        };
      });

      // Validate statements
      const validatedStatements: Array<Statement> = statements.map(stmt => {
        if (!stmt.predicate || !Array.isArray(stmt.args)) {
          throw new Error('Invalid statement: requires predicate and args array');
        }
        return {
          predicate: String(stmt.predicate),
          args: stmt.args.map((arg: any) => String(arg))
        };
      });

      const substance: Substance = {
        domain: domainName,
        declarations: validatedDeclarations,
        statements: validatedStatements
      };

      substances.set(domainName, substance);
      return {
        content: [{
          type: "text",
          text: `Created substance for domain: ${domainName}`
        }]
      };
    }

    case "create_style": {
      const args = request.params.arguments;
      if (!args || typeof args !== 'object') {
        throw new Error('Invalid arguments');
      }

      const { canvas, rules } = args as {
        canvas?: { width?: number; height?: number };
        rules?: Array<any>;
      };

      if (!canvas || typeof canvas.width !== 'number' || typeof canvas.height !== 'number') {
        throw new Error('Invalid style definition: requires canvas with width and height');
      }

      if (!Array.isArray(rules)) {
        throw new Error('Invalid style definition: requires rules array');
      }

      // Validate rules
      const validatedRules: Array<StyleRule> = rules.map(rule => {
        if (!rule.selector || typeof rule.selector !== 'string' ||
            !rule.properties || typeof rule.properties !== 'object' ||
            !Array.isArray(rule.constraints)) {
          throw new Error('Invalid rule: requires selector, properties object, and constraints array');
        }
        return {
          selector: rule.selector,
          properties: rule.properties,
          constraints: rule.constraints.map((c: any) => String(c))
        };
      });

      const style: Style = {
        canvas: {
          width: canvas.width,
          height: canvas.height
        },
        rules: validatedRules
      };

      const id = `style_${styles.size + 1}`;
      styles.set(id, style);
      return {
        content: [{
          type: "text",
          text: `Created style: ${id}`
        }]
      };
    }

    case "generate_diagram": {
      const { domain: domainName, substance: substanceName, style: styleName } = request.params.arguments as {
        domain: string;
        substance: string;
        style: string;
      };

      // Validate all components exist
      const domain = domains.get(domainName);
      if (!domain) throw new Error(`Domain ${domainName} not found`);

      const substance = substances.get(substanceName);
      if (!substance) throw new Error(`Substance ${substanceName} not found`);

      const style = styles.get(styleName);
      if (!style) throw new Error(`Style ${styleName} not found`);

      // Generate SVG diagram with proper XML declaration and formatting
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${style.canvas.width}" height="${style.canvas.height}" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <rect width="100%" height="100%" fill="white"/>
  <text x="10" y="20" font-family="Arial">Domain: ${domain.name}</text>
  <text x="10" y="40" font-family="Arial">Substance: ${substanceName}</text>
  <text x="10" y="60" font-family="Arial">Style: ${styleName}</text>
  
  <!-- Set visualization -->
  <circle cx="150" cy="150" r="50" fill="#e0e0e0" stroke="black"/>
  <text x="150" y="150" text-anchor="middle" font-family="Arial">A</text>
  
  <circle cx="250" cy="150" r="50" fill="#e0e0e0" stroke="black"/>
  <text x="250" y="150" text-anchor="middle" font-family="Arial">B</text>
  
  <!-- Subset relationship -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
    refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="black"/>
    </marker>
  </defs>
  <path d="M 190 150 L 210 150" stroke="black" marker-end="url(#arrowhead)"/>
</svg>`;

      // Convert SVG to base64 with proper data URI format
      const svgBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

      return {
        content: [{
          type: "text",
          text: svgBase64
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});


// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Penrose MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
