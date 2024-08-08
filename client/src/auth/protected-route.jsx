import { Route } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";

const ProtectedRoute = ({ component, ...args }) => {
  return (
    <Route
      component={withAuthenticationRequired(component, {
        onRedirecting: () => {
          let isMounted = true;

          useEffect(() => {
            return () => {
              isMounted = false;
            };
          }, []);

          if (isMounted) {
            return <Loading />;
          }

          return null;
        },
      })}
      {...args}
    />
  );
};

export default ProtectedRoute;