"use client";

import { AuthProvider } from "react-oidc-context";

const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Use environment variable or default to Vercel URL
  return process.env.NEXT_PUBLIC_APP_URL || "https://balance-gate.vercel.app";
};

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_SO83inQPs",
  client_id: "2i73cdljtinrp76oi9aft5sqg7",
  redirect_uri: getRedirectUri(),
  response_type: "code",
  scope: "openid email",
};

export function CognitoAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
}
