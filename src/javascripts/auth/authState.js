export function updateAuthUI(user) {
    const body = document.body;
    body.setAttribute("data-user-authenticated", user ? "true" : "false");
}
