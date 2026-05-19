const AUTH_URL = 'https://functions.poehali.dev/0e5a3082-d6b3-426d-9943-f238e572bf1c';
const MFR_URL = 'https://functions.poehali.dev/3ed12753-e6eb-470b-a0e6-130ad10f84db';
const VISITORS_URL = 'https://functions.poehali.dev/329f3a83-3b48-4f18-818c-e210e887eaad';

function getToken(key = 'svoe_token') { return localStorage.getItem(key) || ''; }

async function req(url: string, method = 'GET', body?: object, tokenKey = 'svoe_token') {
  const token = getToken(tokenKey);
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export const api = {
  auth: {
    register: (email: string, password: string, role: string) =>
      req(`${AUTH_URL}?action=register`, 'POST', { email, password, role }),
    login: (email: string, password: string) =>
      req(`${AUTH_URL}?action=login`, 'POST', { email, password }),
    confirmEmail: (token: string) =>
      req(`${AUTH_URL}?action=confirm-email`, 'POST', { token }),
    resend: (email: string) =>
      req(`${AUTH_URL}?action=resend-confirmation`, 'POST', { email }),
    me: () => req(`${AUTH_URL}?action=me`),
    meVisitor: () => req(`${AUTH_URL}?action=me`, 'GET', undefined, 'svoe_visitor_token'),
    logout: () => req(`${AUTH_URL}?action=logout`, 'POST'),
    logoutVisitor: () => req(`${AUTH_URL}?action=logout`, 'POST', undefined, 'svoe_visitor_token'),
  },
  manufacturers: {
    my: () => req(`${MFR_URL}?action=my`),
    save: (data: object) => req(`${MFR_URL}?action=save`, 'POST', data),
    list: () => req(`${MFR_URL}?action=list`),
  },
  visitors: {
    favorites: () => req(`${VISITORS_URL}?action=favorites`, 'GET', undefined, 'svoe_visitor_token'),
    toggle: (type: string, ref_id: string) =>
      req(`${VISITORS_URL}?action=toggle`, 'POST', { type, ref_id }, 'svoe_visitor_token'),
    chats: () => req(`${VISITORS_URL}?action=chats`, 'GET', undefined, 'svoe_visitor_token'),
    chatMessages: (chat_id: number) =>
      req(`${VISITORS_URL}?action=chat-messages&chat_id=${chat_id}`, 'GET', undefined, 'svoe_visitor_token'),
    sendMessage: (manufacturer_id: number, body: string) =>
      req(`${VISITORS_URL}?action=send-message`, 'POST', { manufacturer_id, body }, 'svoe_visitor_token'),
  },
};