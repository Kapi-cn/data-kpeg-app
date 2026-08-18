const API_URL = import.meta.env.VITE_API_URL;

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return null
  }

  const data = await response.json();

  return data.user;
}

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  return response.ok;
}
