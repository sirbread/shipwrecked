import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { createTransport } from "nodemailer";
import { randomBytes } from "crypto";
import metrics from "@/metrics";

const adapter = {
  ...PrismaAdapter(prisma),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  linkAccount: async ({ ok, state, ...data }: any) => {
    console.log('Linking account:', { provider: data.provider, userId: data.userId });
    
    // If this is a Slack account, update the user with their Slack ID
    if (data.provider === 'slack') {
      console.log('Updating user with Slack ID');

      try {
        await prisma.user.update({
          where: { id: data.userId },
          data: {
            slack: data.providerAccountId  // Slack's user ID
          }
        });
        metrics.increment("success.link_account_id", 1);
      } catch (err) {
        metrics.increment("errors.link_account_id", 1);
      }
    }

    const account = await prisma.account.create({
      data: {
        ...data,
        access_token: data.access_token ?? null,
        token_type: data.token_type ?? null,
        id_token: data.id_token ?? null,
        refresh_token: data.refresh_token ?? null,
        scope: data.scope ?? null,
        expires_at: data.expires_at ?? null,
        session_state: data.session_state ?? null,
      },
    });
    return void account;
  },
}

export const opts: NextAuthOptions = {
  adapter: adapter,
  session: {
    strategy: "database"
  },
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID ?? "",
      clientSecret: process.env.SLACK_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true // Allow linking accounts with same email
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER as string,
      from: process.env.EMAIL_FROM as string,
      maxAge: 60 * 10, // make email links valid for 10 minutes
      generateVerificationToken: async () => {
        // Generate a more secure token that matches NextAuth's expectations
        return new Promise((resolve, reject) => {
          randomBytes(32, (err, buf) => {
            if (err) reject(err);
            else resolve(buf.toString('hex'));
          });
        });
      },
      sendVerificationRequest: async ({ identifier: email, url, token, provider }) => {
        // Customize the verification email
        const { host } = new URL(url);
        const transport = await createTransport(provider.server);
        try {
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to Shipwrecked`,
            text: `Click here to sign in to Shipwrecked: ${url}`,
            html: `
            <html>
        <head>
        <style>
          .wrapper {
            padding: 1rem;
            margin: 0 auto;
            max-width: 600px;
            font-family: 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Fira Sans', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif;
          }

          .container {
            padding: 0;
            margin: 0;
            width: 100%;
            max-width: 100%;
          }

          a {
            color: #47D1F6;
          }

          .section {
            padding: 0.5rem 1rem;
          }

          .footer {
            font-size: 0.8rem;
            line-height: 1.2rem;
            color: #606a79;

            background-position: center;
            background-size: cover;
            background-repeat: repeat-x;
          }

          .footer p {
            margin-block-start: 0.5rem;
            margin-block-end: 0.5rem;
          }

          .footer a {
            color: #646464;
          }
        </style>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        </head>
        <body>
        <div class="wrapper">
          <div class="container">
            <table>
              <thead>
              <tr>
                <th>
                  <div class="section" style="text-align: left;">
                    <a
                      href="https://hackclub.com"
                      target="_blank"
                    >
                      <img
                        src="https://shipwrecked.hackclub.com/logo-outline.svg"
                        alt="Hack Club Logo"
                        style="width: 6rem"
                      />
                    </a>
                  </div>
                </th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>
                  <div
                    class="section"
                  >
                  <p>Hi 👋,</p>
                  <p>You requested a login for <a href="https://shipwrecked.hackclub.com" target="_blank">Shipwrecked</a>. It's here:</p>
                  <a href="${url}">
                    <pre style="text-align:center;background-color:#ebebeb;padding:8px;font-size:1.5em;border-radius:4px">${url}</pre>
                  </a>
                  <p>- Shipwrecked Team</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    class="footer section"
                    style="background-image: url('https://hackclub.com/pattern.svg');"
                  >
                    <p>
                      Hack Club |
                      <a href="mailto:team@hackclub.com">shipwrecked@hackclub.com</a>
                      |
                      <a href="tel:+1855625HACK">1-855-625-HACK</a>
                    </p>
                    <p>
                      Hack Club is an
                      <a href="https://hackclub.com/opensource" target="_blank">open source</a>
                      and
                      <a href="https://hcb.hackclub.com/hq" target="_blank"
                        >financially transparent</a
                      >
                      501(c)(3) nonprofit. Our EIN is 81-2908499. By the students, for the
                      students.
                    </p>
                  </div>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        </body>
        </html>
          `,
          });
          metrics.increment("success.send_auth_email", 1);
        } catch (err) {
          metrics.increment("errors.send_auth_email", 1);
        }
     },
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // With database strategy, we get the fresh user data on every request
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          hackatimeId: user.hackatimeId,
          isAdmin: user.isAdmin
        }
      };
    },
    async signIn({ user, account, profile }) {
      // Log the sign in attempt
      console.log('Sign in attempt:', {
        email: user.email,
        provider: account?.provider,
        hasHackatimeId: !!user.hackatimeId,
        isAdmin: user.isAdmin,
      });

      if (!user.email) {
        metrics.increment("errors.sign_in", 1);
        return false;
      }

      // If signing in with email, check if a Slack account exists
      if (account?.provider === 'email') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        });

        if (existingUser) {
          // Update the current user with any existing hackatimeId
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              hackatimeId: existingUser.hackatimeId,
              slack: existingUser.slack
            }
          });
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/bay`;
    }
  },
  pages: {
    signIn: '/bay/login',
    verifyRequest: '/bay/login/verify',
    error: '/bay/login/error',
  },
  debug: true  // Temporarily enable debug mode to see what's happening
}

const handler = NextAuth(opts)

export { handler as GET, handler as POST }
