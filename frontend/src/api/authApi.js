const AUTH_API_URL = "http://127.0.0.1:8000/auth/login";

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
