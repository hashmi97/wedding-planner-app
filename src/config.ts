export const config = {
  adminToken: import.meta.env.VITE_ADMIN_TOKEN ?? "",
  sitePassword: import.meta.env.VITE_APP_PASSWORD ?? "",
  brideName: import.meta.env.VITE_BRIDE_NAME ?? "Bride",
  groomName: import.meta.env.VITE_GROOM_NAME ?? "Groom",
};
