import jwt from "jsonwebtoken";

// this middleware is put into all microservices that need authenticated routes
export const checkAuth = (req, res, next) => {
  // we check the frontend header for the access token
  const authHeader = req.headers["Authorization"];

  // header is sent in (BEAER <ACCESS TOKEN>)
  if (!authHeader) {
    return res.status(401).json({ error: "Invalid auth header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid access token" });
  }
  // now we try to verify with our secret
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userId = payload.userId;
    // if it works we just go to the next function which is the protected route
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid access token" });
  }
};

//EXAMPLE OF A BACKEND ROUTE

app.post("/reviews", checkAuth, getReviews){
}

app.get("/reviews", checkAuth, (req, res) => {
  // you can access the userId from the middleware
  // we set the userId when we verified in the middleware
  const userId = req.userId;

  // fetch reviews from our DB
  const reviews = db.getReviewsByUserId(userId); // example function

  // send back the data
  return res.json(reviews);
});

// The checkAuth will be on every route that needs to be authenticated