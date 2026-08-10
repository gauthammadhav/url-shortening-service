// This module is the single place where the frontend communicates with the URL API.
const API_BASE_URL = "http://localhost:8000";

// Attach the saved JWT to requests for protected URL endpoints.
function getAuthorizationHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Convert unsuccessful API responses into errors before returning response data.
async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`URL API request failed: ${response.status}`);
  }

  return response.json();
}

export function getUrls() {
  return fetch(`${API_BASE_URL}/urls`, {
    headers: getAuthorizationHeader(),
  }).then(handleResponse);
}

export function createUrl(url) {
  return fetch(`${API_BASE_URL}/urls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader(),
    },
    body: JSON.stringify({ url }),
  }).then(handleResponse);
}

export function updateUrl(shortCode, url) {
  return fetch(`${API_BASE_URL}/urls/${shortCode}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader(),
    },
    body: JSON.stringify({ url }),
  }).then(handleResponse);
}

export function deleteUrl(shortCode) {
  return fetch(`${API_BASE_URL}/urls/${shortCode}`, {
    method: "DELETE",
    headers: getAuthorizationHeader(),
  }).then(handleResponse);
}
