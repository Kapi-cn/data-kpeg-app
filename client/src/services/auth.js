export const getCurrentUser = async () => {
  const response = await fetch(`/api/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return null
  }

  const data = await response.json();

  return data.user;
}

export const logout = async () => {
  const response = await fetch(`/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  return response.ok;
}
