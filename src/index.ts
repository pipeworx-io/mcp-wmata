interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * WMATA MCP.
 */


const BASE = 'https://api.wmata.com';
const UA = 'pipeworx-mcp-wmata/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'rail_lines', description: 'List rail lines.', inputSchema: { type: 'object', properties: {} } },
  { name: 'rail_stations', description: 'List stations.', inputSchema: { type: 'object', properties: { line_code: { type: 'string' } } } },
  { name: 'rail_station_info', description: 'Station info.', inputSchema: { type: 'object', properties: { station_code: { type: 'string' } }, required: ['station_code'] } },
  { name: 'rail_predictions', description: 'Next-train predictions.', inputSchema: { type: 'object', properties: { station_codes: { type: 'string' } }, required: ['station_codes'] } },
  { name: 'rail_incidents', description: 'Current rail incidents.', inputSchema: { type: 'object', properties: {} } },
  { name: 'bus_routes', description: 'List bus routes.', inputSchema: { type: 'object', properties: {} } },
  { name: 'bus_route_details', description: 'Route details.', inputSchema: { type: 'object', properties: { route_id: { type: 'string' }, date: { type: 'string' } }, required: ['route_id'] } },
  { name: 'bus_stops', description: 'Nearby bus stops.', inputSchema: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' }, radius: { type: 'number' } } } },
  { name: 'bus_predictions', description: 'Bus arrival predictions.', inputSchema: { type: 'object', properties: { stop_id: { type: 'string' } }, required: ['stop_id'] } },
  { name: 'bus_incidents', description: 'Bus incidents.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('WMATA requires an API key. Set PLATFORM_WMATA_KEY or pass ?_apiKey=… (free at https://developer.wmata.com/signup).');
  const get = async (path: string, params?: URLSearchParams) => {
    const qs = params ? `?${params}` : '';
    const res = await fetch(`${BASE}${path}${qs}`, {
      headers: { Accept: 'application/json', 'User-Agent': UA, api_key: apiKey },
    });
    if (res.status === 401 || res.status === 403) throw new Error('WMATA: invalid API key.');
    if (!res.ok) throw new Error(`WMATA: ${res.status}`);
    return res.json();
  };
  switch (name) {
    case 'rail_lines':
      return get('/Rail.svc/json/jLines');
    case 'rail_stations': {
      const p = new URLSearchParams();
      if (args.line_code) p.set('LineCode', String(args.line_code));
      return get('/Rail.svc/json/jStations', p);
    }
    case 'rail_station_info': {
      const p = new URLSearchParams({ StationCode: reqStr(args, 'station_code', '"A01"') });
      return get('/Rail.svc/json/jStationInfo', p);
    }
    case 'rail_predictions':
      return get(`/StationPrediction.svc/json/GetPrediction/${encodeURIComponent(reqStr(args, 'station_codes', '"All"'))}`);
    case 'rail_incidents':
      return get('/Incidents.svc/json/Incidents');
    case 'bus_routes':
      return get('/Bus.svc/json/jRoutes');
    case 'bus_route_details': {
      const p = new URLSearchParams({ RouteID: reqStr(args, 'route_id', '"S1"') });
      if (args.date) p.set('Date', String(args.date));
      return get('/Bus.svc/json/jRouteDetails', p);
    }
    case 'bus_stops': {
      const p = new URLSearchParams();
      if (args.lat != null) p.set('Lat', String(args.lat));
      if (args.lon != null) p.set('Lon', String(args.lon));
      if (args.radius != null) p.set('Radius', String(args.radius));
      return get('/Bus.svc/json/jStops', p);
    }
    case 'bus_predictions': {
      const p = new URLSearchParams({ StopID: reqStr(args, 'stop_id', '"1001195"') });
      return get('/NextBusService.svc/json/jPredictions', p);
    }
    case 'bus_incidents':
      return get('/Incidents.svc/json/BusIncidents');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
