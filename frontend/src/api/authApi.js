const AUTH_API_URL = "http://127.0.0.1:8000/auth/login";
const REGISTER_API_URL = "http://127.0.0.1:8000/auth/register";

async function handleAuthResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.detail ??
      errorData?.message ??
      `Authentication request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function login(email, password) {
  const formData = new URLSearchParams({
    username: email,
    password,
  });

  const response = await fetch(AUTH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  return handleAuthResponse(response);
}

export async function register(email, password) {
  const response = await fetch(REGISTER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleAuthResponse(response);
}
