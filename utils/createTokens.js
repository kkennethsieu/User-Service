import jwt from "jsonwebtoken";
export const createTokens = (user) => {
  const createAccessToken = () => {
    const accessToken = jwt.sign(user.id, process.env.ACCESSTOKEN_SECRET, {
      expiresIn: "15m",
    });

    return accessToken;
  };

  const createRefreshToken = () => {
    const refreshToken = jwt.sign(user.id, process.env.REFRESHTOKEN_SECRET, {
      expiresIn: "7d",
    });
    return refreshToken;
  };

  return {
    accessToken: createAccessToken(),
    refreshToken: createRefreshToken(),
  };
};
