# @pipeworx/wmata

[WMATA](https://developer.wmata.com) MCP — Washington Metro real-time + static data. Free API key (5k req/day).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform: `PLATFORM_WMATA_KEY`. BYO: `?_apiKey=…`.

## Tools

- `rail_lines()` — list rail lines
- `rail_stations(line_code?)` — list stations (optionally on a line)
- `rail_station_info(station_code)` — station info
- `rail_predictions(station_codes)` — next-train predictions (comma-sep codes; `All` for system-wide)
- `rail_incidents()` — current rail incidents
- `bus_routes()` — list bus routes
- `bus_route_details(route_id, date?)` — route details
- `bus_stops(lat?, lon?, radius?)` — nearby bus stops
- `bus_predictions(stop_id)` — bus arrival predictions
- `bus_incidents()` — bus incidents

## Data source

`https://api.wmata.com/...`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "wmata": {
      "url": "https://gateway.pipeworx.io/wmata/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Wmata data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
