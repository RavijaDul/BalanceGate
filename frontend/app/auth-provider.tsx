"use client";

import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_SO83inQPs",
  client_id: "2i73cdljtinrp76oi9aft5sqg7",
  redirect_uri: "http://localhost:3000",
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
