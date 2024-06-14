import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to homepage after login
    //   return url.startsWith(baseUrl) ? url : baseUrl;
    return '/${homeWorkspace.id}/chat';
    },
  },
});

export { handler as GET, handler as POST };
