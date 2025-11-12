import { createContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(null);

  const login = async (username, password) => {
    try {
      // we fetch with the username and password
      const res = await fetch("/login", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid Credentials");
      }

      const data = await res.json();

      // we set the access token we created from the backend with the user data
      setAccessToken(data.accessToken);
      setUser(data.user);
      console.log("Successfully logged in");
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    // when we log out we set the accesstoken and user to null
    await fetch("/logout");
    setAccessToken(null);
    setUser(null);
    console.log("Successfully logged out");
  };

  const refreshToken = async () => {
    // this is called when the current accesstoken expired
    // access token expires in 15 minutes or on reload
    try {
      const res = await fetch("/refresh-token");

      if (!res.ok) {
        throw new Error("Error fetching refresh-token");
      }
      const data = await res.json();

      setAccessToken(data.accessToken);

      console.log("New access token created");
      return data.accessToken;
    } catch (error) {
      console.error("Refresh token invalid or expired");
    }
  };
  // this useEffect is called everytime we reload beacuse the accesstoken expires on every reload
  // this prevents the user from continuously logged in
  useEffect(() => {
    const fetchRefreshToken = async () => {
      await refreshToken();
    };
    fetchRefreshToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// EXAMPLE OF FETCHING A PROTECED ROUTE

function frontendExample() {
  const [reviews, setReviews] = useState();
  // get this from the useAuth context
  const { accessToken, refreshToken, logout } = useAuth();

  useEffect(() => {
    // we first try to fetch the datat using the current Access Token
    const fetchData = async () => {
      let res = await fetch("/reviews", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        // if it doesnt work we need to get a new access token from the refresh token
        try {
          const newToken = await refreshToken();
          res = await fetch("/reviews", {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          // if this doesnt work we logout because the refresh token either expired or invalid
          if (!res.ok) {
            logout();
            // can then redirect to login
            nav("/login");
            throw new Error("Not authorized");
          }

          // if it works we set the reviews
          const data = await res.json();

          setReviews(data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, []);

  return <div>{reviews}</div>;
}

export default frontendExample;
