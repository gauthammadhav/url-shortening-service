import { useEffect, useState } from "react";
import { login, register } from "./api/authApi";
import { createUrl, deleteUrl, getUrls, updateUrl } from "./api/urlApi";

function App() {
  const [screen, setScreen] = useState(() =>
    localStorage.getItem("access_token") ? "dashboard" : "login",
  );
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("access_token")));

  async function loadUrls() {
    const loadedUrls = await getUrls();
    setUrls(loadedUrls);
    return loadedUrls;
  }

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;

    loadUrls()
      .catch(() => {
        localStorage.removeItem("access_token");
        setUrls([]);
        setScreen("login");
        setError("Your session has ended. Please log in again.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(email, password) {
    setError("");
    setLoading(true);
    try {
      const tokenResponse = await login(email, password);
      localStorage.setItem("access_token", tokenResponse.access_token);
      await loadUrls();
      setScreen("dashboard");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(email, password) {
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      setNotice("Account created. Log in to start shortening links.");
      setScreen("login");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    setUrls([]);
    setError("");
    setNotice("");
    setScreen("login");
  }

  async function handleCreate(url) {
    setError("");
    try {
      await createUrl(url);
      await loadUrls();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleDelete(shortCode) {
    setError("");
    try {
      await deleteUrl(shortCode);
      await loadUrls();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleUpdate(shortCode, originalUrl) {
    setError("");
    try {
      await updateUrl(shortCode, originalUrl);
      await loadUrls();
    } catch (apiError) {
      setError(apiError.message);
      throw apiError;
    }
  }

  if (screen === "signup") {
    return <AuthScreen mode="signup" error={error} loading={loading} onSubmit={handleSignup} onNavigate={setScreen} />;
  }

  if (screen === "login") {
    return <AuthScreen mode="login" error={error} loading={loading} notice={notice} onSubmit={handleLogin} onNavigate={setScreen} />;
  }

  return (
    <main className="app-shell">
      <DashboardNav active={screen} onNavigate={setScreen} onLogout={handleLogout} />
      {screen === "analytics" ? (
        <AnalyticsScreen />
      ) : (
        <Dashboard
          error={error}
          loading={loading}
          urls={urls}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
}

function AuthScreen({ mode, error, loading, notice, onSubmit, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLogin = mode === "login";

  function submit(event) {
    event.preventDefault();
    onSubmit(email, password);
  }

  return (
    <main className="auth-page">
      <ScreenNav active={mode} onNavigate={onNavigate} />
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">{isLogin ? "Welcome back" : "Create your workspace"}</p>
          <h1>{isLogin ? "Log in to your links" : "Start shortening smarter"}</h1>
          <p className="auth-intro">
            {isLogin
              ? "Every link you've ever shortened is waiting for you."
              : "Create an account to save, share, and manage every link in one place."}
          </p>
          {notice && <p className="notice">{notice}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <form className="auth-form" onSubmit={submit}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="primary-button auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
            </button>
          </form>
          <p className="auth-switch">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => onNavigate(isLogin ? "signup" : "login")}>
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
        <aside className="auth-showcase" aria-hidden="true">
          <div className="demo-long-url">https://your-long-link.example.com/updates/product-launch</div>
          <p className="compress-mark">↓ compress</p>
          <div className="demo-short-url"><strong>snip.io / your-link</strong><span>0 clicks</span></div>
          <div className="showcase-copy">
            <h2>One link. Every click, tracked.</h2>
            <p>Turn unwieldy URLs into links you actually want to share.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ScreenNav({ active, onNavigate }) {
  return (
    <nav className="screen-nav" aria-label="Primary navigation">
      <button className={active === "login" ? "active" : ""} onClick={() => onNavigate("login")}>Log in</button>
      <button className={active === "signup" ? "active" : ""} onClick={() => onNavigate("signup")}>Sign up</button>
    </nav>
  );
}

function DashboardNav({ active, onNavigate, onLogout }) {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("dashboard")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">short.</span>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-6">
          <button className={`font-medium text-sm ${active === "dashboard" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}`} onClick={() => onNavigate("dashboard")}>Dashboard</button>
          <button className={`font-medium text-sm ${active === "analytics" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}`} onClick={() => onNavigate("analytics")}>Analytics</button>
        </div>

        {/* Right: User/Logout */}
        <div className="flex items-center gap-4">
          <button onClick={onLogout} className="text-sm font-medium text-gray-500 hover:text-gray-900">Log out</button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            U
          </div>
        </div>
      </div>
    </nav>
  );
}

function Dashboard({ error, loading, urls, onCreate, onDelete, onUpdate }) {
  const [newUrl, setNewUrl] = useState("");
  const totalClicks = urls.reduce((sum, url) => sum + url.click_count, 0);

  async function submit(event) {
    event.preventDefault();
    await onCreate(newUrl);
    setNewUrl("");
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-500 text-base">Manage your links and track their performance.</p>
      </div>

      {/* Top Section - Create Link */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <form onSubmit={submit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="new-url" className="sr-only">Long URL</label>
            <input 
              id="new-url" 
              type="url" 
              placeholder="Paste a long URL to shorten it (e.g., https://example.com/very/long/path)" 
              value={newUrl} 
              onChange={(e) => setNewUrl(e.target.value)} 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
          <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap">
            Shorten Link
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Links" value={urls.length} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
        <StatCard title="Total Clicks" value={totalClicks} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
        <StatCard title="Clicks Today" value="--" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatCard title="Unique Visitors" value="--" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
      </div>

      {/* Links List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Your Links</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading your links…</div>
        ) : urls.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <p>No links yet. Shorten your first URL above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header row for large screens */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Original URL</div>
              <div className="col-span-3">Short Link</div>
              <div className="col-span-2 text-center">Clicks</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {urls.map((url) => <UrlRow key={url.short_code} url={url} onDelete={onDelete} onUpdate={onUpdate} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center gap-3 text-gray-500 mb-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          {icon}
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
    </div>
  );
}

function UrlRow({ url, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(url.original_url);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url.shortened_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function save() {
    await onUpdate(url.short_code, value);
    setEditing(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50/50 transition-colors">
      <div className="col-span-1 md:col-span-5 min-w-0 pr-4">
        {editing ? (
          <div className="flex gap-2">
            <input 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
            <button onClick={save} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Save</button>
            <button onClick={() => setEditing(false)} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        ) : (
          <p className="text-sm text-gray-600 truncate" title={url.original_url}>{url.original_url}</p>
        )}
      </div>
      
      <div className="col-span-1 md:col-span-3">
        <a href={url.shortened_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors truncate max-w-full">
          <span className="truncate">{url.shortened_url.replace(/^https?:\/\//, '')}</span>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
      
      <div className="col-span-1 md:col-span-2 md:text-center flex md:justify-center items-center gap-2">
        <span className="md:hidden text-xs text-gray-500 font-medium">Clicks:</span>
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
          {url.click_count}
        </span>
      </div>
      
      <div className="col-span-1 md:col-span-2 flex items-center md:justify-end gap-1 text-gray-400">
        <button onClick={copy} className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors" title="Copy">
          {copied ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          )}
        </button>
        <button onClick={() => setEditing(!editing)} className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors" title="Edit">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button onClick={() => onDelete(url.short_code)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Analytics</h1>
        <p className="text-gray-500 text-base">Detailed insights coming soon.</p>
      </div>
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data yet</h3>
        <p className="text-gray-500 max-w-sm">Detailed link performance metrics will appear here when the backend provides time-series data.</p>
      </div>
    </div>
  );
}

export default App;
