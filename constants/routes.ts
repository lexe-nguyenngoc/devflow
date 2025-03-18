const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  COLLECTION: "/collection",
  TAGS: "/tags",
  JOB: "/jobs",
  COMMUNITY: "/community",
  PROFILE: (id: string) => `/profile/${id}`,
  TAG: (id: string) => `/tags/${id}`,
  QUESTION: (id: string) => `/questions/${id}`,
  SIGN_IN_WITH_OAUTH: `sign-in-with-oauth`,
};

export default ROUTES;
