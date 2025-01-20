# Display Penrose MCP server documentation and research

# List all available recipes
default:
    @just --list

# Documentation Sections

# Show the full Penrose MCP server outline
outline:
    @cat .topos/penrose-research/mcp-server-outline.md

# Show just the architecture section
architecture:
    @sed -n '/^## Architecture/,/^##/p' .topos/penrose-research/mcp-server-outline.md

# Show the tools section
tools:
    @sed -n '/^## Tools/,/^##/p' .topos/penrose-research/mcp-server-outline.md

# Show the operadic structure
operadic:
    @sed -n '/^## Operadic Structure/,/^##/p' .topos/penrose-research/mcp-server-outline.md

# Show implementation details
implementation:
    @sed -n '/^## Implementation Details/,/^##/p' .topos/penrose-research/mcp-server-outline.md

# Show error handling section
errors:
    @sed -n '/^## Error Handling/,/^##/p' .topos/penrose-research/mcp-server-outline.md

# Show future extensions
extensions:
    @sed -n '/^## Future Extensions/,/^##/p' .topos/penrose-research/mcp-server-outline.md

# Show integration points
integration:
    @sed -n '/^## Integration Points/,/$/p' .topos/penrose-research/mcp-server-outline.md

# MCP Reference Materials

# Show MCP specification overview
mcp-spec:
    @cat .topos/penrose-research/mcp-spec/specification/_index.md

# Show MCP server implementation guide
mcp-server:
    @cat .topos/penrose-research/mcp-spec/specification/server/_index.md

# Show MCP tools documentation
mcp-tools:
    @cat .topos/penrose-research/mcp-spec/specification/server/tools.md

# Show MCP resources documentation
mcp-resources:
    @cat .topos/penrose-research/mcp-spec/specification/server/resources.md

# Show MCP example server implementation
mcp-example:
    @cat .topos/penrose-research/mcp-examples/src/index.ts
