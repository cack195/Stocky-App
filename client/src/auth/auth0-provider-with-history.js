import { useHistory } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const Mongo = process.env.MONGODB_URI;

  console.log('Auth0 Domain:', domain);
  console.log('Auth0 Client ID:', clientId);
  // console.log(`Mongo:`, Mongo)

  const history = useHistory();

  const onRedirectCallback = (appState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      // this redirect is for development
      redirectUri="http://127.0.0.1:3000/dashboard"
      // this redirect is for live
      // redirectUri="https://your-live-url/dashboard"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
export default Auth0ProviderWithHistory;