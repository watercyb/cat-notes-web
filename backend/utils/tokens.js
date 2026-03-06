const tokens = new Map();
const timeouts = new Map();

export const setToken = (userId, token) => {
  const id = userId.toString();
  tokens.set(id, token);
  if (timeouts.has(id))
    clearTimeout(timeouts.get(id));

  const timeout = setTimeout(
    () => {
      tokens.delete(id);
      timeouts.delete(id);
    },
    15 * 60 * 1000,
  );
  timeouts.set(id, timeout);
};

export const getToken = (userId) => {
  return tokens.get(userId.toString());
};
