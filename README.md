# Penrose MCP Server

A Model Context Protocol (MCP) server for [Penrose](https://penrose.cs.cmu.edu/) - Create beautiful mathematical diagrams through natural language.

## Overview

This MCP server provides tools and resources for creating mathematical diagrams using Penrose's domain-specific languages:

- **Domain (DSL)**: Define mathematical types and relationships
- **Substance**: Describe mathematical objects and their relationships
- **Style**: Specify visual representation rules

## Project Structure

- `.topos/`: Research materials and documentation (gitignored)
  - `penrose-research/`: Design documents and specifications
  - `mcp-examples/`: Reference MCP server implementations
  - `mcp-spec/`: Official MCP protocol documentation

## Development

Use the justfile to access documentation and reference materials:

```bash
# List all available commands
just --list

# View the server architecture
just architecture

# Access MCP specifications
just mcp-spec
```

## License

MIT License - See LICENSE file for details
