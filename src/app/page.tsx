'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import serversData from '@/data/servers.json';

// ── Types ────────────────────────────────────
type Server = {
  id: string; name: string; description: string;
  github_url: string; stars: number; forks: number;
  language: string; topics: string[]; categories: string[];
  homepage: string; license: string; last_push_at: string;
};

type ServerData = { servers: Server[]; total: number; exportedAt: string };

const data = serversData as unknown as ServerData;
const servers = data.servers || [];

const CATEGORIES = [
  { id: '', name: 'All', icon: '🔮' },
  { id: 'database', name: 'Database', icon: '🗄️' },
  { id: 'filesystem', name: 'File System', icon: '📁' },
  { id: 'browser', name: 'Browser', icon: '🌐' },
  { id: 'developer-tools', name: 'Dev Tools', icon: '🛠️' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'ai-ml', name: 'AI & ML', icon: '🤖' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️' },
  { id: 'search', name: 'Search', icon: '🔍' },
  { id: 'monitoring', name: 'Monitoring', icon: '📊' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
];

const LANG_COLORS: Record<string, string> = {
  python: '#3572A5', typescript: '#3178C6', javascript: '#F7DF1E',
  rust: '#DEA584', go: '#00ADD8', java: '#B07219', c: '#555',
  cpp: '#F34B7D', ruby: '#701516', shell: '#89E051',
  kotlin: '#A97BFF', swift: '#F05138', haskell: '#5E5086',
  elixir: '#4E2A8E', clojure: '#5881D8', vue: '#41B883',
  dockerfile: '#2496ED', batchfile: '#C1F12E', html: '#E34F26',
};

// ── Client config templates ───────────────────
const CLIENTS = [
  { id: 'claude', name: 'Claude Desktop', icon: '🤖', configPath: '~/Library/Application Support/Claude/claude_desktop_config.json' },
  { id: 'cursor', name: 'Cursor', icon: '🖍️', configPath: '.cursor/mcp.json' },
  { id: 'windsurf', name: 'Windsurf', icon: '🏄', configPath: '.windsurf/mcp.json' },
  { id: 'openclaw', name: 'OpenClaw', icon: '🐱', configPath: '~/.openclaw/openclaw.json' },
  { id: 'cline', name: 'Cline', icon: '🧠', configPath: 'cline_mcp_settings.json' },
  { id: 'generic', name: 'Generic JSON', icon: '📋', configPath: 'mcp-config.json' },
];

// ── MCP install command lookup (known servers) ─
const KNOWN_INSTALLS: Record<string, { cmd: string; args: string[] }> = {
  'n8n': { cmd: 'npx', args: ['-y', '@n8n/n8n-mcp-server'] },
  'playwright': { cmd: 'npx', args: ['-y', '@playwright/mcp'] },
  'puppeteer': { cmd: 'npx', args: ['-y', '@puppeteer/mcp'] },
  'browserbase': { cmd: 'npx', args: ['-y', '@browserbase/mcp'] },
  'sequential-thinking': { cmd: 'npx', args: ['-y', '@modelcontextprotocol/sequential-thinking'] },
  'github': { cmd: 'npx', args: ['-y', '@modelcontextprotocol/github'] },
  'slack': { cmd: 'npx', args: ['-y', '@modelcontextprotocol/slack'] },
  'filesystem': { cmd: 'npx', args: ['-y', '@modelcontextprotocol/filesystem'] },
  'brave-search': { cmd: 'npx', args: ['-y', '@anthropic-ai/mcp-server-brave-search'] },
  'fetch': { cmd: 'npx', args: ['-y', '@anthropic-ai/mcp-server-fetch'] },
  'memory': { cmd: 'npx', args: ['-y', '@anthropic-ai/mcp-server-memory'] },
  'mcp-servers': { cmd: 'npx', args: ['-y', '@anthropic-ai/mcp-server-mcp-servers'] },
};

function getInstallCmd(server: Server): { cmd: string; args: string[] } {
  // 先查已知列表
  if (KNOWN_INSTALLS[server.name]) return KNOWN_INSTALLS[server.name];

  // 按语言猜测
  const lang = (server.language || '').toLowerCase();
  if (lang === 'python') return { cmd: 'uvx', args: ['-y', server.name] };
  if (lang === 'go') return { cmd: 'go', args: ['run', 'github.com/' + server.id] };
  if (lang === 'rust') return { cmd: 'cargo', args: ['install', server.name] };
  // 默认 npx
  return { cmd: 'npx', args: ['-y', server.name] };
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedClient, setSelectedClient] = useState('claude');
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'name'>('stars');

  // Dark mode with localStorage persistence
  useEffect(() => {
    const saved = localStorage.getItem('mcp-studio-dark');
    if (saved === 'true') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mcp-studio-dark', String(dark));
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  // Filtered servers
  const filtered = useMemo(() => {
    let result = [...servers];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topics?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (category) {
      result = result.filter(s => s.categories?.includes(category));
    }
    if (sortBy === 'stars') result.sort((a, b) => b.stars - a.stars);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'updated') result.sort((a, b) => (b.last_push_at || '').localeCompare(a.last_push_at || ''));
    return result;
  }, [query, category, sortBy]);

  // Open install modal
  const openInstall = useCallback((s: Server) => {
    setSelectedServer(s);
    setSelectedClient('claude');
    setEnvVars([]);
    setCopied(false);
  }, []);

  // Generate config JSON per client format
  const generateConfig = useCallback(() => {
    if (!selectedServer) return '';
    const envObj: Record<string, string> = {};
    envVars.filter(e => e.key.trim()).forEach(e => { envObj[e.key.trim()] = e.value.trim(); });

    const install = getInstallCmd(selectedServer);
    const serverEntry: Record<string, any> = {
      command: install.cmd,
      args: install.args,
    };
    if (Object.keys(envObj).length > 0) serverEntry.env = envObj;

    let config: any;
    switch (selectedClient) {
      case 'openclaw':
        config = { 'mcpServers': { [selectedServer.name]: serverEntry } };
        break;
      case 'cline':
        config = { 'mcpServers': { [selectedServer.name]: serverEntry } };
        break;
      default:
        // claude, cursor, windsurf, generic all use stdio format
        config = { 'mcpServers': { [selectedServer.name]: serverEntry } };
    }

    return JSON.stringify(config, null, 2);
  }, [selectedServer, envVars, selectedClient]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateConfig());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  // Stats
  const totalStars = useMemo(() => servers.reduce((s, x) => s + x.stars, 0), []);
  const topLangs = useMemo(() => {
    const m: Record<string, number> = {};
    servers.forEach(s => { if (s.language) m[s.language] = (m[s.language] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧩</span>
            <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>MCP Studio</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              Beta
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {data.total.toLocaleString()} servers · {(totalStars / 1000).toFixed(1)}k ⭐
            </span>
            <button onClick={() => setDark(!dark)} className="text-lg cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}>
              {dark ? '☀️' : '🌙'}
            </button>
            <a href="https://github.com/mianmian5/mcp-studio" target="_blank"
              className="text-sm font-medium underline-offset-2 hover:underline cursor-pointer"
              style={{ color: 'var(--accent)' }}>
              GitHub →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
          MCP Servers, <span style={{ color: 'var(--accent)' }}>Managed</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
          Browse, install, and configure MCP servers for any AI client.
          One click to generate the config you need.
        </p>

        {/* Quick stats */}
        <div className="flex justify-center gap-8 text-center mb-8">
          <div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{data.total.toLocaleString()}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Servers</div>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{(totalStars / 1000).toFixed(1)}k</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total ⭐</div>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>10</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Categories</div>
          </div>
          {topLangs.map(([lang, count]) => (
            <div key={lang}>
              <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{count}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{lang}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
            <input
              className="w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{
                background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)'
              }}
              placeholder="Search MCP servers..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
      </header>

      {/* Categories + Sort */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setQuery(''); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: category === cat.id ? 'var(--accent)' : 'var(--surface)',
                  color: category === cat.id ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${category === cat.id ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-1.5 rounded-lg border outline-none cursor-pointer"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <option value="stars">⭐ Stars</option>
            <option value="updated">🕐 Updated</option>
            <option value="name">📝 Name</option>
          </select>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{data.total}</strong> servers
        </p>

        {/* Server Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, 48).map(server => (
            <div key={server.id}
              className="rounded-xl border p-4 flex flex-col transition-all cursor-pointer"
              style={{
                background: 'var(--surface)', borderColor: 'var(--border)',
              }}
              onClick={() => openInstall(server)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
              {/* Header */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm truncate">{server.name}</h3>
                </div>
                <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {server.description || 'No description'}
                </p>
              </div>

              {/* Topics */}
              {server.topics && server.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {server.topics.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>{t}</span>
                  ))}
                  {server.topics.length > 3 && (
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>+{server.topics.length - 3}</span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t text-xs"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2.5">
                  {server.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block"
                        style={{ background: LANG_COLORS[server.language.toLowerCase()] || '#888' }} />
                      {server.language}
                    </span>
                  )}
                  <span>⭐ {server.stars.toLocaleString()}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); openInstall(server); }}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  style={{ background: 'var(--accent)', color: 'white' }}>
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 48 && (
          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            +{filtered.length - 48} more servers. Use search to narrow down.
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs mt-12" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <p>🧩 MCP Studio · MCP Server Management Tool</p>
        <p className="mt-1">Data from GitHub · {data.total} servers indexed</p>
      </footer>

      {/* ── Install Modal ── */}
      {selectedServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedServer(null); }}>
          <div className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {/* Close */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedServer.name}</h2>
                <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedServer.description}
                </p>
              </div>
              <button onClick={() => setSelectedServer(null)}
                className="text-xl cursor-pointer" style={{ color: 'var(--text-secondary)' }}>✕</button>
            </div>

            {/* Quick info */}
            <div className="flex flex-wrap gap-3 mb-5 text-xs">
              {selectedServer.language && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border"
                  style={{ borderColor: 'var(--border)' }}>
                  <span className="w-2 h-2 rounded-full"
                    style={{ background: LANG_COLORS[selectedServer.language.toLowerCase()] || '#888' }} />
                  {selectedServer.language}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--border)' }}>
                ⭐ {selectedServer.stars.toLocaleString()}
              </span>
              <a href={selectedServer.github_url} target="_blank"
                className="px-2.5 py-1 rounded-full border hover:underline"
                style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
                GitHub ↗
              </a>
            </div>

            {/* Client selector */}
            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Target AI Client
              </label>
              <div className="flex flex-wrap gap-2">
                {CLIENTS.map(c => (
                  <button key={c.id} onClick={() => setSelectedClient(c.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: selectedClient === c.id ? 'var(--accent)' : 'var(--surface-2)',
                      color: selectedClient === c.id ? 'white' : 'var(--text-secondary)',
                    }}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Env vars */}
            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Environment Variables <span className="font-normal">(optional)</span>
              </label>
              {envVars.map((ev, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input placeholder="KEY"
                    value={ev.key}
                    onChange={e => {
                      const n = [...envVars]; n[i].key = e.target.value; setEnvVars(n);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none font-mono"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <input placeholder="VALUE"
                    value={ev.value}
                    onChange={e => {
                      const n = [...envVars]; n[i].value = e.target.value; setEnvVars(n);
                    }}
                    className="flex-[2] px-3 py-2 rounded-lg border text-xs outline-none font-mono"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <button onClick={() => setEnvVars(envVars.filter((_, j) => j !== i))}
                    className="px-2 rounded-lg text-xs cursor-pointer"
                    style={{ color: 'var(--red)' }}>✕</button>
                </div>
              ))}
              <button onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                className="text-xs cursor-pointer hover:underline"
                style={{ color: 'var(--accent)' }}>+ Add variable</button>
            </div>

            {/* Config output */}
            <div className="mb-4">
              {/* Terminal install command */}
              <div className="mb-3">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Quick Install
                </label>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 rounded-xl px-3 py-2 text-xs font-mono"
                    style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
                    {getInstallCmd(selectedServer).cmd} {getInstallCmd(selectedServer).args.join(' ')}
                  </code>
                  <button onClick={() => {
                    const cmd = getInstallCmd(selectedServer).cmd + ' ' + getInstallCmd(selectedServer).args.join(' ');
                    navigator.clipboard.writeText(cmd);
                  }}
                    className="px-2.5 py-2 rounded-lg text-xs cursor-pointer"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    📋
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Config JSON <span className="font-normal">(paste into your AI client)</span>
                </label>
                <pre className="rounded-xl p-3 text-xs overflow-x-auto font-mono leading-relaxed"
                  style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {generateConfig()}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={copyToClipboard}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: 'var(--accent)', color: 'white',
                }}>
                {copied ? '✅ Copied!' : '📋 Copy Config'}
              </button>
              <button onClick={() => {
                const blob = new Blob([generateConfig()], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url;
                a.download = `${selectedServer.name}-mcp-config.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                ⬇ Download
              </button>
            </div>

            <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              💡 Paste this into <code className="font-mono" style={{ color: 'var(--accent)' }}>{CLIENTS.find(c => c.id === selectedClient)?.configPath}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
