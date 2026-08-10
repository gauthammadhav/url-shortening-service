import { useState } from "react";
import { login } from "./api/authApi";
import { createUrl, deleteUrl, getUrls } from "./api/urlApi";

function App() {
  const [urls, setUrls] = useState([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [copiedShortCode, setCopiedShortCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    try {
      const tokenResponse = await login(email, password);
      localStorage.setItem("access_token", tokenResponse.access_token);
      const authenticatedUrls = await getUrls();
      setUrls(authenticatedUrls);
      setPassword("");
    } catch (apiError) {
      setLoginError(apiError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await createUrl(url);
      const updatedUrls = await getUrls();
      setUrls(updatedUrls);
      setUrl("");
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleDelete(shortCode) {
    setError("");

    try {
      // Delete through the API layer, then load the current server-side URL list.
      await deleteUrl(shortCode);
      const updatedUrls = await getUrls();
      setUrls(updatedUrls);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleCopy(shortCode, shortenedUrl) {
    setError("");

    try {
      // The Clipboard API writes text to the user's clipboard without a backend request.
      await navigator.clipboard.writeText(shortenedUrl);
      // Store the copied item briefly so only its button shows temporary feedback.
      setCopiedShortCode(shortCode);
      setTimeout(() => setCopiedShortCode(""), 2000);
    } catch (clipboardError) {
      setError(clipboardError.message);
    }
  }

  function handleVisit(shortenedUrl) {
    // Opening an existing URL is a browser action, so React does not need backend communication.
    window.open(shortenedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="!min-h-screen !w-full !max-w-none !border-0 bg-gray-50 px-4 py-10 text-left sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/60 ring-1 ring-gray-200 sm:p-8">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wide text-blue-600">
            URL SHORTENER
          </p>
          <h1 className="!m-0 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shorten and share links
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Create compact links that are easy to share and track.
          </p>
        </header>

        <section className="mb-8 rounded-xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="!m-0 text-lg font-semibold text-gray-900">Sign in</h2>
            <p className="mt-1 text-sm text-gray-600">
              Log in to create and manage your shortened links.
            </p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-800">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-800">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Login to your account
            </button>
          </form>

          {loginError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {loginError}
            </p>
          )}
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="url" className="sr-only">
            URL to shorten
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Enter a URL to shorten"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Shorten URL
          </button>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="!m-0 text-lg font-semibold text-gray-900">Your shortened URLs</h2>

          {urls.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
              <p className="font-medium text-gray-900">No shortened URLs yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Add a URL above to create your first short link.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {urls.map((url) => (
                <article
                  key={url.short_code}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Original URL</p>
                      <p className="mt-1 break-all text-sm text-gray-700">{url.original_url}</p>
                      <p className="mt-4 text-sm font-medium text-gray-500">Shortened URL</p>
                      <a
                        href={url.shortened_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {url.shortened_url}
                      </a>
                    </div>
                    <p className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                      Clicks: {url.click_count}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(url.short_code, url.shortened_url)}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      {copiedShortCode === url.short_code ? "Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisit(url.shortened_url)}
                      className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 focus:outline-none focus:ring-4 focus:ring-green-100"
                    >
                      Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(url.short_code)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
